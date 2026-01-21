import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { mattermost } from '@/lib/mattermost';
import Employer from '@/models/Employer';
import Job from '@/models/Job';

// Create Channel
export async function POST(request: Request) {
  try {
    const { employerId, jobId } = await request.json();

    if (!employerId || !jobId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Fetch Job to get title
    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Create Channel
    const channel = await mattermost.createHiringChannel(employerId, jobId, job.title);

    // Save Channel Mapping to Employer
    await Employer.findByIdAndUpdate(employerId, {
      $push: {
        mattermostChannels: {
          jobId: jobId,
          channelId: channel.id,
          channelName: channel.name,
        }
      }
    });

    return NextResponse.json({ success: true, channelId: channel.id });

  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Mattermost Channel Create Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
