import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const candidate = await prisma.candidate.findUnique({
      where: { email: 'godwin@egobas.com' },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const testResults = await prisma.testResult.findMany({
      where: { candidateId: candidate.id },
      include: { answers: true },
    });

    return NextResponse.json({
      session: {
        hasSession: !!session,
        userType: session?.user?.userType,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      },
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        onboardingTestPassed: candidate.onboardingTestPassed,
        onboardingTestScore: candidate.onboardingTestScore,
      },
      testResults: testResults.map((tr) => ({
        id: tr.id,
        score: tr.score,
        passed: tr.passed,
        completedAt: tr.completedAt,
        answersCount: tr.answers.length,
      })),
      totalTestResults: testResults.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { email: 'godwin@egobas.com' },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    let onboardingTest = await prisma.aptitudeTest.findFirst({
      where: { testType: 'ONBOARDING' },
    });

    if (!onboardingTest) {
      onboardingTest = await prisma.aptitudeTest.create({
        data: { title: 'Onboarding Test', testType: 'ONBOARDING', passingScore: 70, isActive: true },
      });
    }

    const testResult = await prisma.testResult.create({
      data: {
        testId: onboardingTest.id,
        candidateId: candidate.id,
        score: 80,
        passingScore: 70,
        passed: true,
        answers: {
          create: [{ questionId: '1', selectedAnswer: 'Test', isCorrect: true }],
        },
      },
    });

    return NextResponse.json({
      message: 'Test result created',
      testResult: { id: testResult.id, score: testResult.score, passed: testResult.passed },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
