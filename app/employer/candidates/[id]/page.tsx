'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import SendTestModal from '@/components/shared/SendTestModal';
import ContactModal from '@/components/shared/ContactModal';
import ScheduleModal from '@/components/shared/ScheduleModal';
import SendOfferModal from '@/components/shared/SendOfferModal';

interface WorkHistory {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Reference {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string;
  skills: string[];
  personalStatement?: string;
  workHistory: WorkHistory[];
  references: Reference[];
  onboardingTestPassed: boolean;
  onboardingTestScore?: number;
  createdAt: string;
}

// Icon components (simplified SVG)
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  useEffect(() => {
    fetchCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/candidates/${candidateId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidate details');
      }

      const data = await response.json();
      setCandidate(data.candidate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Candidate not found'}</p>
            <Button variant="outline" onClick={() => router.push('/employer/search')} className="cursor-pointer">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Navigation - Desktop only or refined for mobile */}
        <div className="mb-4 md:mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            className="h-9 px-3 md:h-10 md:px-4 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all text-sm cursor-pointer"
            onClick={() => router.push('/employer/search')}
          >
            <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden xs:inline">Back to Search</span>
            <span className="xs:hidden">Back</span>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 px-3 md:h-10 md:px-4 hover:bg-white/80 dark:hover:bg-gray-800/80 text-sm cursor-pointer">
              <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden xs:inline">Share Profile</span>
              <span className="xs:hidden">Share</span>
            </Button>
            <Button variant="primary" className="h-9 px-3 md:h-10 md:px-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg transition-all text-sm cursor-pointer">
              <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="hidden xs:inline">Save Candidate</span>
              <span className="xs:hidden">Save</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card with Profile */}
            <Card className="overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0066FF]/10 to-[#00D9A5]/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <CardContent className="relative pt-6 md:pt-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    {candidate.onboardingTestPassed && (
                      <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-7 h-7 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 md:border-4 border-white dark:border-gray-900">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
 
                  {/* Name and Title */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{candidate.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 flex-wrap">
                          <Badge variant="default" className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">
                            <BriefcaseIcon />
                            <span className="ml-1">{candidate.expertise}</span>
                          </Badge>
                          {candidate.onboardingTestPassed && (
                            <Badge variant="success" className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">
                              <AwardIcon />
                              <span className="ml-1">Verified Talent</span>
                            </Badge>
                          )}
                          <Badge variant="info" className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">
                            <CalendarIcon />
                            <span className="ml-1">Joined {new Date(candidate.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
 
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6">
                      <div className="flex items-center gap-3 p-2.5 md:p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-left">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <MailIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
                          <p className="font-semibold text-xs md:text-sm truncate">{candidate.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 md:p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-left">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                          <PhoneIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                          <p className="font-semibold text-xs md:text-sm">{candidate.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Statement */}
            {candidate.personalStatement && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <UserIcon />
                    </div>
                    <CardTitle>About</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {candidate.personalStatement}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <CardTitle>Core Skills</CardTitle>
                    </div>
                    <Badge variant="default">{candidate.skills.length} Skills</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {candidate.skills.map((skill) => (
                      <div
                        key={skill}
                        className="group px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md hover:scale-105 transition-all cursor-default"
                      >
                        <span className="font-medium text-blue-700 dark:text-blue-300">{skill}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work History */}
            {candidate.workHistory && candidate.workHistory.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <BriefcaseIcon />
                    </div>
                    <CardTitle>Work Experience</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-transparent dark:from-blue-800 dark:via-blue-700" />
                    
                    <div className="space-y-4 md:space-y-8">
                      {candidate.workHistory.map((work, index) => (
                        <div key={index} className="relative pl-8 md:pl-12">
                          {/* Timeline Dot */}
                          <div className="absolute left-0 top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-white" />
                          </div>
                          
                          <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                              <div>
                                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">{work.position}</h3>
                                <p className="text-[#0066FF] dark:text-[#4DA3FF] font-semibold text-sm md:text-base">{work.company}</p>
                              </div>
                              <Badge variant="default" className="whitespace-nowrap w-fit text-[10px] md:text-xs">
                                {new Date(work.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {work.endDate ? new Date(work.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                              </Badge>
                            </div>
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{work.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* References */}
            {candidate.references && candidate.references.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <CardTitle>Professional References</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {candidate.references.map((ref, index) => (
                      <div
                        key={index}
                        className="relative p-5 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-950/20 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {ref.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{ref.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{ref.relationship}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="flex items-center gap-2 text-sm">
                                <MailIcon />
                                <span className="text-gray-700 dark:text-gray-300">{ref.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <PhoneIcon />
                                <span className="text-gray-700 dark:text-gray-300">{ref.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Aptitude Score Card */}
            {candidate.onboardingTestScore !== undefined && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0066FF]/20 to-[#00D9A5]/20 rounded-full blur-2xl -mr-16 -mt-16" />
                <CardContent className="relative p-6">
                  <div className="text-center mb-6">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Aptitude Score</p>
                    <div className="relative inline-block scale-90 md:scale-100">
                      <svg className="w-28 h-28 md:w-32 md:h-32 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="none" className="block md:hidden text-gray-200 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="hidden md:block text-gray-200 dark:text-gray-700" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke="url(#gradient)"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${(candidate.onboardingTestScore / 100) * 301.59} 301.59`}
                          className="block md:hidden transition-all duration-1000"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(candidate.onboardingTestScore / 100) * 351.86} 351.86`}
                          className="hidden md:block transition-all duration-1000"
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
                        <span className={`text-3xl md:text-4xl font-bold ${getScoreColor(candidate.onboardingTestScore)}`}>
                          {candidate.onboardingTestScore}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {candidate.onboardingTestScore >= 90 ? 'Exceptional' : 
                       candidate.onboardingTestScore >= 80 ? 'Excellent' :
                       candidate.onboardingTestScore >= 70 ? 'Good' : 'Pass'}
                    </p>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Skills Listed</span>
                      <span className="font-bold text-gray-900 dark:text-white">{candidate.skills?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Work Experience</span>
                      <span className="font-bold text-gray-900 dark:text-white">{candidate.workHistory?.length || 0} {candidate.workHistory?.length === 1 ? 'Position' : 'Positions'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">References</span>
                      <span className="font-bold text-gray-900 dark:text-white">{candidate.references?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setIsTestModalOpen(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Send Custom Test
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Candidate
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 transition-all cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Report Issue
                </Button>
                <Button variant="outline" className="w-full hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 transition-all cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setIsOfferModalOpen(true)}
                >
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Send Offer
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completeness */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm">Profile Completeness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Overall</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(
                        ((candidate.personalStatement ? 20 : 0) +
                        (candidate.skills?.length ? 20 : 0) +
                        (candidate.workHistory?.length ? 30 : 0) +
                        (candidate.references?.length ? 15 : 0) +
                        (candidate.onboardingTestPassed ? 15 : 0))
                      )}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0066FF] to-[#00D9A5] transition-all duration-1000"
                      style={{
                        width: `${Math.round(
                          ((candidate.personalStatement ? 20 : 0) +
                          (candidate.skills?.length ? 20 : 0) +
                          (candidate.workHistory?.length ? 30 : 0) +
                          (candidate.references?.length ? 15 : 0) +
                          (candidate.onboardingTestPassed ? 15 : 0))
                        )}%`
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Personal Statement</span>
                    {candidate.personalStatement ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Skills</span>
                    {candidate.skills?.length ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Work History</span>
                    {candidate.workHistory?.length ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">References</span>
                    {candidate.references?.length ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
 
      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 z-50 flex gap-3 safe-area-bottom">
        <Button 
          variant="outline" 
          className="flex-1 h-12 rounded-xl group hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
          onClick={() => setIsContactModalOpen(true)}
        >
          <div className="flex flex-col items-center">
            <svg className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Contact</span>
          </div>
        </Button>
        <Button 
          variant="primary" 
          className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg transition-all cursor-pointer"
          onClick={() => setIsTestModalOpen(true)}
        >
          <div className="flex flex-col items-center">
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Send Test</span>
          </div>
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 h-12 rounded-xl group hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all cursor-pointer"
          onClick={() => setIsScheduleModalOpen(true)}
        >
          <div className="flex flex-col items-center">
            <svg className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Meet</span>
          </div>
        </Button>
      </div>
 
      {/* Spacer for bottom bar on mobile */}
      <div className="h-24 md:hidden" />

      {/* Send Test Modal */}
      <SendTestModal 
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        candidateId={candidateId}
        candidateName={candidate.name}
      />

      {/* Schedule Modal */}
      <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        candidateId={candidateId}
        candidateName={candidate.name}
      />

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        candidateId={candidateId}
        candidateName={candidate.name}
        candidateRole={candidate.expertise}
      />

      <SendOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        candidateId={candidateId}
        candidateName={candidate.name}
      />
    </div>
  );
}

