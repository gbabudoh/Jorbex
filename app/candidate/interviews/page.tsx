'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/LanguageContext';

interface Interview {
  id: string;
  _id?: string;
  employerId: {
    id: string;
    _id?: string;
    name: string;
    companyName: string;
  };
  dateTime: string;
  type: 'virtual' | 'physical' | 'VIRTUAL' | 'PHYSICAL';
  location: string;
  meetingUrl?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  candidateArchivedAt?: string | null;
}

type Tab = 'upcoming' | 'past' | 'archived';

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [archived, setArchived] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { t } = useLanguage();

  const fetchInterviews = useCallback(async () => {
    try {
      const [mainRes, archiveRes] = await Promise.all([
        fetch('/api/v1/interviews'),
        fetch('/api/v1/interviews/archived'),
      ]);
      if (mainRes.ok) {
        const data = await mainRes.json();
        setInterviews(data.interviews || []);
      }
      if (archiveRes.ok) {
        const data = await archiveRes.json();
        setArchived(data.interviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const handleAction = async (id: string, action: 'archive' | 'remove') => {
    setActionLoading(`${id}-${action}`);
    try {
      const res = await fetch(`/api/v1/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) await fetchInterviews();
    } finally {
      setActionLoading(null);
    }
  };

  // Filter out removed and archived from main list
  const visible = interviews.filter(i => !i.candidateArchivedAt);
  const upcomingInterviews = visible.filter(i =>
    new Date(i.dateTime) > new Date() && i.status?.toLowerCase() !== 'cancelled'
  );
  const pastInterviews = visible.filter(i =>
    new Date(i.dateTime) <= new Date() || i.status?.toLowerCase() === 'cancelled'
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          {t('interviews.candidate_title')}
        </h1>
        <p className="text-gray-500 mt-1">{t('interviews.candidate_subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-800">
        {([
          { key: 'upcoming', label: t('interviews.upcoming_interviews'), count: upcomingInterviews.length },
          { key: 'past',     label: t('interviews.past_cancelled'),      count: pastInterviews.length },
          { key: 'archived', label: 'Archived',                          count: archived.length },
        ] as { key: Tab; label: string; count: number }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-[#0066FF] text-[#0066FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.key
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        upcomingInterviews.length === 0 ? (
          <EmptyState message={t('interviews.no_upcoming_scheduled')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingInterviews.map((interview, i) => (
              <InterviewCard key={interview.id || `u-${i}`} interview={interview} isUpcoming={true} />
            ))}
          </div>
        )
      )}

      {/* Past Tab */}
      {activeTab === 'past' && (
        pastInterviews.length === 0 ? (
          <EmptyState message={t('interviews.no_past_history')} />
        ) : (
          <div className="space-y-4">
            {pastInterviews.map((interview, i) => (
              <InterviewCard
                key={interview.id || `p-${i}`}
                interview={interview}
                isUpcoming={false}
                onArchive={() => handleAction(interview.id, 'archive')}
                onRemove={() => handleAction(interview.id, 'remove')}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )
      )}

      {/* Archived Tab */}
      {activeTab === 'archived' && (
        archived.length === 0 ? (
          <EmptyState message="No archived interviews. Archived items are kept for 30 days." />
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 mb-4">Archived interviews are automatically deleted after 30 days.</p>
            {archived.map((interview, i) => (
              <InterviewCard
                key={interview.id || `a-${i}`}
                interview={interview}
                isUpcoming={false}
                isArchived={true}
                onRemove={() => handleAction(interview.id, 'remove')}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-12 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>{message}</p>
      </CardContent>
    </Card>
  );
}

function InterviewCard({
  interview,
  isUpcoming,
  isArchived = false,
  onArchive,
  onRemove,
  actionLoading,
}: {
  interview: Interview;
  isUpcoming: boolean;
  isArchived?: boolean;
  onArchive?: () => void;
  onRemove?: () => void;
  actionLoading?: string | null;
}) {
  const { t } = useLanguage();
  const date = new Date(interview.dateTime);
  const isVirtual = interview.type?.toLowerCase() === 'virtual';
  const status = interview.status?.toLowerCase();

  const badgeVariant = status === 'cancelled' ? 'error' : status === 'completed' ? 'success' : 'info';

  const formatDate = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const archivingThis = actionLoading === `${interview.id}-archive`;
  const removingThis  = actionLoading === `${interview.id}-remove`;

  // Days remaining in archive
  const daysLeft = isArchived && interview.candidateArchivedAt
    ? Math.max(0, 30 - Math.floor((Date.now() - new Date(interview.candidateArchivedAt).getTime()) / 86400000))
    : null;

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${!isUpcoming ? 'opacity-70 saturate-50' : 'ring-1 ring-black/5 hover:ring-blue-100 dark:ring-white/5 dark:hover:ring-blue-900/30'}`}>
      <div className={`h-1.5 w-full ${isUpcoming ? (isVirtual ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-gray-400'}`} />
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant}>{interview.status?.toUpperCase()}</Badge>
            {isArchived && daysLeft !== null && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                {daysLeft}d left
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(date)}</span>
            <span className="text-xs text-gray-500 font-medium">{formatTime(date)}</span>
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
        <div className="flex items-start gap-2.5">
          {isVirtual ? (
            <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

        {interview.notes && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">{t('interviews.notes_from_employer')}</span>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">&quot;{interview.notes}&quot;</p>
          </div>
        )}

        {/* Join/Directions button for upcoming */}
        {isUpcoming && status !== 'cancelled' && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            {isVirtual && interview.meetingUrl ? (
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white rounded-xl bg-linear-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
                className="cursor-pointer inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {t('interviews.get_directions')}
              </a>
            ) : null}
          </div>
        )}

        {/* Archive / Remove actions for past & archived */}
        {(onArchive || onRemove) && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            {onArchive && !isArchived && (
              <Button
                variant="outline"
                size="sm"
                onClick={onArchive}
                isLoading={archivingThis}
                className="cursor-pointer flex-1 text-xs"
              >
                Archive
              </Button>
            )}
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRemove}
                isLoading={removingThis}
                className="cursor-pointer flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/20"
              >
                Remove
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
