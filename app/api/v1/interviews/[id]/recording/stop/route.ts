import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stopRoomRecording, getRecordingUrl } from '@/lib/livekit';

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
  if (interview.recordingStatus !== 'RECORDING' || !interview.egressId) {
    return NextResponse.json({ error: 'No active recording to stop' }, { status: 400 });
  }

  await stopRoomRecording(interview.egressId);

  // Store the predictable MinIO URL now; status flips to READY once webhook confirms
  await prisma.interview.update({
    where: { id },
    data: {
      recordingStatus: 'PROCESSING',
      recordingUrl: getRecordingUrl(id),
    },
  });

  return NextResponse.json({ success: true });
}
