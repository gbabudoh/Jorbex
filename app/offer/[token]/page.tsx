"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface OfferDetails {
  id:            string;
  companyName:   string;
  candidateName: string;
  jobTitle:      string;
  content:       string;
  salary:        string;
  currency:      string;
  startDate:     string;
  expiresAt:     string;
  status:        'pending' | 'accepted' | 'rejected' | 'expired';
}

export default function OfferPage() {
  const params    = useParams();
  const router    = useRouter();
  const token     = params.token as string;

  const [offer, setOffer]           = useState<OfferDetails | null>(null);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');

  // E-signature state
  const [showSign, setShowSign]     = useState(false);
  const [signedName, setSignedName] = useState('');
  const [agreed, setAgreed]         = useState(false);
  const [signed, setSigned]         = useState(false);

  useEffect(() => { fetchOffer(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOffer = async () => {
    try {
      const res  = await fetch(`/api/offers/${token}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || (res.status === 404 ? 'Offer not found or expired' : 'Failed to load offer'));
      }
      const data = await res.json();
      setOffer(data.offer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    // Show signature panel before accepting
    setShowSign(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleConfirmSign = async () => {
    if (!signedName.trim() || !agreed) return;
    setProcessing(true);
    try {
      // Save signature
      await fetch(`/api/offers/${token}/sign`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ signedByName: signedName.trim() }),
      });

      // Accept offer
      const res = await fetch(`/api/offers/${token}/respond`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'accepted' }),
      });
      if (!res.ok) throw new Error('Failed to accept offer');
      setSigned(true);
      setTimeout(() => router.push('/candidate/applications'), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      await fetch(`/api/offers/${token}/respond`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'rejected' }),
      });
      setOffer(prev => prev ? { ...prev, status: 'rejected' } : null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-[#0066FF] animate-spin" />
    </div>
  );
  if (error)  return <div className="text-center p-20 text-red-500 font-bold">{error}</div>;
  if (!offer) return null;

  if (signed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Offer Accepted!</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Congratulations! Your signed offer has been saved.<br />Redirecting you to your dashboard...
        </p>
        <div className="h-1 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-[grow_3s_linear_forwards]" />
        </div>
      </div>
      <style>{`@keyframes grow { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );

  const isPending = offer.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 flex items-start justify-center">
      <div className="w-full max-w-3xl space-y-4">

        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Header banner */}
          <div className="bg-linear-to-r from-[#0066FF] to-[#0052CC] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <h1 className="text-3xl font-bold relative z-10">Job Offer</h1>
            <p className="text-blue-100 mt-1 relative z-10">from {offer.companyName}</p>
          </div>

          <CardContent className="p-8 space-y-8">
            {/* Key terms */}
            <div className="flex flex-wrap justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Position</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{offer.jobTitle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Salary</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{offer.currency} {offer.salary}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Start Date</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {new Date(offer.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Offer content */}
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <div dangerouslySetInnerHTML={{ __html: offer.content }} />
            </div>

            {/* Action area */}
            {isPending && !showSign && (
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Button
                  className="flex-1 bg-[#0066FF] hover:bg-[#0052CC] h-12 text-base font-bold cursor-pointer"
                  onClick={handleAccept}
                  isLoading={processing}
                >
                  Accept & Sign Offer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-base border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 cursor-pointer"
                  onClick={handleDecline}
                  isLoading={processing}
                >
                  Decline
                </Button>
              </div>
            )}

            {/* E-Signature panel */}
            {isPending && showSign && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-5">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                    Sign this offer
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By typing your full name and checking the box below, you are legally agreeing to the terms of this offer.
                  </p>
                </div>

                {/* Typed signature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Type your full name as your signature
                  </label>
                  <input
                    type="text"
                    value={signedName}
                    onChange={e => setSignedName(e.target.value)}
                    placeholder={offer.candidateName}
                    className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold text-lg focus:outline-none focus:border-[#0066FF] transition-colors"
                    style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                  />
                  {signedName && (
                    <div className="mt-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                      <span className="text-gray-400 text-xs mr-2">Signature:</span>
                      <span className="text-gray-800 dark:text-white text-xl" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                        {signedName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Agreement checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    I, <strong>{signedName || '___________'}</strong>, confirm that I have read and agree to all the terms and conditions in this offer from <strong>{offer.companyName}</strong>. I understand this constitutes a legally binding agreement.
                  </span>
                </label>

                {/* Signed date */}
                <div className="text-sm text-gray-400">
                  Signed on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {/* Confirm/Cancel buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[#0066FF] hover:bg-[#0052CC] h-12 font-bold cursor-pointer"
                    onClick={handleConfirmSign}
                    isLoading={processing}
                    disabled={!signedName.trim() || !agreed}
                  >
                    Confirm & Accept Offer
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-6 cursor-pointer"
                    onClick={() => setShowSign(false)}
                    disabled={processing}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Result states */}
            {offer.status === 'accepted' && (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Offer Accepted & Signed</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Your employer has been notified. A copy of this signed offer is saved to your profile.
                </p>
                <Link
                  href={`/offer/${token}/contract`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download / Print Signed Contract
                </Link>
              </div>
            )}

            {offer.status === 'rejected' && (
              <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Offer Declined</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">You have declined this offer.</p>
              </div>
            )}

            {offer.status === 'expired' && (
              <div className="p-6 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Offer Expired</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This offer is no longer valid.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
