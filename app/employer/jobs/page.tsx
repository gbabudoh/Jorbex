'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  status: 'active' | 'closed' | 'draft' | 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
}

export default function EmployerJobsPage() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/employer/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const response = await fetch(`/api/employer/jobs?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setJobs(jobs.filter(j => j.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const getStatusVariant = (status: Job['status']) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'success';
    if (s === 'closed') return 'error';
    return 'warning';
  };

  const getStatusLabel = (status: Job['status']) => {
    const s = status?.toLowerCase();
    if (s === 'active') return t('jobs.status_active');
    if (s === 'closed') return t('jobs.status_closed');
    return t('jobs.status_draft');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('jobs.management_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('jobs.management_subtitle')}
            {jobs.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black">
                {jobs.length}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          {jobs.length > 0 && (
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}
          <Link href="/employer/jobs/create">
            <Button variant="primary" className="bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 font-bold px-6 py-2 rounded-xl cursor-pointer">
              {t('jobs.post_new_job')}
            </Button>
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="rounded-3xl border-0 shadow-xl">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('jobs.no_jobs_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">{t('jobs.no_jobs_desc')}</p>
            <Link href="/employer/jobs/create">
              <Button variant="primary" className="h-12 px-8 rounded-xl font-bold bg-[#0066FF] cursor-pointer">{t('jobs.create_first_job')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        /* ── List View ── */
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl group">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</h2>
                    <Badge variant={getStatusVariant(job.status)}>{getStatusLabel(job.status)}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {t('jobs.posted_on')} {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link href={`/employer/jobs/${job.id}`}>
                    <Button variant="outline" className="rounded-xl font-bold text-gray-600 hover:bg-gray-50 border-gray-200 cursor-pointer">
                      {t('jobs.view_job') || 'View'}
                    </Button>
                  </Link>
                  <Link href={`/employer/applications?jobId=${job.id}`}>
                    <Button variant="outline" className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 border-blue-100 cursor-pointer">
                      {t('jobs.view_applications')}
                    </Button>
                  </Link>
                  {confirmDeleteId === job.id ? (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-800">
                      <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">{t('jobs.confirm_delete_short')}</span>
                      <button onClick={() => deleteJob(job.id)} className="px-3 py-1 rounded-lg bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:scale-95 transition-all cursor-pointer">{t('jobs.yes')}</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">{t('jobs.no')}</button>
                    </div>
                  ) : (
                    <Button variant="outline" className="rounded-xl font-bold text-rose-500 hover:bg-rose-50 border-rose-100 cursor-pointer" onClick={() => setConfirmDeleteId(job.id)}>
                      {t('jobs.delete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="group flex flex-col border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              {/* Blue top accent */}
              <div className="h-1.5 w-full bg-linear-to-r from-blue-600 to-indigo-500" />
              <CardContent className="p-6 flex flex-col flex-1">
                {/* Title + status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                    {job.title}
                  </h2>
                  <Badge variant={getStatusVariant(job.status)} className="shrink-0 mt-0.5">
                    {getStatusLabel(job.status)}
                  </Badge>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    {t('jobs.posted_on')} {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2">
                    <Link href={`/employer/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 border-gray-200 cursor-pointer">
                        {t('jobs.view_job') || 'View'}
                      </Button>
                    </Link>
                    <Link href={`/employer/applications?jobId=${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl font-bold text-sm text-blue-600 hover:bg-blue-50 border-blue-100 cursor-pointer">
                        {t('jobs.view_applications')}
                      </Button>
                    </Link>
                  </div>
                  {confirmDeleteId === job.id ? (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-800">
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex-1">{t('jobs.confirm_delete_short')}</span>
                      <button onClick={() => deleteJob(job.id)} className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 active:scale-95 transition-all cursor-pointer">{t('jobs.yes')}</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">{t('jobs.no')}</button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 border-rose-100 cursor-pointer" onClick={() => setConfirmDeleteId(job.id)}>
                      {t('jobs.delete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
