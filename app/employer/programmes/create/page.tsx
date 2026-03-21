'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AFRICAN_COUNTRIES } from '@/lib/constants';

type ProgrammeType = 'GOVERNMENT' | 'UNIVERSITY' | 'CORPORATE';

const TYPES: { value: ProgrammeType; label: string; icon: string; description: string }[] = [
  { value: 'GOVERNMENT', icon: '🏛️', label: 'Government Internship', description: 'National internship or youth employment scheme managed by a ministry or parastatal' },
  { value: 'UNIVERSITY',  icon: '🎓', label: 'University Placement',  description: 'Graduate and student placement programme run by a university or polytechnic' },
  { value: 'CORPORATE',   icon: '🏢', label: 'Corporate Match',       description: 'Managed recruitment and placement for corporate clients and multinationals' },
];

const PORTAL_PREFIX: Record<ProgrammeType, string> = {
  GOVERNMENT: '/gov/',
  UNIVERSITY:  '/campus/',
  CORPORATE:   '/match/',
};

export default function CreateProgrammePage() {
  const router = useRouter();
  const [step, setStep]       = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    name: '', description: '', type: '' as ProgrammeType | '',
    country: '', city: '', startDate: '', endDate: '',
    maxParticipants: '', inviteOnly: true,
    allowedDomains: '', welcomeMessage: '', primaryColour: '#10b981',
    billingModel: 'FLAT', billingAmount: '', billingCurrency: 'NGN',
  });

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.type) { setError('Name and type are required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          allowedDomains: form.allowedDomains
            ? form.allowedDomains.split(',').map(d => d.trim()).filter(Boolean)
            : [],
          billingAmount: form.billingAmount ? Number(form.billingAmount) : null,
          maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create programme'); return; }
      router.push(`/employer/programmes/${data.programme.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 cursor-pointer text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Create Programme</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Set up your programme portal in two steps</p>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`flex items-center gap-2 text-sm font-semibold ${step === s ? 'text-emerald-600' : step > s ? 'text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-emerald-600 text-white' : step > s ? 'bg-slate-300 dark:bg-slate-700 text-gray-600 dark:text-gray-400' : 'border-2 border-slate-200 dark:border-slate-700 text-gray-400'}`}>{s}</div>
              {s === 1 ? 'Programme type & details' : 'Access & billing'}
              {s < 2 && <svg className="w-4 h-4 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          {error && <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-sm">{error}</div>}

          {step === 1 && (
            <div className="space-y-6">
              {/* Type selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Programme Type *</label>
                <div className="grid gap-3">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('type', t.value)}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${form.type === t.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{t.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {form.type && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Programme Name *</label>
                    <input
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="e.g. NYSC Tech Placement 2026"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {form.name && form.type && (
                      <p className="text-xs text-gray-400 mt-1">
                        Portal URL: <span className="text-emerald-600 font-mono">{PORTAL_PREFIX[form.type]}{form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      rows={3}
                      placeholder="What is this programme about?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Country</label>
                      <select
                        value={form.country}
                        onChange={e => set('country', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="">Select country…</option>
                        {AFRICAN_COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">City</label>
                      <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Lagos" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Start Date</label>
                      <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">End Date</label>
                      <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>

                  <button onClick={() => setStep(2)} disabled={!form.name}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors cursor-pointer">
                    Continue →
                  </button>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Max Participants</label>
                <input type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} placeholder="Leave blank for unlimited" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">Invite-only enrolment</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Candidates need an invite code to join</div>
                </div>
                <button
                  type="button"
                  onClick={() => set('inviteOnly', !form.inviteOnly)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.inviteOnly ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.inviteOnly ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Allowed Email Domains</label>
                <input value={form.allowedDomains} onChange={e => set('allowedDomains', e.target.value)} placeholder="unilag.edu.ng, ui.edu.ng (comma-separated, leave blank for any)" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-gray-400 mt-1">Restrict enrolment to specific email domains (e.g. university email addresses)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Welcome Message</label>
                <textarea value={form.welcomeMessage} onChange={e => set('welcomeMessage', e.target.value)} rows={3} placeholder="Welcome message shown on the programme portal" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Billing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Billing Model</label>
                    <select value={form.billingModel} onChange={e => set('billingModel', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="FLAT">Flat fee</option>
                      <option value="PER_SEAT">Per participant</option>
                      <option value="PER_PLACEMENT">Per placement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                    <input type="number" value={form.billingAmount} onChange={e => set('billingAmount', e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-slate-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors cursor-pointer">
                  {loading ? 'Creating…' : 'Create Programme'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
