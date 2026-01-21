import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import Employer from '@/models/Employer';
import Candidate from '@/models/Candidate';
import Application from '@/models/Application';
import { sendPushNotification } from '@/lib/ntfy';
// import { TEMPLATE_IDS } from '@/lib/listmonk';

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

    await dbConnect();

    // 1. Verify Employer
    const employer = await Employer.findById(session.user.id);
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // 2. Find Application (to link it)
    const application = await Application.findOne({
      candidateId: candidateId,
      employerId: employer._id,
      jobId: jobId,
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Create Offer
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiration

    const offer = await Offer.create({
      candidateId,
      employerId: employer._id,
      jobId,
      applicationId: application._id,
      content,
      salary,
      currency: currency || 'NGN',
      startDate: new Date(startDate),
      expiresAt,
      status: 'pending',
    });

    // 4. Update Application Status
    application.status = 'offer_sent';
    application.offerId = offer._id;
    await application.save();

    // 5. Notify Candidate
    const offerLink = `${process.env.NEXTAUTH_URL}/offer/${offer.token}`;
    const candidate = await Candidate.findById(candidateId).populate('userId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyCandidate = candidate as any;
    if (candidate && anyCandidate.userId) {
       await sendPushNotification({
          topic: anyCandidate.ntfyTopic || `user_${anyCandidate.userId}`,
          title: '🎉 Job Offer Received!',
          message: `Congratulations! ${employer.companyName} has sent you a job offer.`,
          click: offerLink,
          userId: anyCandidate.userId.toString(),
          userType: 'candidate',
          tags: ['tada', 'moneybag']
        });
    }

    // Fallback email if no user attached (rare, but good practice)
    if (candidate && !anyCandidate.userId) {
       // Send direct listmonk email... we could use sendNotification logic if we refactor, but for now relies on linked user.
    }

    return NextResponse.json({ success: true, offerId: offer._id, token: offer.token });
  } catch (error: unknown) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
