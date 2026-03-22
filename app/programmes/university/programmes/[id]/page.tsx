'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
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
};

type InviteCode = { id: string; code: string; label: string | null; usedCount: number; expiresAt: string | null; maxUses: number | null };

type Programme = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  country: string | null;
  city: string | null;
  startDate: string | null;
  endDate: string | null;
  maxParticipants: number | null;
  inviteOnly: boolean;
  members: Member[];
  inviteCodes: InviteCode[];
};

export default function UniversityProgrammeManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'students' | 'invites'>('overview');
  const [newCodeLabel, setNewCodeLabel] = useState('');
  const [creatingCode, setCreatingCode] = useState(false);
  const [codeCreated, setCodeCreated] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.userType !== 'portal_user' || session.user.portalType !== 'UNIVERSITY') {
      router.replace('/programmes/university/login');
    }
  }, [session, status, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/programmes/portal/${id}`);
      const data = await res.json();
      if (res.ok) setProgramme(data.programme);
      else setError(data.error || 'Failed to load');
    } catch {
      setError('Failed to load programme');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (session?.user?.userType === 'portal_user' && session.user.portalType === 'UNIVERSITY') load();
  }, [session, load]);

  async function createInviteCode() {
    setCreatingCode(true);
    try {
      const res = await fetch(`/api/programmes/portal/${id}/invite-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newCodeLabel }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodeCreated(data.inviteCode.code);
        setNewCodeLabel('');
        load();
      }
    } finally {
      setCreatingCode(false);
    }
  }

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
            <p className="text-white font-bold text-sm">{loading ? 'Loading...' : programme?.name}</p>
            <p className="text-slate-400 text-xs">{session.user.portalName} — University Portal</p>
          </div>
          {programme && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${programme.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-500/10 text-slate-400'}`}>
              {programme.status}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : error ? (
          <GlassCard className="p-8 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
            <Link href="/programmes/university/dashboard" className="text-violet-400 text-sm mt-3 block">← Back to dashboard</Link>
          </GlassCard>
        ) : programme ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Students', value: programme.members.length },
                { label: 'Invite Codes', value: programme.inviteCodes.length },
                { label: 'Location', value: [programme.city, programme.country].filter(Boolean).join(', ') || '—' },
                { label: 'Capacity', value: programme.maxParticipants ?? 'Unlimited' },
              ].map((s) => (
                <GlassCard key={s.label} className="p-4">
                  <p className="text-xl font-black text-white truncate">{s.value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                </GlassCard>
              ))}
            </div>

            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-6 w-fit">
              {(['overview', 'students', 'invites'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <GlassCard className="p-6 space-y-4">
                <h2 className="font-bold text-white text-lg">{programme.name}</h2>
                {programme.description && <p className="text-slate-300 text-sm">{programme.description}</p>}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {programme.startDate && <div><p className="text-slate-400 text-xs mb-0.5">Start Date</p><p className="text-white">{new Date(programme.startDate).toLocaleDateString()}</p></div>}
                  {programme.endDate && <div><p className="text-slate-400 text-xs mb-0.5">End Date</p><p className="text-white">{new Date(programme.endDate).toLocaleDateString()}</p></div>}
                  <div><p className="text-slate-400 text-xs mb-0.5">Location</p><p className="text-white">{[programme.city, programme.country].filter(Boolean).join(', ') || '—'}</p></div>
                  <div><p className="text-slate-400 text-xs mb-0.5">Access</p><p className="text-white">{programme.inviteOnly ? 'Invite Only' : 'Open Enrolment'}</p></div>
                </div>
              </GlassCard>
            )}

            {tab === 'students' && (
              <GlassCard className="overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h2 className="font-bold text-white">Students ({programme.members.length})</h2>
                </div>
                {programme.members.length === 0 ? (
                  <div className="px-6 py-12 text-center text-slate-400 text-sm">No students enrolled yet. Generate an invite code and share it with students.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase">Name</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Email</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Field</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Status</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Enrolled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programme.members.map((m) => (
                          <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-6 py-3 text-white font-medium">{m.candidate.name}</td>
                            <td className="px-4 py-3 text-slate-300">{m.candidate.email}</td>
                            <td className="px-4 py-3 text-slate-300">{m.candidate.expertise}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-500/10 text-slate-400'}`}>{m.status}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{new Date(m.enrolledAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            )}

            {tab === 'invites' && (
              <div className="space-y-4">
                <GlassCard className="p-5">
                  <h3 className="font-bold text-white mb-3">Generate Invite Code</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCodeLabel}
                      onChange={(e) => setNewCodeLabel(e.target.value)}
                      placeholder="Label (e.g. Engineering Cohort 2026)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <button
                      onClick={createInviteCode}
                      disabled={creatingCode}
                      className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-xl transition disabled:opacity-50"
                    >
                      {creatingCode ? '...' : 'Generate'}
                    </button>
                  </div>
                  {codeCreated && (
                    <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <p className="text-emerald-300 text-xs font-semibold mb-1">Code created — share with students:</p>
                      <p className="text-white font-mono font-bold text-lg">{codeCreated}</p>
                    </div>
                  )}
                </GlassCard>

                <GlassCard className="overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="font-bold text-white">Invite Codes ({programme.inviteCodes.length})</h3>
                  </div>
                  {programme.inviteCodes.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">No invite codes yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase">Code</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Label</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Used</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Expires</th>
                          </tr>
                        </thead>
                        <tbody>
                          {programme.inviteCodes.map((c) => (
                            <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="px-6 py-3 text-white font-mono text-xs">{c.code}</td>
                              <td className="px-4 py-3 text-slate-300">{c.label || '—'}</td>
                              <td className="px-4 py-3 text-slate-300">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </GlassCard>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
