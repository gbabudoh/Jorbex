'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/LanguageContext';

interface Question {
  _id: string; // From custom tests
  id?: string; // From onboarding
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
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Test submitted! You scored ${data.score}%.`);
        router.push('/candidate/tests');
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch {
      alert('An error occurred during submission');
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
  const qId = question._id || question.id || `q-${currentQuestion}`;
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Card */}
        <Card className="mb-6 border-0 shadow-xl bg-white dark:bg-gray-900">
          <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between">
            <div className="min-w-0">
              <Badge variant="info" className="mb-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20">{t('candidate_tests.official_assessment')}</Badge>
              <CardTitle className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {test.title}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                {test.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-6">
            <div className="flex items-center justify-between text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              <span>{t('candidate_tests.progress')}: {answeredCount} / {questions.length} {t('candidate_tests.answered')}</span>
              <span>{t('onboarding.question')} {currentQuestion + 1} {t('onboarding.question_of')} {questions.length}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#0066FF] to-[#00D9A5] h-full transition-all duration-500 rounded-full"
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
  );
}
