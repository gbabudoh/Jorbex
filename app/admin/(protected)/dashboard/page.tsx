'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  candidateCount: number;
  employerCount: number;
  jobCount: number;
  applicationCount: number;
  interviewCount: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
}

interface RecentCandidate {
  id: string;
  name: string;
  email: string;
  expertise: string;
  createdAt: string;
}

interface RecentEmployer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  subscriptionStatus: string;
  createdAt: string;
}

const statCards = [
  {
    key: 'candidateCount',
    label: 'Candidates',
    href: '/admin/candidates',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    numColor: 'text-blue-700',
    border: 'border-blue-100 hover:border-blue-200',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    key: 'employerCount',
    label: 'Employers',
    href: '/admin/employers',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    numColor: 'text-emerald-700',
    border: 'border-emerald-100 hover:border-emerald-200',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    key: 'jobCount',
    label: 'Active Jobs',
    href: '/admin/jobs',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
    numColor: 'text-violet-700',
    border: 'border-violet-100 hover:border-violet-200',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    key: 'applicationCount',
    label: 'Applications',
    href: '/admin/applications',
    gradient: 'from-orange-500 to-amber-500',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    numColor: 'text-orange-700',
    border: 'border-orange-100 hover:border-orange-200',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    key: 'interviewCount',
    label: 'Interviews',
    href: '/admin/tests',
    gradient: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-600',
    numColor: 'text-pink-700',
    border: 'border-pink-100 hover:border-pink-200',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    key: 'activeSubscriptions',
    label: 'Active Subs',
    href: '/admin/subscriptions',
    gradient: 'from-cyan-500 to-sky-600',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-600',
    numColor: 'text-cyan-700',
    border: 'border-cyan-100 hover:border-cyan-200',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
];

const subStatusConfig: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Active',    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  TRIAL:     { label: 'Trial',     cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  EXPIRED:   { label: 'Expired',   cls: 'bg-red-50 text-red-600 border border-red-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
};

const quickActions = [
  { label: 'Add Job',       href: '/admin/jobs',          gradient: 'from-violet-500 to-purple-600',  icon: 'M12 4v16m8-8H4' },
  { label: 'Verifications', href: '/admin/verifications',  gradient: 'from-amber-500 to-orange-500',   icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { label: 'Subscriptions', href: '/admin/subscriptions',  gradient: 'from-cyan-500 to-sky-600',       icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { label: 'Settings',      href: '/admin/settings',       gradient: 'from-slate-600 to-slate-700',    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);
  const [recentEmployers, setRecentEmployers] = useState<RecentEmployer[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/verifications?type=all&status=PENDING').then((r) => r.ok ? r.json() : null),
    ]).then(([data, verif]) => {
      setStats(data.stats);
      setRecentCandidates(data.recentCandidates || []);
      setRecentEmployers(data.recentEmployers || []);
      if (verif) setPendingVerifications((verif.candidates?.length ?? 0) + (verif.companies?.length ?? 0));
    }).finally(() => setIsLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-full -m-6 relative overflow-hidden">

      {/* ── Layered gradient background ───────────────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.07)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.06)_0%,_transparent_60%)]" />

      {/* Soft pastel orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-48 w-[400px] h-[400px] bg-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[400px] h-[400px] bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.018]"
        style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-7">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">{today}</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {getGreeting()},{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              {stats
                ? `${stats.candidateCount.toLocaleString()} candidates · ${stats.employerCount.toLocaleString()} employers · ${stats.activeSubscriptions} active subscriptions`
                : 'Loading platform overview…'}
            </p>
          </div>

          {pendingVerifications > 0 && (
            <Link
              href="/admin/verifications"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-amber-700 text-sm font-bold leading-tight">
                  {pendingVerifications} pending {pendingVerifications === 1 ? 'verification' : 'verifications'}
                </p>
                <p className="text-amber-500 text-xs font-medium">Review now →</p>
              </div>
            </Link>
          )}
        </div>

        {/* ── Stat Cards ──────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/60 border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                className={`relative group p-5 rounded-2xl bg-white/70 backdrop-blur-sm border ${card.border} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
              >
                {/* Top-right gradient accent strip */}
                <div className={`absolute top-0 right-0 w-16 h-1 bg-gradient-to-l ${card.gradient} rounded-bl-lg opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                  <svg className={`w-4.5 h-4.5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>

                <p className={`text-2xl font-black ${card.numColor} leading-none mb-1`}>
                  {stats ? stats[card.key as keyof Stats].toLocaleString() : '—'}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
              </Link>
            ))}
          </div>
        )}

        {/* ── Middle row ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Subscription health */}
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/70 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Subscription Health</p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-semibold">Active</span>
                  <span className="text-sm font-black text-emerald-600">{stats?.activeSubscriptions ?? '—'}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                    style={{ width: stats ? `${Math.min(100, (stats.activeSubscriptions / Math.max(stats.employerCount, 1)) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-semibold">Trial</span>
                  <span className="text-sm font-black text-blue-600">{stats?.trialSubscriptions ?? '—'}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: stats ? `${Math.min(100, (stats.trialSubscriptions / Math.max(stats.employerCount, 1)) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-semibold">Applications / Job</span>
                  <span className="text-sm font-black text-violet-600">
                    {stats && stats.jobCount > 0 ? (stats.applicationCount / stats.jobCount).toFixed(1) : '—'}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full w-3/4 transition-all duration-1000" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm border border-slate-200/70 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors text-center">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Activity ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Candidates */}
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-500/40" />
                <h2 className="font-bold text-slate-800 text-sm tracking-tight">Recent Candidates</h2>
              </div>
              <Link
                href="/admin/candidates"
                className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-wider"
              >
                View all →
              </Link>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100/80 animate-pulse" />
                ))}
              </div>
            ) : recentCandidates.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-slate-400 text-sm">No candidates yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentCandidates.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/candidates/${c.id}`}
                    className="flex items-center gap-3.5 px-6 py-3.5 hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-blue-500/20">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{c.expertise || 'No expertise listed'}</p>
                    </div>
                    <p className="text-xs text-slate-400 shrink-0 font-medium">{timeAgo(c.createdAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Employers */}
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/40" />
                <h2 className="font-bold text-slate-800 text-sm tracking-tight">Recent Employers</h2>
              </div>
              <Link
                href="/admin/employers"
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-wider"
              >
                View all →
              </Link>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100/80 animate-pulse" />
                ))}
              </div>
            ) : recentEmployers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-slate-400 text-sm">No employers yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentEmployers.map((e) => {
                  const sub = subStatusConfig[e.subscriptionStatus] ?? subStatusConfig.CANCELLED;
                  return (
                    <Link
                      key={e.id}
                      href={`/admin/employers/${e.id}`}
                      className="flex items-center gap-3.5 px-6 py-3.5 hover:bg-emerald-50/40 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-emerald-500/20">
                        {e.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                          {e.companyName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{e.email}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${sub.cls}`}>
                        {sub.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
