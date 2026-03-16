'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Employer {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone: string;
  country: string;
  isSuspended: boolean;
  subscriptionStatus: string;
  subscriptionEndDate: string;
  createdAt: string;
  _count: { jobs: number; applications: number };
}

const subStatusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  TRIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchEmployers = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), search, ...(statusFilter && { status: statusFilter }) });
    const res = await fetch(`/api/admin/employers?${params}`);
    const data = await res.json();
    setEmployers(data.employers || []);
    setTotal(data.total || 0);
    setIsLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchEmployers(); }, [fetchEmployers]);

  const toggleSuspend = async (id: string, current: boolean) => {
    await fetch(`/api/admin/employers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSuspended: !current }),
    });
    fetchEmployers();
  };

  const deleteEmployer = async (id: string) => {
    await fetch(`/api/admin/employers/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    fetchEmployers();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, company..."
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
          <option value="TRIAL">Trial</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <span className="text-sm text-slate-500 flex items-center">{total} employers</span>
      </div>

      {/* Table */}
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
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Company</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Contact</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Subscription</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Jobs / Apps</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Joined</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employers.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{emp.companyName}</p>
                      <p className="text-xs text-slate-500">{emp.country || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${subStatusColor[emp.subscriptionStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {emp.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {emp._count.jobs} / {emp._count.applications}
                    </td>
                    <td className="px-6 py-4">
                      {emp.isSuspended ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Suspended</span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(emp.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {confirmDelete === emp.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-slate-500">Delete?</span>
                          <button onClick={() => deleteEmployer(emp.id)} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">Yes</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/admin/employers/${emp.id}`} className="text-xs font-bold text-[#0066FF] hover:underline">View</Link>
                          <button onClick={() => toggleSuspend(emp.id, emp.isSuspended)} className={`text-xs font-bold hover:underline cursor-pointer ${emp.isSuspended ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {emp.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button onClick={() => setConfirmDelete(emp.id)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {employers.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">No employers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Previous</button>
            <span className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
