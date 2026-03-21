'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface HomepageClientProps {
  candidateImageUrl?: string;
  employerImageUrl?: string;
}

/* ─────────────────────────────────────────────
   Reusable tiny components
───────────────────────────────────────────── */
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/30 ${className}`}>
    {children}
  </div>
);

const Pill = ({ children, colour = 'blue' }: { children: React.ReactNode; colour?: string }) => {
  const map: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300',
    green:  'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300',
    amber:  'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border ${map[colour] ?? map.blue}`}>
      {children}
    </span>
  );
};

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const STATS = [
  { value: '54',   label: 'African countries' },
  { value: '4',    label: 'Languages' },
  { value: '100%', label: 'Verified candidates' },
  { value: '∞',    label: 'Free for candidates' },
];

const FEATURE_KEYS = [
  { icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',  colour: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20', pill: 'violet' as const, tKey: 'video' },
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', colour: 'from-blue-500 to-indigo-600',   shadow: 'shadow-blue-500/20',   pill: 'blue'   as const, tKey: 'proctored' },
  { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', colour: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/20', pill: 'green'  as const, tKey: 'matching' },
  { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', colour: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20', pill: 'amber' as const, tKey: 'messaging' },
  { icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', colour: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', pill: 'amber' as const, tKey: 'payroll' },
  { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', colour: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/20', pill: 'green' as const, tKey: 'records' },
  { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', colour: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/20', pill: 'blue' as const, tKey: 'programmes' },
  { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', colour: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20', pill: 'blue' as const, tKey: 'scheduling' },
  { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', colour: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20', pill: 'green' as const, tKey: 'multilingual' },
];

