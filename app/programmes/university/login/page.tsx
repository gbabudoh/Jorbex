'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

type Locale = 'en' | 'fr' | 'ar' | 'pt';

export default function UniversityLoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const LANGS: { code: Locale; label: string }[] = [
    { code: 'en', label: t('uni_login.lang_en') },
    { code: 'fr', label: t('uni_login.lang_fr') },
    { code: 'ar', label: t('uni_login.lang_ar') },
    { code: 'pt', label: t('uni_login.lang_pt') },
  ];

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
        if (result.error === 'PortalPending') {
          setError('PortalPending');
        } else {
          setError(t('uni_login.error_invalid'));
        }
      } else if (result?.ok) {
        router.push('/programmes/university/dashboard');
      }
    } catch {
      setError(t('uni_login.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/60 to-purple-50/40 flex">

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-b from-violet-700 via-purple-700 to-indigo-800 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/programmes" className="inline-flex items-center gap-1.5 text-violet-200 hover:text-white text-sm font-medium transition-colors mb-10 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('uni_login.back')}
          </Link>

          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{t('uni_login.portal_label')}</p>
              <p className="text-violet-300 text-xs">{t('uni_login.portal_name')}</p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-3">
            {t('uni_login.headline_1')}<br />
            <span className="bg-gradient-to-r from-violet-200 to-pink-200 bg-clip-text text-transparent">
              {t('uni_login.headline_2')}
            </span>
          </h1>
          <p className="text-violet-100 text-sm leading-relaxed mb-10">
            {t('uni_login.subheading')}
          </p>

          {/* Campus illustration */}
          <svg viewBox="0 0 340 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
            <defs>
              <linearGradient id="ulosky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="ulobld" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="ulowin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <rect width="340" height="210" rx="16" fill="url(#ulosky)" />
            <rect x="0" y="182" width="340" height="28" rx="4" fill="white" fillOpacity="0.07" />
            <rect x="28" y="120" width="68" height="62" fill="url(#ulobld)" rx="2" />
            {[34,50,66,82].map((x,i) => [128,144,160].map((y,j) => (
              <rect key={`uw${i}${j}`} x={x} y={y} width="10" height="11" fill="url(#ulowin)" rx="1" />
            )))}
            <rect x="26" y="115" width="72" height="5" fill="white" fillOpacity="0.16" rx="1" />
            <rect x="106" y="72" width="128" height="110" fill="url(#ulobld)" rx="2" />
            {[113,128,143,158,175,190,205,220].map((x,i) => (
              <rect key={`ucol${i}`} x={x} y="98" width="8" height="84" fill="white" fillOpacity="0.10" rx="1" />
            ))}
            <polygon points="93,98 170,46 247,98" fill="white" fillOpacity="0.13" />
            <polygon points="103,98 170,54 237,98" fill="white" fillOpacity="0.09" />
            {[113,148,185,215].map((x) => [106,126,146].map((y) => (
              <rect key={`${x}${y}`} x={x} y={y} width="18" height="16" fill="url(#ulowin)" rx="1" />
            )))}
            <rect x="151" y="152" width="38" height="30" fill="white" fillOpacity="0.18" rx="2" />
            <rect x="169" y="152" width="2" height="30" fill="white" fillOpacity="0.14" />
            <ellipse cx="170" cy="54" rx="30" ry="22" fill="white" fillOpacity="0.18" />
            <ellipse cx="170" cy="48" rx="18" ry="13" fill="white" fillOpacity="0.26" />
            <ellipse cx="170" cy="40" rx="8" ry="7" fill="white" fillOpacity="0.36" />
            <line x1="170" y1="22" x2="170" y2="40" stroke="white" strokeWidth="1.5" strokeOpacity="0.65" />
            <rect x="170" y="13" width="18" height="10" fill="#fbbf24" fillOpacity="0.80" rx="1" />
            <rect x="244" y="120" width="68" height="62" fill="url(#ulobld)" rx="2" />
            {[250,266,282,296].map((x,i) => [128,144,160].map((y,j) => (
              <rect key={`urw${i}${j}`} x={x} y={y} width="10" height="11" fill="url(#ulowin)" rx="1" />
            )))}
            <rect x="242" y="115" width="72" height="5" fill="white" fillOpacity="0.16" rx="1" />
            <rect x="93" y="179" width="154" height="5" fill="white" fillOpacity="0.14" rx="1" />
            <rect x="100" y="174" width="140" height="5" fill="white" fillOpacity="0.11" rx="1" />
            <rect x="108" y="169" width="124" height="5" fill="white" fillOpacity="0.09" rx="1" />
            <g transform="translate(278,20)" opacity="0.75">
              <polygon points="18,7 36,16 18,25 0,16" fill="white" fillOpacity="0.3" />
              <rect x="15" y="16" width="6" height="12" fill="white" fillOpacity="0.25" rx="1" />
              <circle cx="18" cy="28" r="3" fill="white" fillOpacity="0.4" />
            </g>
            {[[22,28],[318,48],[14,105],[326,118]].map(([x,y],i) => (
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
              <svg className="w-3.5 h-3.5 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xs">{t('uni_login.info_pending_title')}</p>
              <p className="text-violet-200 text-xs leading-snug">{t('uni_login.info_pending_desc')}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-violet-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-xs">{t('uni_login.info_help_title')}</p>
              <p className="text-violet-200 text-xs leading-snug">
                {t('uni_login.info_help_desc')}{' '}
                <span className="text-violet-100 font-medium">programmes@jorbex.com</span>
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
            {t('uni_login.back_mobile')}
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
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30 scale-105'
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
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl shadow-lg shadow-violet-500/25 mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-violet-100 border border-violet-200 text-violet-700 mb-3">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
              {t('uni_login.badge')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">{t('uni_login.page_title')}</h2>
            <p className="text-slate-500 text-sm mt-1">{t('uni_login.page_subtitle')}</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

            <form onSubmit={handleSubmit} className="p-7 space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t('uni_login.field_email')}
                </label>
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
                    placeholder={t('uni_login.field_email_placeholder')}
                    required
                    autoComplete="email"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {t('uni_login.field_password')}
                </label>
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
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all shadow-sm"
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

              {/* Error — invalid credentials */}
              {error && error !== 'PortalPending' && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Error — pending approval */}
              {error === 'PortalPending' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-amber-700 text-sm font-semibold">{t('uni_login.error_pending_title')}</p>
                    <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">{t('uni_login.error_pending_desc')}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('uni_login.btn_loading')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {t('uni_login.btn_submit')}
                  </>
                )}
              </button>

              {/* Divider + register link */}
              <div className="pt-1 border-t border-slate-100">
                <p className="text-center text-slate-500 text-sm pt-4">
                  {t('uni_login.no_account')}{' '}
                  <Link href="/programmes/university/register" className="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                    {t('uni_login.register_link')}
                  </Link>
                </p>
              </div>

            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-slate-400 text-xs mt-5">
            {t('uni_login.questions')}{' '}
            <a href="mailto:programmes@jorbex.com" className="text-violet-500 hover:text-violet-600 transition-colors font-medium">
              programmes@jorbex.com
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
