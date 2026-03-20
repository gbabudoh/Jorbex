'use client';

import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      setSubscribed(true);
      return;
    }

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    await fetch('/api/v1/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });

    setPermission('granted');
    setSubscribed(true);
  }

  async function unsubscribe() {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const sub = await registration?.pushManager.getSubscription();
    if (!sub) return;

    await fetch('/api/v1/push', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    await sub.unsubscribe();
    setSubscribed(false);
  }

  async function requestAndSubscribe() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') await subscribe();
  }

  return { permission, subscribed, requestAndSubscribe, unsubscribe };
}
