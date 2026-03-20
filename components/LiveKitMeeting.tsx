'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import Image from 'next/image';

interface LiveKitMeetingProps {
  roomName: string;
  displayName: string;
  serverUrl: string;
  onLeave?: () => void;
}

function JorbexBranding() {
  return (
    <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 shadow-xl">
      <Image
        src="/logo.png"
        alt="Jorbex"
        width={80}
        height={28}
        className="h-6 w-auto"
      />
      <span className="text-[10px] font-bold text-white uppercase tracking-wider border-l border-white/20 pl-2">
        Interview
      </span>
    </div>
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
          body: JSON.stringify({ roomName, displayName }),
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
  }, [roomName, displayName]);

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const handleDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
    if (onLeave) onLeave();
  }, [onLeave]);

  const handleConnected = useCallback(() => {
    setConnectionStatus('connected');
  }, []);

  const handleError = useCallback((err: Error) => {
    console.error('LiveKit Room Error:', err);
    setError(`Connection Error: ${err.message}`);
    setConnectionStatus('disconnected');
  }, []);

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

  // Use proxied URL in browser to bypass Firefox CORS/Signal blocks
  const effectiveServerUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/livekit`
    : serverUrl;

  return (
    <div className="relative flex-1 w-full flex flex-col min-h-0 bg-gray-950 rounded-xl overflow-hidden">
      <JorbexBranding />
      <LiveKitRoom
        key={token}
        token={token}
        serverUrl={effectiveServerUrl}
        data-lk-theme="default"
        onDisconnected={handleDisconnected}
        onConnected={handleConnected}
        onError={handleError}
        className="h-full"
        connect={true}
        options={{
          adaptiveStream: true, 
          dynacast: true,
        }}
        style={{ height: '100%', flex: '1 1 0%', minHeight: 0 }}
      >
        <VideoConference />
        <RoomAudioRenderer />
        {connectionStatus === 'disconnected' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60]">
            <div className="text-center px-4">
              <p className="text-red-400 font-bold mb-2">Room Disconnected</p>
              <p className="text-gray-400 text-sm mb-4">The connection to the interview room was lost.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Try Reconnecting
              </button>
            </div>
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
}

