'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type Audience = 'candidate' | 'employer';

function DownloadSection() {
  const [loading, setLoading] = useState<Audience | null>(null);

  async function handleDownload(audience: Audience) {
    setLoading(audience);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { CandidatePDF, EmployerPDF } = await import('@/components/pdf/EmploymentLawPDF');

      const DocComponent = audience === 'candidate' ? CandidatePDF : EmployerPDF;
      const blob = await pdf(<DocComponent />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = audience === 'candidate'
        ? 'Jorbex-African-Employment-Law-Guide-Candidates-2024.pdf'
        : 'Jorbex-African-Employment-Law-Guide-Employers-2024.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#0066FF] to-[#003D99] rounded-2xl p-8 mb-10 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-[#00D9A5] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Download the Full Guide as PDF</h2>
      </div>
      <p className="text-blue-200 text-sm mb-6 ml-11">
        Branded, print-ready guide covering Nigeria, South Africa, Kenya, Ghana, Ethiopia &amp; Tanzania.
        Choose the version tailored to your role.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Candidate */}
        <div className="bg-white/10 rounded-xl p-5 border border-white/20 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#00D9A5] text-lg">👤</span>
            <span className="font-semibold text-sm">Candidates Edition</span>
          </div>
          <p className="text-blue-200 text-xs leading-relaxed">
            Know your rights — covers employee entitlements, leave, minimum wages, tips for job seekers,
            and how to resolve disputes.
          </p>
          <button
            onClick={() => handleDownload('candidate')}
            disabled={loading !== null}
            className="mt-auto flex items-center justify-center gap-2 bg-white text-[#0066FF] font-semibold text-sm py-2.5 px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading === 'candidate' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating PDF…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Candidate Guide
              </>
            )}
          </button>
        </div>

        {/* Employer */}
        <div className="bg-white/10 rounded-xl p-5 border border-white/20 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#00D9A5] text-lg">🏢</span>
            <span className="font-semibold text-sm">Employers Edition</span>
          </div>
          <p className="text-blue-200 text-xs leading-relaxed">
            Stay compliant — covers employer obligations, registration requirements, best practices,
            payroll duties, and dispute resolution.
          </p>
          <button
            onClick={() => handleDownload('employer')}
            disabled={loading !== null}
            className="mt-auto flex items-center justify-center gap-2 bg-[#00D9A5] text-gray-900 font-semibold text-sm py-2.5 px-4 rounded-lg hover:bg-[#00c49a] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading === 'employer' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating PDF…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Employer Guide
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-blue-300 text-xs mt-4 text-center">
        PDF generated client-side — nothing is uploaded to our servers.
      </p>
    </div>
  );
}

export default function EmploymentLawPage() {
  const { t, locale } = useLanguage();
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('employment_law.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('employment_law.subtitle')}
          </p>

          {/* PDF Download Section */}
          <DownloadSection />

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
                Current national minimum wage: ₦70,000 per month (as of 2024)
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
                <li>Daily minimum wage: GH₵18.15 (as of 2024)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ethiopia Employment Law</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">Key Legislation:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Labour Proclamation No. 1156/2019</li>
                <li>Public Servants Proclamation No. 1064/2017</li>
                <li>Employees Social Security Law</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Key Provisions:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maximum 8 hours per day, 48 hours per week</li>
                <li>16 working days annual leave (increasing with tenure)</li>
                <li>90 days maternity leave (30 before, 60 after birth)</li>
                <li>No statutory national minimum wage; sector-specific</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tanzania Employment Law</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">Key Legislation:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Employment and Labour Relations Act 2004</li>
                <li>Labour Institutions Act 2004</li>
                <li>Occupational Health and Safety Authority Act 2003</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Key Provisions:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maximum 45 hours per week</li>
                <li>28 consecutive days annual leave after 12 months</li>
                <li>84 days maternity leave</li>
                <li>TZS 400,000/month minimum wage (most sectors, 2023)</li>
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
