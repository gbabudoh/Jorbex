'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function EmploymentLawPage() {
  const { t, locale } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('employment_law.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('employment_law.subtitle')}
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('employment_law.overview.title')}</h2>
              <p className="leading-relaxed">
                {t('employment_law.overview.content')}
              </p>
            </section>

            {locale !== 'en' && (
              <section className="bg-yellow-50 dark:bg-yellow-950/30 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-8">
                <p className="leading-relaxed text-gray-800 dark:text-gray-200">
                  <strong>📋 {t('employment_law.note')}</strong>
                </p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nigeria Employment Law</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">Key Legislation:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Labour Act (Cap L1 LFN 2004)</li>
                <li>Employees&apos; Compensation Act 2010</li>
                <li>National Minimum Wage Act 2019</li>
                <li>Pension Reform Act 2014</li>
                <li>National Health Insurance Scheme Act</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Employment Contracts:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Must be in writing for clarity and legal protection</li>
                <li>Should specify job title, duties, salary, and benefits</li>
                <li>Include probation period (typically 3-6 months)</li>
                <li>Define notice periods for termination</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Working Hours:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maximum 8 hours per day, 40 hours per week</li>
                <li>Overtime must be compensated at higher rates</li>
                <li>Minimum 1 hour break for 8-hour workday</li>
                <li>At least 1 rest day per week</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Leave Entitlements:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Annual leave: Minimum 6 working days after 12 months</li>
                <li>Sick leave: As per company policy or collective agreement</li>
                <li>Maternity leave: 12 weeks (6 weeks before, 6 weeks after delivery)</li>
                <li>Public holidays: As declared by government</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Minimum Wage:</h3>
              <p className="leading-relaxed ml-4">
                Current national minimum wage: ₦30,000 per month (as of 2019, subject to updates)
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">South Africa Employment Law</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">Key Legislation:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Labour Relations Act 66 of 1995</li>
                <li>Basic Conditions of Employment Act 75 of 1997</li>
                <li>Employment Equity Act 55 of 1998</li>
                <li>Skills Development Act 97 of 1998</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Key Provisions:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maximum 45 hours per week for most employees</li>
                <li>21 consecutive days annual leave per year</li>
                <li>4 months maternity leave (unpaid, but can claim UIF)</li>
                <li>Strong protection against unfair dismissal</li>
                <li>Emphasis on employment equity and transformation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Kenya Employment Law</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">Key Legislation:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Employment Act 2007</li>
                <li>Labour Relations Act 2007</li>
                <li>Work Injury Benefits Act 2007</li>
                <li>Occupational Safety and Health Act 2007</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Key Provisions:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maximum 52 hours per week</li>
                <li>21 days annual leave after 12 months</li>
                <li>3 months maternity leave</li>
                <li>Minimum wage varies by sector and location</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ghana Employment Law</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">Key Legislation:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Labour Act 2003 (Act 651)</li>
                <li>Workmen&apos;s Compensation Law 1987</li>
                <li>National Pensions Act 2008</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Key Provisions:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maximum 8 hours per day, 40 hours per week</li>
                <li>15 working days annual leave</li>
                <li>14 weeks maternity leave (paid)</li>
                <li>Daily minimum wage: GH₵13.53 (subject to updates)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Common Employment Rights Across Africa</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Non-Discrimination:</strong> Protection against discrimination based on race, gender, religion, disability</li>
                <li><strong>Fair Wages:</strong> Right to receive agreed compensation on time</li>
                <li><strong>Safe Working Conditions:</strong> Employer duty to provide safe workplace</li>
                <li><strong>Freedom of Association:</strong> Right to join trade unions</li>
                <li><strong>Protection from Unfair Dismissal:</strong> Due process required for termination</li>
                <li><strong>Social Security:</strong> Pension and health insurance contributions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Employer Obligations</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Register with relevant labor authorities</li>
                <li>Maintain proper employment records</li>
                <li>Remit taxes and social security contributions</li>
                <li>Provide written contracts and payslips</li>
                <li>Comply with health and safety regulations</li>
                <li>Respect employee rights and dignity</li>
                <li>Follow due process for disciplinary actions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Employee Obligations</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Perform duties diligently and professionally</li>
                <li>Follow lawful instructions from employer</li>
                <li>Maintain confidentiality of business information</li>
                <li>Comply with workplace policies and procedures</li>
                <li>Give proper notice before resignation</li>
                <li>Act in good faith and loyalty to employer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dispute Resolution</h2>
              <p className="leading-relaxed mb-4">
                Most African countries have established mechanisms for resolving employment disputes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Internal grievance procedures</li>
                <li>Mediation and conciliation services</li>
                <li>Labour courts or industrial tribunals</li>
                <li>Trade union representation</li>
                <li>Ministry of Labour intervention</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices for Employers</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Stay updated on changes in employment legislation</li>
                <li>Maintain clear, written employment policies</li>
                <li>Provide regular training on workplace rights</li>
                <li>Document all employment decisions and actions</li>
                <li>Seek legal advice for complex employment matters</li>
                <li>Foster a culture of respect and fairness</li>
                <li>Implement transparent performance management systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resources</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>International Labour Organization (ILO) - African Regional Office</li>
                <li>National Labour Ministries and Departments</li>
                <li>Trade Union Congresses</li>
                <li>Employers&apos; Associations</li>
                <li>Legal Aid Organizations</li>
              </ul>
            </section>

            <section className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('employment_law.disclaimer.title')}</h2>
              <p className="leading-relaxed">
                {t('employment_law.disclaimer.content')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('employment_law.assistance.title')}</h2>
              <p className="leading-relaxed">
                {t('employment_law.assistance.intro')}
              </p>
              <p className="mt-4 font-semibold">
                {t('employment_law.assistance.email')}: legal@jorbex.com<br />
                {t('employment_law.assistance.note')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
