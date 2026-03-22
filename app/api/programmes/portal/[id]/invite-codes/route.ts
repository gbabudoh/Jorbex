import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// POST /api/programmes/portal/[id]/invite-codes
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (!['portal_user', 'portal_gov'].includes(userType))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    const programme = await prisma.programme.findFirst({ where: { id, portalId } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const { label, maxUses, expiresAt } = body;

    const inviteCode = await prisma.programmeInviteCode.create({
      data: {
        programmeId: id,
        code: generateInviteCode(),
        label: label?.trim() || null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ inviteCode }, { status: 201 });
  } catch (error) {
    console.error('Invite code create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
