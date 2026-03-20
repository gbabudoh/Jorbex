'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useLanguage } from '@/lib/LanguageContext';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Benin','Bolivia','Bosnia and Herzegovina',
  'Botswana','Brazil','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada',
  'Central African Republic','Chad','Chile','China','Colombia','Congo (DRC)','Congo (Republic)',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Ecuador',
  'Egypt','El Salvador','Eritrea','Estonia','Ethiopia','Finland','France','Gabon','Gambia',
  'Georgia','Germany','Ghana','Greece','Guatemala','Guinea','Guinea-Bissau','Haiti','Honduras',
  'Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia',
  'Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia',
  'Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Mongolia','Montenegro','Morocco',
  'Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger',
  'Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palestine','Panama',
  'Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saudi Arabia','Senegal','Serbia','Sierra Leone','Singapore','Slovakia','Slovenia','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Sweden','Switzerland',
  'Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tunisia','Turkey','Turkmenistan',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'NGN', symbol: '₦', label: 'NGN (₦)' },
  { code: 'GHS', symbol: '₵', label: 'GHS (₵)' },
  { code: 'KES', symbol: 'KSh', label: 'KES (KSh)' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR (R)' },
  { code: 'EGP', symbol: 'E£', label: 'EGP (E£)' },
  { code: 'MAD', symbol: 'MAD', label: 'MAD (دهـ)' },
  { code: 'XOF', symbol: 'CFA', label: 'XOF (CFA)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
];

export default function CreateJobPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    country: '',
    city: '',
    type: 'Full-time',
    salary: { min: '', max: '', currency: 'USD' },
    salaryRate: 'monthly',
    expiresAt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const setSalary = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, salary: { ...prev.salary, [field]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return alert(t('jobs.create_page.validation_required'));
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          country: formData.country,
          city: formData.city,
          type: formData.type,
          salaryRate: formData.salaryRate,
          expiresAt: formData.expiresAt || undefined,
          salary: {
            min: formData.salary.min ? parseFloat(formData.salary.min) : undefined,
            max: formData.salary.max ? parseFloat(formData.salary.max) : undefined,
            currency: formData.salary.currency,
          },
        }),
      });

      if (response.ok) {
        router.push('/employer/jobs');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || t('jobs.create_page.post_error'));
      }
    } catch {
      alert(t('jobs.create_page.post_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    'w-full h-14 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 outline-none transition-all font-medium text-slate-800 dark:text-slate-100 appearance-none cursor-pointer';
  const labelClass = 'text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1';

  // Min expiry = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full w-10 h-10 p-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white italic">{t('jobs.create_page.page_title')}</h1>
          <p className="text-slate-500">{t('jobs.create_page.page_subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-0 shadow-xl overflow-hidden rounded-[2.5rem]">
          <div className="h-2.5 w-full bg-linear-to-r from-blue-600 to-indigo-600" />
          <CardHeader className="p-8 md:p-10">
            <CardTitle className="text-2xl font-bold">{t('jobs.create_page.job_details')}</CardTitle>
          </CardHeader>
          <CardContent className="px-8 md:px-10 pb-10 space-y-8">

            {/* Row 1: Title + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.job_title')}</label>
                <Input
                  placeholder={t('jobs.create_page.job_title_placeholder')}
                  value={formData.title}
                  onChange={(e) => set('title', e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 focus:ring-blue-600"
                />
              </div>
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.job_type')}</label>
                <select value={formData.type} onChange={(e) => set('type', e.target.value)} className={selectClass}>
                  <option value="Full-time">{t('jobs.create_page.full_time')}</option>
                  <option value="Part-time">{t('jobs.create_page.part_time')}</option>
                  <option value="Contract">{t('jobs.create_page.contract')}</option>
                  <option value="Remote">{t('jobs.create_page.remote')}</option>
                  <option value="Internship">{t('jobs.create_page.internship')}</option>
                </select>
              </div>
            </div>

            {/* Row 2: Country + City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.country')}</label>
                <select value={formData.country} onChange={(e) => set('country', e.target.value)} className={selectClass}>
                  <option value="">{t('jobs.create_page.country_placeholder')}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.city')}</label>
                <Input
                  placeholder={t('jobs.create_page.city_placeholder')}
                  value={formData.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="h-14 rounded-2xl border-slate-200"
                />
              </div>
            </div>

            {/* Row 3: Currency + Salary Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.currency')}</label>
                <select value={formData.salary.currency} onChange={(e) => setSalary('currency', e.target.value)} className={selectClass}>
                  {CURRENCIES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.salary_rate')}</label>
                <select value={formData.salaryRate} onChange={(e) => set('salaryRate', e.target.value)} className={selectClass}>
                  <option value="hourly">{t('jobs.create_page.rate_hourly')}</option>
                  <option value="daily">{t('jobs.create_page.rate_daily')}</option>
                  <option value="weekly">{t('jobs.create_page.rate_weekly')}</option>
                  <option value="monthly">{t('jobs.create_page.rate_monthly')}</option>
                  <option value="annual">{t('jobs.create_page.rate_annual')}</option>
                </select>
              </div>
            </div>

            {/* Row 4: Min + Max Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.min_salary')}</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.salary.min}
                  onChange={(e) => setSalary('min', e.target.value)}
                  className="h-14 rounded-2xl border-slate-200"
                />
              </div>
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.max_salary')}</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.salary.max}
                  onChange={(e) => setSalary('max', e.target.value)}
                  className="h-14 rounded-2xl border-slate-200"
                />
              </div>
            </div>

            {/* Row 5: Expiry Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={labelClass}>{t('jobs.create_page.expiry_date')}</label>
                <Input
                  type="date"
                  min={minDate}
                  value={formData.expiresAt}
                  onChange={(e) => set('expiresAt', e.target.value)}
                  className="h-14 rounded-2xl border-slate-200"
                />
                <p className="text-xs text-slate-400 ml-1">{t('jobs.create_page.expiry_hint')}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className={labelClass}>{t('jobs.create_page.job_description')}</label>
              <Textarea
                placeholder={t('jobs.create_page.description_placeholder')}
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                rows={8}
                className="rounded-2xl border-slate-200 p-6 text-lg leading-relaxed"
              />
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting} className="h-14 px-8 rounded-2xl font-bold">
                {t('jobs.create_page.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="h-14 px-12 rounded-2xl font-black bg-linear-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isSubmitting ? t('jobs.create_page.posting') : t('jobs.create_page.post_job')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
