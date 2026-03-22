'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AFRICAN_COUNTRIES } from '@/lib/locations';

interface Candidate {
  id: string;
  name: string;
  email: string;
  expertise: string;
  skills: string[];
  country: string;
  city?: string;
  isSuspended: boolean;
  onboardingTestPassed: boolean;
  onboardingTestScore: number | null;
  createdAt: string;
  _count: { applications: number };
}

const inputCls = 'px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors placeholder-slate-400';
const labelCls = 'block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1';

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), search });
    if (expertiseFilter) params.set('expertise', expertiseFilter);
    if (countryFilter)   params.set('country', countryFilter);
    if (dateFrom)        params.set('dateFrom', dateFrom);
    if (dateTo)          params.set('dateTo', dateTo);

    const res = await fetch(`/api/admin/candidates?${params}`);
    const data = await res.json();
    setCandidates(data.candidates || []);
    setTotal(data.total || 0);
    setIsLoading(false);
  }, [page, search, expertiseFilter, countryFilter, dateFrom, dateTo]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const clearFilters = () => {
    setSearch(''); setExpertiseFilter(''); setCountryFilter('');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasActiveFilters = search || expertiseFilter || countryFilter || dateFrom || dateTo;

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

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">

      {/* ── Filter bar ─────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          <div className="lg:col-span-2">
            <label className={labelCls}>Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Name or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className={`${inputCls} w-full pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Expertise</label>
            <select
              value={expertiseFilter}
              onChange={(e) => { setExpertiseFilter(e.target.value); setPage(1); }}
              className={`${inputCls} w-full`}
            >
              <option value="">All Expertise</option>
              {['Finance', 'IT', 'Marketing', 'Sales', 'HR', 'Operations', 'Other'].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Country</label>
            <select
              value={countryFilter}
              onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
              className={`${inputCls} w-full`}
            >
              <option value="">All Countries</option>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className={labelCls}>Joined from</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className={`${inputCls} w-full`}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className={`${inputCls} w-full`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            <span className="font-black text-slate-800">{total.toLocaleString()}</span> candidate{total !== 1 ? 's' : ''} found
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="text-left px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Country</th>
                  <th className="text-left px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Expertise</th>
                  <th className="text-left px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Onboarding</th>
                  <th className="text-left px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Apps</th>
                  <th className="text-left px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Date Joined</th>
                  <th className="text-right px-6 py-3.5 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm shadow-blue-500/20">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {c.country ? (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-slate-700 font-medium text-xs">{c.country}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                      {c.city && <p className="text-[11px] text-slate-400 mt-0.5 ml-5">{c.city}</p>}
                    </td>

                    <td className="px-6 py-4 text-slate-600 text-sm">{c.expertise || '—'}</td>

                    <td className="px-6 py-4">
                      {c.onboardingTestPassed ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Passed {c.onboardingTestScore ? `${c.onboardingTestScore}%` : ''}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600 font-semibold">{c._count.applications}</td>

                    <td className="px-6 py-4">
                      {c.isSuspended ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">Suspended</span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-slate-700 text-xs font-semibold">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {new Date(c.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {confirmDelete === c.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-slate-400">Delete?</span>
                          <button onClick={() => deleteCandidate(c.id)} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">Yes</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-xs font-bold text-slate-500 hover:underline cursor-pointer">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 justify-end">
                          <Link href={`/admin/candidates/${c.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800">View</Link>
                          <button
                            onClick={() => toggleSuspend(c.id, c.isSuspended)}
                            className={`text-xs font-bold cursor-pointer ${c.isSuspended ? 'text-emerald-600 hover:text-emerald-800' : 'text-amber-600 hover:text-amber-800'}`}
                          >
                            {c.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button onClick={() => setConfirmDelete(c.id)} className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-400 text-sm">
                      No candidates match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:border-slate-300 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-slate-500">
              Page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:border-slate-300 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
