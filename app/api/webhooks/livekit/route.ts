import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import prisma from '@/lib/prisma';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const authHeader = req.headers.get('Authorization') ?? undefined;

  let event;
  try {
    event = await receiver.receive(body, authHeader);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  // Recording finished — flip status to READY or FAILED
  if (event.event === 'egress_ended' && event.egressInfo) {
    const { egressId, status } = event.egressInfo;

    const interview = await prisma.interview.findFirst({
      where: { egressId },
    });

    if (interview) {
      const isComplete = status === 3; // EgressStatus.EGRESS_COMPLETE = 3
      await prisma.interview.update({
        where: { id: interview.id },
        data: {
          recordingStatus: isComplete ? 'READY' : 'FAILED',
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
