import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET: Fetch all active/recent attendance sessions for an employer's staff
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeSessions = await prisma.attendanceSession.findMany({
      where: {
        employmentRecord: {
          employerId: session.user.id,
        },
        // Show sessions from the last 24 hours even if closed, 
        // OR sessions that are currently open.
        OR: [
          { clockOut: null },
          { 
            clockIn: {
              gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        ]
      },
      include: {
        employmentRecord: {
          select: {
            id: true,
            candidate: {
              select: {
                id: true,
                name: true,
                expertise: true,
              },
            },
          },
        },
      },
      orderBy: {
        clockIn: 'desc',
      },
    });

    return NextResponse.json({ sessions: activeSessions });
  } catch (error) {
    console.error('Error fetching office dashboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
