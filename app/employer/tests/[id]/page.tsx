'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface TestData {
  _id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit?: number;
  questions: Question[];
  isActive: boolean;
}

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [test, setTest] = useState<TestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (testId) {
      fetch(`/api/v1/tests/${testId}`)
        .then(res => res.json())
        .then(data => {
          if (data.test) setTest(data.test);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [testId]);

  const addQuestion = () => {
    if (!test) return;
    setTest({
      ...test,
      questions: [...test.questions, { question: '', options: ['', ''], correctAnswer: '' }]
    });
  };

  const removeQuestion = (index: number) => {
    if (!test || test.questions.length <= 1) return;
    const newQuestions = [...test.questions];
    newQuestions.splice(index, 1);
    setTest({ ...test, questions: newQuestions });
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | string[]) => {
    if (!test) return;
    const newQuestions = [...test.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value } as Question;
    setTest({ ...test, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
      });

      if (response.ok) {
        router.push('/employer/tests');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update test');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await fetch(`/api/v1/tests/${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/employer/tests');
        router.refresh();
      }
    } catch {
      alert('Failed to delete test');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (!test) return <div className="p-8 text-center">Test not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full w-10 h-10 p-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Test</h1>
            <p className="text-gray-500">Modify your assessment details</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleDelete} className="text-red-500 hover:bg-red-50">
          Delete Test
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Same form structure as create page but with test data */}
        <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
          <div className="h-2 w-full bg-[#0066FF]" />
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-xl font-bold">General Information</CardTitle>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Test Title</label>
                <Input 
                  value={test.title}
                  onChange={(e) => setTest({...test, title: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Passing Score (%)</label>
                <Input 
                  type="number" 
                  value={test.passingScore}
                  onChange={(e) => setTest({...test, passingScore: parseInt(e.target.value)})}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</label>
              <textarea 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 min-h-[100px] outline-none"
                value={test.description}
                onChange={(e) => setTest({...test, description: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h2>
            <Badge variant="info" className="px-3 py-1 rounded-full">{test.questions.length} Questions</Badge>
          </div>

          {test.questions.map((q, qIndex) => (
            <Card key={qIndex} className="relative group border-0 shadow-lg rounded-2xl overflow-hidden">
               <CardHeader className="flex flex-row items-start justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-[#0066FF]">
                    {qIndex + 1}
                  </div>
                  <CardTitle className="text-lg font-bold">Question Details</CardTitle>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeQuestion(qIndex)}
                  className="text-gray-400 hover:text-red-500"
                  disabled={test.questions.length === 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <Input 
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  className="h-12 border-0 bg-gray-50 dark:bg-gray-900 rounded-xl"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                       <button
                          type="button"
                          onClick={() => updateQuestion(qIndex, 'correctAnswer', option)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            q.correctAnswer === option ? 'border-[#00D9A5] bg-[#00D9A5] text-white' : 'border-gray-200'
                          }`}
                        >
                          {q.correctAnswer === option && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      <Input 
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[oIndex] = e.target.value;
                          updateQuestion(qIndex, 'options', newOptions);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addQuestion} className="w-full border-dashed p-8">
            Add Question
          </Button>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Update Test'}
          </Button>
        </div>
      </form>
    </div>
  );
}
