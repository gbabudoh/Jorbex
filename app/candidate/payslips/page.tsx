'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface PayslipComponent {
  salary_component: string;
  amount: number;
}

interface Payslip {
  id: string;
  periodMonth: number;
  periodYear: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  pdfUrl: string | null;
  transferCode: string | null;
  disbursedAt: string | null;
  status: string;
  components: PayslipComponent[] | null;
  employmentRecord: {
    country: string;
    employer: { companyName: string };
    offer: { job: { title: string } | null } | null;
  };
}

interface ActiveRecord {
  grossSalary: number;
  currency: string;
  country: string;
  status: string;
  employer: { companyName: string };
  offer: { job: { title: string } | null } | null;
}

const STATUS_STYLES: Record<string, string> = {
  DISBURSED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  GENERATED: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  FAILED:    'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

export default function CandidatePayslipsPage() {
  const [payslips, setPayslips]         = useState<Payslip[]>([]);
  const [activeRecord, setActiveRecord] = useState<ActiveRecord | null>(null);
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/eor/payslips')
      .then(r => r.json())
      .then(data => {
        setPayslips(data.payslips ?? []);
        setActiveRecord(data.activeRecord ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            My{' '}
            <span className="text-[#0066FF]">Payslips</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base font-medium">
            Your monthly salary records and payment history.
          </p>
        </div>

        {/* Active employment banner */}
        {activeRecord && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#0066FF]/10 to-blue-50 dark:from-[#0066FF]/10 dark:to-blue-950/30 border border-blue-100 dark:border-blue-900/30 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">
                Active employment — {activeRecord.employer.companyName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {activeRecord.offer?.job?.title ?? 'Position'} &middot; {activeRecord.currency} {activeRecord.grossSalary.toLocaleString()} / month &middot; {activeRecord.country}
              </div>
            </div>
            <Badge className="sm:ml-auto text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {activeRecord.status}
            </Badge>
          </div>
        )}

        {/* No payslips state */}
        {payslips.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">No payslips yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                Your payslips will appear here once your employer runs payroll for the first time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payslips.map(slip => {
              const isOpen = expanded === slip.id;
              const earnings   = slip.components?.filter(c => c.amount > 0 && !isDeduction(c.salary_component)) ?? [];
              const deductions = slip.components?.filter(c => isDeduction(c.salary_component)) ?? [];

              return (
                <Card
                  key={slip.id}
                  className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                >
                  <CardContent className="p-0">
                    {/* Main row */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : slip.id)}
                      className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      {/* Month icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0066FF]/10 flex flex-col items-center justify-center">
                        <span className="text-[#0066FF] font-black text-sm leading-none">
                          {MONTH_NAMES[slip.periodMonth]?.slice(0, 3).toUpperCase()}
                        </span>
                        <span className="text-[#0066FF] text-xs font-bold opacity-70 leading-none mt-0.5">
                          {slip.periodYear}
                        </span>
                      </div>

                      {/* Period + employer */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {MONTH_NAMES[slip.periodMonth]} {slip.periodYear}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {slip.employmentRecord.employer.companyName}
                          {slip.employmentRecord.offer?.job?.title
                            ? ` · ${slip.employmentRecord.offer.job.title}`
                            : ''}
                        </div>
                        {slip.disbursedAt && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            Paid {new Date(slip.disbursedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {/* Amounts */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-black text-gray-900 dark:text-white">
                          {slip.currency} {slip.netPay.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Gross {slip.currency} {slip.grossPay.toLocaleString()}
                        </div>
                        <Badge className={`text-xs mt-1 px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[slip.status] ?? ''}`}>
                          {slip.status}
                        </Badge>
                      </div>

                      {/* Chevron */}
                      <div className="hidden sm:block flex-shrink-0 ml-1">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded breakdown */}
                    {isOpen && (
                      <div className="border-t border-gray-100 dark:border-gray-800 px-5 pb-5 pt-4">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Earnings */}
                          {earnings.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Earnings</div>
                              <div className="space-y-1.5">
                                {earnings.map(c => (
                                  <div key={c.salary_component} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{c.salary_component}</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {slip.currency} {c.amount.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Deductions */}
                          {deductions.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Deductions</div>
                              <div className="space-y-1.5">
                                {deductions.map(c => (
                                  <div key={c.salary_component} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{c.salary_component}</span>
                                    <span className="font-semibold text-red-500">
                                      − {slip.currency} {Math.abs(c.amount).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Summary line */}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">Net Pay</span>
                          <span className="font-black text-[#0066FF] text-lg">
                            {slip.currency} {slip.netPay.toLocaleString()}
                          </span>
                        </div>

                        {/* PDF download */}
                        {slip.pdfUrl && (
                          <a
                            href={slip.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Payslip PDF
                          </a>
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

// Known deduction component name fragments
function isDeduction(componentName: string): boolean {
  const deductionKeywords = [
    'paye', 'tax', 'pension', 'pencom', 'nhif', 'shif', 'nssf',
    'nhf', 'nsitf', 'levy', 'deduction',
  ];
  const lower = componentName.toLowerCase();
  return deductionKeywords.some(k => lower.includes(k));
}
