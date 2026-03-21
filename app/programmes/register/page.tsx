'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { AFRICAN_COUNTRIES } from '@/lib/constants';

type InstitutionType = 'GOVERNMENT' | 'UNIVERSITY' | 'CORPORATE';

const INSTITUTION_TYPES: { value: InstitutionType; icon: string; label: string; sub: string; colour: string; border: string }[] = [
  {
    value: 'GOVERNMENT',
    icon: '🏛️',
    label: 'Government / Parastatal',
    sub: 'Ministries, agencies, and government-funded internship schemes',
    colour: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    value: 'UNIVERSITY',
    icon: '🎓',
    label: 'University / Institute',
    sub: 'Universities, polytechnics, and higher education careers offices',
    colour: 'from-violet-600 to-purple-700',
    border: 'border-violet-500 bg-violet-50 dark:bg-violet-900/20',
  },
  {
    value: 'CORPORATE',
    icon: '🏢',
    label: 'Corporate / Multinational',
    sub: 'Companies and HR teams running graduate schemes or managed hiring',
    colour: 'from-amber-500 to-orange-600',
    border: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
  },
];

export default function ProgrammesRegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<InstitutionType | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    institutionName: '',
    country: '',
    city: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    website: '',
    estimatedSize: '',
    notes: '',
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  // If already logged in as employer, redirect straight to dashboard
  if (status === 'authenticated' && session?.user?.userType === 'employer') {
    router.replace('/programmes/dashboard');
    return null;
  }

  const handleSubmit = async () => {
    if (!form.institutionName || !form.country || !form.email) {
      setError('Institution name, country and email are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/programmes/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit enquiry'); return; }
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const typeMeta = INSTITUTION_TYPES.find(t => t.value === type);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Logo / back */}
        <button onClick={() => router.push('/programmes')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Programmes
        </button>

        {/* Step 3 — success */}
        {step === 3 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Enquiry submitted</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Thank you, <strong>{form.contactName || form.institutionName}</strong>. Our programmes team will review your enquiry and contact you within 2 business days.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              Already have an account?{' '}
              <button onClick={() => signIn()} className="text-blue-600 dark:text-blue-400 underline cursor-pointer">Sign in</button>
              {' '}to access your dashboard.
            </p>
            <button
              onClick={() => router.push('/programmes')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Back to Programmes
            </button>
          </div>
        )}

        {step !== 3 && (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 mb-4">
                Get started with Jorbex Programmes
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Register your institution</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tell us about your institution and we'll set up your dedicated programme portal.
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8 justify-center">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200 dark:border-slate-700 text-gray-400'}`}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:inline ${step === s ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {s === 1 ? 'Institution type' : 'Your details'}
                  </span>
                  {s < 2 && <svg className="w-4 h-4 text-slate-300 dark:text-slate-700 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              {error && (
                <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
                  {error}
                </div>
              )}

              {/* Step 1 — institution type */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">What type of institution are you?</h2>
                  {INSTITUTION_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${type === t.value ? t.border + ' border-2' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    >
                      <span className="text-3xl shrink-0">{t.icon}</span>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{t.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.sub}</div>
                      </div>
                      {type === t.value && (
                        <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => type && setStep(2)}
                    disabled={!type}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Continue →
                  </button>

                  <p className="text-center text-sm text-gray-400 dark:text-gray-500 pt-2">
                    Already have an account?{' '}
                    <button onClick={() => signIn()} className="text-blue-600 dark:text-blue-400 underline cursor-pointer">Sign in</button>
                  </p>
                </div>
              )}

              {/* Step 2 — details */}
              {step === 2 && (
                <div className="space-y-5">
                  {typeMeta && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-linear-to-r ${typeMeta.colour} text-white mb-2`}>
                      <span className="text-xl">{typeMeta.icon}</span>
                      <span className="font-bold text-sm">{typeMeta.label}</span>
                      <button onClick={() => setStep(1)} className="ml-auto text-white/70 hover:text-white text-xs underline cursor-pointer">Change</button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Institution Name *</label>
                    <input
                      value={form.institutionName}
                      onChange={e => set('institutionName', e.target.value)}
                      placeholder="e.g. Federal Ministry of Labour"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Country *</label>
                      <select
                        value={form.country}
                        onChange={e => set('country', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">Select…</option>
                        {AFRICAN_COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">City</label>
                      <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Abuja" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Contact Name</label>
                      <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Your full name" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Job Title</label>
                      <input value={form.contactTitle} onChange={e => set('contactTitle', e.target.value)} placeholder="e.g. Head of HR" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Work Email *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@institution.gov.ng" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Estimated Cohort Size</label>
                    <select value={form.estimatedSize} onChange={e => set('estimatedSize', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                      <option value="">Select range…</option>
                      <option value="1-50">1 – 50 participants</option>
                      <option value="51-250">51 – 250 participants</option>
                      <option value="251-1000">251 – 1,000 participants</option>
                      <option value="1001-5000">1,001 – 5,000 participants</option>
                      <option value="5000+">5,000+ participants</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Anything else we should know?</label>
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Tell us about your programme goals, timeline, or any specific requirements…" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 border-2 border-slate-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      ← Back
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="flex-2 flex-grow bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors cursor-pointer">
                      {loading ? 'Submitting…' : 'Submit Enquiry'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
