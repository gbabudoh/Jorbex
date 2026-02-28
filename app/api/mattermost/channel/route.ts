import { NextResponse } from 'next/server';
import { mattermost } from '@/lib/mattermost';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { employerId, jobId } = await request.json();

    if (!employerId || !jobId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const channel = await mattermost.createHiringChannel(employerId, jobId, job.title);

    await prisma.mattermostChannel.create({
      data: {
        employerId,
        jobId,
        channelId: channel.id,
        channelName: channel.name,
      },
    });

    return NextResponse.json({ success: true, channelId: channel.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Mattermost Channel Create Error';
    console.error('Mattermost Channel Create Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
