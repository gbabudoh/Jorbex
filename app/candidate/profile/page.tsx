'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/lib/LanguageContext';
import { Notification } from '@/components/ui/Notification';

// Icon Components
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
}

interface Reference {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

interface ProfileData {
  name: string;
  email: string;
  expertise: string;
  onboardingTestPassed?: boolean;
  onboardingTestScore?: number;
  personalStatement?: string;
  skills?: string[];
  workHistory?: WorkExperience[];
  references?: Reference[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    expertise: '',
    personalStatement: '',
    skills: [] as string[],
    workHistory: [] as WorkExperience[],
    references: [] as Reference[],
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [showRefForm, setShowRefForm] = useState(false);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [editingRefIndex, setEditingRefIndex] = useState<number | null>(null);
  
  const [workForm, setWorkForm] = useState<WorkExperience>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    isCurrent: false,
  });
  
  const [refForm, setRefForm] = useState<Reference>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/v1/candidates/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          expertise: data.expertise || '',
          personalStatement: data.personalStatement || '',
          skills: data.skills || [],
          workHistory: data.workHistory || [],
          references: data.references || [],
        });
      }
    } catch {
      // Failed to fetch profile
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/candidates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProfile();
        setNotification({ isOpen: true, message: t('candidate_profile.success'), type: 'success' });
      } else {
        const data = await response.json();
        setNotification({ isOpen: true, message: data.error || t('candidate_profile.error'), type: 'error' });
      }
    } catch {
      setNotification({ isOpen: true, message: t('candidate_profile.error'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Skills Management
  const handleAddSkill = () => {
    if (newSkill && formData.skills.length < 5 && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  // Work History Management
  const handleSaveWork = () => {
    if (!workForm.company || !workForm.position || !workForm.startDate || !workForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newWork = {
      company: workForm.company,
      position: workForm.position,
      startDate: workForm.startDate,
      endDate: workForm.isCurrent ? undefined : workForm.endDate,
      description: workForm.description,
      isCurrent: workForm.isCurrent,
    };

    if (editingWorkIndex !== null) {
      const updated = [...formData.workHistory];
      updated[editingWorkIndex] = newWork;
      setFormData({ ...formData, workHistory: updated });
    } else {
      setFormData({ ...formData, workHistory: [...formData.workHistory, newWork] });
    }

    setWorkForm({ company: '', position: '', startDate: '', endDate: '', description: '', isCurrent: false });
    setShowWorkForm(false);
    setEditingWorkIndex(null);
  };

  const handleEditWork = (index: number) => {
    const work = formData.workHistory[index];
    setWorkForm({
      company: work.company,
      position: work.position,
      startDate: work.startDate,
      endDate: work.endDate || '',
      description: work.description,
      isCurrent: !work.endDate,
    });
    setEditingWorkIndex(index);
    setShowWorkForm(true);
  };

  const handleDeleteWork = (index: number) => {
    if (confirm('Are you sure you want to delete this work experience?')) {
      setFormData({ ...formData, workHistory: formData.workHistory.filter((_, i) => i !== index) });
    }
  };

  // References Management
  const handleSaveReference = () => {
    if (!refForm.name || !refForm.email || !refForm.phone || !refForm.relationship) {
      alert('Please fill in all fields');
      return;
    }

    if (editingRefIndex !== null) {
      const updated = [...formData.references];
      updated[editingRefIndex] = refForm;
      setFormData({ ...formData, references: updated });
    } else {
      setFormData({ ...formData, references: [...formData.references, refForm] });
    }

    setRefForm({ name: '', email: '', phone: '', relationship: '' });
    setShowRefForm(false);
    setEditingRefIndex(null);
  };

  const handleEditReference = (index: number) => {
    setRefForm(formData.references[index] as Reference);
    setEditingRefIndex(index);
    setShowRefForm(true);
  };

  const handleDeleteReference = (index: number) => {
    if (confirm(t('candidate_profile.confirm_delete'))) {
      setFormData({ ...formData, references: formData.references.filter((_, i) => i !== index) });
    }
  };

  const getProfileCompleteness = () => {
    let score = 0;
    if (formData.personalStatement) score += 20;
    if (formData.skills.length > 0) score += 20;
    if (formData.workHistory.length > 0) score += 30;
    if (formData.references.length > 0) score += 15;
    if (profile?.onboardingTestPassed) score += 15;
    return score;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0066FF] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('candidate_profile.loading')}</p>
        </div>
      </div>
    );
  }

  const completeness = getProfileCompleteness();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-2 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">{t('candidate_profile.title')}</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{t('candidate_profile.subtitle')}</p>
          </div>
          <Button
            variant="primary"
            onClick={handleSaveProfile}
            isLoading={isSaving}
            className="hidden md:flex bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg items-center"
          >
            <SaveIcon />
            <span className="ml-2">{t('candidate_profile.save_all_changes')}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/20 to-[#00D9A5]/20 rounded-full blur-2xl -mr-16 -mt-16" />
              <CardContent className="relative p-4 md:p-6 text-center">
                <div className="flex items-center md:flex-col gap-4 md:gap-0">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg mb-0 md:mb-4 shrink-0">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left md:text-center flex-1">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-0 md:mb-1">{profile?.name}</h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-4">{profile?.expertise}</p>
                    
                    {profile?.onboardingTestPassed && (
                      <Badge variant="success" className="mb-0 md:mb-4 text-[10px] md:text-xs">
                        <AwardIcon />
                        <span className="ml-1">{t('candidate_profile.verified_talent')}</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-[13px] md:text-sm text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-600 dark:text-gray-400 shrink-0">{t('candidate_profile.email')}</span>
                    <span className="font-medium truncate text-right">{profile?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('candidate_profile.phone')}</span>
                    <span className="font-medium text-right">{formData.phone || t('candidate_profile.not_set')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aptitude Score */}
            {profile?.onboardingTestScore !== undefined && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/20 to-[#00D9A5]/20 rounded-full blur-2xl -mr-16 -mt-16" />
                <CardContent className="relative p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('candidate_profile.aptitude_score')}</p>
                    <div className="relative inline-block">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(profile.onboardingTestScore / 100) * 351.86} 351.86`}
                          className="transition-all duration-1000"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className="text-[#0066FF]" stopColor="currentColor" />
                            <stop offset="100%" className="text-[#00D9A5]" stopColor="currentColor" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-[#0066FF]">{profile.onboardingTestScore}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Completeness */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm">{t('candidate_profile.profile_strength')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">{t('candidate_profile.completeness')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{completeness}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0066FF] to-[#00D9A5] transition-all duration-1000"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('candidate_profile.personal_statement')}</span>
                    {formData.personalStatement ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('candidate_profile.skills')}</span>
                    {formData.skills.length > 0 ? (
                      <span className="text-green-600 dark:text-green-400">✓ {formData.skills.length}/5</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('candidate_profile.work_history')}</span>
                    {formData.workHistory.length > 0 ? (
                      <span className="text-green-600 dark:text-green-400">✓ {formData.workHistory.length}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('candidate_profile.references')}</span>
                    {formData.references.length > 0 ? (
                      <span className="text-green-600 dark:text-green-400">✓ {formData.references.length}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="sticky top-[64px] z-30 -mx-2 px-2 py-2 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 md:relative md:top-0 md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-b-0">
              <Card className="border-0 shadow-lg md:shadow-md">
                <CardContent className="p-1 md:p-2">
                  <div className="flex gap-1 md:gap-2">
                    {['overview', 'work', 'references'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 min-w-0 px-1 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-[11px] sm:text-[12px] md:text-sm font-bold transition-all whitespace-nowrap ${
                          activeTab === tab
                            ? 'bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t(`candidate_profile.${tab}`)}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Basic Info */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="p-3 md:p-6 pb-1 md:pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                        <UserIcon />
                      </div>
                      <CardTitle className="text-lg md:text-xl">{t('candidate_profile.basic_info')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    <Input
                      label={t('candidate_profile.full_name')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label={t('candidate_profile.phone_number')}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('candidate_profile.expertise')}</label>
                      <select
                        value={formData.expertise}
                        onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 outline-none transition-all"
                      >
                        <option value="">{t('signup.selectExpertise')}</option>
                        <option value="Finance">{t('signup.expertise.finance')}</option>
                        <option value="IT">{t('signup.expertise.it')}</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Operations">Operations</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Statement */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg">{t('candidate_profile.personal_statement_title')}</CardTitle>
                        <CardDescription className="text-[11px] md:text-sm">{t('candidate_profile.personal_statement_desc')}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                    <Textarea
                      placeholder={t('candidate_profile.personal_statement_placeholder')}
                      value={formData.personalStatement}
                      onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
                      rows={6}
                      helperText={`${formData.personalStatement.length}/1000 ${t('candidate_profile.characters')}`}
                    />
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <CardTitle className="text-base md:text-lg">{t('candidate_profile.top_skills')}</CardTitle>
                          <CardDescription className="text-[11px] md:text-sm">{t('candidate_profile.add_up_to_5')}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="default" className="text-[10px]">{formData.skills.length}/5</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6 pt-0 md:pt-0 space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Python, React, Excel"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        disabled={formData.skills.length >= 5}
                      />
                      <Button
                        variant="primary"
                        onClick={handleAddSkill}
                        disabled={formData.skills.length >= 5 || !newSkill}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <div
                          key={skill}
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-2 group"
                        >
                          <span className="font-medium text-blue-700 dark:text-blue-300">{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Work History Tab */}
            {activeTab === 'work' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <BriefcaseIcon />
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg">{t('candidate_profile.work_experience')}</CardTitle>
                        <CardDescription className="text-[11px] md:text-sm">{t('candidate_profile.professional_history')}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-2 py-1 h-8 text-[11px]"
                      onClick={() => {
                        setShowWorkForm(true);
                        setEditingWorkIndex(null);
                        setWorkForm({ company: '', position: '', startDate: '', endDate: '', description: '', isCurrent: false });
                      }}
                    >
                      <PlusIcon />
                      <span className="ml-1">{t('candidate_profile.add_ref')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                  {showWorkForm && (
                    <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {editingWorkIndex !== null ? t('candidate_profile.edit_work') : t('candidate_profile.add_work_exp')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label={t('candidate_profile.company')}
                          value={workForm.company}
                          onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                        />
                        <Input
                          label={t('candidate_profile.position')}
                          value={workForm.position}
                          onChange={(e) => setWorkForm({ ...workForm, position: e.target.value })}
                        />
                        <Input
                          label={t('candidate_profile.start_date')}
                          type="date"
                          value={workForm.startDate}
                          onChange={(e) => setWorkForm({ ...workForm, startDate: e.target.value })}
                        />
                        {!workForm.isCurrent && (
                          <Input
                            label={t('candidate_profile.end_date')}
                            type="date"
                            value={workForm.endDate}
                            onChange={(e) => setWorkForm({ ...workForm, endDate: e.target.value })}
                          />
                        )}
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={workForm.isCurrent}
                          onChange={(e) => setWorkForm({ ...workForm, isCurrent: e.target.checked, endDate: '' })}
                          className="w-4 h-4 text-[#0066FF] rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t('candidate_profile.current_work')}</span>
                      </label>
                      <Textarea
                        label={t('candidate_profile.description')}
                        placeholder={t('candidate_profile.responsibilities_placeholder')}
                        value={workForm.description}
                        onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={handleSaveWork}>
                          <SaveIcon />
                          <span className="ml-2">{t('candidate_profile.save')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowWorkForm(false);
                            setEditingWorkIndex(null);
                          }}
                        >
                          {t('candidate_profile.cancel')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Work History List */}
                  <div className="space-y-4">
                    {formData.workHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                          <BriefcaseIcon />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{t('candidate_profile.no_work_experience')}</p>
                      </div>
                    ) : (
                      formData.workHistory.map((work, index) => (
                        <div
                          key={index}
                          className="p-5 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{work.position}</h3>
                              <p className="text-[#0066FF] dark:text-[#4DA3FF] font-semibold">{work.company}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {new Date(work.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                                {work.endDate ? new Date(work.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : t('candidate_profile.present')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditWork(index)}>
                                <EditIcon />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteWork(index)}>
                                <TrashIcon />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{work.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* References Tab */}
            {activeTab === 'references' && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-lg">{t('candidate_profile.professional_references')}</CardTitle>
                        <CardDescription className="text-[11px] md:text-sm">{t('candidate_profile.optional_recommended')}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-2 py-1 h-8 text-[11px]"
                      onClick={() => {
                        setShowRefForm(true);
                        setEditingRefIndex(null);
                        setRefForm({ name: '', email: '', phone: '', relationship: '' });
                      }}
                    >
                      <PlusIcon />
                      <span className="ml-1">{t('candidate_profile.add_ref')}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                  {showRefForm && (
                    <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800 space-y-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {editingRefIndex !== null ? t('candidate_profile.edit_ref') : t('candidate_profile.add_ref')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label={t('candidate_profile.full_name_ref')}
                          value={refForm.name}
                          onChange={(e) => setRefForm({ ...refForm, name: e.target.value })}
                        />
                        <Input
                          label={t('candidate_profile.relationship')}
                          placeholder={t('candidate_profile.relationship_placeholder')}
                          value={refForm.relationship}
                          onChange={(e) => setRefForm({ ...refForm, relationship: e.target.value })}
                        />
                        <Input
                          label={t('candidate_profile.email')}
                          type="email"
                          value={refForm.email}
                          onChange={(e) => setRefForm({ ...refForm, email: e.target.value })}
                        />
                        <Input
                          label={t('candidate_profile.phone')}
                          type="tel"
                          value={refForm.phone}
                          onChange={(e) => setRefForm({ ...refForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={handleSaveReference}>
                          <SaveIcon />
                          <span className="ml-2">{t('candidate_profile.save')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRefForm(false);
                            setEditingRefIndex(null);
                          }}
                        >
                          {t('candidate_profile.cancel')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* References List */}
                  <div className="grid grid-cols-1 gap-4">
                    {formData.references.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{t('candidate_profile.no_references')}</p>
                      </div>
                    ) : (
                      formData.references.map((ref, index) => (
                        <div
                          key={index}
                          className="p-5 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                              {ref.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{ref.name}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{ref.relationship}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEditReference(index)}>
                                    <EditIcon />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDeleteReference(index)}>
                                    <TrashIcon />
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{ref.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span>{ref.phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Notification
        isOpen={!!notification}
        message={notification?.message || ''}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
