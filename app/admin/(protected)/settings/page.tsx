'use client';

import { useState, useEffect } from 'react';

interface Settings {
  platform_name: string;
  support_email: string;
  trial_days: string;
  maintenance_mode: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    platform_name: 'Jorbex',
    support_email: 'support@jorbex.com',
    trial_days: '30',
    maintenance_mode: 'false',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Platform Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Platform Name
          </label>
          <input
            value={settings.platform_name}
            onChange={(e) => setSettings(prev => ({ ...prev, platform_name: e.target.value }))}
            className={inputClass}
          />
        </div>

        {/* Support Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Support Email
          </label>
          <input
            type="email"
            value={settings.support_email}
            onChange={(e) => setSettings(prev => ({ ...prev, support_email: e.target.value }))}
            className={inputClass}
          />
        </div>

        {/* Trial Days */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Trial Period (days)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.trial_days}
            onChange={(e) => setSettings(prev => ({ ...prev, trial_days: e.target.value }))}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-slate-400">Number of days new employers get on the trial plan</p>
        </div>

        {/* Maintenance Mode */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Maintenance Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Temporarily disable public access to the platform</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({
                ...prev,
                maintenance_mode: prev.maintenance_mode === 'true' ? 'false' : 'true',
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  settings.maintenance_mode === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settings.maintenance_mode === 'true' && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl">
              <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                Maintenance mode is ON — the platform is inaccessible to regular users.
              </p>
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#0066FF] text-white font-bold rounded-xl text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-semibold">Settings saved</span>}
        </div>
      </div>
    </div>
  );
}
