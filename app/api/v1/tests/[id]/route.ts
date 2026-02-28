import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (session.user.userType === 'candidate') {
      const test = await prisma.aptitudeTest.findFirst({
        where: { id, isActive: true },
        include: { questions: true },
      });

      if (!test) {
        return NextResponse.json({ error: 'Test not found or not assigned to you' }, { status: 404 });
      }

      // Check if already completed
      const result = await prisma.testResult.findFirst({
        where: { testId: id, candidateId: session.user.id },
      });

      if (result) {
        return NextResponse.json(
          { error: 'You have already completed this test', result },
          { status: 400 }
        );
      }

      return NextResponse.json({ test }, { status: 200 });
    } else if (session.user.userType === 'employer') {
      const test = await prisma.aptitudeTest.findFirst({
        where: { id, employerId: session.user.id },
        include: { questions: true },
      });

      if (!test) {
        const existsAtAll = await prisma.aptitudeTest.findUnique({ where: { id } });
        if (existsAtAll) {
          return NextResponse.json({ error: `Test belongs to another employer (ID: ${id})` }, { status: 403 });
        }
        return NextResponse.json({ error: `Test truly not found in DB (ID: ${id})` }, { status: 404 });
      }

      return NextResponse.json({ test }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Only update allowed fields
    const { title, description, passingScore, timeLimit, isActive } = body;

    const updatedTest = await prisma.aptitudeTest.updateMany({
      where: { id, employerId: session.user.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(passingScore !== undefined && { passingScore }),
        ...(timeLimit !== undefined && { timeLimit }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    if (updatedTest.count === 0) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 });
    }

    const test = await prisma.aptitudeTest.findUnique({ where: { id }, include: { questions: true } });
    return NextResponse.json({ success: true, test }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await prisma.aptitudeTest.deleteMany({
      where: { id, employerId: session.user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Test not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Test deleted' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
