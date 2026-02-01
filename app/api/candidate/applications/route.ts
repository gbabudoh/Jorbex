import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Application from '@/models/Application';
import Candidate from '@/models/Candidate';
import Job from '@/models/Job';
import Employer from '@/models/Employer';
import { notifyNewApplication } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const candidate = await Candidate.findById(session.user.id);
    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });

    const applications = await Application.find({ candidateId: candidate._id })
      .populate('jobId', 'title location type employerId')
      .populate({
        path: 'jobId',
        populate: { path: 'employerId', select: 'companyName industry' }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch applications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await request.json();
    if (!jobId) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    await dbConnect();

    const candidate = await Candidate.findById(session.user.id);
    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });

    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Check if duplicate application
    const existing = await Application.findOne({ candidateId: candidate._id, jobId });
    if (existing) return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });

    const application = await Application.create({
      candidateId: candidate._id,
      jobId,
      employerId: job.employerId,
      status: 'Applied'
    });

    // Send Notifications
    const employer = await Employer.findById(job.employerId);
    if (employer) {
      await notifyNewApplication(
        candidate._id.toString(),
        candidate.email,
        candidate.name,
        employer._id.toString(),
        employer.companyName,
        job.title,
        application._id.toString(),
        `${process.env.NEXT_PUBLIC_APP_URL}/employer/applications?id=${application._id}`
      );
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to apply for job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
