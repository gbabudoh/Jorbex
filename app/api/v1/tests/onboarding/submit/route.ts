import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Candidate from '@/models/Candidate';
import TestResult from '@/models/TestResult';
import { calculateTestScore, isPassingScore } from '@/lib/utils';

// Same questions as in the GET route - in production, fetch from database
const ONBOARDING_QUESTIONS = [
  { id: '1', correctAnswer: 'Cannot be determined' },
  { id: '2', correctAnswer: '42' },
  { id: '3', correctAnswer: '5 hours' },
  { id: '4', correctAnswer: 'Carrot' },
  { id: '5', correctAnswer: 'Friday' },
  { id: '6', correctAnswer: '600' },
  { id: '7', correctAnswer: 'I' },
  { id: '8', correctAnswer: '6' },
  { id: '9', correctAnswer: '80' },
  { id: '10', correctAnswer: 'Some managers are mentors' },
];

export async function POST(request: Request) {
  try {
    console.log('=== TEST SUBMISSION STARTED ===');
    const session = await getServerSession(authOptions);
    
    console.log('Session check:', {
      hasSession: !!session,
      userType: session?.user?.userType,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });
    
    if (!session || session.user?.userType !== 'candidate') {
      console.error('Unauthorized access attempt:', { session });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');

    const body = await request.json();
    const { answers } = body;

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'No answers provided' },
        { status: 400 }
      );
    }

    // Create correct answers map
    const correctAnswers: Record<string, string> = {};
    ONBOARDING_QUESTIONS.forEach((q) => {
      correctAnswers[q.id] = q.correctAnswer.trim();
    });

    // Normalize user answers for comparison (trim whitespace)
    const normalizedAnswers: Record<string, string> = {};
    Object.keys(answers).forEach((key) => {
      normalizedAnswers[key] = String(answers[key] || '').trim();
    });

    console.log('Test submission details:', {
      candidateId: session.user?.id,
      totalAnswers: Object.keys(normalizedAnswers).length,
      expectedQuestions: ONBOARDING_QUESTIONS.length,
      answers: normalizedAnswers,
      correctAnswers,
    });

    // Calculate score with normalized answers
    const score = calculateTestScore(normalizedAnswers, correctAnswers);
    const passed = isPassingScore(score, 70);

    console.log('Score calculation:', {
      score,
      passed,
      passingThreshold: 70,
    });

    // Create answer array for TestResult
    const answerArray = Object.keys(normalizedAnswers).map((questionId) => {
      const userAnswer = normalizedAnswers[questionId];
      const correctAnswer = correctAnswers[questionId];
      const isCorrect = userAnswer === correctAnswer;
      
      return {
        questionId,
        selectedAnswer: userAnswer,
        isCorrect,
      };
    });

    // Create test result (we'll need a test ID - for now, use a placeholder)
    // In production, create or fetch the onboarding test from database
    console.log('Creating test result with data:', {
      candidateId: session.user?.id,
      answersCount: answerArray.length,
      score,
      passed,
    });
    
    const testResult = await TestResult.create({
      testId: new (await import('mongoose')).Types.ObjectId(), // Placeholder
      candidateId: session.user?.id,
      answers: answerArray,
      score,
      passingScore: 70,
      passed,
    });
    
    console.log('Test result created successfully:', {
      testResultId: testResult._id,
      score: testResult.score,
      passed: testResult.passed,
    });

    // Update candidate
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      session.user?.id,
      {
        onboardingTestPassed: passed,
        onboardingTestScore: score,
      },
      { new: true }
    );

    if (!updatedCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    console.log('Candidate updated:', {
      name: updatedCandidate.name,
      email: updatedCandidate.email,
      score,
      passed,
    });

    return NextResponse.json(
      {
        score,
        passed,
        testResultId: testResult._id,
        message: passed 
          ? 'Congratulations! You passed the onboarding test.' 
          : `You scored ${score}%. You need at least 70% to pass.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('=== TEST SUBMISSION ERROR ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to submit test',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

