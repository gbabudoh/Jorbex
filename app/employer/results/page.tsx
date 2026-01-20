'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TestResult {
  _id: string;
  candidateId: {
    name: string;
    email: string;
    expertise: string;
  };
  testId: {
    title: string;
    description: string;
  };
  score: number;
  passed: boolean;
  completedAt: string;
}

export default function ResultsBucketPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/v1/tests/results/employer');
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">
            Completed Assessments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Review performance and results of sent tests
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="info" className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            {results.length} Submissions
          </Badge>
        </div>
      </div>

      {results.length === 0 ? (
        <Card className="rounded-[2.5rem] border-0 shadow-2xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="py-24 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No results yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
              Once candidates complete the assessments you&apos;ve sent, their scores and details will appear here.
            </p>
            <Link href="/employer/tests">
              <Button className="h-14 px-10 rounded-2xl font-black bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                Go to Test Builder
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
          {results.map((result, index) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={result._id}
            >
              <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-white/5 h-full">
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${result.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <CardHeader className="pb-3 pl-6 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`px-3 py-0.5 rounded-full font-black text-[9px] uppercase tracking-widest ${
                      result.passed 
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      {new Date(result.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg font-black text-slate-400 dark:text-slate-500 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {result.candidateId.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {result.candidateId.name}
                      </h3>
                      <p className="text-sm font-bold text-blue-500 dark:text-blue-400 truncate opacity-80 uppercase tracking-tight">
                        {result.candidateId.expertise}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pl-6 pr-6 pb-6 pt-0">
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3 mb-4 border border-slate-100 dark:border-white/5">
                    <p className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 mb-0.5 tracking-tighter">Assessment</p>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm leading-tight line-clamp-1">
                      {result.testId.title}
                    </h4>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-tighter mb-0.5">Score</span>
                      <span className={`text-2xl font-black leading-none ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {result.score}%
                      </span>
                    </div>
                    
                    <Link href={`/employer/results/${result._id}`} className="flex-1 max-w-[110px]">
                      <Button variant="outline" className="w-full h-9 rounded-lg text-xs font-black border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all group/btn">
                        Report
                        <svg className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
