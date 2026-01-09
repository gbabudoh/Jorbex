'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Test {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  passingScore: number;
  questions?: unknown[];
}
 
export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Test Builder</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Create and manage custom aptitude tests</p>
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

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No tests created yet.</p>
            <Link href="/employer/tests/create">
              <Button variant="primary" className="cursor-pointer">Create Your First Test</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tests.map((test) => (
            <Card key={test._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/5 to-[#00D9A5]/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-[#0066FF]/10 transition-colors" />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0066FF] transition-colors">{test.title}</CardTitle>
                  {test.isActive ? (
                    <Badge variant="success" className="shadow-sm">Active</Badge>
                  ) : (
                    <Badge variant="info" className="opacity-60">Draft</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2 text-sm">{test.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-1">Questions</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{test.questions?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-1">Passing</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{test.passingScore}%</p>
                  </div>
                </div>
                <Link href={`/employer/tests/${test._id}`}>
                  <Button variant="outline" size="sm" className="w-full h-10 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all font-semibold cursor-pointer">
                    Manage Test
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </Link>
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

