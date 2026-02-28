import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers } = await request.json();

    if (!answers) {
      return NextResponse.json({ error: 'Missing answers' }, { status: 400 });
    }

    // Find the test
    const test = await prisma.aptitudeTest.findFirst({
      where: { id: testId, isActive: true },
      include: { questions: true },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found or not assigned to you' }, { status: 404 });
    }

    // Check if already completed
    const existingResult = await prisma.testResult.findFirst({
      where: { testId, candidateId: session.user.id },
    });

    if (existingResult) {
      return NextResponse.json({ error: 'You have already completed this test' }, { status: 400 });
    }

    // Calculate score
    let correctCount = 0;
    test.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / test.questions.length) * 100);
    const passed = score >= (test.passingScore || 70);

    // Save result with answers
    const newResult = await prisma.testResult.create({
      data: {
        testId,
        candidateId: session.user.id,
        employerId: test.employerId,
        score,
        passed,
        passingScore: test.passingScore || 70,
        completedAt: new Date(),
        answers: {
          create: Object.entries(answers).map(([qId, val]) => ({
            questionId: qId,
            selectedAnswer: val as string,
            isCorrect: test.questions.find((q) => q.id === qId)?.correctAnswer === val,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      score,
      passed,
      message: 'Test submitted successfully',
    }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
