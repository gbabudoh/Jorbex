'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Notification } from '@/components/ui/Notification';
import { useLanguage } from '@/lib/LanguageContext';

interface Employer {
  companyName: string;
  isVerified?: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  employer: Employer;
  createdAt: string;
}

type ViewMode = 'grid' | 'list';

const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

function SalaryText({ job }: { job: Job }) {
  if (!job.salaryMin && !job.salaryMax) return null;
  const range = job.salaryMin && job.salaryMax
    ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
    : job.salaryMin
    ? `From ${job.salaryMin.toLocaleString()}`
    : `Up to ${job.salaryMax!.toLocaleString()}`;
  return <>{range} <span className="text-blue-600">{job.currency}</span></>;
}

export default function CandidateJobsPage() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ title: '', location: '', type: '' });
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' } | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/candidate/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      const response = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotification({ isOpen: true, message: t('jobs.apply_success'), type: 'success' });
      } else {
        setNotification({ isOpen: true, message: data.error || t('jobs.error'), type: 'error' });
      }
    } catch {
      setNotification({ isOpen: true, message: t('login.error_generic'), type: 'error' });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{t('jobs.candidate_title')}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{t('jobs.candidate_subtitle')}</p>
      </div>

      {/* Search bar */}
      <Card className="mb-8 p-2 rounded-[2rem] border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <Input
            placeholder={t('jobs.keywords_placeholder')}
            value={filters.title}
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            className="flex-[2] h-14 rounded-2xl border-transparent bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
          />
          <Input
            placeholder={t('jobs.location_placeholder')}
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="flex-1 h-14 rounded-2xl border-transparent bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="flex-1 h-14 px-4 rounded-2xl border-2 border-transparent bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-600/30 outline-none transition-all font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <option value="">{t('jobs.all_types')}</option>
            <option value="Full-time">{t('jobs.full_time')}</option>
            <option value="Part-time">{t('jobs.part_time')}</option>
            <option value="Contract">{t('jobs.contract')}</option>
            <option value="Remote">{t('jobs.remote')}</option>
          </select>
          <Button
            onClick={fetchJobs}
            variant="primary"
            className="h-14 px-10 rounded-2xl font-black bg-blue-600 shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {t('jobs.search_button')}
          </Button>
        </CardContent>
      </Card>

      {/* Results bar with view toggle */}
      {!isLoading && jobs.length > 0 && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
          </p>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow text-blue-600'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="Grid view"
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 shadow text-blue-600'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="List view"
            >
              <ListIcon />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">{t('jobs.no_jobs_matching')}</h3>
          <p className="text-slate-500">{t('jobs.adjust_filters')}</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── 3 columns */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <Card key={job.id} className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                {/* Type + location */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge variant="info" className="bg-blue-600/10 text-blue-600 border-0 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px]">
                    {job.type || '—'}
                  </Badge>
                  {job.location && (
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1 truncate">
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{job.location}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {job.title}
                </h2>

                {/* Company */}
                {job.employer?.companyName && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-[9px] shrink-0">
                      {job.employer.companyName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {job.employer.companyName}
                    </span>
                    {job.employer.isVerified && (
                      <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 flex-1 mb-4">
                  {job.description || 'No description provided.'}
                </p>

                {/* Salary */}
                {(job.salaryMin || job.salaryMax) && (
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 mb-4">
                    <SalaryText job={job} />
                  </p>
                )}

                {/* Posted date */}
                <p className="text-[11px] text-slate-400 mb-4">
                  {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                {/* Apply button */}
                <Button
                  variant="primary"
                  className="w-full h-11 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-auto"
                  onClick={() => handleApply(job.id)}
                  disabled={applyingId === job.id}
                >
                  {applyingId === job.id ? t('jobs.applying') : t('jobs.apply_now')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ── LIST VIEW ── 1 column */
        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Company avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl shrink-0">
                  {job.employer?.companyName?.charAt(0) ?? '?'}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h2>
                    <Badge variant="info" className="bg-blue-600/10 text-blue-600 border-0 font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider text-[10px]">
                      {job.type || '—'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    {job.employer?.companyName && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{job.employer.companyName}</span>
                        {job.employer.isVerified && (
                          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        )}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        <SalaryText job={job} />
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">
                      {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Apply button */}
                <Button
                  variant="primary"
                  className="h-11 px-8 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer"
                  onClick={() => handleApply(job.id)}
                  disabled={applyingId === job.id}
                >
                  {applyingId === job.id ? t('jobs.applying') : t('jobs.apply_now')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {notification && (
        <Notification
          isOpen={notification.isOpen}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
