import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/programmes/portal/[id] — full programme detail for portal users
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (!['portal_user', 'portal_gov'].includes(userType))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    const programme = await prisma.programme.findFirst({
      where: { id, portalId },
      include: {
        members: {
          include: {
            candidate: { select: { id: true, name: true, email: true, expertise: true, country: true } },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        inviteCodes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    return NextResponse.json({ programme });
  } catch (error) {
    console.error('Programme detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/programmes/portal/[id] — update status
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (!['portal_user', 'portal_gov'].includes(userType))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.programme.findFirst({ where: { id, portalId } });
    if (!existing) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    const updated = await prisma.programme.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json({ programme: updated });
  } catch (error) {
    console.error('Programme update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
