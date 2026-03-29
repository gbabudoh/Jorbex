'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  /** Interview duration in minutes (default 30) */
  duration?: number;
  /** Scheduled start time ISO string — used to compute absolute end time */
  scheduledAt?: string;
  /** Employer sees record/stop button; candidate sees indicator only */
  isEmployer?: boolean;
  /** Required for recording API calls */
  interviewId?: string;
  /** Panel invite token — resolves external interviewer identity server-side */
  panelToken?: string;
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

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface CountdownTimerProps {
  scheduledAt: string;
  duration: number; // minutes
  extensionMinutes?: number;
  onConnected: boolean;
  onExpired?: () => void;
}

function CountdownTimer({ scheduledAt, duration, extensionMinutes = 0, onConnected, onExpired }: CountdownTimerProps) {
  const durationSeconds = (duration + extensionMinutes) * 60;
  const endTimeMs = new Date(scheduledAt).getTime() + durationSeconds * 1000;

  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [showWarning, setShowWarning] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const fiveMinWarningFired = useRef(false);
  const expiredFired = useRef(false);

  // Reset warning flags when an extension is added
  useEffect(() => {
    if (extensionMinutes > 0) {
      fiveMinWarningFired.current = false;
      expiredFired.current = false;
      setWarningDismissed(false);
    }
  }, [extensionMinutes]);

  useEffect(() => {
    if (!onConnected) {
      setSecondsLeft(durationSeconds);
      return;
    }

    const tick = () => {
      const remaining = Math.min(
        durationSeconds,
        Math.max(0, Math.round((endTimeMs - Date.now()) / 1000))
      );
      setSecondsLeft(remaining);

      if (remaining <= 300 && remaining > 0 && !fiveMinWarningFired.current) {
        fiveMinWarningFired.current = true;
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 8000);
      }

      if (remaining === 0 && !expiredFired.current) {
        expiredFired.current = true;
        onExpired?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onConnected, endTimeMs, durationSeconds, onExpired]);

  const isExpired = secondsLeft === 0 && onConnected;
  const isWarning = secondsLeft > 0 && secondsLeft <= 300;
  const isCritical = secondsLeft > 0 && secondsLeft <= 60;

  const pillColor = isExpired || isCritical
    ? 'bg-red-500/30 border-red-500/50 text-red-300'
    : isWarning
    ? 'bg-yellow-500/30 border-yellow-500/50 text-yellow-300'
    : 'bg-white/10 border-white/20 text-white';

  return (
    <>
      {/* Timer pill — top right */}
      <div
        className={`absolute top-4 right-4 z-50 flex items-center gap-1.5 backdrop-blur-md rounded-lg px-3 py-1.5 border shadow-xl transition-colors duration-500 ${pillColor}`}
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs font-bold tabular-nums tracking-wide">
          {isExpired ? 'Ended' : formatCountdown(secondsLeft)}
        </span>
        {isWarning && !isExpired && (
          <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">left</span>
        )}
      </div>

      {/* 5-minute warning banner */}
      {showWarning && !warningDismissed && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-70 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 bg-yellow-900/90 backdrop-blur-md border border-yellow-500/40 rounded-xl px-4 py-3 shadow-2xl max-w-sm">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-yellow-300 text-xs font-bold">5 minutes remaining</p>
              <p className="text-yellow-400/70 text-[11px]">Please wrap up your interview.</p>
            </div>
            <button
              onClick={() => { setShowWarning(false); setWarningDismissed(true); }}
              className="text-yellow-500/60 hover:text-yellow-300 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function LiveKitMeeting({
  roomName,
  displayName,
  serverUrl,
  duration = 30,
  scheduledAt,
  isEmployer = false,
  interviewId,
  panelToken,
  onLeave,
}: LiveKitMeetingProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const handleStartRecording = useCallback(async () => {
    if (!interviewId || recordingBusy) return;
    setRecordingBusy(true);
    setRecordingError(null);
    try {
      const res = await fetch(`/api/v1/interviews/${interviewId}/recording/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start recording');
      setIsRecording(true);
    } catch (e) {
      setRecordingError(e instanceof Error ? e.message : 'Recording failed');
    } finally {
      setRecordingBusy(false);
    }
  }, [interviewId, recordingBusy]);

  const handleStopRecording = useCallback(async () => {
    if (!interviewId || recordingBusy) return;
    setRecordingBusy(true);
    setRecordingError(null);
    try {
      const res = await fetch(`/api/v1/interviews/${interviewId}/recording/stop`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to stop recording');
      setIsRecording(false);
    } catch (e) {
      setRecordingError(e instanceof Error ? e.message : 'Stop failed');
    } finally {
      setRecordingBusy(false);
    }
  }, [interviewId, recordingBusy]);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch('/api/v1/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, displayName, panelToken }),
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

  // End-of-interview state
  const [extensionMinutes, setExtensionMinutes] = useState(0);
  const [graceLeft, setGraceLeft] = useState<number | null>(null); // null = not in grace period
  const [ended, setEnded] = useState(false);
  const graceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleExpired = useCallback(() => {
    setGraceLeft(60);
  }, []);

  const handleEndNow = useCallback(() => {
    if (graceIntervalRef.current) clearInterval(graceIntervalRef.current);
    setGraceLeft(null);
    setEnded(true);
    // Stop recording if it's still running
    if (isRecording) handleStopRecording();
  }, [isRecording, handleStopRecording]);

  const handleAddTime = useCallback(() => {
    if (graceIntervalRef.current) clearInterval(graceIntervalRef.current);
    setGraceLeft(null);
    setExtensionMinutes((prev) => prev + 10);
  }, []);

  // Start the grace countdown only when it first becomes non-null (i.e. transitions null→60).
  // The setInterval drives its own ticks via functional setState so graceLeft need not be a dep.
  const gracePrevRef = useRef<number | null>(null);
  useEffect(() => {
    const wasNull = gracePrevRef.current === null;
    gracePrevRef.current = graceLeft;
    if (!wasNull || graceLeft === null) return; // only start the interval on the null→N transition

    graceIntervalRef.current = setInterval(() => {
      setGraceLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(graceIntervalRef.current!);
          setEnded(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (graceIntervalRef.current) clearInterval(graceIntervalRef.current); };
  }, [graceLeft]);

  const handleDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
    if (onLeave) onLeave();
  }, [onLeave]);

  const handleConnected = useCallback(() => {
    setConnectionStatus('connected');
  }, []);

  // Auto-start recording as soon as the employer connects
  const autoRecordFired = useRef(false);
  useEffect(() => {
    if (connectionStatus === 'connected' && isEmployer && interviewId && !autoRecordFired.current) {
      autoRecordFired.current = true;
      handleStartRecording();
    }
  }, [connectionStatus, isEmployer, interviewId, handleStartRecording]);

  const handleError = useCallback((err: Error) => {
    console.error('LiveKit Room Error:', err);
    setError(`Connection Error: ${err.message}`);
    setConnectionStatus('disconnected');
  }, []);

  // ── Thank You screen — replaces video after interview ends ─────────────────
  if (ended) {
    return (
      <div className="relative flex-1 w-full flex flex-col items-center justify-center min-h-0 bg-gray-950">
        <JorbexBranding />
        <div className="w-full max-w-md text-center px-6">
          {/* Checkmark */}
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">Interview Complete</h2>
          <p className="text-gray-400 text-sm mb-1">Thank you for using Jorbex</p>
          <p className="text-gray-600 text-xs mb-8">This session has ended. You may now close this tab.</p>

          <div className="flex flex-col gap-3">
            {interviewId && (
              <a
                href={`/interview/${interviewId}/playback`}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors text-center"
              >
                View Recording
              </a>
            )}
            <button
              onClick={() => window.close()}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-medium transition-colors"
            >
              Close Tab
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Recording indicator — visible to everyone when recording */}
      {isRecording && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600/90 backdrop-blur-md rounded-full px-3 py-1 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white text-[11px] font-bold uppercase tracking-wider">Recording</span>
        </div>
      )}

      {/* Employer: show error if auto-recording failed */}
      {isEmployer && recordingError && connectionStatus === 'connected' && (
        <div className="absolute bottom-20 left-4 z-50">
          <div className="bg-red-900/90 border border-red-500/40 rounded-lg px-3 py-1.5 text-red-300 text-xs max-w-[220px]">
            Recording failed to start: {recordingError}
          </div>
        </div>
      )}

      {scheduledAt && (
        <CountdownTimer
          scheduledAt={scheduledAt}
          duration={duration}
          extensionMinutes={extensionMinutes}
          onConnected={connectionStatus === 'connected'}
          onExpired={handleExpired}
        />
      )}

      {/* Grace period overlay — full-screen, semi-transparent over video */}
      {graceLeft !== null && (
        <div className="absolute inset-0 z-80 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-bold mb-1">Scheduled time has ended</h3>
            <p className="text-gray-400 text-sm mb-6">The call will end automatically in</p>
            <p className="text-red-400 text-5xl font-bold tabular-nums mb-6">{graceLeft}s</p>
            <div className="flex gap-3">
              <button
                onClick={handleAddTime}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
              >
                + 10 min
              </button>
              <button
                onClick={handleEndNow}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-60">
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
