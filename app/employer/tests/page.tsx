'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Test {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  passingScore: number;
  questions?: unknown[];
  candidateId?: { _id: string; name: string };
  originalTestId?: string;
  createdAt: string;
}
 
export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'assigned'>('templates');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/v1/tests/employer');
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const templates = tests.filter(t => !t.candidateId);
  const assignedTests = tests.filter(t => t.candidateId);
  const displayTests = activeTab === 'templates' ? templates : assignedTests;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 italic">Tracking Assessments</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Manage templates and track sent assessments</p>
        </div>
        <div className="hidden sm:block">
          <Link href="/employer/tests/create">
            <Button variant="primary" className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg transition-all cursor-pointer">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'templates' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-[#0066FF]' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'assigned' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-[#0066FF]' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Sent Assessments ({assignedTests.length})
        </button>
      </div>

      {displayTests.length === 0 ? (
        <Card className="rounded-3xl border-0 shadow-xl overflow-hidden">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              {activeTab === 'templates' 
                ? "You haven't created any test templates yet." 
                : "No assessments have been sent to candidates yet."}
            </p>
            {activeTab === 'templates' && (
              <Link href="/employer/tests/create">
                <Button variant="primary" className="h-12 px-8 rounded-xl font-bold bg-[#0066FF] cursor-pointer">Create Your First Test</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTests.map((test) => (
            <Card key={test._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeTab === 'templates' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-indigo-500'}`} />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-[#0066FF] transition-colors">{test.title}</CardTitle>
                    {test.candidateId && (
                      <p className="text-[#8B5CF6] font-bold text-xs uppercase tracking-widest mt-1">
                        Sent to: {test.candidateId.name}
                      </p>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2 text-sm">{test.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1">Items</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{test.questions?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1">Pass Mark</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{test.passingScore}%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-400 font-medium italic">
                    {new Date(test.createdAt).toLocaleDateString('en-GB')}
                  </span>
                  <Link href={`/employer/tests/${test._id}`}>
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[#0066FF] cursor-pointer">
                      Details
                      <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
 
      {/* Mobile Floating Action Button */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <Link href="/employer/tests/create">
          <Button 
            variant="primary" 
            className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] p-0 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}

