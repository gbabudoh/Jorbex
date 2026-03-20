import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { RoleType } from '@prisma/client';
import crypto from 'crypto';

// POST /api/v1/novu/webhook
// Receives delivery status events from Novu and updates NotificationLog

function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.NOVU_WEBHOOK_SECRET;
  if (!secret || !signature) return !secret; // skip verification if secret not set
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-novu-signature');

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { type, payload } = event;

    // Novu sends events like: message.sent, message.delivery.failed, subscriber.created
    if (!type || !payload) {
      return NextResponse.json({ ok: true }); // ignore unknown events
    }

    const subscriberId: string | undefined = payload.subscriber?.subscriberId;
    const workflowId: string | undefined = payload.workflowIdentifier ?? payload.transactionId;
    const channel: string | undefined = payload.channel?.toUpperCase();

    if (!subscriberId) return NextResponse.json({ ok: true });

    // Map Novu event types to NotificationStatus
    const statusMap: Record<string, 'SENT' | 'DELIVERED' | 'FAILED'> = {
      'message.sent':              'SENT',
      'message.delivery.success':  'DELIVERED',
      'message.delivery.failed':   'FAILED',
    };

    const status = statusMap[type];
    if (!status) return NextResponse.json({ ok: true });

    // Find the matching NotificationLog by workflowId type
    const logType = workflowId?.toUpperCase().replace(/-/g, '_') ?? 'UNKNOWN';
    const channelEnum = (['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'MATTERMOST'].includes(channel ?? '')
      ? channel
      : 'EMAIL') as 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP' | 'MATTERMOST';

    // Determine if subscriberId belongs to employer or candidate
    const [employer, candidate] = await Promise.all([
      prisma.employer.findUnique({ where: { id: subscriberId }, select: { id: true } }),
      prisma.candidate.findUnique({ where: { id: subscriberId }, select: { id: true } }),
    ]);

    const userType: RoleType = employer ? 'EMPLOYER' : 'CANDIDATE';

    await prisma.notificationLog.create({
      data: {
        userType,
        ...(employer ? { employerId: subscriberId } : { candidateId: subscriberId }),
        type: logType,
        channel: channelEnum,
        subject: payload.subject ?? type,
        content: JSON.stringify(payload),
        status,
        sentAt: status !== 'FAILED' ? new Date() : undefined,
        error: status === 'FAILED' ? (payload.error ?? 'Delivery failed') : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    console.error('[Novu Webhook]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
