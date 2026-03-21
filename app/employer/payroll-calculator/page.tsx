'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

type Country = 'NG' | 'KE';

interface PayrollResult {
  grossSalary:    number;
  currency:       string;
  earnings:       { label: string; amount: number }[];
  deductions:     { label: string; amount: number }[];
  totalDeductions: number;
  netSalary:      number;
}

// ─── Nigeria PAYE 2026 ─────────────────────────────────────────────────────────
// Consolidated Relief: higher of ₦200,000 or 1% of gross + 20% of gross
function calcNigeriaPAYE(annualGross: number): number {
  const cra = Math.max(200000, annualGross * 0.01) + annualGross * 0.20;
  const taxable = Math.max(0, annualGross - cra);
  const bands = [
    { limit: 300000,   rate: 0.07 },
    { limit: 300000,   rate: 0.11 },
    { limit: 500000,   rate: 0.15 },
    { limit: 500000,   rate: 0.19 },
    { limit: 1600000,  rate: 0.21 },
    { limit: Infinity, rate: 0.24 },
  ];
  let tax = 0, remaining = taxable;
  for (const band of bands) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, band.limit);
    tax      += slice * band.rate;
    remaining -= slice;
  }
  return tax / 12; // monthly
}

// ─── Kenya PAYE 2026 (KRA) ────────────────────────────────────────────────────
// Monthly bands; personal relief = KSh 2,400/month
function calcKenyaPAYE(monthlyGross: number): number {
  const bands = [
    { limit: 24000,   rate: 0.10 },
    { limit: 8333,    rate: 0.25 },
    { limit: 467667,  rate: 0.30 },
    { limit: 300000,  rate: 0.325 },
    { limit: Infinity, rate: 0.35 },
  ];
  let tax = 0, remaining = monthlyGross;
  for (const band of bands) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, band.limit);
    tax      += slice * band.rate;
    remaining -= slice;
  }
  return Math.max(0, tax - 2400); // personal relief
}

