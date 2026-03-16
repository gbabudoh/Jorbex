'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Candidate {
  id: string;
  name: string;
  email: string;
  expertise: string;
  skills: string[];
  country: string;
  isSuspended: boolean;
  onboardingTestPassed: boolean;
  onboardingTestScore: number | null;
  createdAt: string;
  _count: { applications: number };
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), search, ...(expertiseFilter && { expertise: expertiseFilter }) });
    const res = await fetch(`/api/admin/candidates?${params}`);
    const data = await res.json();
    setCandidates(data.candidates || []);
    setTotal(data.total || 0);
    setIsLoading(false);
  }, [page, search, expertiseFilter]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const toggleSuspend = async (id: string, current: boolean) => {
    await fetch(`/api/admin/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSuspended: !current }),
    });
    fetchCandidates();
  };

  const deleteCandidate = async (id: string) => {
    await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    fetchCandidates();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
        />
        <select
          value={expertiseFilter}
          onChange={(e) => { setExpertiseFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
        >
          <option value="">All Expertise</option>
          {['Finance', 'IT', 'Marketing', 'Sales', 'HR', 'Operations', 'Other'].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500 flex items-center">{total} candidates</span>
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
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Expertise</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Onboarding</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Applications</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Joined</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{c.expertise}</td>
                    <td className="px-6 py-4">
                      {c.onboardingTestPassed ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Passed {c.onboardingTestScore ? `(${c.onboardingTestScore}%)` : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{c._count.applications}</td>
                    <td className="px-6 py-4">
                      {c.isSuspended ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {confirmDelete === c.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-slate-500">Delete?</span>
                          <button onClick={() => deleteCandidate(c.id)} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">Yes</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/admin/candidates/${c.id}`} className="text-xs font-bold text-[#0066FF] hover:underline">View</Link>
                          <button
                            onClick={() => toggleSuspend(c.id, c.isSuspended)}
                            className={`text-xs font-bold hover:underline cursor-pointer ${c.isSuspended ? 'text-emerald-600' : 'text-amber-600'}`}
                          >
                            {c.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button onClick={() => setConfirmDelete(c.id)} className="text-xs font-bold text-red-500 hover:underline cursor-pointer">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">No candidates found</td></tr>
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
