import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where = session.user.userType === 'employer'
      ? { employerId: session.user.id }
      : { candidateId: session.user.id };

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        employer: { select: { id: true, name: true, companyName: true } },
        candidate: { select: { id: true, name: true, phone: true, expertise: true } },
      },
      orderBy: { dateTime: 'asc' },
    });

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { candidateId, dateTime, type, location, notes } = body;

    if (!candidateId || !dateTime || !type || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateId, dateTime, type, and location are required' },
        { status: 400 }
      );
    }

    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const interview = await prisma.interview.create({
      data: {
        employerId: session.user.id,
        candidateId,
        dateTime: new Date(dateTime),
        type: type.toUpperCase(),
        location,
        notes,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully',
      interviewId: interview.id,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to schedule interview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
