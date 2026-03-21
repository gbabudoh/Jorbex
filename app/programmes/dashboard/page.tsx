'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type ProgrammeType   = 'GOVERNMENT' | 'UNIVERSITY' | 'CORPORATE';
type ProgrammeStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';

interface Programme {
  id: string;
  slug: string;
  name: string;
  type: ProgrammeType;
  status: ProgrammeStatus;
  country?: string;
  startDate?: string;
  endDate?: string;
  _count: { members: number; programmeJobs: number };
  createdAt: string;
}

const TYPE_META: Record<ProgrammeType, { label: string; colour: string; icon: string; light: string }> = {
  GOVERNMENT: { label: 'Government',  icon: '🏛️', colour: 'from-blue-600 to-indigo-700',   light: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  UNIVERSITY:  { label: 'University',  icon: '🎓', colour: 'from-violet-600 to-purple-700', light: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  CORPORATE:   { label: 'Corporate',   icon: '🏢', colour: 'from-amber-500 to-orange-600',  light: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
};

const STATUS_COLOUR: Record<ProgrammeStatus, string> = {
  DRAFT:     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  ACTIVE:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  SUSPENDED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function ProgrammesDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/programmes/register'); return; }
    if (status !== 'authenticated') return;
    fetch('/api/programmes')
      .then(r => r.json())
      .then(d => { if (d.programmes) setProgrammes(d.programmes); })
      .finally(() => setLoading(false));
  }, [status, router]);

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  }

  const active    = programmes.filter(p => p.status === 'ACTIVE').length;
  const totalMem  = programmes.reduce((s, p) => s + p._count.members, 0);
  const totalJobs = programmes.reduce((s, p) => s + p._count.programmeJobs, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">

      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/programmes" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              Programmes
            </Link>
            <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
              {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={() => router.push('/programmes/create')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Programme
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Your Programmes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all your Government, University, and Corporate placement programmes</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total programmes', value: programmes.length, icon: '📋' },
            { label: 'Active',           value: active,            icon: '✅' },
            { label: 'Total members',    value: totalMem,          icon: '👥' },
            { label: 'Jobs assigned',    value: totalJobs,         icon: '💼' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Type breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(['GOVERNMENT', 'UNIVERSITY', 'CORPORATE'] as ProgrammeType[]).map(type => {
            const count = programmes.filter(p => p.type === type).length;
            const meta  = TYPE_META[type];
            return (
              <div key={type} className={`rounded-2xl p-5 bg-linear-to-br ${meta.colour} text-white`}>
                <div className="text-3xl mb-2">{meta.icon}</div>
                <div className="text-2xl font-black">{count}</div>
                <div className="text-sm opacity-80">{meta.label} programme{count !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>

        {/* Programme list */}
        {programmes.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4">🏛️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No programmes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Create your first Government, University, or Corporate placement programme
            </p>
            <button
              onClick={() => router.push('/programmes/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer"
            >
              Create Programme
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Programmes</h2>
            {programmes.map(programme => {
              const meta = TYPE_META[programme.type];
              return (
                <Link
                  key={programme.id}
                  href={`/programmes/${programme.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-wrap items-start gap-4 justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${meta.colour} flex items-center justify-center text-2xl shrink-0`}>
                      {meta.icon}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{programme.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.light}`}>{meta.label}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOUR[programme.status]}`}>{programme.status.toLowerCase()}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        /{programme.slug}{programme.country ? ` · ${programme.country}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                    <div className="text-center">
                      <div className="text-base font-black text-gray-900 dark:text-white">{programme._count.members}</div>
                      <div className="text-xs">members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-black text-gray-900 dark:text-white">{programme._count.programmeJobs}</div>
                      <div className="text-xs">jobs</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
