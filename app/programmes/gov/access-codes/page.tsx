'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/30 ${className}`}>
    {children}
  </div>
);

type AccessCode = {
  id: string;
  code: string;
  label: string | null;
  isActive: boolean;
  usedCount: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export default function GovAccessCodesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.userType !== 'portal_gov') {
      router.replace('/programmes/gov/login');
    }
  }, [session, status, router]);

  const loadCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/programmes/portal/access-codes');
      const data = await res.json();
      if (res.ok) setCodes(data.codes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.userType === 'portal_gov') loadCodes();
  }, [session, loadCodes]);

  async function createCode() {
    setCreating(true);
    try {
      const res = await fetch('/api/programmes/portal/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, expiresAt: expiresAt || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCode(data.code.code);
        setLabel('');
        setExpiresAt('');
        setShowForm(false);
        loadCodes();
      }
    } finally {
      setCreating(false);
    }
  }

  async function toggleCode(id: string, isActive: boolean) {
    setToggling(id);
    try {
      await fetch('/api/programmes/portal/access-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      loadCodes();
    } finally {
      setToggling(null);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const activeCodes = codes.filter((c) => c.isActive);
  const inactiveCodes = codes.filter((c) => !c.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/programmes/gov/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{session.user.portalName}</p>
            <p className="text-slate-400 text-xs">Access Codes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Code
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Access Codes</h1>
          <p className="text-slate-400 text-sm mt-1">
            Government portals use access codes instead of passwords. Each code grants one session of portal access.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Codes', value: codes.length },
            { label: 'Active', value: activeCodes.length },
            { label: 'Total Logins', value: codes.reduce((a, c) => a + c.usedCount, 0) },
          ].map((s) => (
            <GlassCard key={s.label} className="p-4">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Last created notification */}
        {newCode && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4">
            <p className="text-emerald-300 font-semibold text-sm mb-1">New access code created — share securely:</p>
            <div className="flex items-center gap-3">
              <p className="text-white font-mono font-bold text-lg tracking-widest">{newCode}</p>
              <button
                onClick={() => copyCode(newCode)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
              >
                {copied === newCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <GlassCard className="p-6">
            <h2 className="font-bold text-white mb-4">Create Access Code</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Label</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Director of Placement — FMOL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-white/10 text-slate-300 font-semibold text-sm rounded-xl hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createCode}
                  disabled={creating}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Generate Code'}
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Codes list */}
        <GlassCard className="overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-bold text-white">All Access Codes</h2>
          </div>
          {loading ? (
            <div className="px-6 py-10 text-center">
              <svg className="w-6 h-6 text-blue-400 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : codes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-slate-300 font-semibold text-sm">No access codes yet</p>
              <p className="text-slate-500 text-xs mt-1">Create a code to allow portal access.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase">Code</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Label</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Uses</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Last Used</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Expires</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-xs tracking-widest">{c.code}</span>
                          <button onClick={() => copyCode(c.code)} className="text-blue-400 hover:text-blue-300 transition">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          {copied === c.code && <span className="text-emerald-400 text-xs">Copied</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{c.label || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{c.usedCount}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-500/10 text-slate-400'}`}>
                          {c.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleCode(c.id, c.isActive)}
                          disabled={toggling === c.id}
                          className={`text-xs font-semibold transition ${c.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'} disabled:opacity-40`}
                        >
                          {toggling === c.id ? '...' : c.isActive ? 'Revoke' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {inactiveCodes.length > 0 && (
          <p className="text-slate-500 text-xs text-center">{inactiveCodes.length} revoked code{inactiveCodes.length > 1 ? 's' : ''} hidden above.</p>
        )}
      </main>
    </div>
  );
}
