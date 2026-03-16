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
  { key: 'candidateCount', label: 'Total Candidates', color: 'blue', href: '/admin/candidates', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'employerCount', label: 'Total Employers', color: 'emerald', href: '/admin/employers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'jobCount', label: 'Active Jobs', color: 'purple', href: '/admin/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'applicationCount', label: 'Applications', color: 'orange', href: '/admin/applications', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'interviewCount', label: 'Interviews', color: 'pink', href: '/admin/tests', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'activeSubscriptions', label: 'Active Subs', color: 'teal', href: '/admin/subscriptions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
  purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50',
  orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/50',
  pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-800/50',
  teal: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/50',
};

const subStatusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  TRIAL: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);
  const [recentEmployers, setRecentEmployers] = useState<RecentEmployer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentCandidates(data.recentCandidates || []);
        setRecentEmployers(data.recentEmployers || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className={`p-4 rounded-2xl border ${colorMap[card.color]} hover:shadow-md transition-all group`}
          >
            <svg className="w-6 h-6 mb-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
            </svg>
            <p className="text-2xl font-black">
              {stats ? stats[card.key as keyof Stats] : '—'}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Candidates */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Recent Candidates</h2>
            <Link href="/admin/candidates" className="text-[#0066FF] text-sm font-semibold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentCandidates.map((c) => (
              <Link key={c.id} href={`/admin/candidates/${c.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.expertise}</p>
                </div>
                <p className="text-xs text-slate-400 shrink-0">{new Date(c.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
            {recentCandidates.length === 0 && (
              <p className="px-6 py-8 text-center text-slate-400 text-sm">No candidates yet</p>
            )}
          </div>
        </div>

        {/* Recent Employers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Recent Employers</h2>
            <Link href="/admin/employers" className="text-[#0066FF] text-sm font-semibold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentEmployers.map((e) => (
              <Link key={e.id} href={`/admin/employers/${e.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {e.companyName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{e.companyName}</p>
                  <p className="text-xs text-slate-500 truncate">{e.email}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${subStatusColor[e.subscriptionStatus] || 'bg-gray-100 text-gray-700'}`}>
                  {e.subscriptionStatus}
                </span>
              </Link>
            ))}
            {recentEmployers.length === 0 && (
              <p className="px-6 py-8 text-center text-slate-400 text-sm">No employers yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
