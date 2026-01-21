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
  industry: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  employerId: Employer;
}

export default function CandidateJobsPage() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ title: '', location: '', type: '' });
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' } | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/candidate/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
       void error;
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
    } catch (error) {
      void error;
      setNotification({ isOpen: true, message: t('login.error_generic'), type: 'error' });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{t('jobs.candidate_title')}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{t('jobs.candidate_subtitle')}</p>
      </div>

      <Card className="mb-12 p-2 rounded-[2rem] border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
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
             className="flex-1 h-14 px-4 rounded-2xl border-2 border-transparent bg-slate-100/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-600/30 outline-none transition-all font-bold text-slate-600 dark:text-slate-300"
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
            className="h-14 px-10 rounded-2xl font-black bg-blue-600 shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            {t('jobs.search_button')}
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
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
      ) : (
        <div className="grid gap-8">
          {jobs.map((job) => (
            <Card key={job._id} className="group relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="info" className="bg-blue-600/10 text-blue-600 border-0 font-bold px-3 py-1 rounded-lg uppercase tracking-wider text-[10px]">
                        {job.type}
                      </Badge>
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {job.location}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                        {job.employerId?.companyName.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-400">{job.employerId?.companyName}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="font-medium text-slate-500 dark:text-slate-500">{job.employerId?.industry}</span>
                    </div>
 
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed line-clamp-3 mb-8">
                      {job.description}
                    </p>
 
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">{t('jobs.estimated_salary')}</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                          {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} <span className="text-blue-600">{job.salary.currency}</span>
                        </p>
                      </div>
                    </div>
                  </div>
 
                  <div className="flex md:flex-col justify-end gap-3 shrink-0">
                    <Button 
                      variant="primary" 
                      className="h-16 px-12 rounded-2xl font-black text-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                      onClick={() => handleApply(job._id)}
                      disabled={applyingId === job._id}
                    >
                      {applyingId === job._id ? t('jobs.applying') : t('jobs.apply_now')}
                    </Button>
                  </div>
                </div>
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
