import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/ntfy';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateId, jobId, content, salary, startDate, currency } = await req.json();

    if (!candidateId || !jobId || !content || !salary || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Employer
    const employer = await prisma.employer.findUnique({ where: { id: session.user.id } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // 2. Find Application
    const application = await prisma.application.findFirst({
      where: { candidateId, employerId: employer.id, jobId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Create Offer
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const offer = await prisma.offer.create({
      data: {
        candidateId,
        employerId: employer.id,
        jobId,
        content,
        salary,
        currency: currency || 'NGN',
        startDate: new Date(startDate),
        expiresAt,
        status: 'PENDING',
        token,
      },
    });

    // 4. Update Application Status
    await prisma.application.update({
      where: { id: application.id },
      data: { status: 'OFFER_SENT', offerId: offer.id },
    });

    // 5. Notify Candidate
    const offerLink = `${process.env.NEXTAUTH_URL}/offer/${offer.token}`;
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });

    if (candidate?.ntfyTopic) {
      await sendPushNotification({
        topic: candidate.ntfyTopic,
        title: '🎉 Job Offer Received!',
        message: `Congratulations! ${employer.companyName} has sent you a job offer.`,
        click: offerLink,
        userId: candidate.id,
        userType: 'candidate',
        tags: ['tada', 'moneybag'],
      });
    }

    return NextResponse.json({ success: true, offerId: offer.id, token: offer.token });
  } catch (error: unknown) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
