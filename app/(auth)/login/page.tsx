'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useLanguage } from '@/lib/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'candidate',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        redirect: false,
      });

      if (result?.error) {
        // More specific error messages
        if (result.error === 'CredentialsSignin') {
          setError(t('login.error_invalid'));
        } else {
          setError(result.error || t('login.error_invalid'));
        }
        setIsLoading(false);
        return;
      }

      // Redirect based on user type
      if (formData.userType === 'candidate') {
        router.push('/candidate/profile');
      } else {
        router.push('/employer/search');
      }
    } catch {
      setError(t('login.error_generic'));
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#0066FF] to-[#00D9A5] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">J</span>
        </div>
        <CardTitle className="text-2xl">{t('login.welcome_back')}</CardTitle>
        <CardDescription>{t('login.sign_in_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('login.i_am_a')}
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
                {t('login.candidate')}
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
                {t('login.employer')}
              </button>
            </div>
          </div>

          <Input
            label={t('login.email')}
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={t('login.password')}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full cursor-pointer"
            isLoading={isLoading}
          >
            {t('login.sign_in')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('login.dont_have_account')} </span>
          <Link href="/signup" className="text-[#0066FF] hover:underline font-medium cursor-pointer">
            {t('login.sign_up')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

