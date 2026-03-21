import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/programmes/public/[slug]/enrol
// Candidate enrols in a programme using an invite code
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'You must be signed in as a candidate to enrol' }, { status: 401 });
    }

    const { slug } = await params;
    const { inviteCode } = await request.json();

    const programme = await prisma.programme.findUnique({
      where: { slug },
      include: { inviteCodes: true },
    });

    if (!programme || programme.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Programme not found or not accepting enrolments' }, { status: 404 });
    }

    // Check capacity
    if (programme.maxParticipants) {
      const activeCount = await prisma.programmeMember.count({
        where: { programmeId: programme.id, status: 'ACTIVE' },
      });
      if (activeCount >= programme.maxParticipants) {
        return NextResponse.json({ error: 'Programme is at capacity' }, { status: 409 });
      }
    }

    // Validate invite code if programme is invite-only
    if (programme.inviteOnly) {
      if (!inviteCode) {
        return NextResponse.json({ error: 'An invite code is required to join this programme' }, { status: 400 });
      }

      const code = programme.inviteCodes.find(c => c.code === inviteCode.toUpperCase());
      if (!code) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
      }
      if (code.expiresAt && code.expiresAt < new Date()) {
        return NextResponse.json({ error: 'This invite code has expired' }, { status: 400 });
      }
      if (code.maxUses !== null && code.usedCount >= code.maxUses) {
        return NextResponse.json({ error: 'This invite code has reached its usage limit' }, { status: 400 });
      }

      // Increment usage count
      await prisma.programmeInviteCode.update({
        where: { id: code.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Check allowed email domains
    if (programme.allowedDomains.length > 0) {
      const candidateEmail = session.user.email ?? '';
      const domain = candidateEmail.split('@')[1] ?? '';
      if (!programme.allowedDomains.includes(domain)) {
        return NextResponse.json({
          error: `Enrolment is restricted to email addresses from: ${programme.allowedDomains.join(', ')}`,
        }, { status: 403 });
      }
    }

    // Check if already enrolled
    const existing = await prisma.programmeMember.findUnique({
      where: {
        programmeId_candidateId: {
          programmeId: programme.id,
          candidateId: session.user.id,
        },
      },
    });

    if (existing) {
      if (existing.status === 'ACTIVE') {
        return NextResponse.json({ error: 'You are already enrolled in this programme' }, { status: 409 });
      }
      // Re-activate if previously removed
      await prisma.programmeMember.update({
        where: { id: existing.id },
        data: { status: 'ACTIVE', enrolledAt: new Date() },
      });
      return NextResponse.json({ message: 'Successfully re-enrolled in programme' });
    }

    await prisma.programmeMember.create({
      data: {
        programmeId: programme.id,
        candidateId: session.user.id,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ message: 'Successfully enrolled in programme' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to enrol';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
