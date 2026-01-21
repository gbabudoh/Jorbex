'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Notification } from '@/components/ui/Notification';
import { useLanguage } from '@/lib/LanguageContext';
import Image from 'next/image';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary: string;
  employerId: {
    _id: string;
    companyName: string;
    industry: string;
    logo?: string;
    description?: string;
  };
  createdAt: string;
}

export default function JobDetailsPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' } | null>(null);

  const fetchJobDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/candidate/jobs/${id}`);
      const data = await res.json();
      if (res.ok) {
        setJob(data.job);
        setHasApplied(data.hasApplied);
      } else {
        setNotification({ isOpen: true, message: data.error || t('jobs.loading_details_error'), type: 'error' });
        setTimeout(() => router.push('/candidate/jobs'), 2000);
      }
    } catch (error) {
      console.error('Fetch Job Details Error:', error);
      setNotification({ isOpen: true, message: t('login.error_generic'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, router, t]);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id, fetchJobDetails]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ isOpen: true, message: t('jobs.apply_success'), type: 'success' });
        setHasApplied(true);
      } else {
        setNotification({ isOpen: true, message: data.error || t('jobs.error'), type: 'error' });
      }
    } catch (error) {
      console.error('Apply Error:', error);
      setNotification({ isOpen: true, message: t('login.error_generic'), type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-gray-500">{t('jobs.loading_details')}</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6 hover:bg-gray-100"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('jobs.back_to_search')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="info" className="px-3 py-1">
                      {job.type}
                    </Badge>
                    <Badge variant="success" className="px-3 py-1">
                      {job.location}
                    </Badge>
                    {job.salary && (
                      <span className="text-gray-600 font-medium flex items-center">
                        <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">{t('jobs.description')}</h4>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('jobs.about_company')}</h4>
                <div className="flex items-center gap-4 mb-4">
                  {job.employerId.logo ? (
                    <Image 
                      src={job.employerId.logo} 
                      alt={job.employerId.companyName} 
                      width={48}
                      height={48}
                      className="rounded-lg object-cover bg-gray-50 border border-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      {job.employerId.companyName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{job.employerId.companyName}</h3>
                    <p className="text-sm text-gray-500">{job.employerId.industry}</p>
                  </div>
                </div>
                {job.employerId.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 italic">
                    &quot;{job.employerId.description}&quot;
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <Button 
                  className="w-full h-12 text-base font-semibold"
                  disabled={hasApplied || applying}
                  onClick={handleApply}
                >
                  {applying ? t('jobs.submitting') : hasApplied ? t('jobs.already_applied') : t('jobs.apply_now')}
                </Button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  {t('jobs.posted_on')} {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
