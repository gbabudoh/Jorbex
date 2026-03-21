'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

interface Payslip {
  id:        string;
  period:    string;
  grossPay:  number;
  netPay:    number;
  status:    string;
  pdfUrl:    string | null;
  createdAt: string;
}

interface EmploymentRecord {
  id:             string;
  jobTitle:       string;
  companyName:    string;
  salary:         string;
  currency:       string;
  startDate:      string;
  endDate:        string | null;
  eorStatus:      string;
  contractToken:  string;
  payslips:       Payslip[];
}

const STATUS_COLOURS: Record<string, string> = {
  ACTIVE:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ONBOARDING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PENDING:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  TERMINATED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function fmt(n: number) { return n.toLocaleString(); }

export default function CandidateEmploymentPage() {
  const [records, setRecords] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/candidate/employment')
      .then(r => r.json())
      .then(d => setRecords(d.records ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = records.find(r => r.eorStatus === 'ACTIVE' || r.eorStatus === 'ONBOARDING');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-[#0066FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Employment <span className="text-[#0066FF]">History</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base font-medium">
            Your verified employment records and proof of income — all in one place.
          </p>
        </div>

        {/* Active employment banner */}
        {active && (
          <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Currently Employed</span>
              </div>
              <p className="font-black text-gray-900 dark:text-white text-lg">{active.jobTitle}</p>
              <p className="text-sm text-emerald-600 font-semibold">{active.companyName}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-black text-gray-900 dark:text-white text-xl">
                {active.currency} {fmt(parseFloat(active.salary))}
                <span className="text-sm font-semibold text-gray-500"> / mo</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Since {new Date(active.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* No records */}
        {records.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80">
            <CardContent className="p-12 text-center">
              <div className="text-5xl mb-4">💼</div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">No employment records yet</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Your employment history will appear here once you accept an offer through Jorbex.
              </p>
              <Link
                href="/candidate/jobs"
                className="inline-block mt-4 px-6 py-3 bg-[#0066FF] text-white rounded-xl font-bold text-sm hover:bg-[#0052CC] transition-colors"
              >
                Browse Jobs
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {records.map(record => (
              <Card key={record.id} className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-6">

                  {/* Record header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-gray-900 dark:text-white text-xl">{record.jobTitle}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_COLOURS[record.eorStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                          {record.eorStatus}
                        </span>
                      </div>
                      <p className="text-[#0066FF] font-semibold">{record.companyName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(record.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {record.endDate ? ` — ${new Date(record.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' — Present'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="font-black text-gray-900 dark:text-white text-lg">
                        {record.currency} {fmt(parseFloat(record.salary))} <span className="text-sm font-semibold text-gray-400">/ mo</span>
                      </div>
                      <Link
                        href={`/offer/${record.contractToken}/contract`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066FF] hover:underline"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Signed Contract
                      </Link>
                    </div>
                  </div>

                  {/* Payslip history */}
                  {record.payslips.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payslips</div>
                      <div className="space-y-2">
                        {record.payslips.slice(0, 6).map(p => (
                          <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">{p.period}</span>
                              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                p.status === 'DISBURSED'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">
                                Gross: {fmt(p.grossPay)}
                              </span>
                              <span className="font-bold text-emerald-600">
                                Net: {fmt(p.netPay)}
                              </span>
                              {p.pdfUrl && (
                                <a
                                  href={p.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0066FF] hover:underline font-semibold text-xs"
                                >
                                  PDF
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {record.payslips.length > 6 && (
                        <Link
                          href="/candidate/payslips"
                          className="mt-3 inline-block text-sm font-semibold text-[#0066FF] hover:underline"
                        >
                          View all {record.payslips.length} payslips →
                        </Link>
                      )}
                    </div>
                  )}

                  {record.payslips.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No payslips generated yet.</p>
                  )}

                  {/* Proof of employment download */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#0066FF] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print proof of employment
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style>{`@media print { button { display: none !important; } }`}</style>
    </div>
  );
}
