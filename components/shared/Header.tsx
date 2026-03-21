'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import { CandidateInbox } from './CandidateInbox';

const NavLink = ({ href, pathname, children, icon }: { href: string; pathname: string; children: React.ReactNode; icon?: React.ReactNode }) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`relative flex items-center space-x-2 px-3.5 py-2 text-[13px] font-bold tracking-tight transition-all duration-300 group rounded-xl
        ${isActive 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-400/10' 
          : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}
    >
      <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </span>
      <span>{children}</span>
      {isActive && (
        <motion.div
          layoutId="nav-glow"
          className="absolute inset-0 z-[-1] rounded-xl bg-blue-500/5 blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </Link>
  );
};

export const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Sync Novu subscriber once per authenticated session
  React.useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetch('/api/v1/novu/subscriber', { method: 'POST' }).catch(() => {});
    }
  }, [status, session?.user?.id]);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMenuOpen]);

  const logoHref = session?.user?.userType === 'candidate' 
    ? '/candidate/profile' 
    : session?.user?.userType === 'employer' 
      ? '/employer/search' 
      : '/';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color,border-color,box-shadow,padding] duration-300
        ${scrolled
          ? [
              /* Mobile: stay pinned flush — no margin, no movement, no rounding */
              'py-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm',
              /* Desktop only: float as pill */
              'md:mt-2 md:mx-4 lg:mx-8 md:rounded-2xl md:border md:border-slate-200/50 md:dark:border-slate-800/50 md:shadow-2xl md:shadow-blue-500/10 md:py-1.5',
            ].join(' ')
          : 'bg-white dark:bg-slate-950/0 border-b border-transparent py-3'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo Section */}
          <Link href={logoHref} className="flex-shrink-0 flex items-center space-x-2 group" onClick={() => setIsMenuOpen(false)}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/logo.png"
                alt="Jorbex"
                width={110}
                height={38}
                className="h-9 w-auto relative transform group-hover:scale-105 transition-transform duration-300"
                style={{ minWidth: '110px' }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            
            <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/30 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 backdrop-blur-md">
              {!session && (
                <NavLink href="/#how-it-works" pathname={pathname}>{t('nav.how_it_works')}</NavLink>
              )}
              
              {session?.user?.userType === 'employer' ? (
                <div className="flex items-center space-x-2 px-4 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('nav.dashboard')}</span>
                </div>
              ) : session?.user?.userType === 'candidate' ? (
                <div className="flex items-center space-x-2 px-4 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('nav.dashboard')}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center ml-4 space-x-3">
              {session && session.user?.userType === 'candidate' ? (
                <CandidateInbox subscriberId={session.user.id} />
              ) : session ? (
                <NotificationDropdown />
              ) : null}
              <LanguageSwitcher />
              
              {status === 'loading' ? (
                <div className="w-24 h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ) : session ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-2xl h-11 px-5 border-2 border-slate-100 dark:border-slate-800 hover:text-rose-500 font-bold cursor-pointer transition-colors"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <span className="mr-2">{t('nav.sign_out')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="h-11 px-5 text-[13px] font-bold cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition-all">
                      {t('nav.sign_in')}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm" className="h-11 px-6 text-[13px] font-black rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border-none">
                      {t('nav.get_started')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2 pr-2">
            {session && session.user?.userType === 'candidate' ? (
              <CandidateInbox subscriberId={session.user.id} />
            ) : session ? (
              <NotificationDropdown />
            ) : null}
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-10 h-10 mr-1 flex items-center justify-center rounded-xl bg-[#0066FF] text-white shadow-md shadow-blue-500/30 active:scale-95 active:shadow-none transition-all cursor-pointer shrink-0"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.svg 
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg 
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <>
            {/* Backdrop — direct AnimatePresence child so exit fires */}
            <motion.div
              key="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 z-110 bg-slate-900/50 backdrop-blur-[2px] lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer — direct AnimatePresence child so exit fires */}
            <motion.div
              key="menu-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.75 }}
              className="fixed top-0 right-0 z-120 w-[82vw] max-w-[320px] h-full bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-100 dark:border-slate-800 lg:hidden"
              style={{ willChange: 'transform' }}
            >
              <div className="flex flex-col h-full overflow-hidden">
              {/* Drawer inner scroll container */}
              <div className="flex flex-col h-full overflow-y-auto overscroll-contain p-6">
                <div className="flex justify-between items-center mb-6">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <Image src="/logo.png" alt="Jorbex" width={100} height={35} className="h-8 w-auto" />
                  </Link>
                  <button 
                    onClick={() => setIsMenuOpen(false)} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <nav className="flex flex-col space-y-6 overflow-y-auto">

                  {[
                    ...(!session ? [{ href: '/#how-it-works', label: t('nav.how_it_works') }] : []),
                    ...(session?.user?.userType === 'employer' ? [
                      { href: '/employer/profile', label: t('employer_profile.title'), icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                      { href: '/employer/search', label: t('nav.dashboard'), icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                      { href: '/employer/jobs', label: t('nav.jobs'), icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                      { href: '/employer/applications', label: t('nav.applied_box'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                      { href: '/employer/interviews', label: t('nav.interviews') || 'Interviews', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                      { href: '/employer/tests', label: t('nav.tests'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { href: '/employer/messages', label: t('nav.messages'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                      { href: '/employer/results', label: t('nav.results'), icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                      { href: '/employer/compliance', label: 'Compliance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                      { href: '/employer/records', label: 'Records', icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' },
                      { href: '/employer/payroll-calculator', label: 'Payroll Calc', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
                    ] : session?.user?.userType === 'candidate' ? [
                      { href: '/candidate/profile', label: t('nav.profile'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                      { href: '/candidate/jobs', label: t('nav.search_jobs'), icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                      { href: '/candidate/applications', label: t('jobs.my_applications'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                      { href: '/candidate/interviews', label: t('nav.interviews') || 'Interviews', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                      { href: '/candidate/messages', label: t('nav.messages'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                      { href: '/candidate/tests', label: t('nav.tests'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { href: '/candidate/payslips', label: 'Payslips', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
                      { href: '/candidate/employment', label: 'Employment', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
                    ] : [])
                  ].map((item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-4 p-3 rounded-2xl transition-all duration-300 group
                          ${pathname === item.href 
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                          ${pathname === item.href 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-blue-600 shadow-sm'}`}
                        >
                          {item.icon && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {session ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="pt-6 mt-auto bg-slate-50/50 dark:bg-slate-900/50 -mx-6 px-6 pb-8"
                    >
                      <button
                        className="w-full flex items-center justify-between h-12 px-5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-100 dark:border-rose-500/20 text-[13px] font-bold cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                      >
                        {t('nav.sign_out')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                        </svg>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="flex flex-col space-y-4 pt-10 mt-10 border-t border-slate-100 dark:border-slate-800 font-bold"
                    >
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full h-14 rounded-2xl text-lg font-bold border-2 border-slate-100 dark:border-slate-800 cursor-pointer">
                          {t('nav.sign_in')}
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="primary" className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-blue-600/20 cursor-pointer">
                          {t('nav.get_started')}
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </nav>
              </div> {/* /inner scroll container */}
              </div> {/* /overflow-hidden wrapper */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
