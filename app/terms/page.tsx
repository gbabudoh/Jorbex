'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('terms.last_updated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section1.title')}</h2>
              <p className="leading-relaxed">
                {t('terms.section1.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section2.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('terms.section2.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('terms.section2.item1')}</li>
                <li>{t('terms.section2.item2')}</li>
                <li>{t('terms.section2.item3')}</li>
                <li>{t('terms.section2.item4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section3.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('terms.section3.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('terms.section3.item1')}</li>
                <li>{t('terms.section3.item2')}</li>
                <li>{t('terms.section3.item3')}</li>
                <li>{t('terms.section3.item4')}</li>
                <li>{t('terms.section3.item5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section4.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('terms.section4.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('terms.section4.item1')}</li>
                <li>{t('terms.section4.item2')}</li>
                <li>{t('terms.section4.item3')}</li>
                <li>{t('terms.section4.item4')}</li>
                <li>{t('terms.section4.item5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section5.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('terms.section5.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('terms.section5.item1')}</li>
                <li>{t('terms.section5.item2')}</li>
                <li>{t('terms.section5.item3')}</li>
                <li>{t('terms.section5.item4')}</li>
                <li>{t('terms.section5.item5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section6.title')}</h2>
              <p className="leading-relaxed">
                {t('terms.section6.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section7.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('terms.section7.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('terms.section7.item1')}</li>
                <li>{t('terms.section7.item2')}</li>
                <li>{t('terms.section7.item3')}</li>
                <li>{t('terms.section7.item4')}</li>
                <li>{t('terms.section7.item5')}</li>
                <li>{t('terms.section7.item6')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section8.title')}</h2>
              <p className="leading-relaxed">
                {t('terms.section8.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section9.title')}</h2>
              <p className="leading-relaxed">
                {t('terms.section9.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section10.title')}</h2>
              <p className="leading-relaxed">
                {t('terms.section10.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.section11.title')}</h2>
              <p className="leading-relaxed">
                {t('terms.section11.intro')}
              </p>
              <p className="mt-4 font-semibold">
                {t('terms.section11.email')}: legal@hireme.ng<br />
                {t('terms.section11.address')}: Lagos, Nigeria
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
