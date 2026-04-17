import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET: Check for an active session for the current candidate
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeSession = await prisma.attendanceSession.findFirst({
      where: {
        employmentRecord: {
          candidateId: session.user.id,
        },
        clockOut: null,
      },
      include: {
        employmentRecord: {
          select: {
            id: true,
            employer: {
              select: {
                name: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ session: activeSession });
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST: Clock-in (Create new session)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { employmentRecordId } = await req.json();

    if (!employmentRecordId) {
      return NextResponse.json({ error: 'Missing employmentRecordId' }, { status: 400 });
    }

    // Verify record ownership and status
    const record = await prisma.employmentRecord.findUnique({
      where: { id: employmentRecordId },
    });

    if (!record || record.candidateId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid employment record' }, { status: 403 });
    }

    // Check if there is already an active session
    const existingSession = await prisma.attendanceSession.findFirst({
      where: {
        employmentRecordId,
        clockOut: null,
      },
    });

    if (existingSession) {
      return NextResponse.json({ error: 'Already clocked in', session: existingSession }, { status: 400 });
    }

    // Capture IP (basic geofencing for Milestone 1)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const newSession = await prisma.attendanceSession.create({
      data: {
        employmentRecordId,
        ipAddress: ip,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error clocking in:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH: Clock-out (Close session)
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { employmentRecord: true },
    });

    if (!attendanceSession || attendanceSession.employmentRecord.candidateId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
    }

    if (attendanceSession.clockOut) {
      return NextResponse.json({ error: 'Already clocked out' }, { status: 400 });
    }

    const now = new Date();
    // Basic minutes calculation
    const diffMs = now.getTime() - attendanceSession.clockIn.getTime();
    const activeMinutes = Math.floor(diffMs / 60000);

    const updatedSession = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        clockOut: now,
        status: 'OFFLINE',
        totalActiveMinutes: attendanceSession.totalActiveMinutes + activeMinutes,
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error clocking out:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
