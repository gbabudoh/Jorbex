'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useLanguage } from '@/lib/LanguageContext';
import { EXPERTISE_LIST } from '@/lib/constants';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userTypeParam = searchParams.get('type') || 'candidate';
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: userTypeParam === 'employer' ? 'employer' : 'candidate',
    companyName: '',
    expertise: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userType: userTypeParam === 'employer' ? 'employer' : 'candidate',
    }));
  }, [userTypeParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('signup.errors.passwordLength'));
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = formData.userType === 'candidate' ? '/api/auth/signup/candidate' : '/api/auth/signup/employer';
      const body = formData.userType === 'candidate'
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            expertise: formData.expertise,
            termsAccepted,
            privacyAccepted,
            marketingConsent,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            companyName: formData.companyName,
            termsAccepted,
            privacyAccepted,
            marketingConsent,
          };

      console.log('Submitting signup:', { endpoint, body: { ...body, password: '***' } });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Signup response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || t('signup.errors.signupFailed'));
      }

      console.log('Signup successful, signing in...');

      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
      });

      if (signInResult?.ok) {
        // Redirect to appropriate onboarding
        if (formData.userType === 'candidate') {
          router.push('/candidate/onboarding');
        } else {
          router.push('/employer/subscription');
        }
      } else {
        console.error('Auto-login failed:', signInResult?.error);
        router.push('/login');
      }
    } catch (err: unknown) {
      console.error('Signup error:', err);
      setError((err as Error).message || t('signup.errors.generic'));
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-linear-to-r from-[#0066FF] to-[#00D9A5] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">J</span>
        </div>
        <CardTitle className="text-2xl">{t('signup.title')}</CardTitle>
        <CardDescription>
          {formData.userType === 'candidate' ? t('signup.candidateSubtitle') : t('signup.employerSubtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('signup.userTypeLabel')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'candidate' })}
                className={`px-4 py-2 rounded-xl border-2 transition-all cursor-pointer ${
                  formData.userType === 'candidate'
                    ? 'border-[#0066FF] bg-[#0066FF]/10 text-[#0066FF]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t('signup.candidate')}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'employer' })}
                className={`px-4 py-2 rounded-xl border-2 transition-all cursor-pointer ${
                  formData.userType === 'employer'
                    ? 'border-[#0066FF] bg-[#0066FF]/10 text-[#0066FF]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t('signup.employer')}
              </button>
            </div>
          </div>

          <Input
            label={t('signup.fullName')}
            type="text"
            placeholder={t('signup.fullNamePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label={t('signup.email')}
            type="email"
            placeholder={t('signup.emailPlaceholder')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={t('signup.phone')}
            type="tel"
            placeholder={t('signup.phonePlaceholder')}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          {formData.userType === 'employer' && (
            <Input
              label={t('signup.companyName')}
              type="text"
              placeholder={t('signup.companyNamePlaceholder')}
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          )}

          {formData.userType === 'candidate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('signup.expertiseArea')}
              </label>
              <select
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF]"
                required
              >
                <option value="">{t('signup.selectExpertise')}</option>
                {EXPERTISE_LIST.map((exp) => (
                  <option key={exp.id} value={exp.label}>
                    {t(`signup.expertise.${exp.id}`)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label={t('signup.password')}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Input
            label={t('signup.confirmPassword')}
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          {/* ── Consent checkboxes ── */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={termsAccepted && privacyAccepted}
                  onChange={(e) => { setTermsAccepted(e.target.checked); setPrivacyAccepted(e.target.checked); }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${termsAccepted && privacyAccepted ? 'bg-[#0066FF] border-[#0066FF]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#0066FF]'}`}>
                  {termsAccepted && privacyAccepted && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                {t('signup.consent.terms_prefix')}{' '}
                <Link href="/terms" target="_blank" className="text-[#0066FF] hover:underline font-medium">{t('signup.consent.terms_link')}</Link>
                {' '}{t('signup.consent.terms_and')}{' '}
                <Link href="/privacy" target="_blank" className="text-[#0066FF] hover:underline font-medium">{t('signup.consent.privacy_link')}</Link>
                . <span className="text-red-500">{t('signup.consent.terms_required')}</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${marketingConsent ? 'bg-[#0066FF] border-[#0066FF]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#0066FF]'}`}>
                  {marketingConsent && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                {t('signup.consent.marketing')} <span className="text-gray-400 text-xs">{t('signup.consent.marketing_optional')}</span>
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!termsAccepted || !privacyAccepted}
            variant="primary"
            size="lg"
            className="w-full cursor-pointer"
            isLoading={isLoading}
          >
            {t('signup.createAccount')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('signup.haveAccount')} </span>
          <Link href="/login" className="text-[#0066FF] hover:underline font-medium cursor-pointer">
            {t('signup.signIn')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}


export default function SignupPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0066FF]" />
        </CardContent>
      </Card>
    }>
      <SignupForm />
    </Suspense>
  );
}
