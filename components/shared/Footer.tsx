'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import Image from 'next/image';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Jorbex"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('footer.for_candidates')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/signup?type=candidate" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.sign_up')}
                </Link>
              </li>
              <li>
                <Link href="/signup?type=candidate" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.take_test')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('footer.for_employers')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/signup?type=employer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.sign_up')}
                </Link>
              </li>
              <li>
                <Link href="/employer/subscription" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.subscription')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('footer.legal_resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/employment-law" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.employment_law')}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#0066FF] transition-colors">
                  {t('footer.resources')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Jorbex. {t('footer.rights_reserved')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('footer.empowering')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

