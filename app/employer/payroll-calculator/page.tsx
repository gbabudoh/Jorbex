'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/lib/LanguageContext';

type Country = 'NG' | 'KE' | 'ZA' | 'GH' | 'TZ' | 'UG' | 'RW';

interface PayrollResult {
  grossSalary:     number;
  currency:        string;
  earnings:        { label: string; amount: number }[];
  deductions:      { label: string; amount: number }[];
  totalDeductions: number;
  netSalary:       number;
}

const COUNTRY_META: Record<Country, { flag: string; name: string; currency: string; symbol: string; placeholder: string; noteKey: string }> = {
  NG: { flag: '🇳🇬', name: 'Nigeria',       currency: 'NGN', symbol: '₦',   placeholder: 'e.g. 500,000',  noteKey: 'note_ng' },
  KE: { flag: '🇰🇪', name: 'Kenya',         currency: 'KES', symbol: 'KSh', placeholder: 'e.g. 80,000',   noteKey: 'note_ke' },
  ZA: { flag: '🇿🇦', name: 'South Africa',  currency: 'ZAR', symbol: 'R',   placeholder: 'e.g. 30,000',   noteKey: 'note_za' },
  GH: { flag: '🇬🇭', name: 'Ghana',         currency: 'GHS', symbol: '₵',   placeholder: 'e.g. 5,000',    noteKey: 'note_gh' },
  TZ: { flag: '🇹🇿', name: 'Tanzania',      currency: 'TZS', symbol: 'TSh', placeholder: 'e.g. 1,000,000', noteKey: 'note_tz' },
  UG: { flag: '🇺🇬', name: 'Uganda',        currency: 'UGX', symbol: 'USh', placeholder: 'e.g. 2,000,000', noteKey: 'note_ug' },
  RW: { flag: '🇷🇼', name: 'Rwanda',        currency: 'RWF', symbol: 'FRw', placeholder: 'e.g. 500,000',  noteKey: 'note_rw' },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function applyBands(amount: number, bands: { limit: number; rate: number }[]): number {
  let tax = 0, remaining = amount;
  for (const band of bands) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, band.limit);
    tax += slice * band.rate;
    remaining -= slice;
  }
  return tax;
}

// ─── Nigeria PAYE 2026 ────────────────────────────────────────────────────────
// CRA = max(₦200k, 1% gross) + 20% gross; bands on annual taxable income
function calcNigeriaPAYE(annualGross: number): number {
  const cra = Math.max(200_000, annualGross * 0.01) + annualGross * 0.20;
  const taxable = Math.max(0, annualGross - cra);
  return applyBands(taxable, [
    { limit: 300_000,   rate: 0.07 },
    { limit: 300_000,   rate: 0.11 },
    { limit: 500_000,   rate: 0.15 },
    { limit: 500_000,   rate: 0.19 },
    { limit: 1_600_000, rate: 0.21 },
    { limit: Infinity,  rate: 0.24 },
  ]) / 12;
}

// ─── Kenya PAYE 2026 (KRA) ────────────────────────────────────────────────────
// Monthly bands; personal relief KSh 2,400/mo
function calcKenyaPAYE(monthly: number): number {
  const tax = applyBands(monthly, [
    { limit: 24_000,   rate: 0.10 },
    { limit: 8_333,    rate: 0.25 },
    { limit: 467_667,  rate: 0.30 },
    { limit: 300_000,  rate: 0.325 },
    { limit: Infinity, rate: 0.35 },
  ]);
  return Math.max(0, tax - 2_400);
}

// ─── South Africa PAYE 2026 (SARS) ───────────────────────────────────────────
// Annual bands; primary rebate R17,235/yr; UIF 1% capped at R177.12/mo
function calcSARSPAYE(annualGross: number): number {
  const tax = applyBands(annualGross, [
    { limit: 226_000,    rate: 0.18 },
    { limit: 127_100,    rate: 0.26 },
    { limit: 135_600,    rate: 0.31 },
    { limit: 152_700,    rate: 0.36 },
    { limit: 176_200,    rate: 0.39 },
    { limit: 914_000,    rate: 0.41 },
    { limit: Infinity,   rate: 0.45 },
  ]);
  return Math.max(0, tax - 17_235) / 12;
}

