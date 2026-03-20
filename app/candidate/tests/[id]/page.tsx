'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/LanguageContext';
import { MobilePageHeader } from '@/components/mobile/PageHeader';
import ProctorMonitor from '@/components/shared/ProctorMonitor';

interface Question {
  id: string;
  _id?: string; // legacy alias
  question: string;
  options: string[];
  correctAnswer: string;
}

interface TestData {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const { t } = useLanguage();
  
  const [test, setTest] = useState<TestData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const violationsRef = useRef<{ type: string; timestamp: number }[]>([]);

  useEffect(() => {
    if (testId) {
      fetch(`/api/v1/tests/${testId}`)
        .then(res => res.json())
        .then(data => {
          if (data.test) setTest(data.test);
          else setError(data.error || 'Failed to fetch test content');
        })
        .catch(() => setError('An error occurred while loading the test'))
        .finally(() => setIsLoading(false));
    }
  }, [testId]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, violations: violationsRef.current }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ score: data.score, passed: data.passed });
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">{t('candidate_tests.error_loading')}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => router.push('/candidate/tests')}>
              {t('candidate_tests.back_to_tests')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = test.questions;
  const question = questions[currentQuestion];
  const getQId = (q: Question, idx: number) => q.id || q._id || `q-${idx}`;
  const qId = getQId(question, currentQuestion);
  const isComplete = questions.every((q, idx) => !!answers[getQId(q, idx)]);

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <MobilePageHeader
        title={test.title}
        backHref="/candidate/tests"
      />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* Header Card */}
        <Card className="mb-6 border-0 shadow-xl bg-white dark:bg-gray-900">
          <CardHeader className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <Badge variant="info" className="mb-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20">{t('candidate_tests.official_assessment')}</Badge>
              <CardTitle className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {test.title}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                {test.description}
              </CardDescription>
            </div>
            <div className="shrink-0">
              <ProctorMonitor
                onViolation={(v) => { violationsRef.current = v; }}
              />
            </div>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-6">
            <div className="flex items-center justify-between text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              <span>{t('candidate_tests.progress')}: {questions.filter((q, idx) => !!answers[getQId(q, idx)]).length} / {questions.length} {t('candidate_tests.answered')}</span>
              <span>{t('onboarding.question')} {currentQuestion + 1} {t('onboarding.question_of')} {questions.length}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-linear-to-r from-[#0066FF] to-[#00D9A5] h-full transition-all duration-500 rounded-full"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <h3 className="text-xl md:text-2xl font-bold mb-8 text-gray-900 dark:text-white leading-snug">
              {question.question}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(qId, option)}
                  className={`group relative w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all active:scale-[0.98] flex items-center gap-4 ${
                    answers[qId] === option
                      ? 'border-[#0066FF] bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    answers[qId] === option ? 'border-blue-500 bg-blue-500 text-white shadow-lg' : 'border-gray-300 text-gray-400 group-hover:border-blue-300'
                  }`}>
                    {answers[qId] === option ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-bold text-lg md:text-xl leading-tight">{option}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                disabled={currentQuestion === 0}
                className="font-bold h-12"
              >
                {t('onboarding.previous')}
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!isComplete || isSubmitting}
                  isLoading={isSubmitting}
                  className="h-12 px-10 font-black text-lg shadow-xl shadow-blue-500/20 rounded-xl"
                >
                  {t('candidate_tests.submit')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setCurrentQuestion(q => Math.min(questions.length - 1, q + 1))}
                  disabled={!answers[qId]}
                  className="h-12 px-10 font-bold shadow-lg rounded-xl"
                >
                  {t('onboarding.next_question')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* ── Success Modal ── */}
    {result && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" />
        <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* top accent bar */}
          <div className={`h-1.5 w-full ${result.passed ? 'bg-linear-to-r from-[#00D9A5] to-[#0066FF]' : 'bg-linear-to-r from-orange-400 to-rose-500'}`} />

          <div className="p-8 text-center">
            {/* score ring */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                  className="text-gray-100 dark:text-gray-800" />
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" strokeLinecap="round"
                  stroke={result.passed ? '#00D9A5' : '#f97316'}
                  strokeDasharray={`${(result.score / 100) * 326.7} 326.7`}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-black leading-none ${result.passed ? 'text-[#00D9A5]' : 'text-orange-500'}`}>
                  {result.score}%
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Score</span>
              </div>
            </div>

            {/* badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${
              result.passed
                ? 'bg-[#00D9A5]/10 text-[#00D9A5]'
                : 'bg-orange-50 dark:bg-orange-950/30 text-orange-500'
            }`}>
              {result.passed ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
                </svg>
              )}
              {result.passed ? 'Assessment Passed' : 'Below Passing Score'}
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {result.passed ? 'Well done!' : 'Assessment Complete'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
              {result.passed
                ? 'Your result has been recorded and sent to the employer for review.'
                : 'Your submission has been saved. The employer will be in touch with next steps.'}
            </p>

            <Button
              variant="primary"
              className="w-full h-12 rounded-2xl bg-linear-to-r from-[#0066FF] to-[#0052CC] font-black text-sm shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => router.push('/candidate/tests')}
            >
              Back to My Assessments
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* ── Error Modal ── */}
    {submitError && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" onClick={() => setSubmitError('')} />
        <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="h-1.5 w-full bg-linear-to-r from-rose-400 to-rose-600" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Submission Failed</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{submitError}</p>
            <Button
              variant="primary"
              className="w-full h-11 rounded-2xl bg-rose-500 hover:bg-rose-600 font-bold cursor-pointer"
              onClick={() => setSubmitError('')}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
