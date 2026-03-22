'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/30 ${className}`}>
    {children}
  </div>
);

type Member = {
  id: string;
  status: string;
  enrolledAt: string;
  candidate: { id: string; name: string; email: string; expertise: string; country: string | null };
  programme: { id: string; name: string; slug: string };
};

export default function UniversityStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.userType !== 'portal_user' || session.user.portalType !== 'UNIVERSITY') {
      router.replace('/programmes/university/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.userType === 'portal_user' && session.user.portalType === 'UNIVERSITY') {
      fetch('/api/programmes/portal/members')
        .then((r) => r.json())
        .then((data) => { if (data.members) setMembers(data.members); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-950 flex items-center justify-center">
        <svg className="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const filtered = members.filter((m) => {
    const matchSearch =
      !search ||
      m.candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      m.candidate.email.toLowerCase().includes(search.toLowerCase()) ||
      m.programme.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/programmes/university/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{session.user.portalName}</p>
            <p className="text-slate-400 text-xs">Student Management</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Students</h1>
          <p className="text-slate-400 text-sm mt-1">All students enrolled across your programmes.</p>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Students', value: members.length },
            { label: 'Active', value: members.filter((m) => m.status === 'ACTIVE').length },
            { label: 'Completed', value: members.filter((m) => m.status === 'COMPLETED').length },
          ].map((s) => (
            <GlassCard key={s.label} className="p-4">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, programme..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="REMOVED">Removed</option>
          </select>
        </div>

        {/* Table */}
        <GlassCard className="overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold text-white">Enrolled Students</h2>
            <span className="text-slate-400 text-xs">{filtered.length} of {members.length}</span>
          </div>
          {loading ? (
            <div className="px-6 py-10 text-center">
              <svg className="w-6 h-6 text-violet-400 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-slate-500 text-sm">Loading students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-slate-300 font-semibold text-sm">{members.length === 0 ? 'No students enrolled yet' : 'No results match your search'}</p>
              {members.length === 0 && (
                <p className="text-slate-500 text-xs mt-1">Students enrol using invite codes from your programmes.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Programme</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Field</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-3 text-white font-medium">{m.candidate.name}</td>
                      <td className="px-4 py-3 text-slate-300">{m.candidate.email}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/programmes/university/programmes/${m.programme.id}`}
                          className="text-violet-400 hover:text-violet-300 transition text-xs font-semibold"
                        >
                          {m.programme.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{m.candidate.expertise}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300' :
                          m.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-300' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>{m.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(m.enrolledAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
