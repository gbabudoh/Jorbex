'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Notification } from '@/components/ui/Notification';
import { WORLD_COUNTRIES } from '@/lib/locations';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { EXPERTISE_LIST } from '@/lib/constants';

// Icons
const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CompanyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

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
    industry: 'Technology',
    companySize: '10-50',
    website: '',
    linkedin: '',
    twitter: '',
  });

  const [stats] = useState({
    activeJobs: 12,
    applications: 148,
    interviews: 24,
    offers: 8
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/employers/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          companyName: data.companyName || '',
          phone: data.phone || '',
          country: data.country || '',
          city: data.city || '',
          email: data.email || '',
        }));
      }
    } catch {
      setNotification({ isOpen: true, message: t('employer_profile.error_load'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
  }, [session, fetchProfile]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0066FF] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading company profile...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              {t('employer_profile.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your company information and hiring presence
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg hover:shadow-blue-500/20 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg text-sm"
              >
                <SaveIcon />
                {t('employer_profile.save_changes')}
              </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Profile Summary & Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4 space-y-6"
          >
            {/* Branding Card */}
            <Card className="border-0 shadow-2xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl group">
              <CardContent className="relative px-6 pb-8 pt-6">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#2ca9f8] to-[#0084d1] flex items-center justify-center text-white text-3xl font-black shadow-inner">
                      {formData.companyName?.charAt(0) || 'C'}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formData.companyName}</h2>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-4 flex items-center justify-center gap-1">
                    <StarIcon />
                    Verified Employer
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge className="rounded-full bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 border border-blue-200/50">
                      {formData.industry}
                    </Badge>
                    <Badge className="rounded-full bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200/50">
                      {formData.companySize} Employees
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{stats.activeJobs}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-tight">Active<br/>Jobs</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{stats.applications}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-tight">App<br/>Received</p>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <BriefcaseIcon />
                  </div>
                  <Badge className="bg-emerald-500 text-white border-0">ACTIVE</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1">Professional Plan</h3>
                <p className="text-blue-100 text-sm mb-4">Next billing: Oct 24, 2026</p>
                <div className="h-1.5 bg-white/20 rounded-full mb-2">
                  <div className="h-full bg-white w-3/4 rounded-full"></div>
                </div>
                <p className="text-xs text-blue-100 font-medium tracking-wide">7,500 Credits remaining</p>
              </CardContent>
            </Card>

            {/* Social Links Form (UI only mockup for now) */}
            <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Online Presence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 px-3">
                    <GlobeIcon />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Website URL"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-blue-500/50 outline-none text-sm transition-all"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 px-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="LinkedIn Profile"
                    value={formData.linkedin}
                    onChange={e => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-blue-500/50 outline-none text-sm transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Main Content area */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 space-y-6"
          >
            {/* Main Information Card */}
            <Card className="border-0 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden">
               <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <CompanyIcon />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{t('employer_profile.company_details')}</CardTitle>
                      <CardDescription>Core details about your organization</CardDescription>
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Contact Person */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <UserIcon />
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('employer_profile.contact_name')}</label>
                      </div>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        containerClassName="group rounded-2xl overflow-hidden"
                        className="h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 group-focus-within:border-blue-500/50 transition-all rounded-2xl px-6 text-base font-medium"
                      />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CompanyIcon />
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('employer_profile.company_name')}</label>
                      </div>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        containerClassName="group rounded-2xl overflow-hidden"
                        className="h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 group-focus-within:border-blue-500/50 transition-all rounded-2xl px-6 text-base font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-4 opacity-70">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('employer_profile.email_address')}</label>
                      </div>
                      <Input
                        value={formData.email}
                        disabled
                        className="h-14 bg-gray-100/50 dark:bg-slate-800/50 border-2 border-transparent text-gray-500 cursor-not-allowed rounded-2xl px-6"
                      />
                      <p className="text-xs text-amber-600/70 font-medium">* Contact support to change company email</p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('employer_profile.phone_number')}</label>
                      </div>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        containerClassName="group rounded-2xl overflow-hidden"
                        className="h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 group-focus-within:border-blue-500/50 transition-all rounded-2xl px-6 text-base font-medium"
                      />
                    </div>
                  </div>

                  {/* Location Divider */}
                  <div className="flex items-center gap-4 py-4">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Headquarters & Location</span>
                     <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Country */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <GlobeIcon />
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('employer_profile.country')}</label>
                        </div>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 px-6 py-2 text-base font-medium outline-none focus:border-blue-500/50 transition-all cursor-pointer shadow-sm appearance-none"
                        >
                          <option value="">{t('employer_profile.select_country')}</option>
                          {WORLD_COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                     </div>

                     {/* City */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('employer_profile.city')}</label>
                        </div>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder={t('employer_profile.city_placeholder')}
                          containerClassName="group rounded-2xl overflow-hidden"
                          className="h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 group-focus-within:border-blue-500/50 transition-all rounded-2xl px-6 text-base font-medium"
                        />
                     </div>
                  </div>

                  {/* Industry Divider */}
                  <div className="flex items-center gap-4 py-4">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Company Profile details</span>
                     <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Industry */}
                     <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Industry Sector</label>
                         <select
                           value={formData.industry}
                           onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                           className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 px-6 py-2 text-base font-medium outline-none focus:border-blue-500/50 transition-all cursor-pointer shadow-sm"
                         >
                           <option value="">{t('signup.selectExpertise')}</option>
                           {EXPERTISE_LIST.map((exp) => (
                             <option key={exp.id} value={exp.label}>
                               {t(`signup.expertise.${exp.id}`)}
                             </option>
                           ))}
                         </select>
                     </div>

                     {/* Company Size */}
                     <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Team Size</label>
                        <select
                          value={formData.companySize}
                          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                          className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 px-6 py-2 text-base font-medium outline-none focus:border-blue-500/50 transition-all cursor-pointer shadow-sm"
                        >
                          <option value="1-10">1-10 Employees</option>
                          <option value="11-50">11-50 Employees</option>
                          <option value="51-200">51-200 Employees</option>
                          <option value="201-500">201-500 Employees</option>
                          <option value="500+">500+ Employees</option>
                        </select>
                     </div>
                  </div>
               </CardContent>
               
               <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    variant="primary"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/30 px-6 py-4 transform hover:scale-[1.02] active:scale-95 transition-all font-bold rounded-xl text-sm"
                  >
                    Save Company Profile
                  </Button>
               </div>
            </Card>
          </motion.div>
        </div>
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
