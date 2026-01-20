import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { candidateId, testId } = await request.json();

    if (!candidateId || !testId) {
      return NextResponse.json(
        { error: 'Candidate ID and Test ID are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the original test template
    const originalTest = await AptitudeTest.findOne({
      _id: testId,
      employerId: session.user?.id,
      testType: 'employer_custom'
    });

    if (!originalTest) {
      return NextResponse.json(
        { error: 'Test template not found' },
        { status: 404 }
      );
    }

    // Clone the test and assign it to the candidate
    const assignedTest = new AptitudeTest({
      title: originalTest.title,
      description: originalTest.description,
      testType: 'employer_custom',
      employerId: originalTest.employerId,
      candidateId: candidateId,
      originalTestId: originalTest._id,
      questions: originalTest.questions,
      passingScore: originalTest.passingScore,
      timeLimit: originalTest.timeLimit,
      isActive: true,
    });

    await assignedTest.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Test assigned successfully',
      assignedTestId: assignedTest._id 
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to assign test:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
