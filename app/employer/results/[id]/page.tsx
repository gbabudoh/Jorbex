'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ResultData {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email: string;
    expertise: string;
  };
  testId: {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
  };
  score: number;
  passed: boolean;
  answers: Answer[];
  completedAt: string;
}

export default function ResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params.id as string;
  
  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resultId) {
      fetch(`/api/v1/tests/results/${resultId}`)
        .then(res => res.json())
        .then(data => {
          if (data.result) setResult(data.result);
          else setError(data.error || 'Failed to fetch result details');
        })
        .catch(() => setError('An error occurred while loading the report'))
        .finally(() => setIsLoading(false));
    }
  }, [resultId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <Card className="rounded-[2.5rem] border-0 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <CardContent className="py-16">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Report Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{error || 'The requested test report could not be found.'}</p>
            <Button variant="primary" onClick={() => router.push('/employer/results')} className="rounded-2xl h-12 px-8 font-black">
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl min-h-screen pb-32">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <button 
            onClick={() => router.push('/employer/results')}
            className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest mb-4 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Results
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Assessment <span className="text-[#0066FF] italic">Report</span>
          </h1>
        </div>

        <Badge variant={result.passed ? 'success' : 'error'} 
          className={`px-8 py-3 rounded-2xl text-sm font-black tracking-[0.2em] shadow-lg ${
            result.passed 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-rose-500 text-white shadow-rose-500/20'
          }`}>
          {result.passed ? 'PASSED' : 'FAILED'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Candidate & Test Summary */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="rounded-[2.5rem] border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-100 dark:border-white/5 overflow-hidden">
            <div className={`h-3 w-full ${result.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-500/20 mb-6">
                  {result.candidateId.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{result.candidateId.name}</h2>
                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs mb-4">{result.candidateId.expertise}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{result.candidateId.email}</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Assessment</p>
                  <p className="font-bold text-slate-900 dark:text-white">{result.testId.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Score</p>
                    <p className={`text-2xl font-black ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>{result.score}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Required</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">70%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-0 shadow-xl bg-slate-900 dark:bg-black text-white overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Summary
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The candidate has completed the assessment for <span className="text-white font-bold">{result.testId.title}</span>. 
                Based on the score of {result.score}%, they have {result.passed ? 'successfully met' : 'not met'} the required proficiency standards.
              </p>
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Completed: {new Date(result.completedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Questions Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 px-2">
            Question Analytics
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0">{result.answers.length} Total</Badge>
          </h2>

          <div className="space-y-6">
            {result.testId.questions.map((q, idx) => {
              const answer = result.answers.find(a => a.questionId === q._id);
              return (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={q._id}
                >
                  <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="p-6 md:p-8 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-400 shrink-0">
                          {idx + 1}
                        </span>
                        <Badge className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          answer?.isCorrect 
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        }`}>
                          {answer?.isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold mt-4 leading-snug">
                        {q.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {q.options.map((option, oIdx) => {
                          const isSelected = answer?.selectedAnswer === option;
                          const isCorrect = q.correctAnswer === option;
                          
                          let bgClass = "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-white/5";
                          let textClass = "text-slate-600 dark:text-slate-400";
                          
                          if (isSelected && isCorrect) {
                            bgClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 ring-1 ring-emerald-500/20";
                            textClass = "text-emerald-700 dark:text-emerald-400 font-bold";
                          } else if (isSelected && !isCorrect) {
                            bgClass = "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 ring-1 ring-rose-500/20";
                            textClass = "text-rose-700 dark:text-rose-400 font-bold";
                          } else if (!isSelected && isCorrect) {
                            bgClass = "bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 border-dashed";
                            textClass = "text-emerald-600/70 dark:text-emerald-500/70";
                          }

                          return (
                            <div 
                              key={oIdx}
                              className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${bgClass}`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                isSelected ? 'border-current' : 'border-slate-300 dark:border-slate-700'
                              }`}>
                                {isSelected && (
                                  <div className="w-3 h-3 rounded-full bg-current" />
                                )}
                              </div>
                              <span className={`text-sm ${textClass}`}>{option}</span>
                              {isCorrect && (
                                <svg className="w-4 h-4 text-emerald-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
