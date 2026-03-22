'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AFRICAN_COUNTRIES } from '@/lib/constants';
import { useLanguage } from '@/lib/LanguageContext';

type Locale = 'en' | 'fr' | 'ar' | 'pt';

/* ── Password strength meter ── */
function PasswordStrength({ password, labels }: { password: string; labels: string[] }) {
  const strength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  })();
  const label = labels[strength] || '';
  const colour = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500', 'bg-emerald-500'][strength] || '';
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colour : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength >= 4 ? 'text-green-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{label}</p>
    </div>
  );
}

/* ── Input wrapper with icon ── */
function InputField({ icon, label, required, children }: {
  icon: React.ReactNode; label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</span>
        {children}
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-sm';
const selectCls = 'w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-sm appearance-none';

/* ── Eye toggle icon ── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

/* ── SVG Illustration: corporate skyline ── */
function CorpIllustration() {
  return (
    <svg viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto opacity-90">
      <defs>
        <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="ctall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="cmid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="cwin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="340" height="220" fill="url(#csky)" rx="16" />
      <rect x="0" y="185" width="340" height="35" rx="4" fill="#fde68a" opacity="0.35" />
      <rect x="10" y="140" width="45" height="45" fill="#b45309" opacity="0.6" rx="2" />
      {[14,28,42].map((x,i) => [145,160,175].map((y,j) => (
        <rect key={`fl${i}${j}`} x={x} y={y} width="8" height="8" fill="url(#cwin)" rx="1" />
      )))}
      <rect x="55" y="110" width="55" height="75" fill="url(#cmid)" rx="2" />
      {[60,72,84,96].map((x,i) => [118,132,146,160].map((y,j) => (
        <rect key={`lm${i}${j}`} x={x} y={y} width="9" height="9" fill="url(#cwin)" rx="1" />
      )))}
      <rect x="68" y="102" width="30" height="8" fill="#d97706" rx="1" />
      <rect x="78" y="94" width="10" height="8" fill="#b45309" rx="1" />
      <rect x="130" y="40" width="80" height="145" fill="url(#ctall)" rx="3" />
      {[137,152,167,182,197].map((x,i) => [50,66,82,98,114,130,146,162].map((y,j) => (
        <rect key={`ct${i}${j}`} x={x} y={y} width="11" height="12" fill="url(#cwin)" rx="1" />
      )))}
      <rect x="163" y="20" width="14" height="22" fill="#92400e" rx="1" />
      <polygon points="170,8 178,20 162,20" fill="#b45309" />
      <circle cx="170" cy="7" r="2.5" fill="#fcd34d" opacity="0.9" />
      <rect x="228" y="100" width="58" height="85" fill="url(#cmid)" rx="2" />
      {[233,246,259,272].map((x,i) => [108,122,136,150,164].map((y,j) => (
        <rect key={`rm${i}${j}`} x={x} y={y} width="9" height="10" fill="url(#cwin)" rx="1" />
      )))}
      <rect x="238" y="92" width="38" height="8" fill="#d97706" rx="1" />
      <rect x="290" y="150" width="42" height="35" fill="#b45309" opacity="0.55" rx="2" />
      {[295,308].map((x,i) => [154,165].map((y,j) => (
        <rect key={`fr${i}${j}`} x={x} y={y} width="8" height="7" fill="url(#cwin)" rx="1" />
      )))}
      <rect x="0" y="188" width="340" height="3" fill="#f59e0b" opacity="0.25" rx="2" />
      {[[30,25],[310,45],[18,100],[325,120]].map(([x,y],i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-4" y1="0" x2="4" y2="0" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
      <g transform="translate(272,22)" opacity="0.85">
        <rect x="2" y="6" width="22" height="16" rx="2" fill="#d97706" />
        <rect x="8" y="3" width="10" height="4" rx="1" fill="#92400e" />
        <line x1="2" y1="13" x2="24" y2="13" stroke="#fde68a" strokeWidth="1.2" opacity="0.5" />
        <line x1="13" y1="6" x2="13" y2="22" stroke="#fde68a" strokeWidth="1.2" opacity="0.5" />
      </g>
    </svg>
  );
}

export default function CorporateRegisterPage() {
  const { t, locale, setLocale } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('');

  // Step 2
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step2Error, setStep2Error] = useState('');

  const LANGS: { code: Locale; label: string }[] = [
    { code: 'en', label: t('corp_register.lang_en') },
    { code: 'fr', label: t('corp_register.lang_fr') },
    { code: 'ar', label: t('corp_register.lang_ar') },
    { code: 'pt', label: t('corp_register.lang_pt') },
  ];

  const pwdLabels = ['', t('corp_register.pwd_very_weak'), t('corp_register.pwd_weak'), t('corp_register.pwd_fair'), t('corp_register.pwd_strong'), t('corp_register.pwd_very_strong')];

  const PILLARS = [
    {
      icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
      title: t('corp_register.pillar1_title'),
      desc: t('corp_register.pillar1_desc'),
    },
    {
      icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
      title: t('corp_register.pillar2_title'),
      desc: t('corp_register.pillar2_desc'),
    },
    {
      icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
      title: t('corp_register.pillar3_title'),
      desc: t('corp_register.pillar3_desc'),
    },
  ];

  const INDUSTRIES = [
    { value: 'Banking & Finance',      label: t('corp_register.industry_banking') },
    { value: 'Technology',             label: t('corp_register.industry_tech') },
    { value: 'Telecoms',               label: t('corp_register.industry_telecoms') },
    { value: 'Energy & Mining',        label: t('corp_register.industry_energy') },
    { value: 'Healthcare',             label: t('corp_register.industry_health') },
    { value: 'FMCG / Retail',          label: t('corp_register.industry_fmcg') },
    { value: 'Consulting',             label: t('corp_register.industry_consulting') },
    { value: 'Engineering',            label: t('corp_register.industry_engineering') },
    { value: 'Media & Entertainment',  label: t('corp_register.industry_media') },
    { value: 'Other',                  label: t('corp_register.industry_other') },
  ];

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep2Error('');
    if (password.length < 8) { setStep2Error(t('corp_register.err_min_chars')); return; }
    if (password !== confirmPassword) { setStep2Error(t('corp_register.err_mismatch')); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/programmes/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CORPORATE',
          institutionName: companyName, industry, country, city, website, companySize,
          name, jobTitle, email: email.toLowerCase().trim(), password, phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setStep2Error(data.error || t('corp_register.err_generic')); return; }
      setStep(3);
    } catch {
      setStep2Error(t('corp_register.err_unexpected'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/60 to-orange-50/40 flex">

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-b from-amber-600 via-orange-600 to-amber-800 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/programmes" className="inline-flex items-center gap-1.5 text-amber-100 hover:text-white text-sm font-medium transition-colors mb-10 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('corp_register.back')}
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{t('corp_register.portal_label')}</p>
              <p className="text-amber-200 text-xs">{t('corp_register.portal_name')}</p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-3">
            {t('corp_register.headline_1')}<br />
            <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              {t('corp_register.headline_2')}
            </span>
          </h1>
          <p className="text-amber-100 text-sm leading-relaxed mb-8">
            {t('corp_register.subheading')}
          </p>

          <CorpIllustration />
        </div>

        {/* Trust pillars */}
        <div className="relative z-10 space-y-3 mt-8">
          {PILLARS.map((p, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3">
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-amber-100">
                {p.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-xs">{p.title}</p>
                <p className="text-amber-200 text-xs leading-snug">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 overflow-y-auto">

        {/* Mobile back link */}
        <div className="lg:hidden w-full max-w-md mb-6">
          <Link href="/programmes" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('corp_register.back_mobile')}
          </Link>
        </div>

        <div className="w-full max-w-md">

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
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-200/60 p-1.5">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 ${
                    locale === code
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 scale-105'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-amber-100 border border-amber-200 text-amber-700 mb-4">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              {t('corp_register.badge')}
            </span>
            <h2 className="text-2xl font-black text-slate-900">{t('corp_register.page_title')}</h2>
            <p className="text-slate-500 text-sm mt-1">{t('corp_register.page_subtitle')}</p>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center justify-center gap-0 mb-8">
              {[
                { n: 1, label: t('corp_register.step1_label') },
                { n: 2, label: t('corp_register.step2_label') },
              ].map((s, idx) => (
                <div key={s.n} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step === s.n ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : step > s.n ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 border-2 border-slate-200 text-slate-400'
                    }`}>
                      {step === s.n && <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30" />}
                      {step > s.n ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s.n}
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${step === s.n ? 'text-amber-600' : step > s.n ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 1 && (
                    <div className={`w-16 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Form card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />

            <div className="p-7">

              {/* ── Step 1: Company Details ── */}
              {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
                  <InputField
                    label={t('corp_register.field_company')} required
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                  >
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={t('corp_register.field_company_placeholder')} required className={inputCls} />
                  </InputField>

                  <InputField
                    label={t('corp_register.field_industry')}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>}
                  >
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
                      <option value="">{t('corp_register.industry_placeholder')}</option>
                      {INDUSTRIES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField
                    label={t('corp_register.field_country')} required
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  >
                    <select value={country} onChange={(e) => setCountry(e.target.value)} required className={selectCls}>
                      <option value="">{t('corp_register.field_country_placeholder')}</option>
                      {AFRICAN_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </InputField>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label={t('corp_register.field_city')}
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    >
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('corp_register.field_city_placeholder')} className={inputCls} />
                    </InputField>

                    <InputField
                      label={t('corp_register.field_size')}
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    >
                      <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={selectCls}>
                        <option value="">{t('corp_register.size_placeholder')}</option>
                        <option value="1_50">1–50</option>
                        <option value="51_200">51–200</option>
                        <option value="201_1000">201–1,000</option>
                        <option value="1001_5000">1,001–5,000</option>
                        <option value="5000_plus">5,000+</option>
                      </select>
                    </InputField>
                  </div>

                  <InputField
                    label={t('corp_register.field_website')}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                  >
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={t('corp_register.field_website_placeholder')} className={inputCls} />
                  </InputField>

                  <button type="submit" className="w-full mt-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2">
                    {t('corp_register.btn_continue')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              )}

              {/* ── Step 2: Account Details ── */}
              {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t('corp_register.field_full_name')} required
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    >
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('corp_register.field_full_name_placeholder')} required className={inputCls} />
                    </InputField>

                    <InputField label={t('corp_register.field_job_title')}
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    >
                      <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={t('corp_register.field_job_title_placeholder')} className={inputCls} />
                    </InputField>
                  </div>

                  <InputField label={t('corp_register.field_email')} required
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  >
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('corp_register.field_email_placeholder')} required className={inputCls} />
                  </InputField>

                  <InputField label={t('corp_register.field_phone')}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                  >
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('corp_register.field_phone_placeholder')} className={inputCls} />
                  </InputField>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {t('corp_register.field_password')} <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </span>
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('corp_register.field_password_placeholder')} required minLength={8} className={`${inputCls} pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    <PasswordStrength password={password} labels={pwdLabels} />
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {t('corp_register.field_confirm_password')} <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </span>
                      <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('corp_register.field_confirm_placeholder')} required
                        className={`${inputCls} pr-10 ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:border-red-400' : confirmPassword && confirmPassword === password ? 'border-emerald-300 focus:border-emerald-400' : ''}`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={`text-xs font-medium mt-1.5 ${confirmPassword === password ? 'text-emerald-600' : 'text-red-500'}`}>
                        {confirmPassword === password ? `✓ ${t('corp_register.password_match')}` : `✗ ${t('corp_register.password_mismatch')}`}
                      </p>
                    )}
                  </div>

                  {step2Error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600 text-sm">{step2Error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {t('corp_register.btn_back')}
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-grow bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t('corp_register.btn_submitting')}
                        </>
                      ) : (
                        <>
                          {t('corp_register.btn_submit')}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Step 3: Success (instant activation) ── */}
              {step === 3 && (
                <div className="text-center py-4">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-40" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-200">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 mb-4">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {t('corp_register.success_badge')}
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 mb-2">{t('corp_register.success_title')}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {t('corp_register.success_desc').split(t('corp_register.success_desc_live')).map((part, i, arr) =>
                      i < arr.length - 1
                        ? <span key={i}>{part}<span className="text-amber-600 font-bold">{t('corp_register.success_desc_live')}</span></span>
                        : <span key={i}>{part}</span>
                    )}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-7">
                    {[
                      { label: t('corp_register.stat_status_label'), value: t('corp_register.stat_status_value'), colour: 'text-emerald-600' },
                      { label: t('corp_register.stat_schemes_label'), value: '0', colour: 'text-slate-700' },
                      { label: t('corp_register.stat_candidates_label'), value: '0', colour: 'text-slate-700' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                        <p className={`text-base font-black ${stat.colour}`}>{stat.value}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link href="/programmes/corporate/login"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      {t('corp_register.btn_sign_in')}
                    </Link>
                    <Link href="/programmes"
                      className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-semibold py-3 px-6 rounded-xl transition-all text-sm">
                      {t('corp_register.btn_back_programmes')}
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Sign-in link */}
          {step < 3 && (
            <p className="text-center text-slate-500 text-sm mt-5">
              {t('corp_register.already_portal')}{' '}
              <Link href="/programmes/corporate/login" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                {t('corp_register.sign_in_here')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
