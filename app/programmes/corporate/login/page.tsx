'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

type Locale = 'en' | 'fr' | 'ar' | 'pt';

export default function CorporateLoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const LANGS: { code: Locale; label: string }[] = [
    { code: 'en', label: t('corp_login.lang_en') },
    { code: 'fr', label: t('corp_login.lang_fr') },
    { code: 'ar', label: t('corp_login.lang_ar') },
    { code: 'pt', label: t('corp_login.lang_pt') },
  ];

  function LangSwitcher() {
    return (
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-200/60 p-1.5">
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
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        userType: 'portal_user',
        redirect: false,
      });
      if (result?.error) {
        setError(t('corp_login.error_invalid'));
      } else if (result?.ok) {
        router.push('/programmes/corporate/dashboard');
      }
    } catch {
      setError(t('corp_login.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/60 to-orange-50/40 flex">

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-b from-amber-600 via-orange-600 to-amber-800 p-10 relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Back link */}
          <Link href="/programmes" className="inline-flex items-center gap-1.5 text-amber-100 hover:text-white text-sm font-medium transition-colors mb-10 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('corp_login.back')}
          </Link>

          {/* Logo mark */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{t('corp_login.portal_name')}</p>
              <p className="text-amber-200 text-xs">{t('corp_login.portal_subtitle')}</p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-3">
            {t('corp_login.headline')}<br />
            <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              {t('corp_login.headline_accent')}
            </span>
          </h1>
          <p className="text-amber-100 text-sm leading-relaxed mb-10">
            {t('corp_login.subheading')}
          </p>

          {/* Corporate skyline illustration */}
          <svg viewBox="0 0 340 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
            <defs>
              <linearGradient id="closky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#fde68a" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="clotall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.10" />
              </linearGradient>
              <linearGradient id="clomid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="clowin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            <rect width="340" height="210" rx="16" fill="url(#closky)" />
            <rect x="0" y="185" width="340" height="25" rx="4" fill="white" fillOpacity="0.07" />

            {/* Far left short */}
            <rect x="10" y="148" width="44" height="37" fill="url(#clomid)" rx="2" opacity="0.7" />
            {[14,28].map((x) => [152,163].map((y) => (
              <rect key={`${x}${y}`} x={x} y={y} width="9" height="8" fill="url(#clowin)" rx="1" />
            )))}

            {/* Left mid-rise */}
            <rect x="56" y="112" width="56" height="73" fill="url(#clomid)" rx="2" />
            {[61,73,85,97].map((x) => [120,134,148,162].map((y) => (
              <rect key={`${x}${y}`} x={x} y={y} width="9" height="10" fill="url(#clowin)" rx="1" />
            )))}
            <rect x="68" y="104" width="32" height="8" fill="white" fillOpacity="0.18" rx="1" />
            <rect x="78" y="96" width="12" height="8" fill="white" fillOpacity="0.14" rx="1" />

            {/* Centre tower — tallest */}
            <rect x="130" y="38" width="80" height="147" fill="url(#clotall)" rx="3" />
            {[137,152,167,182,197].map((x) => [48,64,80,96,112,128,144,160].map((y) => (
              <rect key={`${x}${y}`} x={x} y={y} width="11" height="12" fill="url(#clowin)" rx="1" />
            )))}
            {/* Crown */}
            <rect x="163" y="18" width="14" height="22" fill="white" fillOpacity="0.22" rx="1" />
            <polygon points="170,6 178,18 162,18" fill="white" fillOpacity="0.28" />
            <circle cx="170" cy="5" r="2.5" fill="#fcd34d" fillOpacity="0.9" />

            {/* Right mid-rise */}
            <rect x="228" y="100" width="58" height="85" fill="url(#clomid)" rx="2" />
            {[233,246,259,272].map((x) => [108,122,136,150,164].map((y) => (
              <rect key={`${x}${y}`} x={x} y={y} width="9" height="10" fill="url(#clowin)" rx="1" />
            )))}
            <rect x="238" y="92" width="38" height="8" fill="white" fillOpacity="0.18" rx="1" />

            {/* Far right short */}
            <rect x="290" y="155" width="42" height="30" fill="url(#clomid)" rx="2" opacity="0.6" />
            {[295,308].map((x) => [159,169].map((y) => (
              <rect key={`${x}${y}`} x={x} y={y} width="8" height="7" fill="url(#clowin)" rx="1" />
            )))}

            {/* Road */}
            <rect x="0" y="188" width="340" height="3" fill="white" fillOpacity="0.12" rx="2" />

            {/* Briefcase icon floating top-right */}
            <g transform="translate(275,22)" opacity="0.7">
              <rect x="2" y="6" width="22" height="16" rx="2" fill="white" fillOpacity="0.3" />
              <rect x="8" y="3" width="10" height="4" rx="1" fill="white" fillOpacity="0.22" />
              <line x1="2" y1="13" x2="24" y2="13" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
              <line x1="13" y1="6" x2="13" y2="22" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
            </g>

            {/* Sparkles */}
            {[[25,26],[315,46],[14,102],[326,116]].map(([x,y],i) => (
              <g key={i} transform={`translate(${x},${y})`}>
                <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
                <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        </div>

        {/* Bottom info cards */}
        <div className="relative z-10 mt-8 space-y-3">
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xs">{t('corp_login.info_instant_title')}</p>
              <p className="text-amber-200 text-xs leading-snug">{t('corp_login.info_instant_desc')}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xs">{t('corp_login.info_help_title')}</p>
              <p className="text-amber-200 text-xs leading-snug">
                {t('corp_login.info_help_desc')}{' '}
                <span className="text-amber-100 font-medium">programmes@jorbex.com</span>
              </p>
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
            {t('corp_login.back')}
          </Link>
        </div>

        <div className="w-full max-w-md">

          {/* Language switcher */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-widest">Language</span>
            </div>
            <LangSwitcher />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/25 mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-amber-100 border border-amber-200 text-amber-700 mb-3">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              {t('corp_login.portal_label')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">{t('corp_login.signin_title')}</h2>
            <p className="text-slate-500 text-sm mt-1">{t('corp_login.signin_subtitle')}</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />

            <form onSubmit={handleSubmit} className="p-7 space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('corp_login.email_label')}</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('corp_login.email_placeholder')}
                    required
                    autoComplete="email"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('corp_login.password_label')}</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
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
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('corp_login.btn_signing_in')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {t('corp_login.btn_sign_in')}
                  </>
                )}
              </button>

              {/* Register link */}
              <div className="pt-1 border-t border-slate-100">
                <p className="text-center text-slate-500 text-sm pt-4">
                  {t('corp_login.no_account')}{' '}
                  <Link href="/programmes/corporate/register" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                    {t('corp_login.register_link')}
                  </Link>
                </p>
              </div>

            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-slate-400 text-xs mt-5">
            {t('corp_login.footer_note')}{' '}
            <a href="mailto:programmes@jorbex.com" className="text-amber-500 hover:text-amber-600 transition-colors font-medium">
              programmes@jorbex.com
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
