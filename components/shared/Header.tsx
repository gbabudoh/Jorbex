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

const NavLink = ({ href, pathname, children, icon }: { href: string; pathname: string; children: React.ReactNode; icon?: React.ReactNode }) => {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`relative flex items-center space-x-1.5 px-3 py-2 text-sm font-bold transition-all duration-300 group
        ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
    >
      {icon}
      <span>{children}</span>
      {isActive && (
        <motion.div
          layoutId="nav-underglow"
          className="absolute -bottom-[21px] left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
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

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoHref = session?.user?.userType === 'candidate' 
    ? '/candidate/profile' 
    : session?.user?.userType === 'employer' 
      ? '/employer/search' 
      : '/';

  return (
    <header 
      className={`sticky top-0 z-[100] w-full transition-all duration-500 border-b
        ${scrolled 
          ? 'py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm' 
          : 'py-4 bg-white dark:bg-slate-900 border-b border-transparent'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo Section */}
          <Link href={logoHref} className="flex items-center space-x-2 group" onClick={() => setIsMenuOpen(false)}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/logo.png"
                alt="Jorbex"
                width={110}
                height={38}
                className="h-9 w-auto relative transform group-hover:scale-105 transition-transform duration-300"
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
                <>
                  <NavLink href="/employer/search" pathname={pathname} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}>
                    {t('nav.dashboard')}
                  </NavLink>
                  <NavLink href="/employer/tests" pathname={pathname} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                    {t('nav.tests')}
                  </NavLink>
                  <NavLink href="/employer/results" pathname={pathname} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2 2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}>
                    Results
                  </NavLink>
                </>
              ) : session?.user?.userType === 'candidate' && (
                <>
                  <NavLink href="/candidate/profile" pathname={pathname} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
                    {t('nav.profile')}
                  </NavLink>
                  <NavLink href="/candidate/messages" pathname={pathname} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}>
                    {t('nav.messages')}
                  </NavLink>
                  <NavLink href="/candidate/tests" pathname={pathname} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                    Tests
                  </NavLink>
                </>
              )}
            </div>

            <div className="flex items-center ml-4 space-x-3">
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
                    <Button variant="ghost" size="sm" className="h-11 px-6 font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                      {t('nav.sign_in')}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm" className="h-11 px-8 font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      {t('nav.get_started')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all overflow-hidden"
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
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[300px] h-full bg-white dark:bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:shadow-none border-l border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-col h-full p-8">
                <div className="flex justify-between items-center mb-10">
                  <Image src="/logo.png" alt="Jorbex" width={100} height={35} className="h-8 w-auto" />
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <nav className="flex flex-col space-y-6">

                  {[
                    ...(!session ? [{ href: '/#how-it-works', label: t('nav.how_it_works') }] : []),
                    ...(session?.user?.userType === 'employer' ? [
                      { href: '/employer/search', label: t('nav.dashboard'), icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                      { href: '/employer/tests', label: t('nav.tests'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { href: '/employer/results', label: 'Results', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
                    ] : session?.user?.userType === 'candidate' ? [
                      { href: '/candidate/profile', label: t('nav.profile'), icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                      { href: '/candidate/messages', label: t('nav.messages'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                      { href: '/candidate/tests', label: 'Tests', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
                    ] : [])
                  ].map((item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-4 text-xl font-black transition-all ${pathname === item.href ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon && (
                          <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                          </svg>
                        )}
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {session ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="pt-10 mt-10 border-t border-slate-100 dark:border-slate-800"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-between h-14 px-6 rounded-2xl bg-rose-500/5 text-rose-500 border-2 border-rose-500/10 font-black cursor-pointer"
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                      >
                        {t('nav.sign_out')}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                        </svg>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="flex flex-col space-y-4 pt-10 mt-10 border-t border-slate-100 dark:border-slate-800"
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

