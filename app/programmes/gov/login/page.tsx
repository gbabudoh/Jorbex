'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

type Locale = 'en' | 'fr' | 'ar' | 'pt';

export default function GovLoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const LANGS: { code: Locale; label: string }[] = [
    { code: 'en', label: t('gov_login.lang_en') },
    { code: 'fr', label: t('gov_login.lang_fr') },
    { code: 'ar', label: t('gov_login.lang_ar') },
    { code: 'pt', label: t('gov_login.lang_pt') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: slug.toLowerCase().trim(),
        password: code.trim(),
        userType: 'portal_gov',
        redirect: false,
      });
      if (result?.error) {
        setError(t('gov_login.error_invalid'));
      } else if (result?.ok) {
        router.push('/programmes/gov/dashboard');
      }
    } catch {
      setError(t('gov_login.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/40 flex">

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-b from-blue-700 via-indigo-700 to-blue-900 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/programmes" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm font-medium transition-colors mb-10 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('gov_login.back')}
          </Link>

          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{t('gov_login.portal_label')}</p>
              <p className="text-blue-300 text-xs">{t('gov_login.portal_name')}</p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-3">
            {t('gov_login.headline_1')}<br />
            <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              {t('gov_login.headline_2')}
            </span>
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed mb-10">
            {t('gov_login.subheading')}
          </p>

          {/* Parliament illustration */}
          <svg viewBox="0 0 340 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
            <defs>
              <linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="lbld" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.10" />
              </linearGradient>
              <linearGradient id="lwin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <rect width="340" height="210" rx="16" fill="url(#lsky)" />
            <rect x="0" y="178" width="340" height="32" rx="4" fill="white" fillOpacity="0.08" />
            <rect x="30" y="118" width="70" height="60" fill="url(#lbld)" rx="2" />
            {[36,52,68,84].map((x,i) => [124,140,156].map((y,j) => (
              <rect key={`lw${i}${j}`} x={x} y={y} width="10" height="11" fill="url(#lwin)" rx="1" />
            )))}
            <rect x="28" y="113" width="74" height="6" fill="white" fillOpacity="0.18" rx="1" />
            <rect x="108" y="75" width="124" height="103" fill="url(#lbld)" rx="2" />
            {[115,130,145,160,175,190,200,215].map((x,i) => (
              <rect key={`col${i}`} x={x} y="100" width="8" height="78" fill="white" fillOpacity="0.12" rx="1" />
            ))}
            <polygon points="95,100 170,48 245,100" fill="white" fillOpacity="0.14" />
            <polygon points="105,100 170,55 235,100" fill="white" fillOpacity="0.10" />
            {[115,150,185,215].map((x,i) => [108,128,148].map((y,j) => (
              <rect key={`cw${i}${j}`} x={x} y={y} width="16" height="15" fill="url(#lwin)" rx="1" />
            )))}
            <rect x="152" y="148" width="36" height="30" fill="white" fillOpacity="0.20" rx="2" />
            <rect x="168" y="148" width="2" height="30" fill="white" fillOpacity="0.15" />
            <ellipse cx="170" cy="55" rx="28" ry="20" fill="white" fillOpacity="0.20" />
            <ellipse cx="170" cy="50" rx="16" ry="12" fill="white" fillOpacity="0.28" />
            <ellipse cx="170" cy="43" rx="7" ry="6" fill="white" fillOpacity="0.38" />
            <line x1="170" y1="26" x2="170" y2="43" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
            <rect x="170" y="17" width="18" height="10" fill="#fbbf24" fillOpacity="0.85" rx="1" />
            <rect x="240" y="118" width="70" height="60" fill="url(#lbld)" rx="2" />
            {[246,262,278,290].map((x,i) => [124,140,156].map((y,j) => (
              <rect key={`rw${i}${j}`} x={x} y={y} width="10" height="11" fill="url(#lwin)" rx="1" />
            )))}
            <rect x="238" y="113" width="74" height="6" fill="white" fillOpacity="0.18" rx="1" />
            <rect x="95" y="175" width="150" height="5" fill="white" fillOpacity="0.15" rx="1" />
            <rect x="100" y="170" width="140" height="5" fill="white" fillOpacity="0.12" rx="1" />
            <rect x="108" y="165" width="124" height="5" fill="white" fillOpacity="0.10" rx="1" />
            {[[25,30],[315,50],[15,100],[328,115]].map(([x,y],i) => (
              <g key={i} transform={`translate(${x},${y})`}>
                <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
                <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        </div>

        {/* Security note */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-4 mt-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xs mb-0.5">{t('gov_login.security_title')}</p>
              <p className="text-blue-200 text-xs leading-snug">{t('gov_login.security_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">

        {/* Mobile back */}
        <div className="lg:hidden w-full max-w-md mb-6">
          <Link href="/programmes" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('gov_login.back_mobile')}
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
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-105'
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
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/25 mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-blue-100 border border-blue-200 text-blue-700 mb-3">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              {t('gov_login.badge')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">{t('gov_login.page_title')}</h2>
            <p className="text-slate-500 text-sm mt-1">{t('gov_login.page_subtitle')}</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

            <form onSubmit={handleSubmit} className="p-7 space-y-5">

              {/* Portal identifier */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t('gov_login.field_identifier')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={t('gov_login.field_identifier_placeholder')}
                    required
                    autoComplete="username"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
                  />
                </div>
                <p className="text-slate-400 text-xs mt-1.5">{t('gov_login.field_identifier_hint')}</p>
              </div>

              {/* Access code */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t('gov_login.field_code')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="••••  ••••  ••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCode ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-1.5">{t('gov_login.field_code_hint')}</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !slug || !code}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('gov_login.btn_loading')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {t('gov_login.btn_submit')}
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Help */}
          <div className="mt-5 text-center space-y-2">
            <p className="text-slate-500 text-sm">
              {t('gov_login.no_credentials')}{' '}
              <a href="mailto:programmes@jorbex.com" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                {t('gov_login.contact_email')}
              </a>
            </p>
            <p className="text-slate-400 text-xs">
              {t('gov_login.other_portals')}{' '}
              <Link href="/programmes" className="text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors">
                {t('gov_login.view_portals')}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
