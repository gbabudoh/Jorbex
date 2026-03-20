'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

type Tab = 'assessments' | 'sent' | 'completed';

interface Template {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions?: unknown[];
  createdAt: string;
  deadline: string | null;
}

interface SentTest {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questionsCount: number;
  createdAt: string;
  candidate: { id: string; name: string; email: string; expertise: string } | null;
  completed: boolean;
  score: number | null;
  passed: boolean | null;
  completedAt: string | null;
}

interface CompletedResult {
  id: string;
  score: number;
  passed: boolean;
  completedAt: string;
  candidate: { name: string; email: string; expertise: string };
  test: { title: string };
  proctorStats: { noFaceCount: number; tabSwitchCount: number } | null;
}

export default function TestsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('assessments');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [sentTests, setSentTests] = useState<SentTest[]>([]);
  const [completed, setCompleted] = useState<CompletedResult[]>([]);

  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingSent, setLoadingSent] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch('/api/v1/tests/employer');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.tests || []);
      }
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const fetchSent = useCallback(async () => {
    setLoadingSent(true);
    try {
      const res = await fetch('/api/v1/tests/sent');
      if (res.ok) {
        const data = await res.json();
        setSentTests(data.tests || []);
      }
    } finally {
      setLoadingSent(false);
    }
  }, []);

  const fetchCompleted = useCallback(async () => {
    setLoadingCompleted(true);
    try {
      const res = await fetch('/api/v1/tests/results/employer');
      if (res.ok) {
        const data = await res.json();
        setCompleted(data.results || []);
      }
    } finally {
      setLoadingCompleted(false);
    }
  }, []);

  // Fetch templates on mount; fetch others on tab switch (lazy)
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => {
    if (activeTab === 'sent' && sentTests.length === 0) fetchSent();
    if (activeTab === 'completed' && completed.length === 0) fetchCompleted();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading =
    (activeTab === 'assessments' && loadingTemplates) ||
    (activeTab === 'sent' && loadingSent) ||
    (activeTab === 'completed' && loadingCompleted);

  const tabs: { id: Tab; label: string; count: number; color: string }[] = [
    { id: 'assessments', label: 'Assessments', count: templates.length,  color: 'text-blue-600' },
    { id: 'sent',        label: 'Sent',         count: sentTests.length,  color: 'text-purple-600' },
    { id: 'completed',   label: 'Completed',    count: completed.length,  color: 'text-emerald-600' },
  ];

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('employer_tests.title')}</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">{t('employer_tests.subtitle')}</p>
        </div>
        <div className="hidden sm:block">
          <Link href="/employer/tests/create">
            <Button variant="primary" className="bg-linear-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg transition-all cursor-pointer">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('employer_tests.create_new')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl mb-8 w-fit gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 shadow-sm ' + tab.color
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-gray-100 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]" />
        </div>
      ) : activeTab === 'assessments' ? (
        <TemplatesGrid templates={templates} t={t} onRefresh={fetchTemplates} router={router} />
      ) : activeTab === 'sent' ? (
        <SentGrid tests={sentTests} onRefresh={fetchSent} />
      ) : (
        <CompletedGrid results={completed} />
      )}

      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <Link href="/employer/tests/create">
          <Button variant="primary" className="w-14 h-14 rounded-full shadow-2xl bg-linear-to-br from-[#0066FF] to-[#0052CC] p-0 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ── Assessments grid ── */
