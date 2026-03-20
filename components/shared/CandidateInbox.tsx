'use client';

import { NovuProvider, Inbox } from '@novu/react';

interface Props {
  subscriberId: string;
}

export function CandidateInbox({ subscriberId }: Props) {
  const appId = process.env.NEXT_PUBLIC_NOVU_APP_IDENTIFIER;
  const apiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL;
  const socketUrl = process.env.NEXT_PUBLIC_NOVU_WEBSOCKET_URL;

  if (!appId || !subscriberId) return null;

  return (
    <NovuProvider
      applicationIdentifier={appId}
      subscriberId={subscriberId}
      apiUrl={apiUrl}
      socketUrl={socketUrl}
    >
      <Inbox
        appearance={{
          variables: { colorPrimary: '#0066FF', colorForeground: '#111827' },
        }}
      />
    </NovuProvider>
  );
}
