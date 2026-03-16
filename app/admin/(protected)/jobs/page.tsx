'use client';

import { useState, useEffect, useCallback } from 'react';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  employer: { companyName: string; email: string };
  _count: { applications: number };
}

const statusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-amber-100 text-amber-700',
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<{ id: string; value: string } | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), search, ...(statusFilter && { status: statusFilter }) });
    const res = await fetch(`/api/admin/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setTotal(data.total || 0);
    setIsLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setEditStatus(null);
    fetchJobs();
  };

  const deleteJob = async (id: string) => {
    await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    fetchJobs();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by job title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
          <option value="DRAFT">Draft</option>
        </select>
        <span className="text-sm text-slate-500 flex items-center">{total} jobs</span>
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
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Title</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Employer</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Location</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Apps</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Posted</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">{job.title}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white">{job.employer.companyName}</p>
                      <p className="text-xs text-slate-500">{job.employer.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{job.location || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{job.type || '—'}</td>
                    <td className="px-6 py-4">
                      {editStatus?.id === job.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={editStatus.value}
                            onChange={(e) => setEditStatus({ id: job.id, value: e.target.value })}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="CLOSED">Closed</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                          <button onClick={() => updateStatus(job.id, editStatus.value)} className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer">Save</button>
                          <button onClick={() => setEditStatus(null)} className="text-xs font-bold text-slate-400 hover:underline cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditStatus({ id: job.id, value: job.status })}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer ${statusColor[job.status] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {job.status}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{job._count.applications}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {confirmDelete === job.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-slate-500">Delete?</span>
                          <button onClick={() => deleteJob(job.id)} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">Yes</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setConfirmDelete(job.id)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-400">No jobs found</td></tr>
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
