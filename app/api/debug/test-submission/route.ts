import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Candidate from '@/models/Candidate';
import TestResult from '@/models/TestResult';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    await dbConnect();

    // Find Godwin's candidate record
    const candidate = await Candidate.findOne({ email: 'godwin@egobas.com' });
    
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Check for test results
    const testResults = await TestResult.find({ candidateId: candidate._id });

    return NextResponse.json({
      session: {
        hasSession: !!session,
        userType: session?.user?.userType,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      },
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        onboardingTestPassed: candidate.onboardingTestPassed,
        onboardingTestScore: candidate.onboardingTestScore,
      },
      testResults: testResults.map(tr => ({
        id: tr._id,
        score: tr.score,
        passed: tr.passed,
        completedAt: tr.completedAt,
        answersCount: tr.answers.length,
      })),
      totalTestResults: testResults.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Test endpoint to manually create a test result
export async function POST() {
  try {
    await dbConnect();

    const candidate = await Candidate.findOne({ email: 'godwin@egobas.com' });
    
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Create a test result
    const testResult = await TestResult.create({
      testId: new mongoose.Types.ObjectId(),
      candidateId: candidate._id,
      answers: [
        { questionId: '1', selectedAnswer: 'Test', isCorrect: true },
      ],
      score: 80,
      passingScore: 70,
      passed: true,
    });

    return NextResponse.json({
      message: 'Test result created',
      testResult: {
        id: testResult._id,
        score: testResult.score,
        passed: testResult.passed,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
