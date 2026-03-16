'use client';

import { useState, useEffect, useRef } from 'react';

type Tab = 'hero' | 'features' | 'footer';

const tabs: { key: Tab; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'features', label: 'Features' },
  { key: 'footer', label: 'Footer' },
];

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const candidateFileRef = useRef<HTMLInputElement>(null);
  const employerFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/cms?section=${activeTab}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content || {}))
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: activeTab, updates: content }),
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUpload = async (key: string, file: File) => {
    setIsUploading(prev => ({ ...prev, [key]: true }));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) {
      setContent(prev => ({ ...prev, [key]: data.url }));
    }
    setIsUploading(prev => ({ ...prev, [key]: false }));
  };

  const field = (key: string, label: string, textarea = false) => (
    <div key={key}>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={content[key] || ''}
          onChange={(e) => setContent(prev => ({ ...prev, [key]: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF] resize-none"
        />
      ) : (
        <input
          value={content[key] || ''}
          onChange={(e) => setContent(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
        />
      )}
    </div>
  );

  const imageField = (key: string, label: string, fileRef: React.RefObject<HTMLInputElement | null>) => (
    <div key={key} className="sm:col-span-2">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex gap-2 items-start">
        <input
          value={content[key] || ''}
          onChange={(e) => setContent(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder="https://..."
          className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading[key]}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isUploading[key] ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(key, file);
            e.target.value = '';
          }}
        />
      </div>
      {content[key] && (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 w-40 h-24 bg-slate-100 dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content[key]} alt={label} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl space-y-4">
      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 flex gap-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#0066FF] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066FF]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'hero' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageField('candidate_image_url', 'Candidate Hero Image', candidateFileRef)}
                {imageField('employer_image_url', 'Employer Hero Image', employerFileRef)}
                {field('hero_title', 'Hero Title')}
                {field('hero_subtitle', 'Hero Subtitle')}
                {field('hero_candidate_cta', 'Candidate CTA Text')}
                {field('hero_employer_cta', 'Employer CTA Text')}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Feature {n}</p>
                    {field(`feature_${n}_title`, 'Title')}
                    {field(`feature_${n}_desc`, 'Description', true)}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'footer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('footer_support_email', 'Support Email')}
                {field('footer_contact_phone', 'Contact Phone')}
                {field('footer_address', 'Address', true)}
                {field('footer_linkedin_url', 'LinkedIn URL')}
                {field('footer_twitter_url', 'Twitter / X URL')}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#0066FF] text-white font-bold rounded-xl text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && <span className="text-sm text-emerald-600 font-semibold">Saved successfully</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
