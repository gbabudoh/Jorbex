import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import AptitudeTest from '@/models/AptitudeTest';
import TestResult from '@/models/TestResult';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const testId = params.id;
    const { answers } = await request.json();

    if (!answers) {
      return NextResponse.json(
        { error: 'Missing answers' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the test
    const test = await AptitudeTest.findOne({
      _id: testId,
      candidateId: session.user.id,
      isActive: true,
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Check if already completed
    const existingResult = await TestResult.findOne({
      testId,
      candidateId: session.user.id,
    });

    if (existingResult) {
      return NextResponse.json(
        { error: 'You have already completed this test' },
        { status: 400 }
      );
    }

    // Calculate score
    let correctCount = 0;
    test.questions.forEach((q: { _id?: string; id?: string; correctAnswer: string }) => {
      const qId = (q._id ? q._id.toString() : q.id) as string;
      if (qId && answers[qId] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / test.questions.length) * 100);
    const passed = score >= (test.passingScore || 70);

    // Save result
    const newResult = new TestResult({
      testId,
      candidateId: session.user.id,
      score,
      passed,
      answers,
    });

    await newResult.save();

    return NextResponse.json({ 
      success: true, 
      score, 
      passed,
      message: 'Test submitted successfully' 
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
