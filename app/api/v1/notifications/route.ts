import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import NotificationLog from '@/models/NotificationLog';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const notifications = await NotificationLog.find({
      userId: session.user.id,
      channel: 'IN_APP',
    })
    .sort({ createdAt: -1 })
    .limit(20);

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

    await dbConnect();

    if (markAllAsRead) {
      await NotificationLog.updateMany(
        { userId: session.user.id, channel: 'IN_APP', status: 'SENT' },
        { status: 'DELIVERED' } // We can use DELIVERED to mean "seen" in this context
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await NotificationLog.updateMany(
        { _id: { $in: notificationIds }, userId: session.user.id },
        { status: 'DELIVERED' }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update notifications';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
