'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Test {
  _id: string;
  title: string;
  description: string;
  passingScore: number;
  questions?: unknown[];
}

interface SendTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: string;
  candidateName?: string;
  selectedCandidates?: { id: string; name: string }[];
}

export default function SendTestModal({ isOpen, onClose, candidateId, candidateName, selectedCandidates }: SendTestModalProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTests();
      // Reset state when opening
      setSuccess(false);
      setError('');
      setSelectedTestId(null);
    }
  }, [isOpen]);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/tests/employer');
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      }
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      setError('Could not load your tests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!selectedTestId) return;

    setIsAssigning(true);
    setError('');
    
    // Determine target candidates
    const targets = selectedCandidates && selectedCandidates.length > 0
      ? selectedCandidates.map(c => c.id)
      : candidateId ? [candidateId] : [];

    if (targets.length === 0) {
      setError('No candidates selected.');
      setIsAssigning(false);
      return;
    }

    try {
      // For bulk, we'll send multiple requests for now as our API is designed for single assignment
      // Alternatively, we could update the API to handle bulk
      const results = await Promise.all(
        targets.map(id => 
          fetch('/api/v1/tests/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidateId: id, testId: selectedTestId }),
          })
        )
      );

      const allOk = results.every(res => res.ok);
      
      if (allOk) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Some tests failed to send. Please check your connection.');
      }
    } catch (err) {
      console.error('Error sending test:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/10 to-[#00D9A5]/10 rounded-full blur-2xl -mr-16 -mt-16" />
        
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send Test</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Assign an assessment to 
                <span className="text-[#0066FF] font-semibold ml-1">
                  {selectedCandidates && selectedCandidates.length > 0 
                    ? `${selectedCandidates.length} selected candidates` 
                    : candidateName}
                </span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Test Sent Successfully!</h3>
              <p className="text-gray-600 dark:text-gray-400">The candidate will find this test in their dashboard.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select a custom test</p>
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {isLoading ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066FF] mx-auto mb-3"></div>
                      <p className="text-gray-500 text-sm">Loading your tests...</p>
                    </div>
                  ) : tests.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">You haven&apos;t created any custom tests yet.</p>
                      <Button variant="outline" size="sm" onClick={() => window.location.href='/employer/tests'}>
                        Create Test
                      </Button>
                    </div>
                  ) : (
                    tests.map((test) => (
                      <div 
                        key={test._id}
                        onClick={() => setSelectedTestId(test._id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                          selectedTestId === test._id 
                            ? 'border-[#0066FF] bg-blue-50/50 dark:bg-blue-900/20 shadow-md' 
                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{test.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{test.description}</p>
                            <div className="flex gap-4 mt-3">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Questions</span>
                                <span className="text-sm font-bold">{test.questions?.length || 0}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Target Score</span>
                                <span className="text-sm font-bold text-[#00D9A5]">{test.passingScore}%</span>
                              </div>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedTestId === test._id ? 'border-[#0066FF] bg-[#0066FF] text-white' : 'border-gray-200 dark:border-gray-700'
                          }`}>
                            {selectedTestId === test._id && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl text-gray-600 dark:text-gray-400"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg disabled:opacity-50"
                  disabled={!selectedTestId || isAssigning}
                  onClick={handleSendTest}
                  isLoading={isAssigning}
                >
                  Send Assessment
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
