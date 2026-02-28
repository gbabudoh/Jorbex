'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  GridLayout,
  ParticipantTile,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import Image from 'next/image';

interface LiveKitMeetingProps {
  roomName: string;
  displayName: string;
  serverUrl: string;
  onLeave?: () => void;
}

function JorbexBranding() {
  return (
    <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
      <Image
        src="/logo.png"
        alt="Jorbex"
        width={80}
        height={28}
        className="h-6 w-auto brightness-0 invert"
      />
      <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider border-l border-white/20 pl-2">
        Interview
      </span>
    </div>
  );
}

function VideoLayout() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}

export default function LiveKitMeeting({
  roomName,
  displayName,
  serverUrl,
  onLeave,
}: LiveKitMeetingProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch('/api/v1/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to get token');
        }

        const data = await res.json();
        setToken(data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [roomName]);

  const handleDisconnected = useCallback(() => {
    if (onLeave) onLeave();
  }, [onLeave]);

  if (loading) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center">
        <JorbexBranding />
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <p className="text-gray-400">Connecting to Jorbex Interview Room...</p>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center">
        <JorbexBranding />
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">Unable to connect</p>
          <p className="text-gray-500 text-sm">{error || 'No token received'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-950 rounded-xl overflow-hidden">
      <JorbexBranding />
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        onDisconnected={handleDisconnected}
        className="h-full"
        connect={true}
        video={true}
        audio={false}
      >
        <VideoLayout />
        <RoomAudioRenderer />
        <ControlBar variation="minimal" />
      </LiveKitRoom>
    </div>
  );
}
