import { Novu } from '@novu/api';

// Novu server-side client — @novu/api pointing at self-hosted instance
export const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY || '',
  serverURL: process.env.NOVU_API_URL,
});

// ─── Workflow IDs ────────────────────────────────────────────────────────────
// Must match the Workflow Trigger Identifier set in your Novu dashboard
export const WORKFLOWS = {
  INTERVIEW_SCHEDULED:   'interview-scheduled',
  INTERVIEW_REMINDER:    'interview-reminder',
  INTERVIEW_CANCELLED:   'interview-cancelled',
  INTERVIEW_RESCHEDULED: 'interview-rescheduled',
  NEW_APPLICATION:       'new-application',
  ASSESSMENT_ASSIGNED:   'assessment-assigned',
  OFFER_RECEIVED:        'offer-received',
  NEW_MESSAGE:           'new-message',
  // Post-hire sequence
  HIRE_DAY_1:            'hire-day-1',
  HIRE_DAY_30:           'hire-day-30',
  HIRE_DAY_90:           'hire-day-90',
  HIRE_MONTH_6:          'hire-month-6',
  // Panel interviews
  PANEL_INTERVIEWER_INVITED: 'panel-interviewer-invited',
} as const;

export type WorkflowId = (typeof WORKFLOWS)[keyof typeof WORKFLOWS];

// ─── Subscriber Sync ─────────────────────────────────────────────────────────
// Call this on every login / profile update to keep Novu in sync
export async function syncSubscriber(params: {
  subscriberId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}) {
  if (!process.env.NOVU_SECRET_KEY) return;

  const [firstName, ...rest] = params.name.trim().split(' ');
  try {
    await novu.subscribers.create({
      subscriberId: params.subscriberId,
      firstName,
      lastName: rest.join(' ') || undefined,
      email: params.email || undefined,
      phone: params.phone || undefined,
    });
  } catch (err) {
    console.error('[Novu] syncSubscriber failed:', err);
  }
}

// ─── Trigger Notification ────────────────────────────────────────────────────
// One call → Novu routes to Email + SMS + Push + Chat + In-App per workflow
export async function triggerNotification(params: {
  workflowId: WorkflowId;
  subscriberId: string;
  to?: { email?: string | null; phone?: string | null; firstName?: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
}) {
  if (!process.env.NOVU_SECRET_KEY) {
    console.warn('[Novu] NOVU_SECRET_KEY not set — skipping');
    return;
  }

  const { workflowId, subscriberId, to, payload } = params;

  try {
    await novu.trigger({
      workflowId,
      to: {
        subscriberId,
        ...(to?.email     && { email: to.email }),
        ...(to?.phone     && { phone: to.phone }),
        ...(to?.firstName && { firstName: to.firstName }),
      },
      payload,
    });
  } catch (err) {
    console.error(`[Novu] trigger failed for "${workflowId}":`, err);
    throw err;
  }
}

// ─── In-App Feed ──────────────────────────────────────────────────────────────
// Fetch in-app notifications for a subscriber (used by /api/v1/notifications)
export async function getInAppFeed(subscriberId: string, page = 0) {
  if (!process.env.NOVU_SECRET_KEY) return [];

  try {
    const res = await novu.subscribers.notifications.feed({
      subscriberId,
      page,
      limit: 20,
    });
    // @novu/api response shape: { result: { data: [...], ... } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any)?.result?.data ?? (res as any)?.data ?? [];
  } catch (err) {
    console.error('[Novu] getInAppFeed failed:', err);
    return [];
  }
}

// ─── Mark all in-app notifications as read ───────────────────────────────────
export async function markAllAsRead(subscriberId: string) {
  if (!process.env.NOVU_SECRET_KEY) return;
  try {
    await novu.subscribers.messages.markAll({ markAs: 'read' }, subscriberId);
  } catch (err) {
    console.error('[Novu] markAllAsRead failed:', err);
  }
}
