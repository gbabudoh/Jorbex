'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Test {
  _id: string;
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

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/v1/tests/assigned');
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
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
            Assigned <span className="text-[#0066FF]">Tests</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
            Complete these tests to showcase your skills to employers
          </p>
        </div>

        {tests.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No tests assigned yet.</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map((test) => (
              <Card key={test._id} className="group relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border-b-4 border-transparent hover:border-[#0066FF]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/5 to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#0066FF]/10 transition-colors" />
                
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#0066FF] group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {test.completed ? (
                      <Badge variant="success" className="bg-[#00D9A5]/10 text-[#00D9A5] border-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="bg-orange-500/10 text-orange-500 border-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#0066FF] transition-colors line-clamp-1">{test.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                    {test.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Questions</span>
                      </div>
                      <span className="text-lg font-black text-gray-900 dark:text-white">{test.questions?.length || 0} <span className="text-xs font-normal text-gray-400">items</span></span>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duration</span>
                      </div>
                      <span className="text-lg font-black text-gray-900 dark:text-white">{test.timeLimit || 30} <span className="text-xs font-normal text-gray-400">min</span></span>
                    </div>
                  </div>

                  {test.completed ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#00D9A5]/5 border border-[#00D9A5]/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#00D9A5]/10 flex items-center justify-center text-[#00D9A5]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-500">Your Score</p>
                            <p className="text-xl font-black text-[#00D9A5] leading-none">{test.score}%</p>
                          </div>
                        </div>
                        <div className="h-10 w-px bg-[#00D9A5]/20 mx-2 hidden sm:block"></div>
                        <Button variant="ghost" className="text-[#00D9A5] hover:bg-[#00D9A5]/10 hidden sm:flex font-bold" disabled>
                          View Results
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/candidate/tests/${test._id}`}>
                      <Button 
                        variant="primary" 
                        className="w-full py-7 rounded-2xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 font-black text-sm uppercase tracking-widest group/btn overflow-hidden relative"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Take Assessment
                          <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
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
