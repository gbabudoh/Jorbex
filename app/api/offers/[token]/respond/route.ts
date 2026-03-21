import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

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
        candidate: { select: { name: true, email: true } },
        employer:  { select: { companyName: true } },
        job:       { select: { title: true } },
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

    if (status === 'accepted') {
      try {
        const { notifyCandidateHired, notifyPostHire } = await import('@/lib/notifications');

        // Notify internal Mattermost
        await notifyCandidateHired(
          offer.candidate.name,
          offer.employer.companyName,
          offer.job.title
        );

        // Trigger day-1 post-hire notification
        notifyPostHire({
          type:           'day1',
          candidateId:    offer.candidateId,
          candidateEmail: offer.candidate.email ?? '',
          candidateName:  offer.candidate.name,
          employerId:     offer.employerId,
          companyName:    offer.employer.companyName,
          position:       offer.job.title,
        }).catch(() => {});

        // Create default onboarding checklist for employer
        await prisma.onboardingTask.createMany({
          data: [
            { offerId: offer.id, task: 'Share first day instructions with the new hire', order: 1 },
            { offerId: offer.id, task: 'Confirm bank account details for salary payment',  order: 2 },
            { offerId: offer.id, task: 'Send equipment or access credentials',              order: 3 },
            { offerId: offer.id, task: 'Set probation period end date',                     order: 4 },
            { offerId: offer.id, task: 'Schedule 30-day check-in meeting',                  order: 5 },
          ],
        });
      } catch (err) {
        console.error('Failed to send hire notification or create tasks:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error responding to offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
