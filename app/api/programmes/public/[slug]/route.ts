import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/programmes/public/[slug] — public programme info for portal landing page
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const programme = await prisma.programme.findUnique({
      where: { slug },
      select: {
        id: true, slug: true, name: true, description: true, type: true,
        country: true, city: true, startDate: true, endDate: true,
        maxParticipants: true, inviteOnly: true, allowedDomains: true,
        logoUrl: true, bannerUrl: true, primaryColour: true, welcomeMessage: true,
        status: true,
        owner: { select: { companyName: true, country: true } },
        _count: { select: { members: true, programmeJobs: true } },
      },
    });

    if (!programme || programme.status === 'DRAFT') {
      return NextResponse.json({ error: 'Programme not found' }, { status: 404 });
    }

    return NextResponse.json({ programme });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch programme';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
