"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/LanguageContext';

interface Application {
  id: string;
  candidateId: string;
  candidate: {
    name: string;
    email: string;
  };
  jobId: string;
  job: {
    title: string;
  };
  status: string;
  createdAt: string;
  testResult?: {
    score: number;
  };
}

export default function EmployerApplicationsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const query = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/employer/applications${query}`);
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      applied:              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      reviewing:            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      test_sent:            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      interview_scheduled:  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      offer_sent:           'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      hired:                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected:             'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const getStatusBorderColor = (status: string) => {
    const borders: Record<string, string> = {
      applied:              'border-l-blue-500',
      reviewing:            'border-l-amber-500',
      test_sent:            'border-l-purple-500',
      interview_scheduled:  'border-l-pink-500',
      offer_sent:           'border-l-orange-500',
      hired:                'border-l-emerald-500',
      rejected:             'border-l-red-400',
    };
    return borders[status] || 'border-l-slate-300';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied:              t('employer_applications.new_applied'),
      reviewing:            t('employer_applications.reviewing'),
      test_sent:            t('employer_applications.test_sent'),
      interview_scheduled:  t('employer_applications.interviewing'),
      offer_sent:           t('employer_applications.offer_sent'),
      hired:                t('employer_applications.hired'),
      rejected:             t('employer_applications.rejected'),
    };
    return labels[status] || status.replace(/_/g, ' ');
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('employer_applications.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{t('employer_applications.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
            {t('employer_applications.subtitle')}
            {applications.length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black">
                {applications.length}
              </span>
            )}
          </p>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-12 px-4 pr-10 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium text-sm outline-none focus:border-blue-500/50 transition-all cursor-pointer shadow-sm appearance-none min-w-48"
        >
          <option value="all">{t('employer_applications.all_statuses')}</option>
          <option value="applied">{t('employer_applications.new_applied')}</option>
          <option value="reviewing">{t('employer_applications.reviewing')}</option>
          <option value="test_sent">{t('employer_applications.test_sent')}</option>
          <option value="interview_scheduled">{t('employer_applications.interviewing')}</option>
          <option value="offer_sent">{t('employer_applications.offer_sent')}</option>
          <option value="hired">{t('employer_applications.hired')}</option>
          <option value="rejected">{t('employer_applications.rejected')}</option>
        </select>
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <Card className="rounded-3xl shadow-xl border-0">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('employer_applications.empty_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{t('employer_applications.no_applications')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card
              key={app.id}
              className={`border-l-4 ${getStatusBorderColor(app.status)} shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-3xl cursor-pointer group`}
              onClick={() => router.push(`/employer/candidates/${app.candidateId}`)}
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                  {/* Candidate info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-blue-400 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                      <span className="text-xl font-black text-white">
                        {app.candidate?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {app.candidate?.name ?? '—'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {t('employer_applications.applied_for')}{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{app.job?.title ?? '—'}</span>
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status & actions */}
                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                      {app.testResult && (
                        <Badge className="text-xs border border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                          {t('employer_applications.test_score')}: {app.testResult.score}%
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-100 dark:border-blue-800 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/employer/candidates/${app.candidateId}`);
                      }}
                    >
                      {t('employer_applications.review_profile')}
                    </Button>
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
