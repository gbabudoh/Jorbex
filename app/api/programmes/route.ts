import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET /api/programmes — list employer's programmes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programmes = await prisma.programme.findMany({
      where: { ownerId: session.user.id },
      include: {
        _count: { select: { members: true, programmeJobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ programmes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch programmes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/programmes — create a programme
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, description, type, country, city,
      startDate, endDate, maxParticipants,
      inviteOnly = true, allowedDomains = [],
      logoUrl, bannerUrl, primaryColour, welcomeMessage,
      billingModel, billingAmount, billingCurrency,
    } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = toSlug(name);
    let slug = baseSlug;
    const exists = await prisma.programme.findUnique({ where: { slug } });
    if (exists) slug = `${baseSlug}-${nanoid(6).toLowerCase()}`;

    const programme = await prisma.programme.create({
      data: {
        slug,
        name,
        description: description || null,
        type,
        ownerId: session.user.id,
        country: country || null,
        city: city || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        inviteOnly,
        allowedDomains,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        primaryColour: primaryColour || '#10b981',
        welcomeMessage: welcomeMessage || null,
        billingModel: billingModel || 'FLAT',
        billingAmount: billingAmount ? Number(billingAmount) : null,
        billingCurrency: billingCurrency || 'NGN',
        status: 'DRAFT',
      },
    });

    // Auto-generate a default invite code
    await prisma.programmeInviteCode.create({
      data: {
        programmeId: programme.id,
        code: nanoid(10).toUpperCase(),
      },
    });

    return NextResponse.json({ programme }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create programme';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
