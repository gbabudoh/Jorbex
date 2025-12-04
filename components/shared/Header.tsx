'use client';

'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

export const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0066FF] to-[#00D9A5] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-xl font-bold gradient-text">Jorbex</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
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
                <Link
                  href={session.user?.userType === 'candidate' ? '/candidate/profile' : '/employer/search'}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0066FF] transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  {t('nav.sign_out')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.sign_in')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    {t('nav.get_started')}
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {status === 'loading' ? (
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : session ? (
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                {t('nav.sign_out')}
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  {t('nav.sign_in')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

