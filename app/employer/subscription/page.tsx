'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  detectUserCountry, getCurrency, formatPrice,
  getYearlyMonthlyEquivalent, getYearlySavings,
  AFRICAN_CURRENCIES, INTERNATIONAL_CURRENCIES,
  type CurrencyConfig,
} from '@/lib/currency';
import { useLanguage } from '@/lib/LanguageContext';

interface SubscriptionData {
  isActive:           boolean;
  isTrial:            boolean;
  hasAccess:          boolean;
  status:             string;
  subscriptionEndsAt?: string;
  nextBillingDate?:   string;
  provider?:          string | null;
  billingPeriod?:     string | null;
}

const FEATURES = [
  'Unlimited candidate searches',
  'Advanced filters & skills match',
  'Custom assessments with proctoring',
  'Interview scheduling & video calls',
  'Priority support',
  'Cancel anytime',
];

function PlanBadge({ provider }: { provider?: string | null }) {
  if (!provider) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
      provider === 'stripe'
        ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
    }`}>
      {provider === 'stripe' ? '💳 Stripe' : '🌍 Paystack'}
    </span>
  );
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { t }        = useLanguage();

  const [loading,           setLoading]          = useState(false);
  const [subscriptionData,  setSubscriptionData]  = useState<SubscriptionData | null>(null);
  const [currency,          setCurrency]          = useState<CurrencyConfig>(getCurrency('NGN'));
  const [billingPeriod,     setBillingPeriod]     = useState<'monthly' | 'yearly'>('monthly');
  const [successMsg,        setSuccessMsg]        = useState<string | null>(null);

  // Check for redirect back from payment provider
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'paystack') setSuccessMsg('Payment successful! Your subscription is now active.');
    if (success === 'stripe')   setSuccessMsg('Payment successful! Your subscription is now active.');
  }, [searchParams]);

  const fetchSubscription = useCallback(async () => {
    if (session?.user?.userType !== 'employer') return;
    try {
      const res = await fetch('/api/v1/billing/subscription');
      if (res.ok) setSubscriptionData(await res.json());
    } catch { /* ignore */ }
  }, [session]);

  useEffect(() => {
    // Auto-detect country → currency
    detectUserCountry().then(cc => {
      const c = getCurrency(cc);
      setCurrency(c);
    });
  }, []);

  useEffect(() => {
    if (status === 'authenticated') fetchSubscription();
  }, [status, fetchSubscription]);

  const handleSubscribe = async (period: 'monthly' | 'yearly') => {
    if (!session) { router.push('/signup?type=employer'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/billing/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currency: currency.code, billingPeriod: period }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || 'Failed to initiate payment. Please try again.');
      }
    } catch {
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You keep access until the end of your billing period.')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/billing/subscription', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message ?? 'Subscription cancelled.');
        fetchSubscription();
      } else {
        alert(data.error || 'Failed to cancel subscription.');
      }
    } finally {
      setLoading(false);
    }
  };

  const displayPrice = (period: 'monthly' | 'yearly') =>
    formatPrice(period === 'yearly' ? currency.yearlyPrice : currency.monthlyPrice, currency.code);

  // ── Active subscription management ──────────────────────────────────────────
  if (session?.user?.userType === 'employer' && subscriptionData && !subscriptionData.isTrial && subscriptionData.hasAccess) {
    const endsAt = subscriptionData.subscriptionEndsAt
      ? new Date(subscriptionData.subscriptionEndsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A';

    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium text-sm">
              ✅ {successMsg}
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Subscription Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your Jorbex Premium plan</p>
          </div>

          <Card className="mb-6 border-2 border-emerald-400 dark:border-emerald-600 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Premium Plan</h2>
                    <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-bold">Active</span>
                    <PlanBadge provider={subscriptionData.provider} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">
                    {subscriptionData.billingPeriod ?? 'monthly'} billing
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Status</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 capitalize">{subscriptionData.status}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Access until</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{endsAt}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Included features</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => router.push('/employer/search')} className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 cursor-pointer">
                  Find Candidates
                </Button>
                {subscriptionData.status === 'ACTIVE' && (
                  <Button variant="outline" onClick={handleCancel} disabled={loading} className="cursor-pointer text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    {loading ? 'Cancelling…' : 'Cancel Plan'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Pricing page (trial / no subscription) ───────────────────────────────────
  const africaCurrencies  = Object.values(AFRICAN_CURRENCIES);
  const globalCurrencies  = Object.values(INTERNATIONAL_CURRENCIES);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
      <div className="container mx-auto px-4 max-w-5xl">

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium text-sm text-center">
            ✅ {successMsg}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            {t('subscription.title_part1')}{' '}
            <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t('subscription.title_part2')}
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {t('subscription.subtitle')}
          </p>

          {/* Payment provider notice */}
          <div className="inline-flex items-center gap-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-6 py-3 text-sm mb-8 shadow-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="text-lg">🌍</span>
              <span><strong className="text-slate-900 dark:text-white">Africa</strong> — Paystack</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="text-lg">🌐</span>
              <span><strong className="text-slate-900 dark:text-white">Rest of world</strong> — Stripe</span>
            </span>
          </div>

          {/* Currency + billing period selectors */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Currency</label>
              <select
                value={currency.code}
                onChange={e => setCurrency(getCurrency(e.target.value))}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer text-sm"
              >
                <optgroup label="🌍 Africa — Paystack">
                  {africaCurrencies.map(c => (
                    <option key={c.code} value={c.code}>{c.country} ({c.symbol})</option>
                  ))}
                </optgroup>
                <optgroup label="🌐 International — Stripe">
                  {globalCurrencies.map(c => (
                    <option key={c.code} value={c.code}>{c.country} ({c.symbol})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Billing period</label>
              <div className="flex bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-1">
                {(['monthly', 'yearly'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setBillingPeriod(p)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all capitalize cursor-pointer ${
                      billingPeriod === p
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {p} {p === 'yearly' && <span className="text-[10px] ml-1 opacity-80">−17%</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Candidate — free */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">For Candidates</h2>
                <div className="text-5xl font-black text-blue-600 dark:text-blue-400 my-4">Free</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Always free — no credit card needed</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Create professional profile', 'Pass aptitude test to unlock profile', 'Get discovered by employers', 'Apply for job opportunities', 'No fees ever'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="primary" size="lg" className="w-full bg-linear-to-r from-blue-600 to-indigo-600 cursor-pointer" onClick={() => router.push('/signup?type=candidate')}>
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Employer — paid */}
          <Card className="border-2 border-emerald-500 dark:border-emerald-600 hover:shadow-xl transition-all relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-linear-to-r from-emerald-600 to-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow">
                {currency.provider === 'stripe' ? '💳 Stripe' : '🌍 Paystack'} · {billingPeriod === 'yearly' ? 'Save 17%' : 'Flexible'}
              </span>
            </div>
            <CardContent className="p-8 pt-10">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">For Employers</h2>
                <div className="flex items-baseline justify-center gap-1 my-4">
                  <span className="text-5xl font-black bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    {displayPrice(billingPeriod)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    /{billingPeriod === 'yearly' ? 'yr' : 'mo'}
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ≈ {formatPrice(getYearlyMonthlyEquivalent(currency.code), currency.code)}/mo · Save {formatPrice(getYearlySavings(currency.code), currency.code)}
                  </p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t('subscription.trial_included')}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant="primary"
                size="lg"
                className="w-full bg-linear-to-r from-emerald-600 to-teal-500 cursor-pointer"
                onClick={() => handleSubscribe(billingPeriod)}
                disabled={loading}
              >
                {loading ? 'Redirecting…' : session ? `Subscribe — ${displayPrice(billingPeriod)}` : 'Start Free Trial'}
              </Button>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                Secure payment via {currency.provider === 'stripe' ? 'Stripe' : 'Paystack'} · No hidden fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto text-sm">
            {[
              { q: 'Which payment methods are accepted?', a: 'African employers pay via Paystack (cards, bank transfer, USSD, mobile money). Employers outside Africa pay via Stripe (credit/debit cards, Apple Pay, Google Pay).' },
              { q: 'What happens after my trial ends?', a: 'Your profile remains visible but you lose access to advanced search filters and custom assessments until you subscribe.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from this page and you keep full access until the end of your billing period — no penalties.' },
              { q: 'Is the yearly plan charged upfront?', a: 'Yes — one payment covers 12 months with 2 months free (you pay for 10, get 12).' },
              { q: 'Do you offer refunds?', a: 'We offer a 7-day refund if you are not satisfied. Contact support within 7 days of payment.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{q}</h3>
                <p className="text-slate-600 dark:text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
