import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, score = 80 } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const passed = score >= 70;

    // Check if test result already exists
    const existingResult = await prisma.testResult.findFirst({
      where: { candidateId: candidate.id },
    });

    if (existingResult) {
      return NextResponse.json({
        message: 'Test result already exists',
        testResult: {
          id: existingResult.id,
          score: existingResult.score,
          passed: existingResult.passed,
          completedAt: existingResult.completedAt,
        },
      }, { status: 200 });
    }

    // We need a test to link to - find or create a placeholder onboarding test
    let onboardingTest = await prisma.aptitudeTest.findFirst({
      where: { testType: 'ONBOARDING' },
    });

    if (!onboardingTest) {
      onboardingTest = await prisma.aptitudeTest.create({
        data: {
          title: 'Onboarding Aptitude Test',
          testType: 'ONBOARDING',
          passingScore: 70,
          isActive: true,
        },
      });
    }

    const testResult = await prisma.testResult.create({
      data: {
        testId: onboardingTest.id,
        candidateId: candidate.id,
        score,
        passingScore: 70,
        passed,
        completedAt: new Date(),
        answers: {
          create: [{ questionId: 'manual', selectedAnswer: 'Manual entry', isCorrect: true }],
        },
      },
    });

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { onboardingTestPassed: passed, onboardingTestScore: score },
    });

    return NextResponse.json({
      message: 'Test result created and candidate updated successfully',
      candidate: {
        id: updatedCandidate.id,
        name: updatedCandidate.name,
        email: updatedCandidate.email,
        onboardingTestPassed: updatedCandidate.onboardingTestPassed,
        onboardingTestScore: updatedCandidate.onboardingTestScore,
      },
      testResult: { id: testResult.id, score: testResult.score, passed: testResult.passed, completedAt: testResult.completedAt },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Manual test fix error';
    console.error('Manual test fix error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const testResults = await prisma.testResult.findMany({
      where: { candidateId: candidate.id },
    });

    return NextResponse.json({
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
      })),
      totalTestResults: testResults.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
