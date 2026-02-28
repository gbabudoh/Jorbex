import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    const offer = await prisma.offer.findUnique({
      where: { token },
      include: {
        employer: { select: { companyName: true } },
        candidate: { select: { name: true } },
        job: { select: { title: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Check expiration
    if (new Date() > offer.expiresAt && offer.status === 'PENDING') {
      await prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'EXPIRED' },
      });
    }

    return NextResponse.json({
      offer: {
        companyName: offer.employer.companyName,
        candidateName: offer.candidate.name,
        jobTitle: offer.job.title,
        content: offer.content,
        salary: offer.salary,
        currency: offer.currency,
        startDate: offer.startDate,
        expiresAt: offer.expiresAt,
        status: offer.status,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