const HOW_C_NUMS = ['01', '02', '03', '04'] as const;
const HOW_E_NUMS = ['01', '02', '03', '04'] as const;

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function HomepageClient({ candidateImageUrl, employerImageUrl }: HomepageClientProps) {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  const candidateSrc = candidateImageUrl || '/candidate.png';
  const employerSrc  = employerImageUrl  || '/employer.png';

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.userType === 'candidate') router.replace('/candidate/profile');
      else if (session.user.userType === 'employer') router.replace('/employer/search');
    }
  }, [session, status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4">

        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50/60 to-indigo-100/50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/40" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-400/12 dark:bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* ── Images first, full-size ── */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">

            {/* Candidate image panel */}
            <div className="group relative">
              {/* Glow ring */}
              <div className="absolute -inset-1 bg-linear-to-br from-blue-500/30 to-indigo-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <GlassCard className="relative overflow-visible hover:scale-[1.015] transition-all duration-500">
                {/* Label badge */}
                <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-xl shadow-blue-600/30 text-sm font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {t('hero.get_hired')}
                </div>
                {/* Full image */}
                <div className="relative aspect-square flex items-center justify-center p-4">
                  <Image
                    src={candidateSrc}
                    alt="Job Seekers"
                    width={600}
                    height={600}
                    className="w-full h-full object-contain transform group-hover:scale-[1.03] transition-all duration-500"
                    unoptimized={candidateSrc.startsWith('http')}
                  />
                  {/* Start here badge */}
                  <Link href="/signup?type=candidate" className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse">
                      <span className="text-white font-black text-xs text-center leading-tight px-1">{t('hero.start_here')}</span>
                    </div>
                  </Link>
                </div>
                {/* Footer row */}
                <div className="px-6 pb-5 pt-2 border-t border-white/40 dark:border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <Pill colour="blue">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      {t('hero.for_candidates')}
                    </Pill>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">{t('hero.find_dream_job')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs">{t('hero.candidate_description')}</p>
                  </div>
                  <Link href="/signup?type=candidate" className="shrink-0">
                    <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                      {t('hero.get_started')} →
                    </button>
                  </Link>
                </div>
              </GlassCard>
            </div>

            {/* Employer image panel */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-br from-emerald-500/30 to-teal-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <GlassCard className="relative overflow-visible hover:scale-[1.015] transition-all duration-500">
                {/* Label badge */}
                <div className="absolute top-5 right-5 z-20 flex items-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full shadow-xl shadow-emerald-600/30 text-sm font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {t('hero.find_talents')}
                </div>
                {/* Full image */}
                <div className="relative aspect-square flex items-center justify-center p-4">
                  <Image
                    src={employerSrc}
                    alt="Employers"
                    width={600}
                    height={600}
                    className="w-full h-full object-contain transform group-hover:scale-[1.03] transition-all duration-500"
                    unoptimized={employerSrc.startsWith('http')}
                  />
                  {/* Start here badge */}
                  <Link href="/signup?type=employer" className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse">
                      <span className="text-white font-black text-xs text-center leading-tight px-1">{t('hero.start_here')}</span>
                    </div>
                  </Link>
                </div>
                {/* Footer row */}
                <div className="px-6 pb-5 pt-2 border-t border-white/40 dark:border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <Pill colour="green">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      {t('hero.for_employers')}
                    </Pill>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">{t('hero.hire_top_talent')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs">{t('hero.employer_description')}</p>
                  </div>
                  <Link href="/signup?type=employer" className="shrink-0">
                    <button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                      {t('hero.start_hiring')} →
                    </button>
                  </Link>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* ── Headline + sub-CTA below images ── */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Eyebrow */}
            <div className="flex justify-center mb-5">
              <Pill colour="blue">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                {t('hero.ecosystem_badge')}
              </Pill>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.06] tracking-tight mb-5">
              <span className="text-gray-900 dark:text-white">{t('mission.title_part1')}</span>
              <br />
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t('mission.title_part2')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('mission.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup?type=candidate">
                <button className="group flex items-center gap-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-9 py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {t('mission.im_candidate')}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </Link>
              <Link href="/signup?type=employer">
                <button className="group flex items-center gap-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-9 py-4 rounded-2xl font-black text-base shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {t('mission.im_employer')}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </Link>
              <Link href="/login" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-4">
                {t('nav.sign_in')} →
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-1 text-gray-400 animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="py-6 bg-gray-950 dark:bg-black">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {STATS.map(s => (
            <div key={s.label} className="px-6 py-4 text-center">
              <div className="text-3xl font-black text-white mb-0.5">{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden bg-white dark:bg-gray-950">
        {/* Subtle BG gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-50/0 via-blue-50/30 to-slate-50/0 dark:from-transparent dark:via-blue-950/10 dark:to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Pill colour="violet">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              {t('homepage.features_pill')}
            </Pill>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-4 mb-4 leading-tight">
              {t('homepage.features_title').split('.')[0]}.{' '}
              <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t('homepage.features_title').split('.').slice(1).join('.').trim()}
              </span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t('homepage.features_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURE_KEYS.map((f, i) => (
              <GlassCard key={i} className="group p-6 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-xl bg-linear-to-br ${f.colour} flex items-center justify-center shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={f.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight">{t(`homepage.feat_${f.tKey}_title`)}</h3>
                      <Pill colour={f.pill}>{t(`homepage.feat_${f.tKey}_tag`)}</Pill>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(`homepage.feat_${f.tKey}_desc`)}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — split candidate / employer
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-950 relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Pill colour="blue">{t('homepage.how_pill')}</Pill>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">
              {t('homepage.how_title')}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">{t('homepage.how_subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Candidate journey */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">{t('homepage.how_c_label')}</div>
                  <div className="font-black text-white text-lg leading-tight">{t('homepage.how_c_journey')}</div>
                </div>
              </div>
              <div className="relative space-y-4 pl-6 border-l-2 border-blue-800/60">
                {HOW_C_NUMS.map((n, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute -left-[29px] top-3 w-5 h-5 rounded-full bg-blue-600 border-2 border-slate-950 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/8 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-black text-blue-400 font-mono">{n}</span>
                        <h4 className="font-black text-white text-sm">{t(`homepage.how_c${i + 1}_title`)}</h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{t(`homepage.how_c${i + 1}_desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/signup?type=candidate">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                    {t('homepage.how_c_cta')} →
                  </button>
                </Link>
              </div>
            </div>

            {/* Employer journey */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t('homepage.how_e_label')}</div>
                  <div className="font-black text-white text-lg leading-tight">{t('homepage.how_e_journey')}</div>
                </div>
              </div>
              <div className="relative space-y-4 pl-6 border-l-2 border-emerald-800/60">
                {HOW_E_NUMS.map((n, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute -left-[29px] top-3 w-5 h-5 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/8 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-black text-emerald-400 font-mono">{n}</span>
                        <h4 className="font-black text-white text-sm">{t(`homepage.how_e${i + 1}_title`)}</h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{t(`homepage.how_e${i + 1}_desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/signup?type=employer">
                  <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                    {t('homepage.how_e_cta')} →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROGRAMMES CTA STRIP
      ══════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">{t('homepage.prog_badge')}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">{t('homepage.prog_title')}</h3>
            <p className="text-blue-100/80 text-sm max-w-xl">
              {t('homepage.prog_desc')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/programmes">
              <button className="bg-white text-indigo-700 hover:bg-blue-50 px-7 py-3.5 rounded-xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                {t('homepage.prog_explore')}
              </button>
            </Link>
            <Link href="/contact">
              <button className="border-2 border-white/30 text-white hover:border-white/60 px-7 py-3.5 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap">
                {t('homepage.prog_sales')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST / WHY JORBEX
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Pill colour="green">{t('homepage.trust_pill')}</Pill>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-4 mb-4">
              {t('homepage.trust_title1')}{' '}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('homepage.trust_title2')}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', colour: 'from-blue-500 to-indigo-600', tKey: 'v' },
              { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', colour: 'from-emerald-500 to-teal-600', tKey: 'a' },
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', colour: 'from-violet-500 to-purple-600', tKey: 's' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', colour: 'from-amber-500 to-orange-600', tKey: 'f' },
              { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', colour: 'from-pink-500 to-rose-600', tKey: 'p' },
              { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', colour: 'from-teal-500 to-cyan-600', tKey: 'sup' },
            ].map((c, i) => (
              <GlassCard key={i} className="p-6 hover:scale-[1.02] transition-all duration-300 group">
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${c.colour} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={c.icon} />
                  </svg>
                </div>
                <h3 className="font-black text-gray-900 dark:text-white mb-2">{t(`homepage.trust_${c.tKey}_title`)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(`homepage.trust_${c.tKey}_desc`)}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-gray-300 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {t('homepage.cta_eyebrow')}
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {t('homepage.cta_title1')}<br />
            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">{t('homepage.cta_title2')}</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            {t('homepage.cta_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?type=candidate">
              <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                {t('homepage.cta_candidate')}
              </button>
            </Link>
            <Link href="/signup?type=employer">
              <button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-4 rounded-2xl font-black text-base shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                {t('homepage.cta_employer')}
              </button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            {t('homepage.cta_have_account')}{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">{t('homepage.cta_sign_in')}</Link>
          </p>
        </div>
      </section>

    </div>
  );
}
