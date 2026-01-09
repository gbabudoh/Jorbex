'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';
import Image from 'next/image';

export const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const logoHref = session?.user?.userType === 'candidate' 
    ? '/candidate/profile' 
    : session?.user?.userType === 'employer' 
      ? '/employer/search' 
      : '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-950 md:bg-white/80 md:dark:bg-gray-900/80 md:backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={logoHref} className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <Image
              src="/logo.png"
              alt="Jorbex"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
             {session && (
              <Link
                href="/"
                className="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mr-2 border-r border-gray-200 dark:border-gray-700 pr-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t('nav.back_to_home')}</span>
              </Link>
            )}
            <Link
              href="/#how-it-works"
              className="text-gray-700 dark:text-gray-300 hover:text-[#0066FF] transition-colors"
            >
              {t('nav.how_it_works')}
            </Link>
            <LanguageSwitcher />
            {status === 'loading' ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : session ? (
              <>
                {session.user?.userType === 'employer' ? (
                  <>
                    <Link
                      href="/employer/search"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/employer/search' ? 'text-[#0066FF]' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      href="/employer/search"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/employer/search' ? 'text-[#0066FF]' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>{t('nav.search')}</span>
                    </Link>
                    <Link
                      href="/employer/tests"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/employer/tests' ? 'text-[#0066FF]' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{t('nav.tests')}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/candidate/profile"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/candidate/profile' ? 'text-[#0066FF] scale-105' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      href="/candidate/messages"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/candidate/messages' ? 'text-[#0066FF] scale-105' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{t('nav.messages')}</span>
                    </Link>
                    <Link
                      href="/candidate/interviews"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/candidate/interviews' ? 'text-[#0066FF] scale-105' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{t('nav.interviews')}</span>
                    </Link>
                    <Link
                      href="/candidate/tests"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/candidate/tests' ? 'text-[#0066FF] scale-105' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>{t('nav.tests')}</span>
                    </Link>
                    <Link
                      href="/candidate/profile"
                      className={`flex items-center space-x-1.5 text-sm font-medium transition-all hover:text-[#0066FF] ${pathname === '/candidate/profile' ? 'text-[#0066FF] scale-105' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{t('nav.profile')}</span>
                    </Link>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-red-500 font-medium cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  {t('nav.sign_out')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    {t('nav.sign_in')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm" className="cursor-pointer">
                    {t('nav.get_started')}
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900/60 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        {/* Drawer */}
        <div 
          className={`absolute top-0 right-0 w-[280px] h-full bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              {session && (
                 <Link
                  href="/"
                  className="flex items-center space-x-2 text-lg font-medium text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>{t('nav.back_to_home')}</span>
                </Link>
              )}
              <Link
                href="/#how-it-works"
                className="text-lg font-medium text-gray-900 dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.how_it_works')}
              </Link>
              
              {status === 'loading' ? (
                <div className="space-y-4">
                  <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : session ? (
                <>
                  {session.user?.userType === 'employer' ? (
                    <>
                      <Link
                        href="/employer/search"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/employer/search' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>{t('nav.dashboard')}</span>
                      </Link>
                      <Link
                        href="/employer/search"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/employer/search' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>{t('nav.search')}</span>
                      </Link>
                      <Link
                        href="/employer/tests"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/employer/tests' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t('nav.tests')}</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/candidate/profile"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/candidate/profile' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>{t('nav.dashboard')}</span>
                      </Link>
                      <Link
                        href="/candidate/messages"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/candidate/messages' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{t('nav.messages')}</span>
                      </Link>
                      <Link
                        href="/candidate/interviews"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/candidate/interviews' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{t('nav.interviews')}</span>
                      </Link>
                      <Link
                        href="/candidate/tests"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/candidate/tests' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span>{t('nav.tests')}</span>
                      </Link>
                      <Link
                        href="/candidate/profile"
                        className={`flex items-center space-x-3 text-lg font-semibold transition-all ${pathname === '/candidate/profile' ? 'text-[#0066FF]' : 'text-gray-900 dark:text-white'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{t('nav.profile')}</span>
                      </Link>
                    </>
                  )}
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="ghost"
                      className="justify-start px-0 text-lg font-medium text-red-600 hover:bg-transparent cursor-pointer"
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      {t('nav.sign_out')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg">
                      {t('nav.sign_in')}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" className="w-full text-lg">
                      {t('nav.get_started')}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

