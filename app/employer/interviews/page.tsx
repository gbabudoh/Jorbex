'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/LanguageContext';

interface Interview {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    expertise?: string;
  };
  jobId?: {
    _id: string;
    title: string;
  };
  jobTitle?: string;
  dateTime: string;
  duration: number;
  type: 'virtual' | 'physical';
  location: string;
  meetingUrl?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
}

export default function EmployerInterviewsPage() {
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const fetchInterviews = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/interviews');
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const now = new Date();
  const upcomingInterviews = interviews.filter(
    i => new Date(i.dateTime) > now && !['cancelled', 'completed', 'no_show'].includes(i.status)
  );
  const pastInterviews = interviews.filter(
    i => new Date(i.dateTime) <= now || ['cancelled', 'completed', 'no_show'].includes(i.status)
  );

  const displayedInterviews = activeTab === 'upcoming' ? upcomingInterviews : pastInterviews;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t('interviews.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('interviews.subtitle')}</p>
        </div>
        <Link href="/employer/search">
          <Button variant="primary" className="cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t('interviews.find_candidates')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('interviews.upcoming')}  value={upcomingInterviews.length}                                          color="purple" />
        <StatCard label={t('interviews.status_confirmed')} value={interviews.filter(i => i.status === 'confirmed').length}    color="green" />
        <StatCard label={t('interviews.completed')}  value={interviews.filter(i => i.status === 'completed').length}          color="blue" />
        <StatCard label={t('interviews.cancelled')}  value={interviews.filter(i => i.status === 'cancelled').length}          color="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-[#0066FF] text-[#0066FF]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('interviews.upcoming')} ({upcomingInterviews.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'border-[#0066FF] text-[#0066FF]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('interviews.past')} ({pastInterviews.length})
        </button>
      </div>

      {/* Interview Grid */}
      {displayedInterviews.length === 0 ? (
        <Card className="border-dashed border-2 rounded-3xl shadow-none">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {activeTab === 'upcoming' ? t('interviews.no_upcoming') : t('interviews.no_past')}
            </h3>
            {activeTab === 'upcoming' && (
              <Link href="/employer/search" className="mt-4 inline-block">
                <Button variant="outline" className="cursor-pointer rounded-xl font-bold">
                  {t('interviews.schedule_first')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedInterviews.map((interview) => (
            <InterviewCard key={interview._id} interview={interview} isUpcoming={activeTab === 'upcoming'} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400',
    green:  'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    red:    'from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400',
    blue:   'from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className={`bg-linear-to-br ${colorClasses[color]} rounded-2xl p-4 text-center shadow-sm`}>
      <p className="text-3xl font-black mb-1">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

function InterviewCard({ interview, isUpcoming }: { interview: Interview; isUpcoming: boolean }) {
  const { t } = useLanguage();
  const date = new Date(interview.dateTime);
  const isVirtual = interview.type?.toLowerCase() === 'virtual' || interview.location?.toLowerCase().includes('video interview');
  const positionTitle = interview.jobId?.title || interview.jobTitle || t('interviews.general_interview');

  const statusConfig: Record<string, { variant: 'success' | 'error' | 'warning' | 'info'; label: string }> = {
    pending:              { variant: 'warning', label: t('interviews.status_pending') },
    confirmed:            { variant: 'info',    label: t('interviews.status_confirmed') },
    in_progress:          { variant: 'info',    label: t('interviews.status_in_progress') },
    completed:            { variant: 'success', label: t('interviews.status_completed') },
    cancelled:            { variant: 'error',   label: t('interviews.status_cancelled') },
    no_show:              { variant: 'error',   label: t('interviews.status_no_show') },
    rescheduled:          { variant: 'warning', label: t('interviews.status_rescheduled') },
  };

  const { variant, label } = statusConfig[interview.status] || { variant: 'info', label: interview.status };

  return (
    <Card className={`overflow-hidden transition-shadow duration-200 rounded-3xl shadow-lg hover:shadow-xl ${!isUpcoming ? 'opacity-60' : ''}`}>
      <div className={`h-1.5 w-full ${isVirtual ? 'bg-purple-500' : 'bg-emerald-500'}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={variant}>{label}</Badge>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Candidate Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-purple-500/20">
            {interview.candidateId?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">{interview.candidateId?.name || t('interviews.unknown_candidate')}</CardTitle>
            <CardDescription className="truncate text-xs">{positionTitle}</CardDescription>
          </div>
        </div>

        {/* Location/Meeting */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {isVirtual ? (
            <svg className="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <span className="truncate">{isVirtual ? t('interviews.video_interview') : interview.location}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{interview.duration || 30} {t('interviews.minutes')}</span>
        </div>

        {/* Actions */}
        {isUpcoming && interview.status !== 'cancelled' && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            {isVirtual ? (
              interview.meetingUrl && interview.meetingUrl.trim() !== '' ? (
                <a
                  href={interview.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all"
                >
                  {t('interviews.join_meeting')}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <Link
                  href={`/interview/${interview._id}`}
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all"
                >
                  {t('interviews.start_interview')}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Link>
              )
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(interview.location || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                {t('interviews.get_directions')}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
