'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export type WorkStatus = 'ACTIVE' | 'IDLE' | 'ON_BREAK' | 'OFFLINE';

interface AttendanceSession {
  id: string;
  employmentRecordId: string;
  clockIn: string;
  clockOut: string | null;
  status: WorkStatus;
  totalActiveMinutes: number;
  totalIdleMinutes: number;
}

const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export function useJorbexOffice() {
  const { data: sessionData } = useSession();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [status, setStatus] = useState<WorkStatus>('OFFLINE');
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const lastActivityRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // Fetch active session on mount
  const fetchActiveSession = useCallback(async () => {
    try {
      const res = await fetch('/api/office/clock');
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setStatus(data.session.status);
        // Calculate initial elapsed time
        const start = new Date(data.session.clockIn).getTime();
        setElapsedMinutes(Math.floor((Date.now() - start) / 60000));
      }
    } catch (err) {
      console.error('Failed to fetch office session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionData?.user?.userType === 'candidate') {
      fetchActiveSession();
    } else {
      setIsLoading(false);
    }
  }, [sessionData, fetchActiveSession]);

  // Heartbeat Logic
  const sendHeartbeat = useCallback(async () => {
    if (!session?.id) return;
    
    try {
      await fetch('/api/office/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, status }),
      });
    } catch (err) {
      console.error('Heartbeat failed:', err);
    }
  }, [session?.id, status]);

  // Activity Detection
  useEffect(() => {
    if (status === 'OFFLINE') return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (status === 'IDLE') {
        setStatus('ACTIVE');
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [status]);

  // Intervals (Heartbeat & Idle Check)
  useEffect(() => {
    if (session && status !== 'OFFLINE') {
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, 60000); // Every minute
      
      activityIntervalRef.current = setInterval(() => {
        const now = Date.now();
        if (now - lastActivityRef.current > IDLE_THRESHOLD && status === 'ACTIVE') {
          setStatus('IDLE');
        }
        // Update timer
        const start = new Date(session.clockIn).getTime();
        setElapsedMinutes(Math.floor((now - start) / 60000));
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);
    };
  }, [session, status, sendHeartbeat]);

  const clockIn = async (recordId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/office/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employmentRecordId: recordId }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setStatus('ACTIVE');
        setElapsedMinutes(0);
        lastActivityRef.current = Date.now();
      }
      return data;
    } catch (err) {
      console.error('Clock in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clockOut = async () => {
    if (!session?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/office/clock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await res.json();
      setSession(null);
      setStatus('OFFLINE');
      setElapsedMinutes(0);
      return data;
    } catch (err) {
      console.error('Clock out failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    status,
    elapsedMinutes,
    isLoading,
    clockIn,
    clockOut,
    refresh: fetchActiveSession
  };
}
