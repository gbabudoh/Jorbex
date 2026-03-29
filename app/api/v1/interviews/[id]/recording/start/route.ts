import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startRoomRecording, getRecordingUrl } from '@/lib/livekit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== 'employer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const interview = await prisma.interview.findUnique({ where: { id } });
  if (!interview) {
    return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
  }
  if (interview.employerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!interview.meetingRoomName) {
    return NextResponse.json({ error: 'No room assigned to this interview' }, { status: 400 });
  }
  if (interview.recordingStatus === 'RECORDING') {
    return NextResponse.json({ error: 'Recording already in progress' }, { status: 409 });
  }

  const egressId = await startRoomRecording(interview.meetingRoomName, id);

  await prisma.interview.update({
    where: { id },
    data: {
      egressId,
      recordingStatus: 'RECORDING',
    },
  });

  return NextResponse.json({ success: true, egressId });
}
