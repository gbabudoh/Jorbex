import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLiveKitToken } from '@/lib/livekit';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomName } = await request.json();

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    const participantName = session.user.name || 'Participant';
    const participantIdentity = `${session.user.userType}-${session.user.id}`;

    const token = await createLiveKitToken(roomName, participantName, participantIdentity);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate token';
    console.error('LiveKit token error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
