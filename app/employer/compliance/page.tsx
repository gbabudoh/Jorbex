'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Payslip {
  id: string;
  periodMonth: number;
  periodYear: number;
  grossPay: number;
  netPay: number;
  currency: string;
  status: string;
  disbursedAt: string | null;
}

interface EmploymentRecord {
  id: string;
  country: string;
  grossSalary: number;
  currency: string;
  payrollCycle: string;
  startDate: string;
  status: string;
  frappeEmployeeName: string | null;
  candidate: {
    id: string;
    name: string;
    email: string;
    country: string | null;
    phone: string | null;
  };
  offer: {
    id: string;
    salary: string;
    currency: string;
    startDate: string;
    job: { title: string } | null;
  };
  payslips: Payslip[];
}

interface Stats {
  total: number;
  active: number;
  onboarding: number;
  pending: number;
  totalMonthlyPayroll: number;
}

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ONBOARDING:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PENDING:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  TERMINATED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const PAYSLIP_STATUS_STYLES: Record<string, string> = {
  DISBURSED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  GENERATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FAILED:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function EmployerCompliancePage() {
  const [records, setRecords]   = useState<EmploymentRecord[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/v1/eor/records');
      const data = await res.json();
      setRecords(data.records ?? []);
      setStats(data.stats ?? null);
    } catch (err) {
      console.error('Failed to fetch EOR records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-blue-50 border-t-[#0066FF] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Compliance{' '}
            <span className="text-[#0066FF]">Dashboard</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base font-medium">
            Manage payroll, contracts and compliance for all your hired employees.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Managed" value={stats.total} color="blue" />
            <StatCard label="Active"         value={stats.active} color="emerald" />
            <StatCard label="Onboarding"     value={stats.onboarding} color="purple" />
            <StatCard
              label="Monthly Payroll"
              value={stats.totalMonthlyPayroll.toLocaleString()}
              color="amber"
              prefix="~"
            />
          </div>
        )}

        {/* Empty state */}
        {records.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">No managed employees yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                When you accept a hire and set up EOR payroll, the employee will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map(record => {
              const lastPayslip = record.payslips[0] ?? null;
              const isOpen      = expanded === record.id;

              return (
                <Card
                  key={record.id}
                  className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-l-4 border-l-[#0066FF]"
                >
                  <CardContent className="p-0">
                    {/* Main row */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : record.id)}
                      className="w-full text-left p-5 flex flex-col md:flex-row md:items-center gap-4"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
                        <span className="text-[#0066FF] font-bold text-base">
                          {record.candidate.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {record.candidate.name}
                          </span>
                          <Badge className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[record.status] ?? ''}`}>
                            {record.status}
                          </Badge>
                          {record.country && (
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                              {record.country}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.offer?.job?.title ?? 'Position'} &middot; {record.offer?.currency} {parseFloat(record.offer?.salary ?? '0').toLocaleString()} / month
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Started {new Date(record.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {record.frappeEmployeeName && (
                            <span className="ml-2 font-mono text-gray-300 dark:text-gray-600">{record.frappeEmployeeName}</span>
                          )}
                        </div>
                      </div>

                      {/* Last payslip */}
                      <div className="flex-shrink-0 text-right">
                        {lastPayslip ? (
                          <>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {lastPayslip.currency} {lastPayslip.netPay.toLocaleString()} net
                            </div>
                            <div className="text-xs text-gray-400">
                              {MONTH_NAMES[lastPayslip.periodMonth]} {lastPayslip.periodYear}
                            </div>
                            <Badge className={`text-xs mt-1 px-2 py-0.5 rounded-full font-semibold ${PAYSLIP_STATUS_STYLES[lastPayslip.status] ?? ''}`}>
                              {lastPayslip.status}
                            </Badge>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No payslips yet</span>
                        )}
                      </div>

                      {/* Chevron */}
                      <div className="flex-shrink-0 ml-2 hidden md:block">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded: employee details */}
                    {isOpen && (
                      <div className="border-t border-gray-100 dark:border-gray-800 px-5 pb-5 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <DetailItem label="Email"        value={record.candidate.email} />
                          <DetailItem label="Phone"        value={record.candidate.phone ?? '—'} />
                          <DetailItem label="Payroll Cycle" value={record.payrollCycle} />
                          <DetailItem label="Currency"     value={record.currency} />
                          <DetailItem label="Gross Salary" value={`${record.currency} ${record.grossSalary.toLocaleString()}`} />
                          <DetailItem label="EOR Status"   value={record.status} />
                        </div>

                        {record.frappeEmployeeName && (
                          <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 font-mono">
                            Frappe HR Employee: <span className="text-gray-600 dark:text-gray-300">{record.frappeEmployeeName}</span>
                          </div>
                        )}

                        {!record.frappeEmployeeName && record.status === 'PENDING' && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-sm text-amber-700 dark:text-amber-400">
                            Frappe HR not yet configured. Set <code className="font-mono text-xs">FRAPPE_HOST</code>, <code className="font-mono text-xs">FRAPPE_API_KEY</code> and <code className="font-mono text-xs">FRAPPE_API_SECRET</code> in your environment to activate payroll.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, color, prefix = '',
}: {
  label: string;
  value: number | string;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  prefix?: string;
}) {
  const colors = {
    blue:    'bg-blue-50   dark:bg-blue-950/30   text-[#0066FF]',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600',
    purple:  'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    amber:   'bg-amber-50  dark:bg-amber-950/30  text-amber-600',
  };
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <div className="text-2xl font-black">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-xs font-semibold opacity-70 mt-0.5">{label}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold mt-0.5">{value}</div>
    </div>
  );
}
