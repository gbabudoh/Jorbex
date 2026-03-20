'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    location?: string;
    type?: string;
    employer: {
      companyName: string;
    };
  };
}

export default function CandidateApplicationsPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/candidate/applications');
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Fetch Applications Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied':             return <Badge variant="info">{t('candidate_applications.status_applied')}</Badge>;
      case 'shortlisted':
      case 'reviewing':           return <Badge variant="success">{t('candidate_applications.status_shortlisted')}</Badge>;
      case 'rejected':            return <Badge variant="error">{t('candidate_applications.status_rejected')}</Badge>;
      case 'interview_scheduled': return <Badge variant="info">Interview Scheduled</Badge>;
      case 'offer_sent':          return <Badge variant="success">Offer Sent</Badge>;
      case 'hired':               return <Badge variant="success">Hired</Badge>;
      default:                    return <Badge variant="default">{status?.replace(/_/g, ' ')}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-gray-500">{t('jobs.loading_applications')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('jobs.my_applications')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('jobs.applications_desc')}</p>
        </div>
        <Link href="/candidate/jobs">
          <Button variant="outline">{t('jobs.find_more_jobs')}</Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-16 bg-white/50 dark:bg-slate-900/50 border-dashed">
          <CardContent>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-6">{t('jobs.no_applications')}</p>
            <Link href="/candidate/jobs">
              <Button>{t('jobs.explore_jobs')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow duration-200 border-gray-100 dark:border-slate-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{app.job?.title ?? '—'}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                        {app.job?.employer?.companyName ?? '—'}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {app.job?.location && (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {app.job.location}
                          </span>
                        )}
                        {app.job?.type && (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {app.job.type}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {t('jobs.applied_on')} {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
