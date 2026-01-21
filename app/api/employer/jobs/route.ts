import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import Employer from '@/models/Employer';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');

    await dbConnect();

    const query: Record<string, unknown> = {};
    if (employerId) {
      query.employerId = employerId;
    } else {
      // If no employerId provided, find by the current session's employer profile
      const employer = await Employer.findById(session.user.id);
      if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
      query.employerId = employer._id;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, location, type, salary } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    await dbConnect();

    const employer = await Employer.findById(session.user.id);
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    const job = await Job.create({
      employerId: employer._id,
      title,
      description,
      location,
      type,
      salary,
      status: 'active'
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
    }

    await dbConnect();

    const employer = await Employer.findById(session.user.id);
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });

    const job = await Job.findOneAndDelete({ _id: id, employerId: employer._id });
    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
