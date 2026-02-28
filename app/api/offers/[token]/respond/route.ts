import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { status } = await req.json();

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { token },
      include: {
        candidate: { select: { name: true } },
        employer: { select: { companyName: true } },
        job: { select: { title: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json({ error: 'Offer already responded to' }, { status: 400 });
    }

    if (new Date() > offer.expiresAt) {
      return NextResponse.json({ error: 'Offer expired' }, { status: 400 });
    }

    // Update Offer
    const newOfferStatus = status === 'accepted' ? 'ACCEPTED' : 'REJECTED';
    await prisma.offer.update({
      where: { id: offer.id },
      data: { status: newOfferStatus },
    });

    // Update Application
    const newAppStatus = status === 'accepted' ? 'HIRED' : 'REJECTED';
    // Find the application linked to this offer
    const application = await prisma.application.findFirst({
      where: { offerId: offer.id },
    });
    if (application) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: newAppStatus },
      });
    }

    // Notify Employer if accepted
    if (status === 'accepted') {
      try {
        const { notifyCandidateHired } = await import('@/lib/notifications');
        await notifyCandidateHired(
          offer.candidate.name,
          offer.employer.companyName,
          offer.job.title
        );
      } catch (err) {
        console.error('Failed to send hire notification:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error responding to offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