function calculateNigeria(grossSalary: number): PayrollResult {
  const basic     = grossSalary * 0.70;
  const housing   = grossSalary * 0.15;
  const transport = grossSalary * 0.15;
  const pensionable = basic + housing + transport; // = gross in this model
  const pencom    = pensionable * 0.08;
  const nhf       = basic * 0.025;
  const nsitf     = grossSalary * 0.01;
  const paye      = calcNigeriaPAYE(grossSalary * 12);
  const totalDed  = pencom + nhf + nsitf + paye;

  return {
    grossSalary,
    currency: 'NGN',
    earnings: [
      { label: 'Basic Salary',        amount: Math.round(basic) },
      { label: 'Housing Allowance',   amount: Math.round(housing) },
      { label: 'Transport Allowance', amount: Math.round(transport) },
    ],
    deductions: [
      { label: 'PAYE Tax',        amount: Math.round(paye) },
      { label: 'PENCOM Pension',  amount: Math.round(pencom) },
      { label: 'NHF',             amount: Math.round(nhf) },
      { label: 'NSITF',           amount: Math.round(nsitf) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(grossSalary - totalDed),
  };
}

function calculateKenya(grossSalary: number): PayrollResult {
  const basic     = grossSalary * 0.85;
  const housing   = grossSalary * 0.15;
  const shif      = Math.max(grossSalary * 0.0275, 300);
  const nssfT1    = Math.min(grossSalary * 0.06, 2160);
  const nssfT2    = Math.min(Math.max(grossSalary - 6000, 0) * 0.06, 4320);
  const housingLevy = grossSalary * 0.015;
  const paye      = calcKenyaPAYE(grossSalary);
  const totalDed  = shif + nssfT1 + nssfT2 + housingLevy + paye;

  return {
    grossSalary,
    currency: 'KES',
    earnings: [
      { label: 'Basic Pay',       amount: Math.round(basic) },
      { label: 'House Allowance', amount: Math.round(housing) },
    ],
    deductions: [
      { label: 'PAYE Tax',          amount: Math.round(paye) },
      { label: 'SHIF',              amount: Math.round(shif) },
      { label: 'NSSF Tier I',       amount: Math.round(nssfT1) },
      { label: 'NSSF Tier II',      amount: Math.round(nssfT2) },
      { label: 'Housing Levy',      amount: Math.round(housingLevy) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(grossSalary - totalDed),
  };
}

export default function PayrollCalculatorPage() {
  const [country, setCountry]         = useState<Country>('NG');
  const [grossInput, setGrossInput]   = useState('');
  const [result, setResult]           = useState<PayrollResult | null>(null);

  const currencyLabel = country === 'NG' ? 'NGN (₦)' : 'KES (KSh)';
  const placeholder   = country === 'NG' ? 'e.g. 500000' : 'e.g. 80000';

  const calculate = () => {
    const gross = parseFloat(grossInput.replace(/,/g, ''));
    if (!gross || gross <= 0) return;
    setResult(country === 'NG' ? calculateNigeria(gross) : calculateKenya(gross));
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Payroll <span className="text-[#0066FF]">Calculator</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base font-medium">
            Calculate net salary, PAYE tax, and statutory deductions instantly.
          </p>
        </div>

        {/* Input card */}
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6 space-y-5">

            {/* Country selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Country</label>
              <div className="grid grid-cols-2 gap-3">
                {(['NG', 'KE'] as Country[]).map(c => (
                  <button
                    key={c}
                    onClick={() => { setCountry(c); setResult(null); }}
                    className={`h-12 rounded-xl font-bold text-sm border-2 transition-all ${
                      country === c
                        ? 'bg-[#0066FF] border-[#0066FF] text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#0066FF]'
                    }`}
                  >
                    {c === 'NG' ? '🇳🇬 Nigeria' : '🇰🇪 Kenya'}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Gross Monthly Salary ({currencyLabel})
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={grossInput}
                  onChange={e => setGrossInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && calculate()}
                  placeholder={placeholder}
                  className="flex-1 h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-[#0066FF] transition-colors"
                />
                <button
                  onClick={calculate}
                  className="h-12 px-6 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold rounded-xl transition-colors"
                >
                  Calculate
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              {country === 'NG'
                ? 'Based on Nigeria PAYE 2026 bands, PENCOM (8%), NHF (2.5%), NSITF (1%). CRA applied.'
                : 'Based on Kenya KRA PAYE 2026 bands, SHIF (2.75%), NSSF Tier I & II, Housing Levy (1.5%).'}
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4" id="payslip-result">

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#0066FF]/10 dark:bg-[#0066FF]/10 p-4 text-center">
                <div className="text-xs font-bold text-[#0066FF] uppercase tracking-wide mb-1">Gross</div>
                <div className="text-xl font-black text-[#0066FF]">{result.currency} {fmt(result.grossSalary)}</div>
              </div>
              <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-4 text-center">
                <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Deductions</div>
                <div className="text-xl font-black text-red-500">− {result.currency} {fmt(result.totalDeductions)}</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Net Pay</div>
                <div className="text-xl font-black text-emerald-600">{result.currency} {fmt(result.netSalary)}</div>
              </div>
            </div>

            {/* Breakdown */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Earnings */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Earnings</div>
                    <div className="space-y-2">
                      {result.earnings.map(e => (
                        <div key={e.label} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{e.label}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{result.currency} {fmt(e.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                        <span>Total Earnings</span>
                        <span className="text-[#0066FF]">{result.currency} {fmt(result.grossSalary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Deductions</div>
                    <div className="space-y-2">
                      {result.deductions.map(d => (
                        <div key={d.label} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                          <span className="font-semibold text-red-500">− {result.currency} {fmt(d.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                        <span>Total Deductions</span>
                        <span className="text-red-500">− {result.currency} {fmt(result.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net line */}
                <div className="mt-6 pt-4 border-t-2 border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-black text-gray-900 dark:text-white text-lg">Net Pay</span>
                  <span className="font-black text-emerald-600 text-2xl">{result.currency} {fmt(result.netSalary)}</span>
                </div>

                {/* Print button */}
                <button
                  onClick={() => window.print()}
                  className="no-print mt-4 w-full h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print / Save as PDF
                </button>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-gray-400">
              This is an estimate only. Consult a qualified accountant for official payroll filings.
            </p>
          </div>
        )}
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}
