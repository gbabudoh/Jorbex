'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Notification as Toast } from '@/components/ui/Notification';

export default function NotificationSettings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    channels: {
      email: true,
      push: true,
      inApp: true,
    },
    types: {
      messages: true,
      applications: true,
      interviews: true,
      tests: true,
    }
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/v1/user/notification-preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setPreferences(data.preferences);
          }
        }
      } catch (error: unknown) {
        console.error('Failed to fetch preferences:', error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleToggle = (category: 'channels' | 'types', key: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]]
      }
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/v1/user/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (response.ok) {
        setNotification({ type: 'success', message: t('candidate_profile.success') });
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setNotification({ type: 'error', message: t('candidate_profile.error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-y-4 flex-col">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-40 bg-slate-100 dark:bg-slate-900 rounded-xl" />
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('notifications.preferences')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Channels */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Channels</h4>
            <div className="space-y-6">
              {['email', 'push', 'inApp'].map((channel) => (
                <div key={channel} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 capitalize">{channel === 'inApp' ? 'In-App' : channel}</p>
                    <p className="text-xs text-slate-500">Receive notifications via {channel}</p>
                  </div>
                  <button
                    onClick={() => handleToggle('channels', channel)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${preferences.channels[channel as keyof typeof preferences.channels] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.channels[channel as keyof typeof preferences.channels] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Types */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Activity Types</h4>
            <div className="space-y-6">
              {['messages', 'applications', 'interviews', 'tests'].map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 capitalize">{type}</p>
                    <p className="text-xs text-slate-500">Notifications about {type}</p>
                  </div>
                  <button
                    onClick={() => handleToggle('types', type)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${preferences.types[type as keyof typeof preferences.types] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.types[type as keyof typeof preferences.types] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={savePreferences}
          disabled={saving}
          className="h-12 px-8 font-black rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {notification && (
        <Toast
          isOpen={!!notification}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
