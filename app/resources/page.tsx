'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/lib/LanguageContext';

export default function ResourcesPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('resources.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('resources.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* For Candidates */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('resources.job_seekers.title')}</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.job_seekers.item1')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.job_seekers.item2')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.job_seekers.item3')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.job_seekers.item4')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* For Employers */}
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 hover:shadow-xl transition-all">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('resources.employers.title')}</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.employers.item1')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.employers.item2')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.employers.item3')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-600 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('resources.employers.item4')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Resource Categories */}
        <div className="space-y-8">
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📚 Career Development</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills Training</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Free online courses (Coursera, edX, Udemy)</li>
                    <li>• Technical skills bootcamps</li>
                    <li>• Soft skills development</li>
                    <li>• Professional certifications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Career Planning</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Career assessment tools</li>
                    <li>• Industry salary guides</li>
                    <li>• Networking strategies</li>
                    <li>• Personal branding tips</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚖️ Legal & Compliance</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Employment Rights</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• <Link href="/employment-law" className="text-blue-600 hover:underline">Employment Law Guide</Link></li>
                    <li>• Workers' rights and protections</li>
                    <li>• Dispute resolution procedures</li>
                    <li>• Trade union information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Employer Compliance</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Tax and payroll obligations</li>
                    <li>• Health and safety requirements</li>
                    <li>• Data protection (NDPR)</li>
                    <li>• Labor registration procedures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🌍 Country-Specific Resources</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Nigeria</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Federal Ministry of Labour</li>
                    <li>• Nigeria Labour Congress (NLC)</li>
                    <li>• PENCOM (Pensions)</li>
                    <li>• NSITF (Insurance)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">South Africa</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Department of Employment</li>
                    <li>• CCMA (Dispute Resolution)</li>
                    <li>• SARS (Tax Authority)</li>
                    <li>• UIF (Unemployment Insurance)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Kenya</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Ministry of Labour</li>
                    <li>• COTU (Trade Union)</li>
                    <li>• NSSF (Social Security)</li>
                    <li>• NHIF (Health Insurance)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">💼 Industry Insights</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>• <strong>Salary Benchmarks:</strong> Compare salaries across industries and experience levels</p>
                <p>• <strong>Job Market Trends:</strong> Stay updated on in-demand skills and emerging sectors</p>
                <p>• <strong>Remote Work Guide:</strong> Best practices for remote and hybrid work arrangements</p>
                <p>• <strong>Startup Employment:</strong> Special considerations for working in startups</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">{t('resources.help.title')}</h2>
              <p className="mb-6">
                {t('resources.help.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  {t('resources.help.contact')}
                </Link>
                <Link href="/#how-it-works" className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                  {t('resources.help.learn_more')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
