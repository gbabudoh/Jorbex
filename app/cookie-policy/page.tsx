import Link from 'next/link';

const EFFECTIVE_DATE = '22 March 2026';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 md:p-12">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              </svg>
              Cookie Policy
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Cookie Policy</h1>
            <p className="text-slate-500 text-sm">Effective date: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. What Are Cookies?</h2>
              <p className="leading-relaxed">
                Cookies are small text files placed on your device (computer, tablet, or mobile) when you visit a website. They allow the website to recognise your device and remember certain information about your visit — such as your preferred language, login session, and settings. Cookies are widely used to make websites work efficiently and to provide information to the website owner.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. How Jorbex Uses Cookies</h2>
              <p className="leading-relaxed mb-4">
                Jorbex uses cookies and similar tracking technologies (such as local storage and session storage) to operate the platform, improve your experience, and comply with our legal obligations. We do not use cookies to sell your data to third parties.
              </p>
              <p className="leading-relaxed">
                We use the following categories of cookies:
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Types of Cookies We Use</h2>

              <div className="space-y-5">
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="font-bold text-slate-900">Strictly Necessary Cookies</h3>
                    <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Always Active</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    These cookies are essential for the platform to function. They manage your login session, keep you authenticated between pages, and remember your security preferences. Without these cookies, services like logging in, submitting applications, and accessing your dashboard cannot be provided.
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-mono">Examples: <code>next-auth.session-token</code>, <code>next-auth.csrf-token</code></p>
                </div>

                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="font-bold text-slate-900">Functional Cookies</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    These cookies remember your preferences and settings to personalise your experience. This includes your chosen language (English, French, Arabic, Portuguese), dark/light mode preference, and dismissed notification banners.
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-mono">Examples: <code>language</code>, <code>cookie_consent</code></p>
                </div>

                <div className="p-5 rounded-xl bg-violet-50 border border-violet-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    <h3 className="font-bold text-slate-900">Analytics Cookies</h3>
                    <span className="ml-auto text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Requires Consent</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    These cookies help us understand how visitors interact with our platform — which pages are visited most, where users drop off, and how features are used. This data is aggregated and anonymised. We currently use this data internally to improve the platform.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <h3 className="font-bold text-slate-900">Third-Party Cookies</h3>
                    <span className="ml-auto text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Requires Consent</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    We may integrate third-party services (such as payment processors like Paystack or Stripe, and video conferencing for interviews). These providers may set their own cookies subject to their own privacy policies. We do not control these third-party cookies.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Cookie Consent</h2>
              <p className="leading-relaxed">
                When you first visit Jorbex, you will see a cookie consent banner. Strictly necessary cookies are active by default and cannot be disabled as they are required for the platform to work. For all other categories of cookies, you may accept or decline via the banner. You can withdraw or change your consent at any time by clearing your browser's local storage or cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. How to Manage Cookies</h2>
              <p className="leading-relaxed mb-4">
                You can control and manage cookies through your browser settings. Note that disabling cookies may affect the functionality of the Jorbex platform. Instructions for common browsers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                <li><strong>Mozilla Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Local Storage</h2>
              <p className="leading-relaxed">
                In addition to cookies, Jorbex uses browser local storage to save your preferences (such as language and cookie consent choice). Local storage data is not transmitted to our servers automatically and persists until you clear your browser data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Data Protection &amp; Legal Basis</h2>
              <p className="leading-relaxed">
                We process cookie-related data in accordance with the <strong>EU General Data Protection Regulation (GDPR)</strong>, Nigeria's <strong>Nigeria Data Protection Act (NDPA) / NDPR</strong>, and South Africa's <strong>Protection of Personal Information Act (POPIA)</strong>. Strictly necessary cookies are processed on the basis of legitimate interest. All other cookies require your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Cookie Policy from time to time. Any significant changes will be notified via an updated banner on the platform. The effective date at the top of this page will reflect when the policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about how we use cookies, please contact our Data Protection Officer:
              </p>
              <div className="mt-3 p-4 bg-slate-50 rounded-xl text-sm space-y-1">
                <p><strong>Email:</strong> privacy@jorbex.ng</p>
                <p><strong>DPO:</strong> dpo@jorbex.ng</p>
                <p><strong>Address:</strong> Jorbex Technologies Ltd, Lagos, Nigeria</p>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-sm">
              <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
              <Link href="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
              <Link href="/data-rights" className="text-blue-600 hover:underline font-medium">Your Data Rights</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
