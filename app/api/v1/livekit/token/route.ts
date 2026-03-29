import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLiveKitToken } from '@/lib/livekit';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { roomName, displayName, panelToken } = await request.json();

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    let participantName: string;
    let participantIdentity: string;

    // Panel invite token takes highest priority — external interviewer without a Jorbex account
    if (panelToken) {
      const invite = await prisma.panelInvite.findUnique({ where: { token: panelToken } });
      if (invite && invite.expiresAt > new Date()) {
        participantName = invite.name;
        participantIdentity = `panel-${invite.id}`;
        const token = await createLiveKitToken(roomName, participantName, participantIdentity);
        return NextResponse.json({ token }, { status: 200 });
      }
      // Invalid or expired token — fall through to session / guest
    }

    const session = await getServerSession(authOptions);

    if (session?.user) {
      participantName = session.user.name || 'Participant';
      participantIdentity = `${session.user.userType}-${session.user.id}`;
    } else {
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
