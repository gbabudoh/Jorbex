'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function CreateTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', ''], correctAnswer: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | string[]) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value } as Question;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length < 6) {
      newQuestions[qIndex].options.push('');
      setQuestions(newQuestions);
    }
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 2) {
      newQuestions[qIndex].options.splice(oIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title) return alert('Please enter a test title');
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question) return alert(`Please enter text for question ${i + 1}`);
      if (!questions[i].correctAnswer) return alert(`Please select a correct answer for question ${i + 1}`);
      if (questions[i].options.some(opt => !opt)) return alert(`Please fill all options for question ${i + 1}`);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/tests/employer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions,
          passingScore,
          timeLimit
        }),
      });

      if (response.ok) {
        router.push('/employer/tests');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create test');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full w-10 h-10 p-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Custom Test</h1>
          <p className="text-gray-500">Design a new assessment for your candidates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                  placeholder="e.g., Advanced JavaScript Assessment" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 rounded-xl focus:ring-[#0066FF]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Passing Score (%)</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time Limit (Minutes)</label>
                <Input 
                  type="number" 
                  min="1" 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</label>
              <textarea 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 min-h-[100px] focus:ring-2 focus:ring-[#0066FF] outline-none transition-all"
                placeholder="Briefly describe what this test assesses..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h2>
            <Badge variant="info" className="px-3 py-1 rounded-full">{questions.length} Questions</Badge>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="relative group border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-200 dark:bg-gray-800 group-hover:bg-[#00D9A5] transition-colors" />
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
                  disabled={questions.length === 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Question Text</label>
                  <Input 
                    placeholder="Enter your question here..." 
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    className="h-12 border-0 bg-gray-50 dark:bg-gray-900 rounded-xl"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Options (Select the correct one)</label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addOption(qIndex)}
                      className="text-[#0066FF] font-bold text-xs"
                      disabled={q.options.length >= 6}
                    >
                      + Add Option
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2 group/option">
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIndex, 'correctAnswer', option)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            q.correctAnswer === option && option !== ''
                              ? 'border-[#00D9A5] bg-[#00D9A5] text-white'
                              : 'border-gray-200 group-hover/option:border-[#00D9A5]/50'
                          }`}
                        >
                          {q.correctAnswer === option && option !== '' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="relative flex-1">
                          <Input 
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...q.options];
                              newOptions[oIndex] = e.target.value;
                              updateQuestion(qIndex, 'options', newOptions);
                              if (q.correctAnswer === option && option !== '') {
                                updateQuestion(qIndex, 'correctAnswer', e.target.value);
                              }
                            }}
                            className={`h-10 rounded-lg ${q.correctAnswer === option && option !== '' ? 'border-[#00D9A5] bg-[#00D9A5]/5' : ''}`}
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 opacity-0 group-hover/option:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            type="button" 
            variant="outline" 
            onClick={addQuestion}
            className="w-full py-8 border-dashed border-2 rounded-2xl hover:border-[#0066FF] hover:bg-blue-50 dark:hover:bg-blue-950/20 group transition-all"
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:bg-[#0066FF] flex items-center justify-center text-[#0066FF] group-hover:text-white transition-all mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-bold text-gray-600 dark:text-gray-400 group-hover:text-[#0066FF]">Add Question</span>
            </div>
          </Button>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSubmitting}
            className="px-12 h-12 rounded-xl font-bold shadow-xl shadow-blue-500/20"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : 'Create Test and Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}
