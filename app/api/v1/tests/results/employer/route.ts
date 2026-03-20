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

    const results = await prisma.testResult.findMany({
      where: { employerId: session.user.id },
      include: {
        candidate: { select: { name: true, email: true, expertise: true } },
        test: { select: { title: true, description: true, testType: true, originalTestId: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Fetch proctorStats via raw SQL (column added after Prisma client generation)
    const ids = results.map(r => r.id);
    const proctorRows = ids.length > 0
      ? await prisma.$queryRaw<{ id: string; proctorStats: unknown }[]>`
          SELECT id, "proctorStats" FROM "TestResult" WHERE id = ANY(${ids}::uuid[])
        `
      : [];

    const proctorMap = new Map(proctorRows.map(r => [r.id, r.proctorStats]));
    const enriched = results.map(r => ({ ...r, proctorStats: proctorMap.get(r.id) ?? null }));

    return NextResponse.json({ results: enriched }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to fetch test results:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
