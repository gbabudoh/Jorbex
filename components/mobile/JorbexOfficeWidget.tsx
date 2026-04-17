'use client';

import { useState } from 'react';
import { useJorbexOffice } from '@/hooks/useJorbexOffice';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Power, ChevronUp, ChevronDown, Coffee, UserX } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function JorbexOfficeWidget() {
  const { data: sessionData } = useSession();
  const { session, status, elapsedMinutes, isLoading, clockOut } = useJorbexOffice();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show for candidates
  if (!sessionData || sessionData.user?.userType !== 'candidate') return null;
  if (!session && !isLoading) return null; // Only show if active or loading

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'bg-emerald-500';
      case 'IDLE': return 'bg-amber-500';
      case 'ON_BREAK': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0066FF] px-5 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]`} />
                <span className="font-semibold tracking-wide text-sm underline decoration-white/30 underline-offset-4">JORBEX OFFICE</span>
              </div>
              <button onClick={() => setIsExpanded(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              <div className="text-center bg-gray-50 rounded-xl py-4 border border-gray-100 italic">
                <span className="text-gray-400 text-xs block mb-1 uppercase tracking-widest font-medium">Session Duration</span>
                <span className="text-3xl font-bold text-gray-800 tabular-nums">
                  {isLoading ? '--:--' : formatTime(elapsedMinutes)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Work Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                    status === 'IDLE' ? 'bg-amber-100 text-amber-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {status}
                  </span>
                </div>
                
                <div className="h-px bg-gray-100" />
                
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium">
                    <Coffee size={14} /> Break
                  </button>
                  <button className="flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-medium">
                    <UserX size={14} /> AFK
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  clockOut();
                  setIsExpanded(false);
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50"
              >
                <Power size={18} />
                <span>Clock Out & Exit</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl transition-all active:scale-95 ${
          status === 'ACTIVE' ? 'bg-[#0066FF] text-white' : 
          status === 'IDLE' ? 'bg-amber-500 text-white' : 
          'bg-gray-800 text-white'
        }`}
      >
        <div className="relative">
          <Clock size={22} className={status === 'ACTIVE' ? 'animate-spin-slow' : ''} />
          {status === 'ACTIVE' && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
        </div>
        {!isExpanded && (
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-0.5">Live Session</span>
            <span className="text-sm font-bold tabular-nums">
              {isLoading ? '...' : formatTime(elapsedMinutes)}
            </span>
          </div>
        )}
        {!isExpanded && <ChevronUp size={16} className="opacity-50" />}
      </motion.button>
    </div>
  );
}
