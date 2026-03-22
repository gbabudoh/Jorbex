'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

/* ── Data ────────────────────────────────────────────────────────────────── */
const AFRICAN_COUNTRIES = [
  'Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cabo Verde','Cameroon',
  'Central African Republic','Chad','Comoros','Congo','DR Congo','Djibouti','Egypt',
  'Equatorial Guinea','Eritrea','Eswatini','Ethiopia','Gabon','Gambia','Ghana','Guinea',
  'Guinea-Bissau','Ivory Coast','Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi',
  'Mali','Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria',
  'Rwanda','São Tomé & Príncipe','Senegal','Seychelles','Sierra Leone','Somalia',
  'South Africa','South Sudan','Sudan','Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe',
];

/* ── Shared input styles ─────────────────────────────────────────────────── */
const inputCls = [
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm',
  'outline-none transition-all duration-200',
  'hover:border-slate-300',
  'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white',
  'shadow-sm',
].join(' ');

const selectCls = [
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm cursor-pointer',
  'outline-none transition-all duration-200',
  'hover:border-slate-300',
  'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
  'shadow-sm',
].join(' ');

/* ── Field wrapper ───────────────────────────────────────────────────────── */
function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="group/field">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-600 group-focus-within/field:text-blue-600 transition-colors">
          {label}{required && <span className="text-blue-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

type Step = 1 | 2 | 3;
type Locale = 'en' | 'fr' | 'ar' | 'pt';

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function GovRegisterPage() {
  const { t, locale, setLocale } = useLanguage();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    institutionName: '', country: '', city: '', website: '',
    contactName: '', contactTitle: '', email: '', phone: '',
    estimatedSize: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const STEPS = [
    { n: 1, label: t('gov_register.step1_label'), desc: t('gov_register.step1_desc') },
    { n: 2, label: t('gov_register.step2_label'), desc: t('gov_register.step2_desc') },
  ];

  const TRUST = [
    {
      label: t('gov_register.trust_security_label'),
      desc: t('gov_register.trust_security_desc'),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      ),
    },
    {
      label: t('gov_register.trust_nations_label'),
      desc: t('gov_register.trust_nations_desc'),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
      ),
    },
    {
      label: t('gov_register.trust_activation_label'),
      desc: t('gov_register.trust_activation_desc'),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/programmes/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'GOVERNMENT', ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit enquiry'); return; }
      setStep(3);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Language switcher ──────────────────────────────────────────────────── */
  const LANGS: { code: Locale; label: string }[] = [
    { code: 'en', label: t('gov_register.lang_en') },
    { code: 'fr', label: t('gov_register.lang_fr') },
    { code: 'ar', label: t('gov_register.lang_ar') },
    { code: 'pt', label: t('gov_register.lang_pt') },
  ];

  function LangSwitcher() {
    return (
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-200/60 p-1.5">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 ${
              locale === code
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-105'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  /* ── Success ────────────────────────────────────────────────────────────── */
  if (step === 3) {
    const timeline = [
      { day: t('gov_register.timeline_now_label'),       text: t('gov_register.timeline_now_text'),       done: true  },
      { day: t('gov_register.timeline_day12_label'),     text: t('gov_register.timeline_day12_text'),     done: false },
      { day: t('gov_register.timeline_day3_label'),      text: t('gov_register.timeline_day3_text'),      done: false },
      { day: t('gov_register.timeline_day3plus_label'),  text: t('gov_register.timeline_day3plus_text'),  done: false },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100/50 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/60 p-10 text-center">

            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/30">
                <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {t('gov_register.success_badge')}
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {t('gov_register.success_title')}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              {t('gov_register.success_desc_1')} <span className="font-semibold text-slate-700">{form.contactName.split(' ')[0]}</span>.{' '}
              {t('gov_register.success_desc_2')} <span className="font-semibold text-slate-700">{form.institutionName}</span>{' '}
              {t('gov_register.success_desc_3')} <span className="text-blue-600 font-medium">{form.email}</span>.
            </p>

            <div className="text-left mb-8 space-y-0">
              {timeline.map(({ day, text, done }, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500 shadow-md shadow-emerald-300' : 'bg-slate-100 border border-slate-200'}`}>
                      {done
                        ? <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span className="w-2 h-2 bg-slate-300 rounded-full" />
                      }
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`w-px flex-1 my-1 ${done ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                    )}
                  </div>
                  <div className="pb-4 pt-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest block mb-0.5 ${done ? 'text-emerald-600' : 'text-slate-400'}`}>{day}</span>
                    <span className={`text-xs font-semibold ${done ? 'text-emerald-700' : 'text-slate-600'}`}>{text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link
                href="/programmes"
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all text-center"
              >
                {t('gov_register.btn_back_programmes')}
              </Link>
              <Link
                href="/programmes/gov/login"
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all text-center shadow-lg shadow-blue-500/25"
              >
                {t('gov_register.btn_sign_in')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main layout ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 flex flex-col lg:flex-row relative overflow-hidden">

      <div className="absolute top-[-5%] right-[10%] w-[600px] h-[600px] bg-blue-100/70 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] bg-indigo-100/60 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-sky-100/40 rounded-full blur-[60px] pointer-events-none" />

      {/* ══ LEFT PANEL ══════════════════════════════════════════════════════ */}
      <div className="relative lg:w-[400px] xl:w-[440px] flex-shrink-0 flex flex-col justify-between px-8 xl:px-12 py-10 lg:py-12 border-r border-slate-200/60">

        <div>
          <Link
            href="/programmes"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-xs font-semibold transition-colors mb-10 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t('gov_register.back')}
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="22" x2="21" y2="22"/>
                <line x1="6" y1="18" x2="6" y2="11"/>
                <line x1="10" y1="18" x2="10" y2="11"/>
                <line x1="14" y1="18" x2="14" y2="11"/>
                <line x1="18" y1="18" x2="18" y2="11"/>
                <polygon points="12 2 20 7 4 7"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('gov_register.portal_label')}</p>
              <p className="text-sm font-bold text-slate-800">{t('gov_register.portal_name')}</p>
            </div>
          </div>

          <h1 className="text-3xl xl:text-[2rem] font-black text-slate-900 leading-[1.2] mb-4">
            {t('gov_register.headline_1')}<br />
            {t('gov_register.headline_2')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              {t('gov_register.headline_3')}
            </span>
          </h1>

          <p className="text-slate-500 text-sm leading-relaxed mb-10">
            {t('gov_register.subheading')}
          </p>

          {/* Illustration */}
          <div className="relative mb-10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative p-6">
              <svg viewBox="0 0 320 180" className="w-full h-auto drop-shadow-2xl" fill="none">
                <defs>
                  <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <rect width="320" height="180" fill="url(#skyG)" rx="8" />
                {[[20,18],[285,22],[48,40],[300,50],[12,70],[308,80],[30,110]].map(([cx,cy],i) => (
                  <circle key={i} cx={cx} cy={cy} r="1.5" fill="white" fillOpacity="0.5" />
                ))}
                <circle cx="275" cy="28" r="10" fill="white" fillOpacity="0.12" />
                <circle cx="279" cy="25" r="8" fill="#3730a3" fillOpacity="0.9" />
                <rect x="0" y="148" width="320" height="32" fill="white" fillOpacity="0.06" rx="2" />
                <rect x="50" y="144" width="220" height="6" fill="white" fillOpacity="0.14" rx="1" />
                <rect x="62" y="138" width="196" height="7" fill="white" fillOpacity="0.10" rx="1" />
                <rect x="74" y="132" width="172" height="7" fill="white" fillOpacity="0.08" rx="1" />
                <rect x="84" y="72" width="152" height="62" fill="white" fillOpacity="0.11" rx="2" />
                {[94,110,126,142,158,174,190,206].map((x,i) => (
                  <rect key={i} x={x} y="74" width="8" height="60" fill="white" fillOpacity="0.17" rx="1" />
                ))}
                <rect x="82" y="67" width="156" height="8" fill="white" fillOpacity="0.22" rx="1" />
                <polygon points="82,67 238,67 160,30" fill="white" fillOpacity="0.14" />
                <polygon points="92,67 228,67 160,38" fill="white" fillOpacity="0.07" />
                <ellipse cx="160" cy="32" rx="26" ry="9" fill="white" fillOpacity="0.20" />
                <ellipse cx="160" cy="26" rx="17" ry="7" fill="white" fillOpacity="0.26" />
                <ellipse cx="160" cy="20" rx="10" ry="5" fill="white" fillOpacity="0.32" />
                <line x1="160" y1="5" x2="160" y2="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.55" />
                <rect x="160" y="5" width="20" height="9" fill="#fbbf24" fillOpacity="0.85" rx="1.5" />
                <rect x="146" y="106" width="28" height="28" fill="white" fillOpacity="0.24" rx="14" />
                {[90,116,184,210].map((x,i) => (
                  <g key={i}>
                    <rect x={x} y="82" width="18" height="22" fill="white" fillOpacity="0.20" rx="2" />
                    <line x1={x+9} y1="82" x2={x+9} y2={104} stroke="white" strokeWidth="0.75" strokeOpacity="0.15" />
                    <line x1={x} y1="93" x2={x+18} y2="93" stroke="white" strokeWidth="0.75" strokeOpacity="0.15" />
                  </g>
                ))}
                <rect x="20" y="95" width="62" height="50" fill="white" fillOpacity="0.08" rx="2" />
                <rect x="238" y="95" width="62" height="50" fill="white" fillOpacity="0.08" rx="2" />
                {[28,44,60].map((x,i) => (
                  <rect key={i} x={x} y="104" width="12" height="16" fill="white" fillOpacity="0.14" rx="1.5" />
                ))}
                {[246,262,278].map((x,i) => (
                  <rect key={i} x={x} y="104" width="12" height="16" fill="white" fillOpacity="0.14" rx="1.5" />
                ))}
              </svg>
            </div>
            <div className="relative px-5 pb-4 flex items-center justify-between">
              <span className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">{t('gov_register.illustration_caption')}</span>
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/70 text-[10px] font-bold">{t('gov_register.illustration_secure')}</span>
              </div>
            </div>
          </div>

          {/* Trust pillars */}
          <div className="space-y-3">
            {TRUST.map((item, i) => (
              <div key={i} className="flex items-center gap-3.5 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-4 py-3.5 shadow-sm">
                <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/60">
          <p className="text-slate-400 text-xs">
            {t('gov_register.have_credentials')}{' '}
            <Link href="/programmes/gov/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              {t('gov_register.sign_in')}
            </Link>
          </p>
        </div>
      </div>

      {/* ══ RIGHT PANEL — form ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-12">

        <div className="w-full max-w-lg mx-auto">

          {/* Language switcher */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-widest">Language</span>
            </div>
            <LangSwitcher />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-10">
            {STEPS.map(({ n, label, desc }, i) => (
              <div key={n} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : undefined }}>
                <div className="flex items-center gap-3">
                  <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 transition-all duration-300 ${
                    step > n
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/30'
                      : step === n
                      ? 'bg-white border-2 border-blue-500 text-blue-600 shadow-lg shadow-blue-100'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {step > n ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : n}
                    {step === n && <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-bold transition-colors ${step >= n ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
                    <p className={`text-[10px] transition-colors ${step >= n ? 'text-slate-500' : 'text-slate-300'}`}>{desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-slate-200 relative overflow-hidden rounded-full">
                    <div className={`absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full ${step > n ? 'w-full' : 'w-0'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            <div className="px-8 pt-7 pb-8">

              <div className="mb-7">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black ${step === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
                    {step}
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {step === 1 ? t('gov_register.step1_title') : t('gov_register.step2_title')}
                  </h2>
                </div>
                <p className="text-slate-400 text-sm">
                  {step === 1 ? t('gov_register.step1_subtitle') : t('gov_register.step2_subtitle')}
                </p>
              </div>

              {/* ── STEP 1 ───────────────────────────────────────────── */}
              {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">

                  <Field label={t('gov_register.field_institution')} required>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="3" y1="22" x2="21" y2="22"/>
                          <line x1="6" y1="18" x2="6" y2="11"/>
                          <line x1="10" y1="18" x2="10" y2="11"/>
                          <line x1="14" y1="18" x2="14" y2="11"/>
                          <line x1="18" y1="18" x2="18" y2="11"/>
                          <polygon points="12 2 20 7 4 7"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        value={form.institutionName}
                        onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                        placeholder={t('gov_register.field_institution_placeholder')}
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('gov_register.field_country')} required>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                          </svg>
                        </div>
                        <select
                          required
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          className={`${selectCls} pl-10`}
                        >
                          <option value="">{t('common.select')}…</option>
                          {AFRICAN_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </Field>
                    <Field label={t('gov_register.field_city')}>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder={t('gov_register.field_city_placeholder')}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label={t('gov_register.field_website')} hint={t('gov_register.optional')}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium select-none pointer-events-none">https://</span>
                      <input
                        type="text"
                        value={form.website.replace(/^https?:\/\//, '')}
                        onChange={(e) => setForm({ ...form, website: e.target.value ? `https://${e.target.value.replace(/^https?:\/\//, '')}` : '' })}
                        placeholder={t('gov_register.field_website_placeholder')}
                        className={`${inputCls} pl-[4.5rem]`}
                      />
                    </div>
                  </Field>

                  <Field label={t('gov_register.field_size')} hint={t('gov_register.optional')}>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                      </div>
                      <select
                        value={form.estimatedSize}
                        onChange={(e) => setForm({ ...form, estimatedSize: e.target.value })}
                        className={`${selectCls} pl-10`}
                      >
                        <option value="">{t('gov_register.size_placeholder')}</option>
                        <option value="Under 100">{t('gov_register.size_under100')}</option>
                        <option value="100-500">{t('gov_register.size_100_500')}</option>
                        <option value="500-2000">{t('gov_register.size_500_2000')}</option>
                        <option value="2000-10000">{t('gov_register.size_2000_10000')}</option>
                        <option value="Over 10000">{t('gov_register.size_over10000')}</option>
                      </select>
                    </div>
                  </Field>

                  <Field label={t('gov_register.field_notes')} hint={t('gov_register.optional')}>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder={t('gov_register.field_notes_placeholder')}
                      className={`${inputCls} resize-none leading-relaxed`}
                    />
                  </Field>

                  <button
                    type="submit"
                    className="relative w-full overflow-hidden group py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] mt-2"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {t('gov_register.btn_continue')}
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </button>
                </form>
              )}

              {/* ── STEP 2 ───────────────────────────────────────────── */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('gov_register.field_full_name')} required>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={form.contactName}
                          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                          placeholder={t('gov_register.field_full_name_placeholder')}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </Field>
                    <Field label={t('gov_register.field_job_title')} hint={t('gov_register.optional')}>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={form.contactTitle}
                          onChange={(e) => setForm({ ...form, contactTitle: e.target.value })}
                          placeholder={t('gov_register.field_job_title_placeholder')}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label={t('gov_register.field_email')} required>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={t('gov_register.field_email_placeholder')}
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </Field>

                  <Field label={t('gov_register.field_phone')} hint={t('gov_register.optional')}>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.6 19.79 19.79 0 01.22 1 2 2 0 012.22 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                        </svg>
                      </div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder={t('gov_register.field_phone_placeholder')}
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </Field>

                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200/60 rounded-2xl px-4 py-3.5">
                    <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mt-0.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-800 text-xs font-bold mb-0.5">{t('gov_register.passwordless_title')}</p>
                      <p className="text-blue-600 text-[11px] leading-relaxed">{t('gov_register.passwordless_desc')}</p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                      {t('gov_register.btn_back')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="relative flex-1 overflow-hidden group py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {submitting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            {t('gov_register.btn_submitting')}
                          </>
                        ) : (
                          <>
                            {t('gov_register.btn_submit')}
                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"/>
                              <polyline points="12 5 19 12 12 19"/>
                            </svg>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            {t('gov_register.sign_in_below')}{' '}
            <Link href="/programmes/gov/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              {t('gov_register.sign_in_portal')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
