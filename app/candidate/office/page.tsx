'use client';

import React, { useState, useEffect } from 'react';
import { useJorbexOffice } from '@/hooks/useJorbexOffice';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Coffee, 
  Power, 
  Calendar, 
  Timer, 
  Activity, 
  Zap, 
  UserMinus, 
  History,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CandidateOfficePage() {
  const { t } = useLanguage();
  const { session, status, elapsedMinutes, isLoading, clockIn, clockOut } = useJorbexOffice();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getStatusDisplay = () => {
    switch(status) {
      case 'ACTIVE': return { label: 'Live Session', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'ON_BREAK': return { label: 'On Break', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'IDLE': return { label: 'Idle Mode', color: 'text-amber-500', bg: 'bg-amber-500/10' };
      default: return { label: 'Offline', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  if (isLoading && !session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Entering Office...</p>
        </motion.div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay();

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-2 py-0.5 rounded-md ${statusInfo.bg} ${statusInfo.color} text-[10px] font-black uppercase tracking-widest border border-current/20`}>
              {statusInfo.label}
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Local Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Jorbex <span className="bg-clip-text text-transparent bg-linear-to-r from-[#0066FF] to-indigo-500">Office</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Verified productivity and instant payroll synchronization.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session ID</p>
             <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">{session?.id?.slice(-8).toUpperCase() || 'OFFLINE'}</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard size={20} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Main Session Controller */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-0 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-1000 ${status === 'ACTIVE' ? 'bg-[#00D9A5] shadow-[0_0_15px_rgba(0,217,165,0.5)]' : 'bg-slate-200'}`} />
            
            <CardContent className="p-10 md:p-14 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-16">
                {/* Timer Visualization */}
                <div className="relative group/timer">
                  <div className={`w-64 h-64 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700
                    ${status === 'ACTIVE' 
                        ? 'border-[#0066FF]/20 bg-blue-50/20 dark:bg-blue-400/5 scale-105' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-800/10'}`}>
                    
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={status}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                        >
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-2 block">Time Elapsed</span>
                            <span className="text-6xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
                            {formatTime(elapsedMinutes)}
                            </span>
                        </motion.div>
                    </AnimatePresence>

                    {status === 'ACTIVE' && (
                      <svg className="absolute inset-[-12px] w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90 pointer-events-none">
                        <circle
                          cx="50%" cy="50%" r="50%"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-[#00D9A5] opacity-20"
                        />
                        <motion.circle
                          cx="50%" cy="50%" r="50%"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray="100 100"
                          className="text-[#00D9A5]"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        />
                      </svg>
                    )}
                  </div>
                  
                  <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all duration-500
                    ${status === 'ACTIVE' ? 'bg-[#00D9A5] text-white' : 'bg-slate-400 text-white'}`}>
                    {status}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex-1 space-y-8 w-full">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                      {status === 'ACTIVE' ? 'You are currently synchronized' : 'Ready to start your work cycle?'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
                      {status === 'ACTIVE' 
                        ? 'Every minute is being tracked and audited by the Jorbex Office engine.' 
                        : 'Clock in to begin tracking your billable hours and start live audit mode.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 pt-4">
                    {status === 'OFFLINE' ? (
                      <Button 
                        onClick={() => clockIn('active-employment')}
                        size="lg"
                        className="h-20 px-12 rounded-[2rem] bg-[#0066FF] hover:bg-blue-700 text-white font-black text-xl shadow-2xl shadow-blue-600/30 active:scale-95 transition-all gap-4 border-none"
                      >
                        <Power size={28} />
                        Start Session
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Button 
                            onClick={() => clockOut()}
                            className="h-16 px-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-lg shadow-xl shadow-rose-500/20 transition-all gap-3 border-none group"
                        >
                            <Power size={22} className="group-hover:rotate-12 transition-transform" />
                            End Session
                        </Button>
                        
                        <div className="flex gap-3">
                             <Button variant="ghost" className="h-16 w-16 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:text-blue-600 text-slate-500">
                                 <Coffee size={24} />
                             </Button>
                             <Button variant="ghost" className="h-16 w-16 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:text-amber-600 text-slate-500">
                                 <UserMinus size={24} />
                             </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline Widget */}
          <Card className="border-0 shadow-lg bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <History className="text-[#0066FF]" size={20} />
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Session Activity Log</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Auditing
                  </div>
               </div>

               <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {[
                    { title: 'Heartbeat Synchronized', time: '1 minute ago', icon: <Activity size={12} />, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                    { title: status === 'ACTIVE' ? 'Work Mode Initiated' : 'Offline', time: 'Today', icon: <Power size={12} />, color: 'text-blue-500', bg: 'bg-blue-500' },
                    { title: 'System Security Audit Passed', time: 'Every 5m', icon: <ShieldCheck size={12} />, color: 'text-indigo-500', bg: 'bg-indigo-500' },
                  ].map((event, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-start gap-6 relative"
                    >
                      <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-900 ${event.bg}`}>
                        {event.icon}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{event.title}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{event.time}</p>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Stats & Impact */}
        <div className="lg:col-span-4 space-y-6">
          {[
            { icon: <Timer size={22} />, label: 'Standard Hours', value: formatTime(elapsedMinutes), color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: <Zap size={22} />, label: 'Projected Gross', value: '$84.20', color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' },
            { icon: <Activity size={22} />, label: 'Compliance Score', value: '98%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                key={i}
            >
                <Card className={`border-0 shadow-lg ${stat.glow ? `shadow-2xl ${stat.glow}` : ''} bg-white dark:bg-slate-900 overflow-hidden group`}>
                <CardContent className="p-8 flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                    </div>
                    <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{stat.value}</p>
                    </div>
                </CardContent>
                </Card>
            </motion.div>
          ))}

          {/* Guarantee Box */}
          <div className="rounded-[2.5rem] bg-linear-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <ShieldCheck size={120} />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-[#00D9A5]" />
                <h4 className="font-black text-lg uppercase tracking-tight">Verified Work Guarantee</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                JO creates a cryptographic proof of your attendance. This ensures your payment is processed accurately without manual timesheet approval.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[10px] font-black text-[#00D9A5] uppercase tracking-widest cursor-pointer hover:gap-3 transition-all">
                Learn more about trust-less payroll <Timer size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
