import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST: Receive heartbeat and update work status
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'candidate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId, status } = await req.json();

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
      return NextResponse.json({ error: 'Session already closed' }, { status: 400 });
    }

    // Update status and timestamp
    const updatedSession = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        status: status || 'ACTIVE',
        updatedAt: new Date(), // This serves as the "Last Seen" timestamp
      },
    });

    return NextResponse.json({ status: updatedSession.status, lastSeen: updatedSession.updatedAt });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
