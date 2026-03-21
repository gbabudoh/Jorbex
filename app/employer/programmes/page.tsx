'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ProgrammeType = 'GOVERNMENT' | 'UNIVERSITY' | 'CORPORATE';
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

const TYPE_META: Record<ProgrammeType, { label: string; colour: string; icon: string }> = {
  GOVERNMENT: { label: 'Government',  colour: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',   icon: '🏛️' },
  UNIVERSITY:  { label: 'University',  colour: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', icon: '🎓' },
  CORPORATE:   { label: 'Corporate',   colour: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',  icon: '🏢' },
};

const STATUS_COLOUR: Record<ProgrammeStatus, string> = {
  DRAFT:     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  ACTIVE:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  SUSPENDED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function ProgrammesPage() {
  const router = useRouter();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/programmes')
      .then(r => r.json())
      .then(d => { if (d.programmes) setProgrammes(d.programmes); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Programmes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your Government, University, and Corporate placement programmes
            </p>
          </div>
          <button
            onClick={() => router.push('/employer/programmes/create')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Programme
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(['GOVERNMENT', 'UNIVERSITY', 'CORPORATE'] as ProgrammeType[]).map(type => {
            const count = programmes.filter(p => p.type === type).length;
            const meta  = TYPE_META[type];
            return (
              <div key={type} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="text-2xl mb-1">{meta.icon}</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{count}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{meta.label} programme{count !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-24 text-gray-400">Loading…</div>
        ) : programmes.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="text-5xl mb-4">🏛️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No programmes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first Government, University, or Corporate placement programme
            </p>
            <button
              onClick={() => router.push('/employer/programmes/create')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold cursor-pointer"
            >
              Create Programme
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {programmes.map(programme => {
              const meta = TYPE_META[programme.type];
              return (
                <Link
                  key={programme.id}
                  href={`/employer/programmes/${programme.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all block"
                >
                  <div className="flex flex-wrap items-start gap-4 justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{meta.icon}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{programme.name}</h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${meta.colour}`}>{meta.label}</span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLOUR[programme.status]}`}>{programme.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          /{programme.slug} {programme.country && `· ${programme.country}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <span><strong className="text-gray-900 dark:text-white">{programme._count.members}</strong> members</span>
                      <span><strong className="text-gray-900 dark:text-white">{programme._count.programmeJobs}</strong> jobs</span>
                    </div>
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
