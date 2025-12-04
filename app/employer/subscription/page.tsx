'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { detectUserCountry, getCurrency, formatPrice, getYearlyMonthlyEquivalent, getYearlySavings, type CurrencyConfig } from '@/lib/currency';
import { useLanguage } from '@/lib/LanguageContext';

interface SubscriptionData {
  isActive: boolean;
  isTrial: boolean;
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  status: string;
  amount?: number;
  nextBillingDate?: Date;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [currency, setCurrency] = useState<CurrencyConfig>(getCurrency('NG'));
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');

  useEffect(() => {
    // Detect user's country and set currency
    detectUserCountry().then((countryCode) => {
      const userCurrency = getCurrency(countryCode);
      setCurrency(userCurrency);
      setSelectedCurrency(userCurrency.code);
    });
  }, []);

  useEffect(() => {
    if (session?.user?.userType === 'employer') {
      setFetchingData(true);
      fetchSubscriptionData();
    }
  }, [session, status, router]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/employer/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/signup?type=employer');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/employer/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currency: selectedCurrency 
        }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to initiate subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/employer/subscription', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        fetchSubscriptionData();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If employer has active subscription, show subscription management
  if (session?.user?.userType === 'employer' && subscriptionData?.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Subscription Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Manage your HireMe subscription
            </p>
          </div>

          {/* Current Subscription Card */}
          <Card className="mb-8 border-2 border-emerald-500 dark:border-emerald-600">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {subscriptionData.isTrial ? 'Free Trial' : 'Premium Plan'}
                    </h2>
                    <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {subscriptionData.isTrial 
                      ? 'You are currently on a free trial' 
                      : 'Full access to all features'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {subscriptionData.isTrial ? `${currency.symbol}0` : formatPrice(currency.monthlyPrice, currency.code)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {subscriptionData.isTrial ? 'Trial period' : 'per month'}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {subscriptionData.status}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {subscriptionData.isTrial ? 'Trial Ends' : 'Next Billing Date'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subscriptionData.isTrial && subscriptionData.trialEndsAt
                      ? new Date(subscriptionData.trialEndsAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : subscriptionData.nextBillingDate
                      ? new Date(subscriptionData.nextBillingDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Features Included:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Unlimited candidate searches</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Custom assessments</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Advanced filters</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                  </div>
                </div>
              </div>

              {!subscriptionData.isTrial && (
                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel Subscription
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/employer/search')}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    Find Candidates
                  </Button>
                </div>
              )}

              {subscriptionData.isTrial && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    {loading ? 'Processing...' : 'Upgrade to Premium'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/employer/search')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Search Candidates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find your next hire</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/employer/tests')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Tests</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Custom assessments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push('/employer/dashboard')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Dashboard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View analytics</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('subscription.title_part1')} <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t('subscription.title_part2')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            {t('subscription.subtitle')}
          </p>
          
          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{t('subscription.select_currency')}</span>
            <select
              value={selectedCurrency}
              onChange={(e) => {
                setSelectedCurrency(e.target.value);
                setCurrency(getCurrency(e.target.value === 'NGN' ? 'NG' : e.target.value === 'KES' ? 'KE' : e.target.value === 'GHS' ? 'GH' : e.target.value === 'ZAR' ? 'ZA' : e.target.value === 'EGP' ? 'EG' : e.target.value === 'TZS' ? 'TZ' : e.target.value === 'UGX' ? 'UG' : e.target.value === 'XOF' ? 'SN' : 'MA'));
              }}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            >
              <option value="NGN">🇳🇬 Nigeria (₦)</option>
              <option value="KES">🇰🇪 Kenya (KSh)</option>
              <option value="GHS">🇬🇭 Ghana (₵)</option>
              <option value="ZAR">🇿🇦 South Africa (R)</option>
              <option value="EGP">🇪🇬 Egypt (E£)</option>
              <option value="TZS">🇹🇿 Tanzania (TSh)</option>
              <option value="UGX">🇺🇬 Uganda (USh)</option>
              <option value="XOF">🌍 West Africa (CFA)</option>
              <option value="MAD">🇲🇦 Morocco (DH)</option>
            </select>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Candidates - Free */}
          <Card className="relative border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('subscription.for_candidates')}</h2>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('subscription.free')}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.always_free')}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.candidate_features.profile')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.candidate_features.tests')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.candidate_features.discovered')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.candidate_features.opportunities')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.candidate_features.no_fees')}</span>
                </li>
              </ul>

              <Button
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => router.push('/signup?type=candidate')}
              >
                {t('subscription.get_started_free')}
              </Button>
            </CardContent>
          </Card>

          {/* Employers - Monthly */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('subscription.monthly')}</h2>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">{formatPrice(currency.monthlyPrice, currency.code)}</span>
                  <span className="text-gray-600 dark:text-gray-400">{t('subscription.per_month')}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.trial_included')}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.monthly_features.unlimited_search')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.monthly_features.advanced_filters')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.monthly_features.custom_assessments')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.monthly_features.priority_support')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.monthly_features.cancel_anytime')}</span>
                </li>
              </ul>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? t('subscription.processing') : session ? t('subscription.subscribe_monthly') : t('subscription.start_free_trial')}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Card */}
          <Card className="relative border-2 border-emerald-500 dark:border-emerald-600 hover:shadow-2xl transition-all">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {t('subscription.save_percent')}
              </span>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('subscription.yearly')}</h2>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{formatPrice(currency.yearlyPrice, currency.code)}</span>
                  <span className="text-gray-600 dark:text-gray-400">{t('subscription.per_year')}</span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                  {formatPrice(getYearlyMonthlyEquivalent(currency.code), currency.code)}{t('subscription.monthly_equivalent')} {formatPrice(getYearlySavings(currency.code), currency.code)})
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subscription.trial_included')}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300"><strong>{t('subscription.yearly_features.everything')}</strong></span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.yearly_features.two_months_free')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.yearly_features.priority_support')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.yearly_features.advanced_analytics')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('subscription.yearly_features.cancel_anytime')}</span>
                </li>
              </ul>

              <Button
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? t('subscription.processing') : session ? t('subscription.subscribe_yearly') : t('subscription.start_free_trial')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t('subscription.why_choose')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('subscription.verified_skills')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.verified_skills_desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('subscription.lightning_fast')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.lightning_fast_desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('subscription.affordable')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.affordable_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t('subscription.faq_title')}
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('subscription.faq.trial_q')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.faq.trial_a')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('subscription.faq.cancel_q')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.faq.cancel_a')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('subscription.faq.payment_q')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.faq.payment_a')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('subscription.faq.candidates_q')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.faq.candidates_a')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('subscription.faq.refunds_q')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subscription.faq.refunds_a')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
