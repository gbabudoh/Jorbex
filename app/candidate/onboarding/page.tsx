'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/LanguageContext';
import TestResultModal from '@/components/shared/TestResultModal';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { status } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState({ score: 0, passed: false });

  useEffect(() => {
    fetchOnboardingTest();
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const fetchOnboardingTest = async () => {
    try {
      const response = await fetch('/api/v1/tests/onboarding');
      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
      }
    } catch (_error) {
      console.error('Failed to fetch test:', _error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/tests/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          score: data.score,
          passed: data.passed
        });
        setShowResultModal(true);
      } else {
        alert(data.error || 'An error occurred while submitting your test.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalAction = () => {
    if (testResult.passed) {
      router.push('/candidate/profile');
    } else {
      // Reset test
      setShowResultModal(false);
      setCurrentQuestion(0);
      setAnswers({});
      setTimeRemaining(600);
      window.scrollTo(0, 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/candidate/onboarding');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-800">
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No test available. Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!questions[currentQuestion]) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-800">
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredQuestions = Object.keys(answers).length;
  const allAnswered = answeredQuestions === questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/10 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/10 pb-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg md:text-2xl truncate">Logical Aptitude Test</CardTitle>
              <CardDescription className="text-xs md:text-sm mt-1 line-clamp-1 md:line-clamp-none">
                {t('onboarding.test_desc') || 'Answer all 10 questions correctly. Score 70% to pass.'}
              </CardDescription>
            </div>
            <Badge variant={timeRemaining < 60 ? 'error' : 'info'} className="shrink-0 text-[10px] md:text-xs px-2 py-1 h-fit">
              <span className="md:inline hidden mr-1">Time:</span> {formatTime(timeRemaining)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 md:mb-4">
            <div className="flex justify-between text-[11px] md:text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{answeredQuestions} / {questions.length} Answered</span>
              <span>Q{currentQuestion + 1} of {questions.length}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 md:h-2">
              <div
                className="bg-gradient-to-r from-[#0066FF] to-[#00D9A5] h-1.5 md:h-2 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:py-8">
          <h3 className="text-lg md:text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer ${
                  answers[question.id] === option
                    ? 'border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF] ring-2 ring-[#0066FF]/10'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[#0066FF]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    answers[question.id] === option ? 'border-[#0066FF] bg-[#0066FF]' : 'border-gray-300'
                  }`}>
                    {answers[question.id] === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-semibold text-[15px] md:text-base leading-snug">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                isLoading={isSubmitting}
              >
                Submit Test
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!answers[question.id]}
                className="cursor-pointer"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 md:hidden z-50">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 h-12 rounded-xl font-bold"
          >
            Back
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              isLoading={isSubmitting}
              className="flex-[2] h-12 rounded-xl font-bold bg-gradient-to-r from-[#0066FF] to-[#0052CC]"
            >
              Submit Test
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!answers[question.id]}
              className="flex-[2] h-12 rounded-xl font-bold bg-gradient-to-r from-[#0066FF] to-[#0052CC] cursor-pointer"
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
      </div>

      <TestResultModal 
        isOpen={showResultModal}
        score={testResult.score}
        passed={testResult.passed}
        onAction={handleModalAction}
      />
    </div>
  );
}

