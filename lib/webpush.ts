import webpush from 'web-push';
import prisma from '@/lib/prisma';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

// Send push to all subscribed devices for a candidate
export async function pushToCandidate(candidateId: string, payload: PushPayload) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    console.warn('[WebPush] VAPID keys not set — skipping');
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { candidateId },
  });

  if (!subscriptions.length) return;

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? '/',
    icon: payload.icon ?? '/icons/icon-192.png',
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification,
        );
      } catch (err: unknown) {
        // 410 Gone = subscription expired, remove it
        if ((err as { statusCode?: number })?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('[WebPush] send failed:', err);
        }
      }
    }),
  );
}
