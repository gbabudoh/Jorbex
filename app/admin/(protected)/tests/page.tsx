'use client';

import { useState, useEffect, useCallback } from 'react';

interface AptitudeTest {
  id: string;
  title: string;
  testType: string;
  expertise: string | null;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  employer: { companyName: string } | null;
  _count: { questions: number; results: number };
}

interface TestResult {
  id: string;
  score: number;
  passed: boolean;
  completedAt: string;
  candidate: { name: string; email: string };
  test: { title: string; testType: string };
}

export default function AdminTestsPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'results'>('tests');
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ view: activeTab, page: String(page) });
    const res = await fetch(`/api/admin/tests?${params}`);
    const data = await res.json();
    if (activeTab === 'results') {
      setResults(data.results || []);
    } else {
      setTests(data.tests || []);
    }
    setTotal(data.total || 0);
    setIsLoading(false);
  }, [activeTab, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 flex gap-1 w-fit">
        {(['tests', 'results'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-[#0066FF] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab === 'tests' ? 'Tests' : 'Results'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066FF]"></div>
          </div>
        ) : activeTab === 'tests' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Title</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Employer</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Questions</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Attempts</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Pass Score</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{test.title}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        test.testType === 'ONBOARDING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {test.testType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{test.employer?.companyName || 'Platform'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{test._count.questions}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{test._count.results}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{test.passingScore}%</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        test.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {test.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(test.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-400">No tests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Candidate</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Test</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Score</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Result</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{result.candidate.name}</p>
                      <p className="text-xs text-slate-500">{result.candidate.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{result.test.title}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        result.test.testType === 'ONBOARDING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {result.test.testType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{result.score}%</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(result.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400">No results found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {total > 20 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 transition-colors">Previous</button>
            <span className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer hover:bg-slate-50 transition-colors">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
