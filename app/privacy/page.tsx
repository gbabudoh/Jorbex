'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function PrivacyPage() {
  const { t, translations } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('privacy.last_updated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section1.title')}</h2>
              <p className="leading-relaxed">
                {t('privacy.section1.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section2.title')}</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">{t('privacy.section2.candidates_title')}</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {(translations?.privacy?.section2?.candidates || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">{t('privacy.section2.employers_title')}</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {(translations?.privacy?.section2?.employers || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">{t('privacy.section2.auto_title')}</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {(translations?.privacy?.section2?.auto || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section3.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('privacy.section3.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {(translations?.privacy?.section3?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section4.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('privacy.section4.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>{t('privacy.section4.employers')}</strong> {t('privacy.section4.employers_desc')}</li>
                <li><strong>{t('privacy.section4.providers')}</strong> {t('privacy.section4.providers_desc')}</li>
                <li><strong>{t('privacy.section4.legal')}</strong> {t('privacy.section4.legal_desc')}</li>
                <li><strong>{t('privacy.section4.business')}</strong> {t('privacy.section4.business_desc')}</li>
              </ul>
              <p className="leading-relaxed mt-4">
                {t('privacy.section4.no_sell')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section5.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('privacy.section5.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {(translations?.privacy?.section5?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section6.title')}</h2>
              <p className="leading-relaxed mb-4">
                {t('privacy.section6.intro')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {(translations?.privacy?.section6?.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section7.title')}</h2>
              <p className="leading-relaxed">
                {t('privacy.section7.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section8.title')}</h2>
              <p className="leading-relaxed">
                {t('privacy.section8.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section9.title')}</h2>
              <p className="leading-relaxed">
                {t('privacy.section9.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section10.title')}</h2>
              <p className="leading-relaxed">
                {t('privacy.section10.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section11.title')}</h2>
              <p className="leading-relaxed">
                {t('privacy.section11.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.section12.title')}</h2>
              <p className="leading-relaxed">
                {t('privacy.section12.intro')}
              </p>
              <p className="mt-4 font-semibold">
                {t('privacy.section12.email')}: privacy@hireme.ng<br />
                {t('privacy.section12.dpo')}: dpo@hireme.ng<br />
                {t('privacy.section12.address')}: Lagos, Nigeria
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
