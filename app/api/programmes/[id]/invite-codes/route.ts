import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// GET /api/programmes/[id]/invite-codes
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const programme = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    const codes = await prisma.programmeInviteCode.findMany({
      where: { programmeId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ codes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invite codes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/programmes/[id]/invite-codes — generate a new invite code
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { maxUses, expiresAt } = body;

    const programme = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    const code = await prisma.programmeInviteCode.create({
      data: {
        programmeId: id,
        code: nanoid(10).toUpperCase(),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ code }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create invite code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
