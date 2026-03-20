import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Raw SQL: candidateId column exists in DB but not in Prisma client
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "AptitudeTest"
      WHERE "employerId" = ${session.user.id}
        AND "originalTestId" IS NOT NULL
        AND "candidateId" IS NOT NULL
        AND "isActive" = true
      ORDER BY "createdAt" DESC
    `;

    if (rows.length === 0) {
      return NextResponse.json({ tests: [] });
    }

    // Fetch full test data + check completion status
    const ids = rows.map(r => r.id);
    const tests = await prisma.aptitudeTest.findMany({
      where: { id: { in: ids } },
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });

    // Get candidateId values via raw SQL for name lookup
    const candidateRows = await prisma.$queryRaw<{ id: string; candidateId: string }[]>`
      SELECT id, "candidateId" FROM "AptitudeTest" WHERE id = ANY(${ids}::uuid[])
    `;
    const candidateIdMap = new Map(candidateRows.map(r => [r.id, r.candidateId]));

    // Fetch candidate names
    const candidateIds = [...new Set(candidateRows.map(r => r.candidateId))];
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, name: true, email: true, expertise: true },
    });
    const candidateMap = new Map(candidates.map(c => [c.id, c]));

    // Check which tests have been completed (TestResult exists)
    const results = await prisma.testResult.findMany({
      where: { testId: { in: ids } },
      select: { testId: true, score: true, passed: true, completedAt: true },
    });
    const resultMap = new Map(results.map(r => [r.testId, r]));

    const enriched = tests.map(t => {
      const cId = candidateIdMap.get(t.id);
      const candidate = cId ? candidateMap.get(cId) : null;
      const result = resultMap.get(t.id);
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        passingScore: t.passingScore,
        questionsCount: t.questions.length,
        createdAt: t.createdAt,
        candidate: candidate ?? null,
        completed: !!result,
        score: result?.score ?? null,
        passed: result?.passed ?? null,
        completedAt: result?.completedAt ?? null,
      };
    });

    return NextResponse.json({ tests: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error fetching sent tests:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