function TemplatesGrid({
  templates, t, onRefresh, router,
}: {
  templates: Template[];
  t: (k: string) => string;
  onRefresh: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/tests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      }
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const isOverdue = (deadline: string | null) =>
    deadline ? new Date(deadline) < new Date() : false;

  if (templates.length === 0) return (
    <EmptyState
      icon="clipboard"
      message={t('employer_tests.no_templates')}
      action={<Link href="/employer/tests/create"><Button variant="primary" className="h-12 px-8 rounded-xl font-bold bg-[#0066FF] cursor-pointer">{t('employer_tests.create_first')}</Button></Link>}
    />
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(test => (
          <Card key={test.id} className="border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300 group rounded-3xl bg-white dark:bg-gray-900 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-[#0066FF] transition-colors">{test.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm mt-1">{test.description}</CardDescription>
                </div>
                {/* Action menu */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => router.push(`/employer/tests/${test.id}`)}
                    title="Edit"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#0066FF] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmId(test.id)}
                    title="Delete"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-center">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-0.5">{t('employer_tests.items')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{test.questions?.length || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-center">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-0.5">{t('employer_tests.pass_mark')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{test.passingScore}%</p>
                </div>
              </div>

              {/* Deadline row */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold mb-4 ${
                test.deadline
                  ? isOverdue(test.deadline)
                    ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400'
              }`}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {test.deadline
                  ? `${isOverdue(test.deadline) ? 'Overdue · ' : 'Deadline · '}${new Date(test.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'No deadline set'}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400">{new Date(test.createdAt).toLocaleDateString()}</span>
                <Link href={`/employer/tests/${test.id}`}>
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[#0066FF] cursor-pointer">
                    {t('employer_tests.details')}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-1.5 w-full bg-linear-to-r from-rose-400 to-rose-600" />
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Assessment?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This will permanently delete the assessment and all its questions. This cannot be undone.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-2xl cursor-pointer" onClick={() => setConfirmId(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  className="flex-1 rounded-2xl bg-rose-500 hover:bg-rose-600 cursor-pointer"
                  isLoading={deletingId === confirmId}
                  onClick={() => handleDelete(confirmId)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Sent grid ── */
function SentGrid({ tests, onRefresh }: { tests: SentTest[]; onRefresh: () => void }) {
  if (tests.length === 0) return (
    <EmptyState
      icon="send"
      message="No assessments sent yet. Send a test from a candidate's profile."
      action={<Button variant="outline" onClick={onRefresh} className="cursor-pointer">Refresh</Button>}
    />
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map(test => (
        <Card key={test.id} className="border-t-4 border-t-purple-500 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl bg-white dark:bg-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{test.title}</CardTitle>
              {test.completed ? (
                <Badge className="shrink-0 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Done</Badge>
              ) : (
                <Badge className="shrink-0 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">Pending</Badge>
              )}
            </div>
            {test.candidate && (
              <div className="flex items-center gap-2 p-2.5 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                  {test.candidate.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{test.candidate.name}</p>
                  <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wide truncate">{test.candidate.expertise}</p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Questions</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{test.questionsCount}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                {test.completed && test.score !== null ? (
                  <>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Score</p>
                    <p className={`text-xl font-black ${test.passed ? 'text-emerald-600' : 'text-rose-500'}`}>{test.score}%</p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Pass Mark</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{test.passingScore}%</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Sent {new Date(test.createdAt).toLocaleDateString()}</span>
              {test.completedAt && (
                <span className="text-emerald-500 font-bold">Completed {new Date(test.completedAt).toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Completed grid ── */
function CompletedGrid({ results }: { results: CompletedResult[] }) {
  if (results.length === 0) return (
    <EmptyState
      icon="check"
      message="No completed assessments yet. Results will appear here once candidates submit."
    />
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map(r => (
        <Card key={r.id} className={`border-t-4 ${r.passed ? 'border-t-emerald-500' : 'border-t-rose-500'} shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-3xl bg-white dark:bg-gray-900`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <Badge className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                r.passed ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-500'
              }`}>
                {r.passed ? 'Passed' : 'Failed'}
              </Badge>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {new Date(r.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-lg font-black text-gray-500 shrink-0">
                {r.candidate.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-black text-gray-900 dark:text-white truncate">{r.candidate.name}</p>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-tight truncate">{r.candidate.expertise}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-3">
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Assessment</p>
              <p className="font-bold text-gray-700 dark:text-gray-300 text-sm line-clamp-1">{r.test.title}</p>
            </div>

            {/* Proctor flags */}
            {r.proctorStats && (r.proctorStats.tabSwitchCount > 0 || r.proctorStats.noFaceCount > 0) && (
              <div className="flex gap-2 mb-3">
                {r.proctorStats.tabSwitchCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-[10px] font-black text-amber-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                    {r.proctorStats.tabSwitchCount} tab switch{r.proctorStats.tabSwitchCount !== 1 ? 'es' : ''}
                  </div>
                )}
                {r.proctorStats.noFaceCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-950/30 rounded-lg text-[10px] font-black text-red-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    {r.proctorStats.noFaceCount} absence{r.proctorStats.noFaceCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">Score</p>
                <p className={`text-2xl font-black ${r.passed ? 'text-emerald-600' : 'text-rose-500'}`}>{r.score}%</p>
              </div>
              <Link href={`/employer/results/${r.id}`}>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-black hover:text-blue-600 cursor-pointer">
                  Full Report →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Shared empty state ── */
function EmptyState({ icon, message, action }: { icon: string; message: string; action?: React.ReactNode }) {
  const icons: Record<string, React.ReactNode> = {
    clipboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };
  return (
    <Card className="rounded-3xl border-0 shadow-xl overflow-hidden">
      <CardContent className="py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icons[icon]}
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg max-w-sm mx-auto">{message}</p>
        {action}
      </CardContent>
    </Card>
  );
}
