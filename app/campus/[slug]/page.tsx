'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Programme {
  id: string; slug: string; name: string; description?: string;
  country?: string; city?: string; startDate?: string; endDate?: string;
  maxParticipants?: number; inviteOnly: boolean;
  primaryColour: string; welcomeMessage?: string;
  owner: { companyName: string };
  _count: { members: number; programmeJobs: number };
}

export default function CampusPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [enrolling, setEnrolling]  = useState(false);
  const [enrolled,  setEnrolled]   = useState(false);
  const [error,     setError]      = useState('');

  useEffect(() => {
    fetch(`/api/programmes/public/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.programme) setProgramme(d.programme); })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnrol = async () => {
    if (!session) { router.push(`/login?redirect=/campus/${slug}`); return; }
    if (session.user?.userType !== 'candidate') {
      setError('Only candidates can enrol in programmes'); return;
    }
    setEnrolling(true); setError('');
    try {
      const res = await fetch(`/api/programmes/public/${slug}/enrol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Enrolment failed'); return; }
      setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
      <div className="text-gray-400">Loading programme…</div>
    </div>
  );

  if (!programme) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="text-5xl mb-4">🎓</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Programme not found</h1>
        <p className="text-gray-500 mt-2">This programme may not be active or the link may be incorrect.</p>
      </div>
    </div>
  );

  const colour = programme.primaryColour || '#7c3aed';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="relative py-20 px-4 text-white text-center" style={{ background: `linear-gradient(135deg, ${colour}dd, ${colour}99)` }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            🎓 University Student Placement Programme
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{programme.name}</h1>
          {programme.welcomeMessage && (
            <p className="text-lg opacity-90 mb-4 max-w-2xl mx-auto">{programme.welcomeMessage}</p>
          )}
          {programme.description && (
            <p className="text-base opacity-75 max-w-2xl mx-auto">{programme.description}</p>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm opacity-80">
            <span>🏫 {programme.owner.companyName}</span>
            {programme.country && <span>📍 {[programme.city, programme.country].filter(Boolean).join(', ')}</span>}
            <span>👥 {programme._count.members} enrolled</span>
            <span>💼 {programme._count.programmeJobs} positions</span>
          </div>
        </div>
      </div>

      {/* Enrolment card */}
      <div className="max-w-lg mx-auto px-4 -mt-8 pb-16">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {enrolled ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">You are enrolled!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Welcome to <strong>{programme.name}</strong>. Start exploring available positions.</p>
              <button onClick={() => router.push('/candidate/jobs')} className="w-full py-3 rounded-xl font-bold text-white cursor-pointer" style={{ background: colour }}>
                Browse Positions
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Join this Programme</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {programme.inviteOnly ? 'Enter your student invite code to join.' : 'Open enrolment — no invite code needed.'}
              </p>

              {error && <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-sm">{error}</div>}

              {programme.inviteOnly && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Student Invite Code</label>
                  <input
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono tracking-widest text-center focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': colour } as React.CSSProperties}
                  />
                  <p className="text-xs text-gray-400 mt-1">Get your code from your university careers office</p>
                </div>
              )}

              <button onClick={handleEnrol} disabled={enrolling} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 cursor-pointer" style={{ background: colour }}>
                {enrolling ? 'Enrolling…' : session ? 'Enrol Now' : 'Sign in to Enrol'}
              </button>

              {!session && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  New to Jorbex?{' '}
                  <button onClick={() => router.push(`/signup?type=candidate&redirect=/campus/${slug}`)} className="hover:underline cursor-pointer" style={{ color: colour }}>Create a free account</button>
                </p>
              )}

              {programme.startDate && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-sm text-center">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Starts</div>
                    <div className="font-bold text-gray-900 dark:text-white">{new Date(programme.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  {programme.endDate && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Ends</div>
                      <div className="font-bold text-gray-900 dark:text-white">{new Date(programme.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
