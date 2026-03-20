import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInAppFeed, markAllAsRead as novuMarkAllAsRead } from '@/lib/novu';

// GET /api/v1/notifications — returns Novu in-app feed for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch from Novu in-app channel
    const feed = await getInAppFeed(userId);

    // Normalise to the shape the NotificationDropdown expects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notifications = feed.map((item: any) => ({
      _id:         item._id ?? item.id,
      type:        item.payload?.type?.toUpperCase() ?? 'SYSTEM',
      content:     item.content ?? item.payload?.message ?? '',
      status:      item.read ? 'DELIVERED' : 'SENT',
      createdAt:   item.createdAt,
      referenceId: item.payload?.referenceId ?? null,
      actionUrl:   item.cta?.action?.buttons?.[0]?.url ?? item.payload?.actionUrl ?? null,
    }));

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH /api/v1/notifications — mark all as read via Novu
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { markAllAsRead } = await request.json();
    const userId = session.user.id;

    if (markAllAsRead) {
      await novuMarkAllAsRead(userId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update notifications';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
