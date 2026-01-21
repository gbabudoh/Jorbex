import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import Application from '@/models/Application';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    await dbConnect();

    const job = await Job.findById(id).populate('employerId', 'companyName industry logo description');
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Check if user already applied
    const application = await Application.findOne({ 
      jobId: id, 
      candidateId: session.user.id 
    });

    return NextResponse.json({ 
      job,
      hasApplied: !!application
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch job details';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
