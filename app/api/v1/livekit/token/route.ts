import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLiveKitToken } from '@/lib/livekit';

export async function POST(request: Request) {
  try {
    const { roomName, displayName } = await request.json();

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Try to get session for identity, but allow unauthenticated access for interview links
    const session = await getServerSession(authOptions);

    let participantName: string;
    let participantIdentity: string;

    if (session?.user) {
      participantName = session.user.name || 'Participant';
      participantIdentity = `${session.user.userType}-${session.user.id}`;
    } else {
      // Guest access for interview links — use displayName or generate guest identity
      participantName = displayName || 'Guest';
      participantIdentity = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    const token = await createLiveKitToken(roomName, participantName, participantIdentity);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate token';
    console.error('LiveKit token error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
