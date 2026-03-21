'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

interface Test {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  questions?: unknown[];
  score?: number;
  timeLimit?: number;
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/v1/tests/assigned');
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      } else {
        const data = await response.json().catch(() => ({}));
        setApiError(data.error || `Error ${response.status}`);
        console.error('Failed to fetch tests:', response.status, data);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setApiError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-blue-50 border-t-[#0066FF] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-8 w-8 rounded-full bg-blue-50"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('candidate_tests.title').split(' ')[0]} <span className="text-[#0066FF]">{t('candidate_tests.title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
            {t('candidate_tests.subtitle')}
          </p>
        </div>

        {apiError ? (
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <p className="text-red-500 font-medium">{apiError}</p>
            </CardContent>
          </Card>
        ) : tests.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">{t('candidate_tests.no_tests')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('candidate_tests.check_back')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="group relative border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                <CardContent className="p-4">
                  {/* Top row: icon + title + badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#0066FF] shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{test.title}</p>
                      <p className="text-xs text-gray-400 truncate">{test.description}</p>
                    </div>
                    {test.completed ? (
                      <Badge variant="success" className="bg-[#00D9A5]/10 text-[#00D9A5] border-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0">
                        {t('candidate_tests.completed')}
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="bg-orange-500/10 text-orange-500 border-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide animate-pulse shrink-0">
                        {t('candidate_tests.pending')}
                      </Badge>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{test.questions?.length || 0}</span> {t('candidate_tests.items')}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{test.timeLimit || 30}</span> {t('candidate_tests.min')}
                    </span>
                    {test.completed && (
                      <span className="flex items-center gap-1 ml-auto font-black text-[#00D9A5]">
                        {test.score}%
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  {test.completed ? (
                    <Button variant="ghost" size="sm" className="w-full text-[#00D9A5] hover:bg-[#00D9A5]/10 font-bold text-xs h-8 rounded-xl" disabled>
                      {t('candidate_tests.view_results')}
                    </Button>
                  ) : (
                    <Link href={`/candidate/tests/${test.id}`}>
                      <Button variant="primary" size="sm" className="w-full bg-[#0066FF] hover:bg-[#0052CC] font-bold text-xs h-8 rounded-xl cursor-pointer">
                        {t('candidate_tests.take_assessment')}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
