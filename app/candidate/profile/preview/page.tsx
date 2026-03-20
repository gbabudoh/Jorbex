'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Reference {
  name: string;
  relationship: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  expertise: string;
  onboardingTestPassed?: boolean;
  onboardingTestScore?: number;
  personalStatement?: string;
  skills?: string[];
  workHistory?: WorkExperience[];
  references?: Reference[];
  highestQualification?: string;
  university?: string;
  degree?: string;
  professionalQualifications?: string;
  hobbies?: string;
}

export default function ProfilePreviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/v1/candidates/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    if (session) fetchProfile();
    else if (session === null) setIsLoading(false);
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0066FF]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Edit
        </button>
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700">
          Public Preview
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* Hero card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#0066FF] to-[#00D9A5]" />
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 flex items-end justify-between">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D9A5] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-gray-900">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {profile.onboardingTestPassed && (
                <Badge variant="success" className="mb-1">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Verified Talent
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            <p className="text-[#0066FF] dark:text-[#4DA3FF] font-semibold">{profile.expertise}</p>
            {(profile.city || profile.country) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </p>
            )}

            {profile.onboardingTestScore !== undefined && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                <svg className="w-4 h-4 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-semibold text-[#0066FF]">Aptitude Score: {profile.onboardingTestScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Personal Statement */}
        {profile.personalStatement && (
          <Section title="About" icon="💬">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{profile.personalStatement}</p>
          </Section>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Section title="Top Skills" icon="⚡">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Work History */}
        {profile.workHistory && profile.workHistory.length > 0 && (
          <Section title="Work Experience" icon="💼">
            <div className="relative pl-5 border-l-2 border-[#0066FF]/20 space-y-5">
              {profile.workHistory.map((work, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[25px] top-4 w-3 h-3 rounded-full bg-[#0066FF] border-2 border-white dark:border-gray-900" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{work.position}</h3>
                    <p className="text-[#0066FF] dark:text-[#4DA3FF] font-semibold text-sm">{work.company}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(work.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} –{' '}
                      {work.endDate ? new Date(work.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 leading-relaxed">{work.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {(profile.highestQualification || profile.university || profile.degree) && (
          <Section title="Education" icon="🎓">
            <div className="space-y-1">
              {profile.highestQualification && (
                <p className="font-semibold text-gray-900 dark:text-white">{profile.highestQualification}</p>
              )}
              {profile.degree && (
                <p className="text-gray-700 dark:text-gray-300">{profile.degree}</p>
              )}
              {profile.university && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.university}</p>
              )}
              {profile.professionalQualifications && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {profile.professionalQualifications}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Hobbies */}
        {profile.hobbies && (
          <Section title="Interests & Hobbies" icon="🎯">
            <p className="text-gray-700 dark:text-gray-300">{profile.hobbies}</p>
          </Section>
        )}

        {/* References count (no sensitive details publicly) */}
        {profile.references && profile.references.length > 0 && (
          <Section title="References" icon="👥">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {profile.references.length} professional reference{profile.references.length > 1 ? 's' : ''} available upon request.
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}
