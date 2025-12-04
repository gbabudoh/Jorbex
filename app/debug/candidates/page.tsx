'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface Candidate {
  id: string;
  name: string;
  email: string;
  expertise: string;
  onboardingTestPassed: boolean;
  onboardingTestScore?: number;
  createdAt: string;
}

export default function DebugCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/candidates');
      const data = await response.json();
      
      if (response.ok) {
        setCandidates(data.candidates || []);
      } else {
        setError(data.error || 'Failed to fetch candidates');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Debug: All Candidates in Database</CardTitle>
          <CardDescription>
            Total candidates: {candidates.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading candidates...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No candidates found in database.</p>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-lg">{candidate.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium">{candidate.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Expertise</p>
                      <p className="font-medium">{candidate.expertise}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Onboarding Test</p>
                      <p className="font-medium">
                        {candidate.onboardingTestPassed ? (
                          <span className="text-green-600 dark:text-green-400">
                            ✓ Passed ({candidate.onboardingTestScore}%)
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">
                            ✗ Not Passed
                            {candidate.onboardingTestScore !== undefined && ` (${candidate.onboardingTestScore}%)`}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="font-medium">
                        {new Date(candidate.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">MongoDB ID</p>
                      <p className="font-mono text-xs break-all">{candidate.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={fetchCandidates}
              className="px-4 py-2 bg-[#0066FF] text-white rounded-xl hover:bg-[#0052CC] transition-colors"
            >
              Refresh List
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

