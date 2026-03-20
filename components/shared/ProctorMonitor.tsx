'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Violation {
  type: 'no_face' | 'multiple_faces' | 'tab_switch';
  timestamp: number;
}

interface ProctorMonitorProps {
  onViolation?: (violations: Violation[]) => void;
  onCameraBlocked?: () => void;
}

export default function ProctorMonitor({ onViolation, onCameraBlocked }: ProctorMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<'loading' | 'active' | 'blocked'>('loading');
  const [warning, setWarning] = useState('');

  const [tabSwitches, setTabSwitches] = useState(0);
  const [faceWarnings, setFaceWarnings] = useState(0);
  const noFaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const violationsRef = useRef<Violation[]>([]);

  const addViolation = useCallback((type: Violation['type']) => {
    const updated = [...violationsRef.current, { type, timestamp: Date.now() }];
    violationsRef.current = updated;
    onViolation?.(updated);
  }, [onViolation]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(n => n + 1);
        setWarning('⚠️ Tab switch detected! This will be reported.');
        addViolation('tab_switch');
        setTimeout(() => setWarning(''), 4000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [addViolation]);

  // Camera + face detection
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const faceapi = await import('face-api.js');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 160, height: 120, facingMode: 'user' },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('active');

        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.4 });

        detectionInterval.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const detections = await faceapi.detectAllFaces(videoRef.current, options);

            if (detections.length === 0) {
              if (!noFaceTimerRef.current) {
                noFaceTimerRef.current = setTimeout(() => {
                  setFaceWarnings(n => n + 1);
                  setWarning('⚠️ No face detected! Please stay in front of the camera.');
                  addViolation('no_face');
                  setTimeout(() => setWarning(''), 4000);
                  noFaceTimerRef.current = null;
                }, 3000); // grace: 3 seconds before flagging
              }
            } else {
              if (noFaceTimerRef.current) {
                clearTimeout(noFaceTimerRef.current);
                noFaceTimerRef.current = null;
              }
              if (detections.length > 1) {
                setWarning('⚠️ Multiple faces detected!');
                addViolation('multiple_faces');
                setTimeout(() => setWarning(''), 4000);
              }
            }
          } catch {
            // silently skip detection frame errors
          }
        }, 1500);
      } catch {
        if (!cancelled) {
          setStatus('blocked');
          onCameraBlocked?.();
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      if (noFaceTimerRef.current) clearTimeout(noFaceTimerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [addViolation, onCameraBlocked]);

  // Always render as a fixed overlay — never scrolls away
  return (
    <div className="fixed bottom-4 right-4 z-200 flex flex-col items-end gap-2">
      {/* Warning toast */}
      {warning && (
        <div className="px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xl animate-in slide-in-from-right-4 duration-300 max-w-[220px] text-right">
          {warning}
        </div>
      )}

      {/* Camera + stats card */}
      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {status === 'blocked' ? (
          <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-red-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span className="font-bold">Camera blocked</span>
          </div>
        ) : (
          <>
            {/* Camera feed */}
            <div className="relative bg-black" style={{ width: 120, height: 90 }}>
              {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
                style={{ display: status === 'active' ? 'block' : 'none' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              {status === 'active' && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/50 rounded px-1 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] text-white font-bold uppercase tracking-wider">Live</span>
                </div>
              )}
            </div>

            {/* Status + stats */}
            <div className="px-2.5 pt-1.5 pb-2" style={{ width: 120 }}>
              <div className="flex items-center gap-1 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                  {status === 'active' ? 'Proctored' : 'Starting…'}
                </span>
              </div>
              <div className="flex gap-1.5">
                {/* Tab switches */}
                <div className={`flex-1 rounded-md px-1.5 py-1 text-center ${tabSwitches > 0 ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                  <div className={`text-sm font-black leading-none ${tabSwitches > 0 ? 'text-amber-400' : 'text-gray-600'}`}>{tabSwitches}</div>
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Tabs</div>
                </div>
                {/* Face absences */}
                <div className={`flex-1 rounded-md px-1.5 py-1 text-center ${faceWarnings > 0 ? 'bg-red-500/20' : 'bg-white/5'}`}>
                  <div className={`text-sm font-black leading-none ${faceWarnings > 0 ? 'text-red-400' : 'text-gray-600'}`}>{faceWarnings}</div>
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Away</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
