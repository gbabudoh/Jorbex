'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const candidateItems: NavItem[] = [
  {
    key: 'profile',
    href: '/candidate/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'from-blue-500 to-indigo-600',
    hoverColor: 'shadow-blue-500/20'
  },
  {
    key: 'search_jobs',
    href: '/candidate/jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'shadow-emerald-500/20'
  },
  {
    key: 'jobs.my_applications',
    href: '/candidate/applications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'from-orange-500 to-red-600',
    hoverColor: 'shadow-orange-500/20'
  },
  {
    key: 'interviews',
    href: '/candidate/interviews',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-purple-500 to-violet-600',
    hoverColor: 'shadow-purple-500/20'
  },
  {
    key: 'messages',
    href: '/candidate/messages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    color: 'from-pink-500 to-rose-600',
    hoverColor: 'shadow-pink-500/20'
  },
  {
    key: 'tests',
    href: '/candidate/tests',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-cyan-500 to-blue-600',
    hoverColor: 'shadow-cyan-500/20'
  },
  {
    key: 'payslips',
    href: '/candidate/payslips',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    color: 'from-violet-500 to-purple-600',
    hoverColor: 'shadow-violet-500/20'
  },
  {
    key: 'employment',
    href: '/candidate/employment',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-emerald-500 to-green-600',
    hoverColor: 'shadow-emerald-500/20'
  }
];

const employerItems: NavItem[] = [
  {
    key: 'employer_profile.title',
    href: '/employer/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-blue-600 to-indigo-700',
    hoverColor: 'shadow-blue-600/20'
  },
  {
    key: 'nav.dashboard',
    href: '/employer/search',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'from-emerald-600 to-teal-700',
    hoverColor: 'shadow-emerald-600/20'
  },
  {
    key: 'nav.jobs',
    href: '/employer/jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'shadow-amber-500/20'
  },
  {
    key: 'nav.applied_box',
    href: '/employer/applications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'from-orange-600 to-red-700',
    hoverColor: 'shadow-orange-600/20'
  },
  {
    key: 'nav.interviews',
    href: '/employer/interviews',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-purple-600 to-violet-700',
    hoverColor: 'shadow-purple-600/20'
  },
  {
    key: 'nav.messages',
    href: '/employer/messages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    color: 'from-pink-600 to-rose-700',
    hoverColor: 'shadow-pink-600/20'
  },
  {
    key: 'nav.tests',
    href: '/employer/tests',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-cyan-600 to-blue-700',
    hoverColor: 'shadow-cyan-600/20'
  }
];

export const NavigationCards: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();

  const userType = session?.user?.userType || 'candidate';
  const items = userType === 'employer' ? employerItems : candidateItems;

  return (
    <div className={`grid gap-2 p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/20 shadow-xl
      ${userType === 'employer' 
        ? 'grid-cols-2 md:grid-cols-7'
        : 'grid-cols-2 md:grid-cols-8'}`}>
      {items.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative group"
          >
            <Link href={item.href}>
              <div className={`relative h-full flex items-center gap-3 p-3 lg:p-4 rounded-xl transition-all duration-300 group-hover:shadow-lg ${item.hoverColor}
                ${isActive 
                  ? 'bg-white dark:bg-slate-800 border-2 border-blue-500/50 shadow-md z-10' 
                  : 'bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/50 shadow-sm'}`}>
                
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-linear-to-br ${item.color} rounded-xl transition-opacity duration-300
                  ${isActive ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'}`} />
                
                {/* Icon Container */}
                <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${item.color} flex items-center justify-center text-white shadow-md transform transition-transform duration-300 shrink-0
                  ${isActive ? 'scale-110' : 'group-hover:rotate-3'}`}>
                  {item.icon}
                </div>
                
                <span className={`text-[13px] font-black leading-tight tracking-tight transition-colors duration-300
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'}`}>
                  {item.key.includes('.') ? t(item.key) : t(`nav.${item.key}`)}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-linear-to-r ${item.color}`} />
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
