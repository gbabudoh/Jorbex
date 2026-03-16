'use client';

import { useState, useEffect, useCallback } from 'react';

interface Employer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  paystackCustomerCode: string | null;
  paystackSubscriptionCode: string | null;
  createdAt: string;
}

const subStatusColor: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  TRIAL: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function AdminSubscriptionsPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string; status: string; endDate: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmployers = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(statusFilter && { status: statusFilter }) });
    const res = await fetch(`/api/admin/subscriptions?${params}`);
    const data = await res.json();
    setEmployers(data.employers || []);
    setTotal(data.total || 0);
    setIsLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchEmployers(); }, [fetchEmployers]);

  const saveSubscription = async () => {
    if (!editing) return;
    setIsSaving(true);
    await fetch(`/api/admin/subscriptions/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionStatus: editing.status,
        ...(editing.endDate && { subscriptionEndDate: editing.endDate }),
      }),
    });
    setIsSaving(false);
    setEditing(null);
    fetchEmployers();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
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
        <span className="text-sm text-slate-500 flex items-center">{total} subscriptions</span>
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
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Company</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Contact</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Start Date</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">End Date</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Paystack Code</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employers.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{emp.companyName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {editing?.id === emp.id ? (
                        <select
                          value={editing.status}
                          onChange={(e) => setEditing(prev => prev ? { ...prev, status: e.target.value } : null)}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
                        >
                          <option value="TRIAL">Trial</option>
                          <option value="ACTIVE">Active</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${subStatusColor[emp.subscriptionStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {emp.subscriptionStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {emp.subscriptionStartDate ? new Date(emp.subscriptionStartDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {editing?.id === emp.id ? (
                        <input
                          type="date"
                          value={editing.endDate}
                          onChange={(e) => setEditing(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">
                          {emp.subscriptionEndDate ? new Date(emp.subscriptionEndDate).toLocaleDateString() : '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {emp.paystackCustomerCode || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {editing?.id === emp.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={saveSubscription}
                            disabled={isSaving}
                            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditing(null)} className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditing({
                            id: emp.id,
                            status: emp.subscriptionStatus,
                            endDate: emp.subscriptionEndDate ? emp.subscriptionEndDate.split('T')[0] : '',
                          })}
                          className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer float-right"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {employers.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">No subscriptions found</td></tr>
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
