import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Offer from '@/models/Offer';
// import Job from '@/models/Job';
// import Candidate from '@/models/Candidate';

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    await dbConnect();

    const offer = await Offer.findOne({ token })
      .populate('employerId', 'companyName')
      .populate('candidateId', 'name') // ensure candidate name is there
      .populate('jobId', 'title');

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (new Date() > offer.expiresAt) {
        if (offer.status === 'pending') {
             offer.status = 'expired';
             await offer.save();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyOffer = offer as any;
    // Return safe data
    return NextResponse.json({
      offer: {
        companyName: anyOffer.employerId.companyName,
        candidateName: anyOffer.candidateId.name,
        jobTitle: anyOffer.jobId.title,
        content: offer.content,
        salary: offer.salary,
        currency: offer.currency,
        startDate: offer.startDate,
        expiresAt: offer.expiresAt,
        status: offer.status,
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
