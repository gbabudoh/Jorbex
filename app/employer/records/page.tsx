'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

interface EmploymentRecord {
  id:              string;
  candidateName:   string;
  candidateEmail:  string;
  jobTitle:        string;
  salary:          string;
  currency:        string;
  startDate:       string;
  endDate:         string | null;
  eorStatus:       string;
  contractId:      string;
  frappeEmployee:  string | null;
  createdAt:       string;
  offerId:         string;
}

interface Stats {
  total:               number;
  active:              number;
  onboarding:          number;
  pending:             number;
  totalMonthlyPayroll: number;
}

const STATUS_COLOURS: Record<string, string> = {
  ACTIVE:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ONBOARDING:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PENDING:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  TERMINATED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function fmt(n: number) { return n.toLocaleString(); }

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_COLOURS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function EmployerRecordsPage() {
  const [records, setRecords] = useState<EmploymentRecord[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    fetch('/api/v1/eor/records')
      .then(r => r.json())
      .then(d => {
        setRecords(d.records ?? []);
        setStats(d.stats   ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter(r =>
    r.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    r.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    r.candidateEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Employment <span className="text-[#0066FF]">Records</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base font-medium">
            All hires made through Jorbex — signed contracts, onboarding status, and payroll summary.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 text-center">
              <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Total Hires</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 shadow-sm p-4 text-center">
              <div className="text-2xl font-black text-emerald-600">{stats.active}</div>
              <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mt-1">Active</div>
            </div>
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 shadow-sm p-4 text-center">
              <div className="text-2xl font-black text-blue-600">{stats.onboarding}</div>
              <div className="text-xs font-semibold text-blue-500 uppercase tracking-wide mt-1">Onboarding</div>
            </div>
            <div className="rounded-2xl bg-[#0066FF]/10 shadow-sm p-4 text-center">
              <div className="text-2xl font-black text-[#0066FF]">{fmt(stats.totalMonthlyPayroll)}</div>
              <div className="text-xs font-semibold text-[#0066FF] uppercase tracking-wide mt-1">Monthly Payroll</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or position..."
            className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-[#0066FF] transition-colors"
          />
        </div>

        {/* Records list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-[#0066FF] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80">
            <CardContent className="p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">No employment records yet</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Records are created automatically when a candidate accepts your offer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(record => (
              <Card key={record.id} className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    {/* Left: candidate info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-black text-gray-900 dark:text-white text-lg truncate">
                          {record.candidateName}
                        </h3>
                        <StatusBadge status={record.eorStatus} />
                      </div>
                      <p className="text-sm text-[#0066FF] font-semibold">{record.jobTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{record.candidateEmail}</p>
                    </div>

                    {/* Right: salary + contract link */}
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-black text-gray-900 dark:text-white">
                          {record.currency} {fmt(parseFloat(record.salary))} / mo
                        </div>
                        <div className="text-xs text-gray-400">
                          Started {new Date(record.startDate).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </div>
                      </div>
                      <Link
                        href={`/offer/${record.contractId}/contract`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066FF] hover:underline"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Contract
                      </Link>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>Record ID: <span className="font-mono text-gray-700 dark:text-gray-300">{record.id.slice(0, 8).toUpperCase()}</span></span>
                    {record.frappeEmployee && (
                      <span>ERPNext: <span className="font-mono text-gray-700 dark:text-gray-300">{record.frappeEmployee}</span></span>
                    )}
                    {record.endDate && (
                      <span className="text-red-500">
                        Ended: {new Date(record.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span>Added {new Date(record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
