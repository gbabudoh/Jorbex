'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useLanguage } from '@/lib/LanguageContext';

export default function CreateJobPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    salary: {
      min: 0,
      max: 0,
      currency: 'NGN'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return alert('Please fill in title and description');

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/employer/jobs');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post job');
      }
    } catch (error) {
       void error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full w-10 h-10 p-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white italic">Create New Opportunity</h1>
          <p className="text-slate-500">Post a new job listing to attract verified professionals</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-0 shadow-xl overflow-hidden rounded-[2.5rem]">
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          <CardHeader className="p-8 md:p-10">
            <CardTitle className="text-2xl font-bold">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="px-8 md:px-10 pb-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Job Title</label>
                <Input 
                  placeholder="e.g., Senior Frontend Engineer" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-14 rounded-2xl border-slate-200 focus:ring-blue-600"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Job Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 outline-none transition-all font-bold"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Location</label>
                <Input 
                  placeholder="e.g., Lagos, Nigeria or Remote" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-14 rounded-2xl border-slate-200"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Currency</label>
                <select
                  value={formData.salary.currency}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, currency: e.target.value } })}
                  className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-600 outline-none transition-all font-bold"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GHS">GHS (₵)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="ZAR">ZAR (R)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Min Salary</label>
                <Input 
                  type="number" 
                  value={formData.salary.min}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, min: parseInt(e.target.value) } })}
                  className="h-14 rounded-2xl border-slate-200"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Max Salary</label>
                <Input 
                  type="number" 
                  value={formData.salary.max}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, max: parseInt(e.target.value) } })}
                  className="h-14 rounded-2xl border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Job Description</label>
              <Textarea 
                placeholder="Describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="rounded-2xl border-slate-200 p-6 text-lg leading-relaxed"
              />
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting} className="h-14 px-8 rounded-2xl font-bold">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
                className="h-14 px-12 rounded-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isSubmitting ? 'Posting Opportunity...' : 'Post Job Listing'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
