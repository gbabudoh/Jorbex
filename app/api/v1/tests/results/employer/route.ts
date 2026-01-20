import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import TestResult from '@/models/TestResult';
import Candidate from '@/models/Candidate';
import AptitudeTest from '@/models/AptitudeTest';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Fetch original tests to map titles if needed, 
    // but TestResult should already link to the specific assigned test.
    // We want to fetch results where employerId matches the current user.
    const results = await TestResult.find({
      employerId: session.user.id
    })
    .populate({
      path: 'candidateId',
      select: 'name email expertise',
      model: Candidate
    })
    .populate({
      path: 'testId',
      select: 'title description testType originalTestId',
      model: AptitudeTest
    })
    .sort({ completedAt: -1 });

    return NextResponse.json({ results }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to fetch test results:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
