'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Notification } from '@/components/ui/Notification';
import { WORLD_COUNTRIES } from '@/lib/locations';
import { useLanguage } from '@/lib/LanguageContext';

export default function EmployerProfilePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    country: '',
    city: '',
    email: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/v1/employers/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          companyName: data.companyName || '',
          phone: data.phone || '',
          country: data.country || '',
          city: data.city || '',
          email: data.email || '',
        });
      }
    } catch {
      setNotification({ isOpen: true, message: t('employer_profile.error_load'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/employers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({ isOpen: true, message: t('employer_profile.success'), type: 'success' });
      } else {
        const data = await response.json();
        setNotification({ isOpen: true, message: data.error || t('employer_profile.error_update'), type: 'error' });
      }
    } catch {
      setNotification({ isOpen: true, message: t('employer_profile.error_generic'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('employer_profile.title')}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('employer_profile.company_details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('employer_profile.contact_name')}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('employer_profile.company_name')}</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('employer_profile.email_address')}</label>
                <Input
                  value={formData.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('employer_profile.phone_number')}</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('employer_profile.country')}</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm cursor-pointer"
                >
                  <option value="">{t('employer_profile.select_country')}</option>
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('employer_profile.city')}</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('employer_profile.city_placeholder')}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {t('employer_profile.save_changes')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Notification
        isOpen={notification?.isOpen || false}
        message={notification?.message || ''}
        type={notification?.type || 'info'}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
