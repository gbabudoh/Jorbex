import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
import Application from '@/models/Application';

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    const { status } = await req.json();

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await dbConnect();

    const offer = await Offer.findOne({ token }).populate('candidateId').populate('employerId').populate('jobId');

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (offer.status !== 'pending') {
      return NextResponse.json({ error: 'Offer already responded to' }, { status: 400 });
    }

    if (new Date() > offer.expiresAt) {
      return NextResponse.json({ error: 'Offer expired' }, { status: 400 });
    }

    // Update Offer
    offer.status = status;
    await offer.save();

    // Update Application
    const newAppStatus = status === 'accepted' ? 'hired' : 'rejected';
    await Application.findByIdAndUpdate(offer.applicationId, { status: newAppStatus });

    // Notify Employer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyOffer = offer as any;
    const employer = anyOffer.employerId;
    const candidateName = anyOffer.candidateId?.name || 'Candidate';
    const jobTitle = anyOffer.jobId?.title || 'Position';

    if (employer && employer.userId) {
       // Send Mattermost Hired Alert if accepted
        if (status === 'accepted') {
             const { notifyCandidateHired } = await import('@/lib/notifications');
             await notifyCandidateHired(candidateName, employer.companyName, jobTitle);
        }
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error responding to offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
