'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ── Reusable micro-components ── */
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/30 ${className}`}>
    {children}
  </div>
);

const Pill = ({ children, colour = 'blue' }: { children: React.ReactNode; colour?: string }) => {
  const map: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300',
    green:  'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    amber:  'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border ${map[colour] ?? map.blue}`}>
      {children}
    </span>
  );
};

type Programme = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  members: { id: string }[];
  inviteCodes: { id: string }[];
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function GovDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.userType !== 'portal_gov') {
      router.replace('/programmes/gov/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.userType === 'portal_gov') {
      fetch('/api/programmes/portal/programmes')
        .then((r) => r.json())
        .then((data) => { if (data.programmes) setProgrammes(data.programmes); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400 text-sm">Loading portal...</p>
        </div>
      </div>
    );
  }

  const totalMembers = programmes.reduce((acc, p) => acc + p.members.length, 0);

  const stats = [
    { label: 'Total Programmes', value: programmes.length, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Total Enrolled', value: totalMembers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Certifications Issued', value: 0, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { label: 'Active This Month', value: programmes.filter((p) => p.status === 'ACTIVE').length, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      {/* Nav bar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{session.user.portalName}</p>
              <Pill colour="blue">GOVERNMENT PORTAL</Pill>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/programmes/gov/login' })}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-semibold transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">
            {greeting()}, <span className="text-blue-300">{session.user.portalName}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Government Programme Management</p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <GlassCard key={stat.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={stat.icon} />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Programmes list */}
          <div className="lg:col-span-2">
            <GlassCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-bold text-white">Programmes</h2>
                <Link href="/programmes/gov/programmes/create" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  + New Programme
                </Link>
              </div>
              {loading ? (
                <div className="px-6 py-10 text-center">
                  <svg className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-500 text-sm">Loading programmes...</p>
                </div>
              ) : programmes.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-slate-300 font-semibold text-sm">No programmes yet</p>
                  <p className="text-slate-500 text-xs mt-1">Create your first programme to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">Programme Name</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">Cohort</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programmes.map((prog) => (
                        <tr key={prog.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-white font-medium">{prog.name}</td>
                          <td className="px-4 py-3 text-slate-300">{prog.members.length}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              prog.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {prog.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/programmes/gov/programmes/${prog.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors">
                              View / Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <GlassCard className="p-5">
              <h2 className="font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/programmes/gov/programmes/create"
                  className="flex items-center gap-3 w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-300 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Programme
                </Link>
                <button className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm px-4 py-3 rounded-xl transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Report
                </button>
                <Link
                  href="/programmes/gov/access-codes"
                  className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Manage Access Codes
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <p className="text-center text-slate-500 text-xs">
          Government portal managed by Jorbex. For support:{' '}
          <a href="mailto:programmes@jorbex.com" className="text-blue-400 hover:text-blue-300 transition-colors">
            programmes@jorbex.com
          </a>
        </p>
      </footer>
    </div>
  );
}
