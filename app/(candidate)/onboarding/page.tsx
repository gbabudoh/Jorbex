'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

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
    } catch (error) {
      console.error('Failed to fetch test:', error);
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
      console.log('Submitting test with answers:', answers);
      console.log('Total answers:', Object.keys(answers).length);
      
      const response = await fetch('/api/v1/tests/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
        }),
      });

      const data = await response.json();
      console.log('Test submission response:', data);

      if (!response.ok) {
        console.error('Test submission failed:', data);
        alert(`Error: ${data.error || 'Failed to submit test'}`);
        return;
      }

      if (data.passed) {
        alert(`Congratulations! You passed with ${data.score}%`);
        router.push('/candidate/profile');
      } else {
        alert(`Test failed. You scored ${data.score}%. You need at least 70% to pass.`);
        router.push('/');
      }
    } catch (error) {
      console.error('Test submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No test available. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredQuestions = Object.keys(answers).length;
  const allAnswered = answeredQuestions === questions.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Logical Aptitude Test</CardTitle>
              <CardDescription>
                Answer all 10 questions correctly. You need at least 7 correct answers (70%) to pass.
              </CardDescription>
            </div>
            <Badge variant={timeRemaining < 60 ? 'error' : 'info'}>
              Time: {formatTime(timeRemaining)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress: {answeredQuestions} / {questions.length}</span>
              <span>Question {currentQuestion + 1} of {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#0066FF] to-[#00D9A5] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  answers[question.id] === option
                    ? 'border-[#0066FF] bg-[#0066FF]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#0066FF]/50'
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
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
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

