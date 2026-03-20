import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, passingScore, timeLimit, questions } = body;

    if (!title) {
      return NextResponse.json({ error: 'Test title is required' }, { status: 400 });
    }
    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }

    const test = await prisma.aptitudeTest.create({
      data: {
        title,
        description: description || null,
        testType: 'EMPLOYER_CUSTOM',
        employerId: session.user.id,
        passingScore: passingScore ?? 70,
        timeLimit: timeLimit ?? null,
        isActive: true,
        questions: {
          create: questions.map((q: { question: string; options: string[]; correctAnswer: string }) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ test: { ...test, _id: test.id } }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating employer test:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tests = await prisma.aptitudeTest.findMany({
      where: {
        employerId: session.user.id,
        testType: 'EMPLOYER_CUSTOM',
        isActive: true,
        originalTestId: null,
      },
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch deadline via raw SQL (added after Prisma client generation)
    const ids = tests.map(t => t.id);
    const deadlineRows = ids.length > 0
      ? await prisma.$queryRaw<{ id: string; deadline: Date | null }[]>`
          SELECT id, deadline FROM "AptitudeTest" WHERE id = ANY(${ids}::uuid[])
        `
      : [];
    const deadlineMap = new Map(deadlineRows.map(r => [r.id, r.deadline]));

    return NextResponse.json({
      tests: tests.map(t => ({ ...t, _id: t.id, deadline: deadlineMap.get(t.id) ?? null }))
    });
  } catch (error: unknown) {
    console.error('Error fetching employer tests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
