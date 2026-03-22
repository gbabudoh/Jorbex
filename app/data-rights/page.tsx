'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

type Step = 'idle' | 'confirm' | 'deleting' | 'deleted' | 'error';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function DataRightsPage() {
  const { data: session, status } = useSession();
  const [deleteStep, setDeleteStep] = useState<Step>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const userType = session?.user?.userType as 'candidate' | 'employer' | undefined;
  const exportEndpoint = userType === 'candidate' ? '/api/candidate/account' : '/api/employer/account';
  const deleteEndpoint = userType === 'candidate' ? '/api/candidate/account' : '/api/employer/account';

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await fetch(exportEndpoint);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jorbex-my-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not export your data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') return;
    setDeleteStep('deleting');
    try {
      const res = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE MY ACCOUNT' }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Deletion failed');
      }
      setDeleteStep('deleted');
      // Sign out after a short delay
      setTimeout(() => signOut({ callbackUrl: '/' }), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
      setDeleteStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">

        {/* Header */}
        <div className="mb-10">
          <Link href={userType === 'candidate' ? '/candidate/profile' : userType === 'employer' ? '/employer/profile' : '/'} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to profile
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-full text-violet-700 text-xs font-bold uppercase tracking-wider mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            GDPR · NDPR · POPIA
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Your Data Rights</h1>
          <p className="text-slate-500 leading-relaxed">
            Under the GDPR, Nigeria Data Protection Act (NDPA), and POPIA (South Africa), you have specific rights over your personal data. This page lets you exercise those rights directly.
          </p>
        </div>

        {status === 'unauthenticated' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-8">
            <p className="text-amber-800 font-semibold mb-3">You must be logged in to exercise your data rights.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors">
              Log in
            </Link>
          </div>
        )}

        <div className="space-y-5">

          {/* Right to Access */}
          <Section
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            title="Right to Access — Download Your Data"
          >
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Under <strong>GDPR Article 15</strong>, <strong>NDPA Section 34</strong>, and <strong>POPIA Section 23</strong>, you have the right to obtain a copy of all personal data we hold about you. Your export will include your profile, work history, applications, test results, and verification records — in a portable JSON format.
            </p>
            <p className="text-xs text-slate-400 mb-4">Passwords, payment tokens, and internal IDs are excluded from exports for security reasons.</p>
            {status === 'authenticated' ? (
              <button
                onClick={handleExport}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {downloading ? 'Preparing download…' : 'Download my data (JSON)'}
              </button>
            ) : (
              <p className="text-sm text-slate-400 italic">Log in to download your data.</p>
            )}
          </Section>

          {/* Right to Rectification */}
          <Section
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
            title="Right to Rectification — Correct Your Data"
          >
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Under <strong>GDPR Article 16</strong>, you have the right to correct inaccurate or incomplete personal data. You can update your profile information directly from your dashboard.
            </p>
            {status === 'authenticated' && (
              <Link
                href={userType === 'candidate' ? '/candidate/profile' : '/employer/profile'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Go to my profile
              </Link>
            )}
          </Section>

          {/* Right to Erasure */}
          <Section
            icon={<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
            title="Right to Erasure — Delete Your Account"
          >
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Under <strong>GDPR Article 17</strong> ("right to be forgotten"), <strong>NDPA Section 36</strong>, and <strong>POPIA Section 24</strong>, you can request permanent deletion of your account and all associated personal data. This action is <strong>irreversible</strong> and includes: your profile, applications, work history, test results, messages, and verification records.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
              <strong>Warning:</strong> Deleting your account cannot be undone. All data will be permanently removed from our systems within 30 days, in accordance with our data retention policy.
            </div>

            {status !== 'authenticated' && (
              <p className="text-sm text-slate-400 italic">Log in to delete your account.</p>
            )}

            {status === 'authenticated' && deleteStep === 'idle' && (
              <button
                onClick={() => setDeleteStep('confirm')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-bold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Request account deletion
              </button>
            )}

            {deleteStep === 'confirm' && (
              <div className="space-y-4 mt-2">
                <p className="text-sm text-slate-700 font-semibold">
                  To confirm, type <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-700 font-mono text-xs">DELETE MY ACCOUNT</code> exactly:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-400 focus:outline-none text-sm font-mono"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDeleteStep('idle'); setConfirmText(''); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== 'DELETE MY ACCOUNT'}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Permanently delete my account
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 'deleting' && (
              <div className="flex items-center gap-3 text-slate-600 text-sm mt-2">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                Deleting your account…
              </div>
            )}

            {deleteStep === 'deleted' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold mt-2">
                ✓ Your account has been deleted. You will be signed out shortly.
              </div>
            )}

            {deleteStep === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mt-2">
                {errorMsg || 'An error occurred. Please try again or contact support.'}
              </div>
            )}
          </Section>

          {/* Data Retention */}
          <Section
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Data Retention Policy"
          >
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>We retain your personal data only as long as necessary for the purposes described in our Privacy Policy. Specifically:</p>
              <ul className="list-disc list-inside ml-2 space-y-1.5">
                <li><strong>Account data:</strong> Retained while your account is active, deleted within 30 days of account deletion request</li>
                <li><strong>Identity verification documents</strong> (passports, IDs, bank statements): Retained for 12 months after verification is completed, then permanently deleted from storage</li>
                <li><strong>Application history:</strong> Retained for 24 months after the application closes</li>
                <li><strong>Billing records:</strong> Retained for 7 years to comply with financial regulations (FIRS / HMRC requirements)</li>
                <li><strong>Consent records:</strong> Retained for the duration of the relationship + 5 years</li>
                <li><strong>Backups:</strong> Purged within 90 days of account deletion</li>
              </ul>
            </div>
          </Section>

          {/* Other Rights */}
          <Section
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            title="Other Rights — Contact Our DPO"
          >
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              For rights not covered above — including the <strong>right to restrict processing</strong>, <strong>right to object</strong>, <strong>right to data portability to another controller</strong>, or to lodge a complaint — please contact our Data Protection Officer directly. We will respond within <strong>30 days</strong> in accordance with GDPR / NDPA / POPIA requirements.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl text-sm space-y-1.5 text-slate-700">
              <p><strong>Email:</strong> <a href="mailto:privacy@jorbex.ng" className="text-blue-600 hover:underline">privacy@jorbex.ng</a></p>
              <p><strong>DPO:</strong> <a href="mailto:dpo@jorbex.ng" className="text-blue-600 hover:underline">dpo@jorbex.ng</a></p>
              <p><strong>Response time:</strong> Within 30 days</p>
              <p><strong>Address:</strong> Jorbex Technologies Ltd, Lagos, Nigeria</p>
            </div>
          </Section>

          {/* Footer links */}
          <div className="flex flex-wrap gap-4 text-sm pt-2">
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
            <Link href="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
            <Link href="/cookie-policy" className="text-blue-600 hover:underline font-medium">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
