import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userType, portalId } = session.user;
    if (!['portal_user', 'portal_gov'].includes(userType))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!portalId)
      return NextResponse.json({ error: 'No portal associated with this session' }, { status: 400 });

    const body = await request.json();
    const { name, description, startDate, endDate, maxParticipants, inviteOnly, country, city } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Programme name is required' }, { status: 400 });

    // Get portal type for the programme record
    const portal = await prisma.programmePortal.findUnique({ where: { id: portalId }, select: { type: true } });
    if (!portal) return NextResponse.json({ error: 'Portal not found' }, { status: 404 });

    const slug = generateSlug(name.trim());

    const programme = await prisma.programme.create({
      data: {
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        type: portal.type,
        portalId,
        country: country?.trim() || null,
        city: city?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        inviteOnly: inviteOnly !== false,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ programme }, { status: 201 });
  } catch (error) {
    console.error('Programme create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userType, portalId } = session.user;

    if (!['portal_user', 'portal_gov'].includes(userType)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!portalId) {
      return NextResponse.json({ error: 'No portal associated with this session' }, { status: 400 });
    }

    const programmes = await prisma.programme.findMany({
      where: { portalId },
      include: {
        members: { select: { id: true } },
        inviteCodes: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ programmes });
  } catch (error) {
    console.error('Programmes fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
