'use client';

import dynamic from 'next/dynamic';

const LiveKitMeeting = dynamic(() => import('@/components/LiveKitMeeting'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        <p className="text-gray-400">Loading Interview Room...</p>
      </div>
    </div>
  ),
});

interface InterviewRoomProps {
  roomName: string;
  displayName: string;
  serverUrl: string;
}

export default function InterviewRoom({ roomName, displayName, serverUrl }: InterviewRoomProps) {
  return (
    <LiveKitMeeting
      roomName={roomName}
      displayName={displayName}
      serverUrl={serverUrl}
    />
  );
}
