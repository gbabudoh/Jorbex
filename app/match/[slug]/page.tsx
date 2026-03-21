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

export default function MatchPortalPage({ params }: { params: Promise<{ slug: string }> }) {
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
    if (!session) { router.push(`/login?redirect=/match/${slug}`); return; }
    if (session.user?.userType !== 'candidate') {
      setError('Only candidates can apply to match programmes'); return;
    }
    setEnrolling(true); setError('');
    try {
      const res = await fetch(`/api/programmes/public/${slug}/enrol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Application failed'); return; }
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
        <div className="text-5xl mb-4">🏢</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Programme not found</h1>
        <p className="text-gray-500 mt-2">This programme may not be active or the link may be incorrect.</p>
      </div>
    </div>
  );

  const colour = programme.primaryColour || '#d97706';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="relative py-20 px-4 text-white text-center" style={{ background: `linear-gradient(135deg, ${colour}dd, ${colour}99)` }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            🏢 Corporate Match Placement Programme
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{programme.name}</h1>
          {programme.welcomeMessage && (
            <p className="text-lg opacity-90 mb-4 max-w-2xl mx-auto">{programme.welcomeMessage}</p>
          )}
          {programme.description && (
            <p className="text-base opacity-75 max-w-2xl mx-auto">{programme.description}</p>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm opacity-80">
            <span>🏢 {programme.owner.companyName}</span>
            {programme.country && <span>📍 {[programme.city, programme.country].filter(Boolean).join(', ')}</span>}
            <span>👥 {programme._count.members} candidates</span>
            <span>💼 {programme._count.programmeJobs} open roles</span>
          </div>
        </div>
      </div>

      {/* Apply card */}
      <div className="max-w-lg mx-auto px-4 -mt-8 pb-16">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {enrolled ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Application received!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You have been added to the <strong>{programme.name}</strong> talent pool.
                Our team will match you with relevant roles and be in touch shortly.
              </p>
              <button onClick={() => router.push('/candidate/profile')} className="w-full py-3 rounded-xl font-bold text-white cursor-pointer" style={{ background: colour }}>
                Complete Your Profile
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Apply to this Programme</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Submit your profile to be considered for matched placements.
                {programme.inviteOnly ? ' An invite code is required.' : ''}
              </p>

              {error && <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-sm">{error}</div>}

              {programme.inviteOnly && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Access Code</label>
                  <input
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <button onClick={handleEnrol} disabled={enrolling} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 cursor-pointer" style={{ background: colour }}>
                {enrolling ? 'Submitting…' : session ? 'Apply Now' : 'Sign in to Apply'}
              </button>

              {!session && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  New to Jorbex?{' '}
                  <button onClick={() => router.push(`/signup?type=candidate&redirect=/match/${slug}`)} className="hover:underline cursor-pointer" style={{ color: colour }}>Create a free account</button>
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">How it works</h3>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex gap-2"><span className="font-bold text-amber-600">1.</span> Apply and complete your Jorbex profile</li>
                  <li className="flex gap-2"><span className="font-bold text-amber-600">2.</span> Our team reviews and shortlists candidates</li>
                  <li className="flex gap-2"><span className="font-bold text-amber-600">3.</span> Get matched with verified employers hiring now</li>
                  <li className="flex gap-2"><span className="font-bold text-amber-600">4.</span> Interview and receive a placement offer</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
