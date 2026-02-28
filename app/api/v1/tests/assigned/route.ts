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

    // Find tests assigned to this candidate (cloned tests with originalTestId set)
    const tests = await prisma.aptitudeTest.findMany({
      where: {
        // Tests cloned for this candidate have originalTestId set
        // We find employer_custom tests linked to this candidate via results or by convention
        isActive: true,
        testType: 'EMPLOYER_CUSTOM',
        originalTestId: { not: null },
      },
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
