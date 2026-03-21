import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/programmes/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const programme = await prisma.programme.findFirst({
      where: { id, ownerId: session.user.id },
      include: {
        members: {
          include: { candidate: { select: { id: true, name: true, email: true, expertise: true, onboardingTestScore: true, onboardingTestPassed: true } } },
          orderBy: { enrolledAt: 'desc' },
        },
        programmeJobs: {
          include: { job: { select: { id: true, title: true, type: true, status: true, createdAt: true } } },
        },
        inviteCodes: { orderBy: { createdAt: 'desc' } },
        _count: { select: { members: true } },
      },
    });

    if (!programme) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });
    return NextResponse.json({ programme });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch programme';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/programmes/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.programme.findFirst({ where: { id, ownerId: session.user.id } });
    if (!existing) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    const { name, description, country, city, startDate, endDate, maxParticipants,
            inviteOnly, allowedDomains, logoUrl, bannerUrl, primaryColour,
            welcomeMessage, billingModel, billingAmount, billingCurrency, status } = body;

    const programme = await prisma.programme.update({
      where: { id },
      data: {
        ...(name              && { name }),
        ...(description !== undefined && { description }),
        ...(country     !== undefined && { country }),
        ...(city        !== undefined && { city }),
        ...(startDate   !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate     !== undefined && { endDate:   endDate   ? new Date(endDate)   : null }),
        ...(maxParticipants !== undefined && { maxParticipants: maxParticipants ? Number(maxParticipants) : null }),
        ...(inviteOnly  !== undefined && { inviteOnly }),
        ...(allowedDomains   && { allowedDomains }),
        ...(logoUrl     !== undefined && { logoUrl }),
        ...(bannerUrl   !== undefined && { bannerUrl }),
        ...(primaryColour    && { primaryColour }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(billingModel     && { billingModel }),
        ...(billingAmount !== undefined && { billingAmount: billingAmount ? Number(billingAmount) : null }),
        ...(billingCurrency  && { billingCurrency }),
        ...(status           && { status }),
      },
    });

    return NextResponse.json({ programme });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update programme';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/programmes/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const result = await prisma.programme.deleteMany({ where: { id, ownerId: session.user.id } });
    if (result.count === 0) return NextResponse.json({ error: 'Programme not found' }, { status: 404 });

    return NextResponse.json({ message: 'Programme deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete programme';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
