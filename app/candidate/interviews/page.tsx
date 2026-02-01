'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/LanguageContext';

interface Interview {
  _id: string;
  employerId: {
    _id: string;
    name: string;
    companyName: string;
  };
  dateTime: string;
  type: 'virtual' | 'physical';
  location: string;
  meetingUrl?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
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
  };

  const upcomingInterviews = interviews.filter(i => new Date(i.dateTime) > new Date() && i.status !== 'cancelled');
  const pastInterviews = interviews.filter(i => new Date(i.dateTime) <= new Date() || i.status === 'cancelled');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            {t('interviews.candidate_title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('interviews.candidate_subtitle')}</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Upcoming Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold">{t('interviews.upcoming_interviews')}</h2>
            <Badge variant="info" className="rounded-full px-2">{upcomingInterviews.length}</Badge>
          </div>
          
          {upcomingInterviews.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>{t('interviews.no_upcoming_scheduled')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingInterviews.map((interview) => (
                <InterviewCard key={interview._id} interview={interview} isUpcoming={true} />
              ))}
            </div>
          )}
        </section>

        {/* Past Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">{t('interviews.past_cancelled')}</h2>
          </div>
          
          {pastInterviews.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('interviews.no_past_history')}</p>
          ) : (
            <div className="space-y-4">
              {pastInterviews.map((interview) => (
                <InterviewCard key={interview._id} interview={interview} isUpcoming={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InterviewCard({ interview, isUpcoming }: { interview: Interview; isUpcoming: boolean }) {
  const { t } = useLanguage();
  const date = new Date(interview.dateTime);
  const isVirtual = interview.type === 'virtual';

  const badgeVariant = interview.status === 'cancelled' ? 'error' : interview.status === 'completed' ? 'success' : 'info';

  const formatInterviewDate = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const formatInterviewTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <Card hover className={`overflow-hidden transition-all duration-300 ${!isUpcoming ? 'opacity-70 saturate-50' : 'ring-1 ring-black/5 hover:ring-blue-100 dark:ring-white/5 dark:hover:ring-blue-900/30'}`}>
      <div className={`h-1.5 w-full ${isVirtual ? 'bg-blue-500' : 'bg-emerald-500'} ${!isUpcoming && 'bg-gray-400'}`} />
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <Badge variant={badgeVariant} className="mb-2">
            {interview.status.toUpperCase()}
          </Badge>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatInterviewDate(date)}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {formatInterviewTime(date)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{interview.employerId?.name}</CardTitle>
            <CardDescription className="truncate">{interview.employerId?.companyName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            {isVirtual ? (
              <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold uppercase text-gray-400 block mb-0.5">
                {isVirtual ? t('interviews.interview') : t('interviews.physical_location')}
              </span>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 break-all line-clamp-2">
                {isVirtual ? t('interviews.video_interview') : interview.location}
              </p>
            </div>
          </div>
        </div>

        {interview.notes && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">{t('interviews.notes_from_employer')}</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">&quot;{interview.notes}&quot;</p>
          </div>
        )}

        {isUpcoming && interview.status !== 'cancelled' && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            {isVirtual && interview.meetingUrl ? (
              <a 
                href={interview.meetingUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-blue-500 focus:ring-blue-600"
              >
                {t('interviews.join_meeting')}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : !isVirtual ? (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(interview.location)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-emerald-600 to-emerald-500 focus:ring-emerald-600"
              >
                {t('interviews.get_directions')}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
