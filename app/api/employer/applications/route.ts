import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Application from '@/models/Application';
import Employer from '@/models/Employer';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const employer = await Employer.findById(session.user.id);
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // Parse query params for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = new URL(req.url) as any;
    const status = url.searchParams.get('status');
    const jobId = url.searchParams.get('jobId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { employerId: employer._id };
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;

    const applications = await Application.find(query)
      .populate('candidateId', 'name email status headshot') // specific fields
      .populate('jobId', 'title')
      .populate('testResultId', 'score status') // If they did a test
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (error: unknown) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
