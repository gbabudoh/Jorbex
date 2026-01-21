import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.userType !== 'candidate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const type = searchParams.get('type');
    const location = searchParams.get('location');

    const query: Record<string, unknown> = { status: 'active' };
    
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('employerId', 'companyName industry logo')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to search jobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
