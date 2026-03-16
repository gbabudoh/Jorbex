'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Employer {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone: string;
  country: string;
  city: string;
  isSuspended: boolean;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  paystackCustomerCode: string;
  createdAt: string;
  jobs: { id: string; title: string; status: string; createdAt: string }[];
  _count: { jobs: number; applications: number; interviews: number };
}

const subStatusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  TRIAL: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function AdminEmployerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', companyName: '', email: '', phone: '',
    country: '', city: '', subscriptionStatus: '', subscriptionEndDate: '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchEmployer = useCallback(async () => {
    const res = await fetch(`/api/admin/employers/${id}`);
    const data = await res.json();
    setEmployer(data.employer);
    setForm({
      name: data.employer.name || '',
      companyName: data.employer.companyName || '',
      email: data.employer.email || '',
      phone: data.employer.phone || '',
      country: data.employer.country || '',
      city: data.employer.city || '',
      subscriptionStatus: data.employer.subscriptionStatus || 'TRIAL',
      subscriptionEndDate: data.employer.subscriptionEndDate ? data.employer.subscriptionEndDate.split('T')[0] : '',
    });
    setIsLoading(false);
  }, [id]);

  useEffect(() => { fetchEmployer(); }, [fetchEmployer]);

  const handleSave = async () => {
    setIsSaving(true);
    await fetch(`/api/admin/employers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setIsSaving(false);
    fetchEmployer();
  };

  const toggleSuspend = async () => {
    await fetch(`/api/admin/employers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSuspended: !employer?.isSuspended }),
    });
    fetchEmployer();
  };

  const handleDelete = async () => {
    await fetch(`/api/admin/employers/${id}`, { method: 'DELETE' });
    router.push('/admin/employers');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }
  if (!employer) return <div className="text-center py-20 text-slate-500">Employer not found</div>;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
              {employer.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{employer.companyName}</h2>
              <p className="text-slate-500 text-sm">{employer.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${subStatusColor[employer.subscriptionStatus]}`}>
                  {employer.subscriptionStatus}
                </span>
                {employer.isSuspended && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={toggleSuspend}
              className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                employer.isSuspended
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {employer.isSuspended ? 'Unsuspend' : 'Suspend'}
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

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          {[
            { label: 'Jobs', value: employer._count.jobs },
            { label: 'Applications', value: employer._count.applications },
            { label: 'Interviews', value: employer._count.interviews },
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
            { key: 'name', label: 'Contact Name' },
            { key: 'companyName', label: 'Company Name' },
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Subscription Status
            </label>
            <select
              value={form.subscriptionStatus}
              onChange={(e) => setForm(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            >
              <option value="TRIAL">Trial</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Subscription End Date
            </label>
            <input
              type="date"
              value={form.subscriptionEndDate}
              onChange={(e) => setForm(prev => ({ ...prev, subscriptionEndDate: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
            />
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

      {/* Recent Jobs */}
      {employer.jobs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Jobs</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {employer.jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-slate-900 dark:text-white font-medium">{job.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {job.status}
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
