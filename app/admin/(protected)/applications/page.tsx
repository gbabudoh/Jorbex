'use client';

import { useState, useEffect, useCallback } from 'react';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  candidate: { name: string; email: string };
  employer: { companyName: string };
  job: { title: string };
}

const statusColor: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-amber-100 text-amber-700',
  TEST_SENT: 'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  OFFER_SENT: 'bg-teal-100 text-teal-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(statusFilter && { status: statusFilter }) });
    const res = await fetch(`/api/admin/applications?${params}`);
    const data = await res.json();
    setApplications(data.applications || []);
    setTotal(data.total || 0);
    setIsLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
        >
          <option value="">All Statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="TEST_SENT">Test Sent</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="OFFER_SENT">Offer Sent</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <span className="text-sm text-slate-500 flex items-center">{total} applications</span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066FF]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Candidate</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Job Title</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Employer</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{app.candidate.name}</p>
                      <p className="text-xs text-slate-500">{app.candidate.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{app.job.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{app.employer.companyName}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[app.status] || 'bg-gray-100 text-gray-600'}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">No applications found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {total > 20 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 transition-colors">Previous</button>
            <span className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 transition-colors">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
