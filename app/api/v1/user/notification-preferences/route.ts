import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import NotificationPreference from '@/models/NotificationPreference';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let preferences = await NotificationPreference.findOne({ userId: session.user.id });

    if (!preferences) {
      // Create default preferences if they don't exist
      preferences = await NotificationPreference.create({
        userId: session.user.id,
        userType: session.user.userType,
      });
    }

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch preferences';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    await dbConnect();

    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updates },
      { new: true, upsert: true }
    );

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
