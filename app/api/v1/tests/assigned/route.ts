import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';
import TestResult from '@/models/TestResult';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find tests assigned to this candidate
    const tests = await AptitudeTest.find({
      candidateId: session.user?.id,
      isActive: true,
    });

    // Get test results to check completion status
    const testResults = await TestResult.find({
      candidateId: session.user?.id,
    });

    const resultsMap = new Map(
      testResults.map((tr) => [tr.testId.toString(), tr])
    );

    const testsWithStatus = tests.map((test) => {
      const result = resultsMap.get(test._id.toString());
      return {
        ...test.toObject(),
        completed: !!result,
        score: result?.score,
      };
    });

    return NextResponse.json({ tests: testsWithStatus }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assigned tests' },
      { status: 500 }
    );
  }
}

