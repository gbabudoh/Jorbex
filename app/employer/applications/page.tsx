"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/LanguageContext';

interface Application {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email: string;
    headshot?: string;
  };
  jobId: {
    _id: string;
    title: string;
  };
  status: string;
  createdAt: string;
  testResultId?: {
    score: number;
    status: string;
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

  const statusColors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-yellow-100 text-yellow-800',
    test_sent: 'bg-purple-100 text-purple-800',
    interview_scheduled: 'bg-pink-100 text-pink-800',
    offer_sent: 'bg-orange-100 text-orange-800',
    hired: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  if (loading && applications.length === 0) {
    return <div className="p-8 text-center">{t('employer_applications.loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('employer_applications.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('employer_applications.subtitle')}</p>
        </div>
        
        <div className="w-full md:w-48">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      <div className="grid gap-4">
        {applications.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            {t('employer_applications.no_applications')}
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/employer/candidates/${app.candidateId._id}`)}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Candidate Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {app.candidateId.headshot ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={app.candidateId.headshot} alt={app.candidateId.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-gray-500">{app.candidateId.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                        {app.candidateId.name}
                      </h3>
                      <p className="text-sm text-gray-500">{t('employer_applications.applied_for')} <span className="font-medium text-gray-700 dark:text-gray-300">{app.jobId.title}</span></p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <Badge className={`${statusColors[app.status] || 'bg-gray-100'} px-3 py-1 capitalize`}>
                      {app.status.replace('_', ' ')}
                    </Badge>
                    
                    {app.testResultId && (
                      <Badge variant="default" className="text-xs border border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {t('employer_applications.test_score')}: {app.testResultId.score}%
                      </Badge>
                    )}
                    
                    <div className="flex gap-2 mt-2 w-full md:w-auto">
                      <Button size="sm" variant="outline" className="flex-1 md:flex-none" onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/employer/candidates/${app.candidateId._id}`);
                      }}>
                        {t('employer_applications.review_profile')}
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none" onClick={(e) => {
                        e.stopPropagation();
                        // Open message modal (future implementation)
                      }}>
                        {t('employer_applications.message')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
