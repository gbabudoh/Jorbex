import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateTestScore, isPassingScore } from '@/lib/utils';

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
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    const correctAnswers: Record<string, string> = {};
    ONBOARDING_QUESTIONS.forEach((q) => { correctAnswers[q.id] = q.correctAnswer.trim(); });

    const normalizedAnswers: Record<string, string> = {};
    Object.keys(answers).forEach((key) => { normalizedAnswers[key] = String(answers[key] || '').trim(); });

    const score = calculateTestScore(normalizedAnswers, correctAnswers);
    const passed = isPassingScore(score, 70);

    // Ensure an onboarding test record exists
    let onboardingTest = await prisma.aptitudeTest.findFirst({
      where: { testType: 'ONBOARDING', title: 'Logical Aptitude Test' },
    });
    if (!onboardingTest) {
      onboardingTest = await prisma.aptitudeTest.create({
        data: { title: 'Logical Aptitude Test', testType: 'ONBOARDING', passingScore: 70 },
      });
    }

    const answerArray = Object.keys(normalizedAnswers).map((questionId) => ({
      questionId,
      selectedAnswer: normalizedAnswers[questionId],
      isCorrect: normalizedAnswers[questionId] === correctAnswers[questionId],
    }));

    const testResult = await prisma.testResult.create({
      data: {
        testId: onboardingTest.id,
        candidateId: session.user.id,
        score,
        passingScore: 70,
        passed,
        answers: { create: answerArray },
      },
    });

    await prisma.candidate.update({
      where: { id: session.user.id },
      data: { onboardingTestPassed: passed, onboardingTestScore: score },
    });

    return NextResponse.json({
      score, passed, testResultId: testResult.id,
      message: passed
        ? 'Congratulations! You passed the onboarding test.'
        : `You scored ${score}%. You need at least 70% to pass.`,
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Test submission error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit test';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
