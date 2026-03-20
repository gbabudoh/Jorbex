'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  status: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { applications: number };
}

export default function EmployerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/employer/jobs/${id}`);
        if (!res.ok) {
          setError('Job not found.');
          return;
        }
        const data = await res.json();
        setJob(data.job);
      } catch {
        setError('Failed to load job.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  const getStatusVariant = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'success' as const;
    if (s === 'closed') return 'error' as const;
    return 'warning' as const;
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'Active';
    if (s === 'closed') return 'Closed';
    return 'Draft';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <p className="text-gray-500 mb-6">{error || 'Job not found.'}</p>
        <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">Go back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </button>

      {/* Header card */}
      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden mb-6">
        <div className="h-2 bg-gradient-to-r from-[#0066FF] to-[#00D9A5]" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{job.title}</h1>
                <Badge variant={getStatusVariant(job.status)}>{getStatusLabel(job.status)}</Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                )}
                {job.type && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {job.type}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Posted {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 shrink-0">
              <div className="text-center px-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900">
                <p className="text-2xl font-black text-[#0066FF]">{job._count?.applications ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Applicants</p>
              </div>
            </div>
          </div>

          {/* Salary */}
          {(job.salaryMin || job.salaryMax) && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {job.currency ?? 'USD'}{' '}
                {job.salaryMin && job.salaryMax
                  ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
                  : job.salaryMin
                  ? `From ${job.salaryMin.toLocaleString()}`
                  : `Up to ${job.salaryMax!.toLocaleString()}`}
              </span>
              <span className="text-gray-400">/ year</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="border-0 shadow-lg rounded-3xl mb-6">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            Job Description
          </h2>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {job.description || <span className="text-gray-400 italic">No description provided.</span>}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/employer/applications?jobId=${job.id}`}>
          <Button variant="primary" className="rounded-xl font-bold px-6 cursor-pointer">
            View Applications ({job._count?.applications ?? 0})
          </Button>
        </Link>
        <Link href="/employer/jobs">
          <Button variant="outline" className="rounded-xl font-bold cursor-pointer">
            All Jobs
          </Button>
        </Link>
      </div>
    </div>
  );
}
