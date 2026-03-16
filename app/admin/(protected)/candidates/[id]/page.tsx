'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface WorkHistory {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  job: { title: string };
  employer: { companyName: string };
}

interface TestResult {
  id: string;
  score: number;
  passed: boolean;
  completedAt: string;
  test: { title: string };
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  expertise: string;
  skills: string[];
  personalStatement: string | null;
  isSuspended: boolean;
  onboardingTestPassed: boolean;
  onboardingTestScore: number | null;
  highestQualification: string | null;
  university: string | null;
  degree: string | null;
  createdAt: string;
  workHistory: WorkHistory[];
  applications: Application[];
  testResults: TestResult[];
  _count: { applications: number; interviews: number };
}

const appStatusColor: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-amber-100 text-amber-700',
  INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-700',
  OFFER_SENT: 'bg-teal-100 text-teal-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminCandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: '', city: '', expertise: '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchCandidate = useCallback(async () => {
    const res = await fetch(`/api/admin/candidates/${id}`);
    const data = await res.json();
    setCandidate(data.candidate);
    setForm({
      name: data.candidate.name || '',
      email: data.candidate.email || '',
      phone: data.candidate.phone || '',
      country: data.candidate.country || '',
      city: data.candidate.city || '',
      expertise: data.candidate.expertise || '',
    });
    setIsLoading(false);
  }, [id]);

  useEffect(() => { fetchCandidate(); }, [fetchCandidate]);

  const handleSave = async () => {
    setIsSaving(true);
    await fetch(`/api/admin/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setIsSaving(false);
    fetchCandidate();
  };

  const toggleSuspend = async () => {
    await fetch(`/api/admin/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSuspended: !candidate?.isSuspended }),
    });
    fetchCandidate();
  };

  const handleDelete = async () => {
    await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' });
    router.push('/admin/candidates');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }
  if (!candidate) return <div className="text-center py-20 text-slate-500">Candidate not found</div>;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{candidate.name}</h2>
              <p className="text-slate-500 text-sm">{candidate.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {candidate.expertise}
                </span>
                {candidate.onboardingTestPassed ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Passed {candidate.onboardingTestScore ? `(${candidate.onboardingTestScore}%)` : ''}
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending Onboarding</span>
                )}
                {candidate.isSuspended && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={toggleSuspend}
              className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                candidate.isSuspended
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {candidate.isSuspended ? 'Unsuspend' : 'Suspend'}
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white cursor-pointer">
                  Confirm Delete
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 cursor-pointer">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          {[
            { label: 'Applications', value: candidate._count.applications },
            { label: 'Interviews', value: candidate._count.interviews },
            { label: 'Test Results', value: candidate.testResults.length },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Edit Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Full Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'country', label: 'Country' },
            { key: 'city', label: 'City' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {field.label}
              </label>
              <input
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Expertise</label>
            <select
              value={form.expertise}
              onChange={(e) => setForm(prev => ({ ...prev, expertise: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            >
              {['Finance', 'IT', 'Marketing', 'Sales', 'HR', 'Operations', 'Other'].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 px-6 py-2.5 bg-[#0066FF] text-white font-bold rounded-xl text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Work History */}
      {candidate.workHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Work History</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {candidate.workHistory.map((w) => (
              <div key={w.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{w.position}</p>
                    <p className="text-slate-500 text-xs">{w.company}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(w.startDate).toLocaleDateString()} — {w.endDate ? new Date(w.endDate).toLocaleDateString() : 'Present'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications */}
      {candidate.applications.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Applications</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {candidate.applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{app.job.title}</p>
                  <p className="text-xs text-slate-500">{app.employer.companyName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${appStatusColor[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      {candidate.testResults.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Test Results</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {candidate.testResults.map((tr) => (
              <div key={tr.id} className="flex items-center justify-between px-6 py-3">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{tr.test.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(tr.completedAt).toLocaleDateString()}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tr.score}%</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tr.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {tr.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