// ─── Ghana PAYE 2026 (GRA) ────────────────────────────────────────────────────
// Monthly bands
function calcGhanaPAYE(monthly: number): number {
  return applyBands(monthly, [
    { limit: 490,      rate: 0.00 },
    { limit: 100,      rate: 0.05 },
    { limit: 200,      rate: 0.10 },
    { limit: 700,      rate: 0.175 },
    { limit: 1_500,    rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ]);
}

// ─── Tanzania PAYE 2026 (TRA) ─────────────────────────────────────────────────
// Monthly bands in TZS
function calcTanzaniaPAYE(monthly: number): number {
  return applyBands(monthly, [
    { limit: 270_000,  rate: 0.00 },
    { limit: 250_000,  rate: 0.08 },
    { limit: 240_000,  rate: 0.20 },
    { limit: 240_000,  rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ]);
}

// ─── Uganda PAYE 2026 (URA) ───────────────────────────────────────────────────
// Monthly bands in UGX
function calcUgandaPAYE(monthly: number): number {
  return applyBands(monthly, [
    { limit: 235_000,    rate: 0.00 },
    { limit: 100_000,    rate: 0.10 },
    { limit: 75_000,     rate: 0.20 },
    { limit: 9_590_000,  rate: 0.30 },
    { limit: Infinity,   rate: 0.40 },
  ]);
}

// ─── Rwanda PAYE 2026 (RRA) ───────────────────────────────────────────────────
// Monthly bands in RWF
function calcRwandaPAYE(monthly: number): number {
  return applyBands(monthly, [
    { limit: 30_000,   rate: 0.00 },
    { limit: 70_000,   rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ]);
}

// ─── Country calculators ──────────────────────────────────────────────────────
function calculateNigeria(gross: number): PayrollResult {
  const basic = gross * 0.70, housing = gross * 0.15, transport = gross * 0.15;
  const pencom = gross * 0.08, nhf = basic * 0.025, nsitf = gross * 0.01;
  const paye = calcNigeriaPAYE(gross * 12);
  const totalDed = pencom + nhf + nsitf + paye;
  return {
    grossSalary: gross, currency: 'NGN',
    earnings: [
      { label: 'Basic Salary',        amount: Math.round(basic) },
      { label: 'Housing Allowance',   amount: Math.round(housing) },
      { label: 'Transport Allowance', amount: Math.round(transport) },
    ],
    deductions: [
      { label: 'PAYE Tax',       amount: Math.round(paye) },
      { label: 'PENCOM Pension', amount: Math.round(pencom) },
      { label: 'NHF',            amount: Math.round(nhf) },
      { label: 'NSITF',          amount: Math.round(nsitf) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(gross - totalDed),
  };
}

function calculateKenya(gross: number): PayrollResult {
  const basic = gross * 0.85, housing = gross * 0.15;
  const shif = Math.max(gross * 0.0275, 300);
  const nssfT1 = Math.min(gross * 0.06, 2_160);
  const nssfT2 = Math.min(Math.max(gross - 6_000, 0) * 0.06, 4_320);
  const housingLevy = gross * 0.015;
  const paye = calcKenyaPAYE(gross);
  const totalDed = shif + nssfT1 + nssfT2 + housingLevy + paye;
  return {
    grossSalary: gross, currency: 'KES',
    earnings: [
      { label: 'Basic Pay',       amount: Math.round(basic) },
      { label: 'House Allowance', amount: Math.round(housing) },
    ],
    deductions: [
      { label: 'PAYE Tax',     amount: Math.round(paye) },
      { label: 'SHIF',         amount: Math.round(shif) },
      { label: 'NSSF Tier I',  amount: Math.round(nssfT1) },
      { label: 'NSSF Tier II', amount: Math.round(nssfT2) },
      { label: 'Housing Levy', amount: Math.round(housingLevy) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(gross - totalDed),
  };
}

function calculateSouthAfrica(gross: number): PayrollResult {
  const basic = gross * 0.75, travel = gross * 0.15, medical = gross * 0.10;
  const paye = calcSARSPAYE(gross * 12);
  const uif = Math.min(gross * 0.01, 177.12);
  const totalDed = paye + uif;
  return {
    grossSalary: gross, currency: 'ZAR',
    earnings: [
      { label: 'Basic Salary',      amount: Math.round(basic) },
      { label: 'Travel Allowance',  amount: Math.round(travel) },
      { label: 'Medical Allowance', amount: Math.round(medical) },
    ],
    deductions: [
      { label: 'PAYE Tax', amount: Math.round(paye) },
      { label: 'UIF',      amount: Math.round(uif) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(gross - totalDed),
  };
}

function calculateGhana(gross: number): PayrollResult {
  const basic = gross * 0.70, transport = gross * 0.15, housing = gross * 0.15;
  const ssnit = gross * 0.055;
  const paye = calcGhanaPAYE(gross);
  const totalDed = ssnit + paye;
  return {
    grossSalary: gross, currency: 'GHS',
    earnings: [
      { label: 'Basic Salary',        amount: Math.round(basic) },
      { label: 'Transport Allowance', amount: Math.round(transport) },
      { label: 'Housing Allowance',   amount: Math.round(housing) },
    ],
    deductions: [
      { label: 'PAYE Tax',      amount: Math.round(paye) },
      { label: 'SSNIT Pension', amount: Math.round(ssnit) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(gross - totalDed),
  };
}

function calculateTanzania(gross: number): PayrollResult {
  const basic = gross * 0.80, housing = gross * 0.20;
  const nssf = gross * 0.10;
  const paye = calcTanzaniaPAYE(gross);
  const totalDed = nssf + paye;
  return {
    grossSalary: gross, currency: 'TZS',
    earnings: [
      { label: 'Basic Salary',    amount: Math.round(basic) },
      { label: 'House Allowance', amount: Math.round(housing) },
    ],
    deductions: [
      { label: 'PAYE Tax', amount: Math.round(paye) },
      { label: 'NSSF',     amount: Math.round(nssf) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(gross - totalDed),
  };
}

function calculateUganda(gross: number): PayrollResult {
  const basic = gross * 0.75, transport = gross * 0.15, housing = gross * 0.10;
  const nssf = gross * 0.05;
  const paye = calcUgandaPAYE(gross);
  const totalDed = nssf + paye;
  return {
    grossSalary: gross, currency: 'UGX',
    earnings: [
      { label: 'Basic Salary',        amount: Math.round(basic) },
      { label: 'Transport Allowance', amount: Math.round(transport) },
      { label: 'Housing Allowance',   amount: Math.round(housing) },
    ],
    deductions: [
      { label: 'PAYE Tax', amount: Math.round(paye) },
      { label: 'NSSF',     amount: Math.round(nssf) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(gross - totalDed),
  };
}

function calculateRwanda(gross: number): PayrollResult {
  const basic = gross * 0.80, transport = gross * 0.20;
  const pension   = gross * 0.03;
  const medic     = gross * 0.075;
  const maternity = gross * 0.003;
  const paye = calcRwandaPAYE(gross);
  const totalDed = pension + medic + maternity + paye;
  return {
    grossSalary: gross, currency: 'RWF',
    earnings: [
      { label: 'Basic Salary',        amount: Math.round(basic) },
      { label: 'Transport Allowance', amount: Math.round(transport) },
    ],
    deductions: [
      { label: 'PAYE Tax',         amount: Math.round(paye) },
      { label: 'RSSB Pension',     amount: Math.round(pension) },
      { label: 'RSSB Medical',     amount: Math.round(medic) },
      { label: 'Maternity Levy',   amount: Math.round(maternity) },
    ],
    totalDeductions: Math.round(totalDed),
    netSalary:       Math.round(gross - totalDed),
  };
}

const CALCULATORS: Record<Country, (g: number) => PayrollResult> = {
  NG: calculateNigeria,
  KE: calculateKenya,
  ZA: calculateSouthAfrica,
  GH: calculateGhana,
  TZ: calculateTanzania,
  UG: calculateUganda,
  RW: calculateRwanda,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PayrollCalculatorPage() {
  const { t } = useLanguage();
  const [country, setCountry]       = useState<Country>('NG');
  const [grossInput, setGrossInput] = useState('');
  const [result, setResult]         = useState<PayrollResult | null>(null);

  const meta = COUNTRY_META[country];

  const calculate = () => {
    const gross = parseFloat(grossInput.replace(/,/g, ''));
    if (!gross || gross <= 0) return;
    setResult(CALCULATORS[country](gross));
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('payroll_calculator.title')} <span className="text-[#0066FF]">{t('payroll_calculator.title_highlight')}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base font-medium">
            {t('payroll_calculator.subtitle')}
          </p>
        </div>

        {/* Input card */}
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6 space-y-5">

            {/* Country selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('payroll_calculator.country_label')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(Object.keys(COUNTRY_META) as Country[]).map(c => (
                  <button
                    key={c}
                    onClick={() => { setCountry(c); setResult(null); setGrossInput(''); }}
                    className={`h-11 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 px-2 ${
                      country === c
                        ? 'bg-[#0066FF] border-[#0066FF] text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#0066FF]'
                    }`}
                  >
                    <span>{COUNTRY_META[c].flag}</span>
                    <span className="truncate">{COUNTRY_META[c].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Salary input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('payroll_calculator.salary_label')} ({meta.currency} {meta.symbol})
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={grossInput}
                  onChange={e => setGrossInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && calculate()}
                  placeholder={meta.placeholder}
                  className="flex-1 h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-[#0066FF] transition-colors"
                />
                <button
                  onClick={calculate}
                  className="h-12 px-6 bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('payroll_calculator.calculate_btn')}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              {t(`payroll_calculator.${meta.noteKey}`)}
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4" id="payslip-result">

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#0066FF]/10 p-4 text-center">
                <div className="text-xs font-bold text-[#0066FF] uppercase tracking-wide mb-1">{t('payroll_calculator.gross')}</div>
                <div className="text-xl font-black text-[#0066FF]">{result.currency} {fmt(result.grossSalary)}</div>
              </div>
              <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 p-4 text-center">
                <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">{t('payroll_calculator.deductions')}</div>
                <div className="text-xl font-black text-red-500">− {result.currency} {fmt(result.totalDeductions)}</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">{t('payroll_calculator.net_pay')}</div>
                <div className="text-xl font-black text-emerald-600">{result.currency} {fmt(result.netSalary)}</div>
              </div>
            </div>

            {/* Breakdown */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Earnings */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('payroll_calculator.earnings')}</div>
                    <div className="space-y-2">
                      {result.earnings.map(e => (
                        <div key={e.label} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{e.label}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{result.currency} {fmt(e.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                        <span>{t('payroll_calculator.total_earnings')}</span>
                        <span className="text-[#0066FF]">{result.currency} {fmt(result.grossSalary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('payroll_calculator.deductions')}</div>
                    <div className="space-y-2">
                      {result.deductions.map(d => (
                        <div key={d.label} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                          <span className="font-semibold text-red-500">− {result.currency} {fmt(d.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                        <span>{t('payroll_calculator.total_deductions')}</span>
                        <span className="text-red-500">− {result.currency} {fmt(result.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net line */}
                <div className="mt-6 pt-4 border-t-2 border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-black text-gray-900 dark:text-white text-lg">{t('payroll_calculator.net_pay')}</span>
                  <span className="font-black text-emerald-600 text-2xl">{result.currency} {fmt(result.netSalary)}</span>
                </div>

                {/* Print button */}
                <button
                  onClick={() => window.print()}
                  className="no-print mt-4 w-full h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {t('payroll_calculator.print')}
                </button>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-gray-400">
              {t('payroll_calculator.disclaimer')}
            </p>
          </div>
        )}
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}
