import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find tests cloned specifically for this candidate
    // Raw SQL used because Prisma client was not regenerated after candidateId was added to schema
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "AptitudeTest"
      WHERE "candidateId" = ${session.user.id}
        AND "isActive" = true
        AND "testType" = 'EMPLOYER_CUSTOM'
        AND "originalTestId" IS NOT NULL
    `;
    const tests = await prisma.aptitudeTest.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
      include: { questions: true },
    });

    // Get test results to check completion status
    const testResults = await prisma.testResult.findMany({
      where: { candidateId: session.user.id },
    });

    const resultsMap = new Map(
      testResults.map((tr) => [tr.testId, tr])
    );

    const testsWithStatus = tests.map((test) => {
      const result = resultsMap.get(test.id);
      return {
        ...test,
        completed: !!result,
        score: result?.score ?? null,
      };
    });

    return NextResponse.json({ tests: testsWithStatus }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch assigned tests';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
