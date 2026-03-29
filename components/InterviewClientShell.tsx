'use client';

import { useState, useEffect } from 'react';
import InterviewRoom from '@/components/InterviewRoom';

// How many minutes before scheduled time participants may enter the room
const JOIN_WINDOW_MINUTES = 10;

interface InterviewClientShellProps {
  interviewId: string;
  roomName: string;
  displayName: string;
  serverUrl: string;
  duration: number;
  scheduledAt: string;
  isEmployer: boolean;
  isPanelMember?: boolean;
  panelToken?: string;
  employerName: string;
  candidateName: string;
  jobTitle: string;
}

function formatTimeUntil(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.round(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

export default function InterviewClientShell({
  interviewId,
  roomName,
  displayName,
  serverUrl,
  duration,
  scheduledAt,
  isEmployer,
  isPanelMember,
  panelToken,
  employerName,
  candidateName,
  jobTitle,
}: InterviewClientShellProps) {
  const scheduledMs = new Date(scheduledAt).getTime();
  const joinWindowMs = JOIN_WINDOW_MINUTES * 60 * 1000;

  const [now, setNow] = useState(() => Date.now());
  const [consented, setConsented] = useState(false);

  // Tick every second so the waiting-room countdown stays live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const msUntilWindow = scheduledMs - joinWindowMs - now;
  const isBeforeWindow = msUntilWindow > 0;

  // ── Waiting room ──────────────────────────────────────────────────────────
  if (isBeforeWindow) {
    const scheduledDate = new Date(scheduledAt);
    const timeStr = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = scheduledDate.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">

          {/* Clock icon */}
          <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-white text-lg font-bold mb-1">Interview not yet open</h2>
          <p className="text-gray-400 text-sm mb-4">{jobTitle}</p>

          {/* Scheduled time */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-5 py-4 mb-5">
            <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Scheduled for</p>
            <p className="text-white text-xl font-bold">{timeStr}</p>
            <p className="text-gray-400 text-sm">{dateStr}</p>
          </div>

          {/* Live countdown */}
          <div className="mb-6">
            <p className="text-gray-500 text-xs mb-1">Room opens in</p>
            <p className="text-blue-400 text-2xl font-bold tabular-nums">{formatTimeUntil(msUntilWindow)}</p>
            <p className="text-gray-600 text-xs mt-1">You can join up to {JOIN_WINDOW_MINUTES} min before the interview</p>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-semibold">{employerName}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
            </svg>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/20 text-blue-300 text-xs font-semibold">{candidateName}</span>
          </div>

          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-medium transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Consent screen ────────────────────────────────────────────────────────
  if (!consented) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 mb-5">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs font-semibold">{employerName}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
            </svg>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/20 text-blue-300 text-xs font-semibold">{candidateName}</span>
          </div>

          <h2 className="text-white text-lg font-bold mb-1">Ready to join?</h2>
          <p className="text-gray-400 text-sm mb-1">{jobTitle}</p>
          <p className="text-gray-500 text-xs mb-6">{duration} min · Video interview</p>

          {/* Consent notice */}
          <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-yellow-300/80 text-xs leading-relaxed">
                This interview <strong className="text-yellow-300">may be recorded</strong> by the employer. Recordings are only accessible to the interview participants and are stored securely. By joining you consent to the possibility of being recorded.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-medium transition-colors"
            >
              Leave
            </button>
            <button
              onClick={() => setConsented(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              {isEmployer ? 'Join as Employer' : isPanelMember ? 'Join as Interviewer' : 'I understand, Join'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InterviewRoom
      roomName={roomName}
      displayName={displayName}
      serverUrl={serverUrl}
      duration={duration}
      scheduledAt={scheduledAt}
      isEmployer={isEmployer}
      interviewId={interviewId}
      panelToken={panelToken}
    />
  );
}
