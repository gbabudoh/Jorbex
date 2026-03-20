'use client';

import { NovuProvider } from '@novu/react';

interface Props {
  subscriberId: string;
  subscriberHash?: string;
  children: React.ReactNode;
}

export function NovuInboxProvider({ subscriberId, subscriberHash, children }: Props) {
  const appId = process.env.NEXT_PUBLIC_NOVU_APP_IDENTIFIER;
  const apiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL;
  const socketUrl = process.env.NEXT_PUBLIC_NOVU_WEBSOCKET_URL;

  if (!appId || !subscriberId) return <>{children}</>;

  return (
    <NovuProvider
      applicationIdentifier={appId}
      subscriberId={subscriberId}
      subscriberHash={subscriberHash}
      apiUrl={apiUrl}
      socketUrl={socketUrl}
    >
      {children}
    </NovuProvider>
  );
}
