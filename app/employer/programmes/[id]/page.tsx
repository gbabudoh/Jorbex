'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'members' | 'jobs' | 'codes';

interface Programme {
  id: string; slug: string; name: string; type: string; status: string;
  description?: string; country?: string; city?: string;
  startDate?: string; endDate?: string; maxParticipants?: number;
  inviteOnly: boolean; allowedDomains: string[];
  primaryColour: string; welcomeMessage?: string;
  billingModel: string; billingAmount?: number; billingCurrency: string;
  members: { id: string; status: string; enrolledAt: string; candidate: { id: string; name: string; email: string; expertise: string; onboardingTestPassed: boolean; onboardingTestScore?: number } }[];
  programmeJobs: { addedAt: string; job: { id: string; title: string; type?: string; status: string; _count: { applications: number } } }[];
  inviteCodes: { id: string; code: string; maxUses?: number; usedCount: number; expiresAt?: string }[];
  _count: { members: number };
}

const TYPE_META: Record<string, { label: string; icon: string; portalPrefix: string }> = {
  GOVERNMENT: { label: 'Government', icon: '🏛️', portalPrefix: '/gov/' },
  UNIVERSITY:  { label: 'University', icon: '🎓', portalPrefix: '/campus/' },
  CORPORATE:   { label: 'Corporate',  icon: '🏢', portalPrefix: '/match/' },
};

const STATUS_COLOURS: Record<string, string> = {
  DRAFT:     'bg-slate-100 text-slate-600',
  ACTIVE:    'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  SUSPENDED: 'bg-rose-100 text-rose-700',
};

export default function ProgrammeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>('overview');
  const [saving, setSaving]       = useState(false);
  const [newCode, setNewCode]     = useState(false);
  const [copied, setCopied]       = useState('');

  const load = () => {
    setLoading(true);
    fetch(`/api/programmes/${id}`)
      .then(r => r.json())
      .then(d => { if (d.programme) setProgramme(d.programme); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const setStatus = async (status: string) => {
    setSaving(true);
    await fetch(`/api/programmes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
    setSaving(false);
  };

  const removeMember = async (candidateId: string) => {
    await fetch(`/api/programmes/${id}/members?candidateId=${candidateId}`, { method: 'DELETE' });
    load();
  };

  const removeJob = async (jobId: string) => {
    await fetch(`/api/programmes/${id}/jobs?jobId=${jobId}`, { method: 'DELETE' });
    load();
  };

  const generateCode = async () => {
    setNewCode(true);
    await fetch(`/api/programmes/${id}/invite-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    load();
    setNewCode(false);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!programme) return <div className="min-h-screen flex items-center justify-center text-gray-400">Programme not found</div>;

  const meta = TYPE_META[programme.type] ?? { label: programme.type, icon: '📋', portalPrefix: '/' };
  const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${meta.portalPrefix}${programme.slug}`;
  const activeMembers = programme.members.filter(m => m.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => router.push('/employer/programmes')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All Programmes
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{meta.icon}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">{programme.name}</h1>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLOURS[programme.status] ?? ''}`}>{programme.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{meta.label}</span>
                  {programme.country && <><span>·</span><span>{programme.country}</span></>}
                  <span>·</span>
                  <button onClick={() => copy(portalUrl)} className="font-mono text-emerald-600 hover:underline cursor-pointer truncate max-w-xs">
                    {meta.portalPrefix}{programme.slug} {copied === portalUrl ? '✓ copied' : ''}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {programme.status === 'DRAFT' && (
                <button onClick={() => setStatus('ACTIVE')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                  Publish
                </button>
              )}
              {programme.status === 'ACTIVE' && (
                <button onClick={() => setStatus('SUSPENDED')} disabled={saving} className="border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                  Suspend
                </button>
              )}
              {programme.status === 'SUSPENDED' && (
                <button onClick={() => setStatus('ACTIVE')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                  Reactivate
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900 dark:text-white">{activeMembers.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Active members{programme.maxParticipants ? ` / ${programme.maxParticipants}` : ''}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900 dark:text-white">{programme.programmeJobs.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Jobs in programme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-900 dark:text-white">{programme.inviteCodes.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Invite codes</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {(['overview', 'members', 'jobs', 'codes'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors cursor-pointer ${tab === t ? 'bg-emerald-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              {t === 'codes' ? 'Invite Codes' : t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            {programme.description && <p className="text-gray-700 dark:text-gray-300">{programme.description}</p>}
            {programme.welcomeMessage && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-l-4 border-emerald-500">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{programme.welcomeMessage}"</p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {[
                { label: 'Start Date', value: programme.startDate ? new Date(programme.startDate).toLocaleDateString() : '—' },
                { label: 'End Date', value: programme.endDate ? new Date(programme.endDate).toLocaleDateString() : '—' },
                { label: 'Access', value: programme.inviteOnly ? 'Invite-only' : 'Open enrolment' },
                { label: 'Billing', value: `${programme.billingModel}${programme.billingAmount ? ` · ${programme.billingCurrency} ${programme.billingAmount.toLocaleString()}` : ''}` },
                { label: 'Allowed Domains', value: programme.allowedDomains.length > 0 ? programme.allowedDomains.join(', ') : 'Any' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {activeMembers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No members yet. Share your invite code to enrol candidates.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Candidate</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 hidden sm:table-cell">Expertise</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Test</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Enrolled</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeMembers.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{m.candidate.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{m.candidate.email}</div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-gray-600 dark:text-gray-400">{m.candidate.expertise}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {m.candidate.onboardingTestPassed
                          ? <span className="text-emerald-600 font-semibold">{m.candidate.onboardingTestScore?.toFixed(0)}% ✓</span>
                          : <span className="text-gray-400">Not taken</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(m.enrolledAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => removeMember(m.candidate.id)} className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'jobs' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {programme.programmeJobs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No jobs assigned to this programme yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Job Title</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 hidden sm:table-cell">Type</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Applications</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {programme.programmeJobs.map(pj => (
                    <tr key={pj.job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{pj.job.title}</td>
                      <td className="px-6 py-4 hidden sm:table-cell text-gray-500 dark:text-gray-400 capitalize">{pj.job.type ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{pj.job._count.applications}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => removeJob(pj.job.id)} className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'codes' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={generateCode} disabled={newCode} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50">
                {newCode ? 'Generating…' : '+ New Code'}
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {programme.inviteCodes.map(c => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold tracking-widest text-gray-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{c.code}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {c.usedCount} used{c.maxUses ? ` / ${c.maxUses}` : ''}
                      {c.expiresAt && ` · expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <button onClick={() => copy(c.code)} className="text-xs text-emerald-600 hover:underline cursor-pointer font-semibold">
                    {copied === c.code ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
