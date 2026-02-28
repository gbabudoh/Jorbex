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

    const userType = session.user.userType;
    const userId = session.user.id;

    const notifications = await prisma.notificationLog.findMany({
      where: {
        channel: 'IN_APP',
        ...(userType === 'employer'
          ? { employerId: userId }
          : { candidateId: userId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds, markAllAsRead } = await request.json();
    const userType = session.user.userType;
    const userId = session.user.id;

    if (markAllAsRead) {
      await prisma.notificationLog.updateMany({
        where: {
          channel: 'IN_APP',
          status: 'SENT',
          ...(userType === 'employer'
            ? { employerId: userId }
            : { candidateId: userId }),
        },
        data: { status: 'DELIVERED' },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notificationLog.updateMany({
        where: {
          id: { in: notificationIds },
          ...(userType === 'employer'
            ? { employerId: userId }
            : { candidateId: userId }),
        },
        data: { status: 'DELIVERED' },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update notifications';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
