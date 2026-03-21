'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

/* ─────────────────────────────────────────────
   Reusable micro-components
───────────────────────────────────────────── */
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/30 ${className}`}>
    {children}
  </div>
);

const Pill = ({ children, colour = 'blue' }: { children: React.ReactNode; colour?: string }) => {
  const map: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300',
    violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300',
    amber:  'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300',
    green:  'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
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
const PROGRAMME_TYPES = [
  {
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    type: 'GOVERNMENT',
    tKey: 'gov',
    gradient: 'from-blue-600 to-indigo-700',
    glow: 'shadow-blue-600/30',
    orbColour: 'bg-blue-400/15 dark:bg-blue-500/8',
    pill: 'blue' as const,
    pillDot: 'bg-blue-500',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    type: 'UNIVERSITY',
    tKey: 'uni',
    gradient: 'from-violet-600 to-purple-700',
    glow: 'shadow-violet-600/30',
    orbColour: 'bg-violet-400/15 dark:bg-violet-500/8',
    pill: 'violet' as const,
    pillDot: 'bg-violet-500',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    type: 'CORPORATE',
    tKey: 'corp',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
    orbColour: 'bg-amber-400/15 dark:bg-amber-500/8',
    pill: 'amber' as const,
    pillDot: 'bg-amber-500',
  },
];

const FEAT_NUMS = [1, 2, 3, 4, 5, 6] as const;
const HOW_STEPS = ['01', '02', '03', '04'] as const;

const HOW_ICONS = [
  'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
];

/* ─────────────────────────────────────────────
   Main
───────────────────────────────────────────── */
export default function ProgrammesLandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const isEmployer = session?.user?.userType === 'employer';
  const handleCTA = () => router.push(isEmployer ? '/programmes/dashboard' : '/programmes/register');

  const STATS = [
    { value: '54', label: t('programmes.stat1_label') },
    { value: '4',  label: t('programmes.stat2_label') },
    { value: '13', label: t('programmes.stat3_label') },
    { value: '∞',  label: t('programmes.stat4_label') },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50/60 to-indigo-100/50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/40" />
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-blue-400/12 dark:bg-blue-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-violet-400/10 dark:bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

        <div className="relative max-w-7xl mx-auto">

          {/* ── Illustrated preview cards — TOP ── */}
          <div className="grid md:grid-cols-3 gap-5 mb-14">

            {/* Government card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-br from-blue-500/30 to-indigo-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <GlassCard className="relative overflow-hidden hover:scale-[1.015] hover:-translate-y-1 transition-all duration-500">
                {/* Illustrated area */}
                <div className="relative h-52 bg-linear-to-br from-blue-600 to-indigo-700 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                  {/* Parliament building SVG illustration */}
                  <svg viewBox="0 0 240 160" className="w-56 h-auto drop-shadow-2xl" fill="none">
                    {/* Sky gradient */}
                    <rect width="240" height="160" fill="url(#govSky)" rx="12" />
                    <defs>
                      <linearGradient id="govSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3730a3" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {/* Ground */}
                    <rect x="0" y="130" width="240" height="30" fill="white" fillOpacity="0.08" />
                    {/* Main building body */}
                    <rect x="60" y="70" width="120" height="65" fill="white" fillOpacity="0.18" rx="2" />
                    {/* Columns */}
                    {[75,95,115,135,155,165].map((x,i) => (
                      <rect key={i} x={x} y="72" width="8" height="63" fill="white" fillOpacity="0.25" rx="1" />
                    ))}
                    {/* Pediment / triangle top */}
                    <polygon points="60,70 180,70 120,35" fill="white" fillOpacity="0.22" />
                    {/* Dome */}
                    <ellipse cx="120" cy="35" rx="18" ry="14" fill="white" fillOpacity="0.30" />
                    <ellipse cx="120" cy="28" rx="8" ry="6" fill="white" fillOpacity="0.40" />
                    {/* Flag pole */}
                    <line x1="120" y1="14" x2="120" y2="28" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
                    <rect x="120" y="14" width="14" height="8" fill="#fbbf24" fillOpacity="0.8" rx="1" />
                    {/* Steps */}
                    <rect x="50" y="130" width="140" height="5" fill="white" fillOpacity="0.15" />
                    <rect x="55" y="125" width="130" height="5" fill="white" fillOpacity="0.12" />
                    {/* Door */}
                    <rect x="108" y="100" width="24" height="35" fill="white" fillOpacity="0.35" rx="12" />
                    {/* Windows */}
                    {[72,100,140,168].map((x,i) => (
                      <rect key={i} x={x} y="82" width="12" height="16" fill="white" fillOpacity="0.3" rx="1" />
                    ))}
                    {/* People silhouettes */}
                    {[40,80,155,195].map((x,i) => (
                      <g key={i} opacity="0.5">
                        <circle cx={x} cy="122" r="4" fill="white" />
                        <rect x={x-3} y="126" width="6" height="10" fill="white" rx="1" />
                      </g>
                    ))}
                    {/* Decorative stars */}
                    {[[20,20],[210,30],[15,100],[225,90]].map(([cx,cy],i) => (
                      <circle key={i} cx={cx} cy={cy} r="1.5" fill="white" fillOpacity="0.4" />
                    ))}
                  </svg>
                  {/* Badge overlay */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold">GOVERNMENT</span>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-white/40 dark:border-white/10">
                  <p className="font-black text-gray-900 dark:text-white text-sm">{t('programmes.gov_title')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('programmes.gov_subtitle')}</p>
                </div>
              </GlassCard>
            </div>

            {/* University card */}
            <div className="group relative md:mt-6">
              <div className="absolute -inset-1 bg-linear-to-br from-violet-500/30 to-purple-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <GlassCard className="relative overflow-hidden hover:scale-[1.015] hover:-translate-y-1 transition-all duration-500">
                <div className="relative h-52 bg-linear-to-br from-violet-600 to-purple-700 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                  {/* Campus / graduation SVG illustration */}
                  <svg viewBox="0 0 240 160" className="w-56 h-auto drop-shadow-2xl" fill="none">
                    <rect width="240" height="160" fill="url(#uniSky)" rx="12" />
                    <defs>
                      <linearGradient id="uniSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5b21b6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {/* Ground */}
                    <rect x="0" y="130" width="240" height="30" fill="white" fillOpacity="0.08" />
                    {/* Main building */}
                    <rect x="70" y="55" width="100" height="75" fill="white" fillOpacity="0.18" rx="3" />
                    {/* Clock tower */}
                    <rect x="105" y="20" width="30" height="35" fill="white" fillOpacity="0.25" rx="2" />
                    <rect x="110" y="15" width="20" height="8" fill="white" fillOpacity="0.30" rx="1" />
                    {/* Clock face */}
                    <circle cx="120" cy="37" r="8" fill="white" fillOpacity="0.20" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
                    <line x1="120" y1="37" x2="120" y2="32" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
                    <line x1="120" y1="37" x2="124" y2="37" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
                    {/* Windows */}
                    {[78,100,122,144].map((x,i) => (
                      <rect key={i} x={x} y="65" width="14" height="18" fill="white" fillOpacity={i%2===0?0.35:0.20} rx="1" />
                    ))}
                    {[78,100,122,144].map((x,i) => (
                      <rect key={i} x={x} y="90" width="14" height="18" fill="white" fillOpacity={i%2===1?0.35:0.20} rx="1" />
                    ))}
                    {/* Door */}
                    <rect x="110" y="108" width="20" height="22" fill="white" fillOpacity="0.4" rx="10" />
                    {/* Steps */}
                    <rect x="60" y="128" width="120" height="4" fill="white" fillOpacity="0.15" />
                    <rect x="65" y="124" width="110" height="4" fill="white" fillOpacity="0.12" />
                    {/* Graduation caps floating */}
                    {[[30,40],[200,50],[15,80],[215,75]].map(([cx,cy],i) => (
                      <g key={i} opacity="0.55">
                        <rect x={cx-8} y={cy-1} width="16" height="3" fill="white" rx="1" />
                        <polygon points={`${cx-6},${cy+2} ${cx+6},${cy+2} ${cx},${cy+9}`} fill="white" />
                      </g>
                    ))}
                    {/* Trees */}
                    {[[30,110],[200,108]].map(([cx,cy],i) => (
                      <g key={i}>
                        <ellipse cx={cx} cy={cy} rx="12" ry="15" fill="white" fillOpacity="0.15" />
                        <rect x={cx-2} y={cy+10} width="4" height="12" fill="white" fillOpacity="0.20" />
                      </g>
                    ))}
                    {/* Students */}
                    {[50,170].map((x,i) => (
                      <g key={i} opacity="0.5">
                        <circle cx={x} cy="120" r="4" fill="white" />
                        <rect x={x-3} y="124" width="6" height="10" fill="white" rx="1" />
                      </g>
                    ))}
                  </svg>
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold">UNIVERSITY</span>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-white/40 dark:border-white/10">
                  <p className="font-black text-gray-900 dark:text-white text-sm">{t('programmes.uni_title')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('programmes.uni_subtitle')}</p>
                </div>
              </GlassCard>
            </div>

            {/* Corporate card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-br from-amber-500/30 to-orange-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <GlassCard className="relative overflow-hidden hover:scale-[1.015] hover:-translate-y-1 transition-all duration-500">
                <div className="relative h-52 bg-linear-to-br from-amber-500 to-orange-600 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                  {/* Corporate office / skyline SVG illustration */}
                  <svg viewBox="0 0 240 160" className="w-56 h-auto drop-shadow-2xl" fill="none">
                    <rect width="240" height="160" fill="url(#corpSky)" rx="12" />
                    <defs>
                      <linearGradient id="corpSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#92400e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {/* Ground */}
                    <rect x="0" y="130" width="240" height="30" fill="white" fillOpacity="0.08" />
                    {/* Tall tower */}
                    <rect x="95" y="18" width="50" height="115" fill="white" fillOpacity="0.20" rx="3" />
                    {/* Tower windows grid */}
                    {[0,1,2,3,4,5,6,7].map(row =>
                      [0,1,2].map(col => (
                        <rect key={`${row}-${col}`} x={100+col*15} y={24+row*13} width="10" height="8"
                          fill="white" fillOpacity={Math.random()>0.4?0.40:0.15} rx="1" />
                      ))
                    )}
                    {/* Antenna */}
                    <line x1="120" y1="8" x2="120" y2="18" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
                    <circle cx="120" cy="8" r="2" fill="white" fillOpacity="0.8" />
                    {/* Side building left */}
                    <rect x="35" y="55" width="55" height="78" fill="white" fillOpacity="0.14" rx="2" />
                    {[0,1,2].map(row =>
                      [0,1,2].map(col => (
                        <rect key={`l${row}-${col}`} x={40+col*16} y={62+row*18} width="11" height="10"
                          fill="white" fillOpacity={0.20+col*0.05} rx="1" />
                      ))
                    )}
                    {/* Side building right */}
                    <rect x="150" y="65" width="55" height="68" fill="white" fillOpacity="0.14" rx="2" />
                    {[0,1,2].map(row =>
                      [0,1].map(col => (
                        <rect key={`r${row}-${col}`} x={156+col*22} y={72+row*18} width="14" height="10"
                          fill="white" fillOpacity={0.20+row*0.05} rx="1" />
                      ))
                    )}
                    {/* Chart bars on foreground */}
                    <g opacity="0.55">
                      <rect x="20" y="105" width="12" height="20" fill="white" rx="2" />
                      <rect x="36" y="95" width="12" height="30" fill="white" rx="2" />
                      <rect x="52" y="88" width="12" height="37" fill="white" rx="2" />
                    </g>
                    {/* People */}
                    {[155,175,195].map((x,i) => (
                      <g key={i} opacity="0.5">
                        <circle cx={x} cy="120" r="4" fill="white" />
                        <rect x={x-3} y="124" width="6" height="10" fill="white" rx="1" />
                      </g>
                    ))}
                  </svg>
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 bg-amber-200 rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold">CORPORATE</span>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-white/40 dark:border-white/10">
                  <p className="font-black text-gray-900 dark:text-white text-sm">{t('programmes.corp_title')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('programmes.corp_subtitle')}</p>
                </div>
              </GlassCard>
            </div>

          </div>

          {/* ── Headline + CTAs below images ── */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-5">
              <Pill colour="blue">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                🌍 {t('programmes.hero_badge')}
              </Pill>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              <span className="text-gray-900 dark:text-white">{t('programmes.hero_title1')}</span>
              <br />
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t('programmes.hero_title2')}
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('programmes.hero_desc')}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <button
                onClick={handleCTA}
                className="group flex items-center gap-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-9 py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {isEmployer ? t('programmes.hero_cta_dashboard') : t('programmes.hero_cta_start')}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
              <a
                href="#programme-types"
                className="flex items-center gap-2 border-2 border-slate-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-2xl font-bold text-base hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                {t('programmes.hero_explore')}
              </a>
            </div>

            {/* Stats row — glassmorphic tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {STATS.map(s => (
                <GlassCard key={s.label} className="p-5 text-center hover:scale-[1.03] transition-all duration-300">
                  <div className="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">{s.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">{s.label}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-10 flex justify-center">
          <div className="flex flex-col items-center gap-1 text-gray-400 animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROGRAMME TYPE CARDS
      ══════════════════════════════════════════ */}
      <section id="programme-types" className="py-24 px-4 bg-slate-50 dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-white/0 via-blue-50/20 to-white/0 dark:from-transparent dark:via-blue-950/10 dark:to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Pill colour="violet">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              {t('programmes.types_title')}
            </Pill>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-4 mb-4 leading-tight">
              {t('programmes.types_title').split(' ').slice(0, 2).join(' ')}{' '}
              <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t('programmes.types_title').split(' ').slice(2).join(' ')}
              </span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t('programmes.types_desc')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {PROGRAMME_TYPES.map((pt) => (
              <div key={pt.type} className="group relative flex flex-col">
                {/* Glow ring on hover */}
                <div className={`absolute -inset-1 bg-linear-to-br ${pt.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500 pointer-events-none`} />

                <GlassCard className="relative flex flex-col flex-1 overflow-hidden hover:scale-[1.015] hover:-translate-y-1 transition-all duration-300">
                  {/* Gradient header */}
                  <div className={`relative bg-linear-to-br ${pt.gradient} p-7 overflow-hidden`}>
                    {/* Subtle grid texture */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    {/* Orb */}
                    <div className={`absolute -top-6 -right-6 w-32 h-32 ${pt.orbColour} rounded-full blur-2xl`} />

                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 shadow-lg ${pt.glow} group-hover:scale-110 transition-transform duration-300`}>
                        {pt.icon}
                      </div>
                      <Pill colour={pt.pill}>
                        <span className={`w-1.5 h-1.5 ${pt.pillDot} rounded-full`} />
                        {pt.type}
                      </Pill>
                      <h3 className="text-xl font-black text-white mt-3 mb-1 leading-tight">{t(`programmes.${pt.tKey}_title`)}</h3>
                      <p className="text-sm text-white/70">{t(`programmes.${pt.tKey}_subtitle`)}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-7 flex flex-col flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      {t(`programmes.${pt.tKey}_desc`)}
                    </p>

                    {/* Feature list */}
                    <ul className="space-y-2.5 mb-7 flex-1">
                      {FEAT_NUMS.map(n => (
                        <li key={n} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {t(`programmes.${pt.tKey}_f${n}`)}
                        </li>
                      ))}
                    </ul>

                    {/* Pricing badge */}
                    <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 mb-5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span className="font-black text-gray-900 dark:text-white text-sm">{t(`programmes.${pt.tKey}_pricing`)}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">{t(`programmes.${pt.tKey}_pricing_note`)}</div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handleCTA}
                      className={`w-full py-3.5 rounded-xl font-bold text-white bg-linear-to-r ${pt.gradient} hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg ${pt.glow} cursor-pointer text-sm`}
                    >
                      {t(`programmes.${pt.tKey}_cta`)} →
                    </button>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Pill colour="blue">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {t('programmes.how_title')}
            </Pill>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-4">{t('programmes.how_title')}</h2>
            <p className="text-gray-400 max-w-xl mx-auto">{t('programmes.how_desc')}</p>
          </div>

          {/* Steps — horizontal connector line on md+ */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-blue-800/0 via-blue-700/60 to-blue-800/0 pointer-events-none" />

            <div className="grid md:grid-cols-4 gap-6">
              {HOW_STEPS.map((step, i) => (
                <div key={step} className="relative text-center group">
                  {/* Step number circle */}
                  <div className="relative mx-auto w-20 h-20 mb-5">
                    <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-lg group-hover:bg-blue-500/30 transition-all duration-300" />
                    <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex flex-col items-center justify-center shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white/80 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={HOW_ICONS[i]} />
                      </svg>
                      <span className="text-[10px] font-black text-white/60 font-mono">{step}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/8 transition-colors">
                    <h3 className="font-black text-white text-sm mb-2 leading-tight">{t(`programmes.how_s${i + 1}_title`)}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{t(`programmes.how_s${i + 1}_desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={handleCTA}
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer hover:scale-105"
            >
              {isEmployer ? t('programmes.hero_cta_dashboard') : t('programmes.hero_cta_start')}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-white/80 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            {t('programmes.hero_badge')}
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            {t('programmes.cta_title')}
          </h2>
          <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
            {t('programmes.cta_desc')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleCTA}
              className="group flex items-center gap-3 bg-white text-indigo-700 hover:bg-blue-50 px-9 py-4 rounded-2xl font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              {isEmployer ? t('programmes.cta_dashboard') : t('programmes.cta_start')}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <Link
              href="/contact"
              className="flex items-center gap-2 border-2 border-white/30 text-white hover:border-white hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-base transition-all"
            >
              {t('programmes.cta_sales')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
