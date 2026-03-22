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

const Pill = ({ children, colour = 'violet' }: { children: React.ReactNode; colour?: string }) => {
  const map: Record<string, string> = {
    violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300',
    green:  'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border ${map[colour] ?? map.violet}`}>
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

export default function UniversityDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.userType !== 'portal_user' || session.user.portalType !== 'UNIVERSITY') {
      router.replace('/programmes/university/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.userType === 'portal_user' && session.user.portalType === 'UNIVERSITY') {
      fetch('/api/programmes/portal/programmes')
        .then((r) => r.json())
        .then((data) => { if (data.programmes) setProgrammes(data.programmes); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleCopy = () => {
    const link = `${window.location.origin}/programmes/university/${session?.user?.portalSlug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400 text-sm">Loading portal...</p>
        </div>
      </div>
    );
  }

  const totalStudents = programmes.reduce((acc, p) => acc + p.members.length, 0);

  const stats = [
    { label: 'Active Programmes', value: programmes.filter((p) => p.status === 'ACTIVE').length, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Students Enrolled', value: totalStudents, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Placement Rate (%)', value: '—', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { label: 'Partner Employers', value: '—', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  const portalLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://jorbex.com'}/programmes/university/${session.user.portalSlug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      {/* Nav bar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{session.user.portalName}</p>
              <Pill colour="violet">UNIVERSITY PORTAL</Pill>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/programmes/university/login' })}
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
            {greeting()}, <span className="text-violet-300">{session.user.name}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">{session.user.portalName} — University Programme Portal</p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <GlassCard key={stat.label} className="p-5">
              <div className="w-9 h-9 bg-violet-500/10 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={stat.icon} />
                </svg>
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Programmes list */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-bold text-white">Programmes</h2>
                <Link href="/programmes/university/programmes/create" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                  + New Programme
                </Link>
              </div>
              {loading ? (
                <div className="px-6 py-10 text-center">
                  <svg className="w-6 h-6 text-violet-400 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-500 text-sm">Loading programmes...</p>
                </div>
              ) : programmes.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">Programme</th>
                        <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">Students</th>
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
                            <Link href={`/programmes/university/programmes/${prog.id}`} className="text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>

            {/* Invite students widget */}
            <GlassCard className="p-5">
              <h3 className="font-bold text-white mb-1">Invite Students</h3>
              <p className="text-slate-400 text-xs mb-3">Share your portal link with students to enrol them.</p>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-slate-300 text-xs font-mono truncate flex-1">{portalLink}</span>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Quick actions */}
          <div>
            <GlassCard className="p-5">
              <h2 className="font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/programmes/university/programmes/create"
                  className="flex items-center gap-3 w-full bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Programme
                </Link>
                <Link
                  href="/programmes/university/students"
                  className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Students
                </Link>
                <Link
                  href="/programmes/university/reports"
                  className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Reports
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
