'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/lib/LanguageContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.userType === 'candidate') {
        router.replace('/candidate/profile');
      } else if (session.user.userType === 'employer') {
        router.replace('/employer/search');
      }
    }
  }, [session, status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Hero Section - Split UI */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full-width Banner Background - Behind cards section */}
        <div className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 102 241 / 0.1) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}></div>
          {/* Decorative shapes */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-200/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Two Equal Column Grid with Images at Top */}
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-8 animate-fade-in">
            {/* Candidate Frame */}
            <div className="group relative">
              <div className="relative p-8 aspect-square flex items-center justify-center transition-all duration-500 hover:scale-[1.02]">
                {/* Badge on Image */}
                <div className="absolute top-12 left-12 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm md:text-base flex items-center gap-2 animate-fade-in">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('hero.get_hired')}
                </div>
                <Image 
                  src="/candidate.png" 
                  alt="Job Seekers" 
                  width={600}
                  height={600}
                  className="relative w-full h-full object-contain transform group-hover:scale-105 transition-all duration-500"
                />
                {/* Start Here Badge */}
                <Link href="/signup?type=candidate" className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer animate-pulse">
                    <span className="text-white font-bold text-sm text-center">{t('hero.start_here').split(' ').join('\n')}</span>
                  </div>
                </Link>
              </div>
              <div className="text-center mt-6 space-y-3 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-800">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 dark:text-blue-300 text-xs font-medium uppercase tracking-wide">{t('hero.for_candidates')}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-poppins">
                  {t('hero.find_dream_job')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto leading-snug">
                  {t('hero.candidate_description')}
                </p>
                <Link href="/signup?type=candidate" className="inline-block">
                  <Button 
                    variant="primary" 
                    size="md" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold cursor-pointer"
                  >
                    {t('hero.get_started')}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Employer Frame */}
            <div className="group relative">
              <div className="relative p-8 aspect-square flex items-center justify-center transition-all duration-500 hover:scale-[1.02]">
                {/* Badge on Image */}
                <div className="absolute top-12 right-12 z-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm md:text-base flex items-center gap-2 animate-fade-in">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t('hero.find_talents')}
                </div>
                <Image 
                  src="/employer.png" 
                  alt="Employers" 
                  width={600}
                  height={600}
                  className="relative w-full h-full object-contain transform group-hover:scale-105 transition-all duration-500"
                />
                {/* Start Here Badge */}
                <Link href="/signup?type=employer" className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer animate-pulse">
                    <span className="text-white font-bold text-sm text-center">Start<br />Here</span>
                  </div>
                </Link>
              </div>
              <div className="text-center mt-6 space-y-3 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 dark:text-emerald-300 text-xs font-medium uppercase tracking-wide">{t('hero.for_employers')}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {t('hero.hire_top_talent')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto leading-snug">
                  {t('hero.employer_description')}
                </p>
                <Link href="/signup?type=employer" className="inline-block">
                  <Button 
                    variant="primary" 
                    size="md" 
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold cursor-pointer"
                  >
                    {t('hero.start_hiring')}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Badge - Responsive placement */}
          <div className="flex justify-center md:-mt-56 md:mb-56 my-12 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-full shadow-lg font-semibold text-xs border border-white/20 backdrop-blur-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-poppins">{t('hero.ecosystem_badge')}</span>
            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Mission Statement & CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight font-poppins px-4">
              <span className="text-gray-900 dark:text-white">{t('mission.title_part1')}</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                {t('mission.title_part2')}
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              {t('mission.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/signup?type=candidate" className="group">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto min-w-[220px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg font-bold px-10 py-7 cursor-pointer"
                >
                  {t('mission.im_candidate')}
                  <svg className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/signup?type=employer" className="group">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto min-w-[220px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg font-bold px-10 py-7 cursor-pointer"
                >
                  {t('mission.im_employer')}
                  <svg className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-20 animate-fade-in px-4">
            <h2 className="text-3xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {t('how_it_works.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('how_it_works.subtitle')}
            </p>
          </div>

          {/* Candidate Journey */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{t('how_it_works.for_candidates')}</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-gray-900 border-0 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      1
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{t('how_it_works.candidate_step1_title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                      {t('how_it_works.candidate_step1_desc')}
                    </p>
                  </CardContent>
                </Card>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transform -translate-y-1/2"></div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-gray-900 border-0 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      2
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{t('how_it_works.candidate_step2_title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                      {t('how_it_works.candidate_step2_desc')}
                    </p>
                  </CardContent>
                </Card>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 transform -translate-y-1/2"></div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-gray-900 border-0 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{t('how_it_works.candidate_step3_title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                      {t('how_it_works.candidate_step3_desc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Employer Journey */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{t('how_it_works.for_employers')}</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-gray-900 border-0 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      1
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{t('how_it_works.employer_step1_title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                      {t('how_it_works.employer_step1_desc')}
                    </p>
                  </CardContent>
                </Card>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 transform -translate-y-1/2"></div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-gray-900 border-0 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      2
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{t('how_it_works.employer_step2_title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                      {t('how_it_works.employer_step2_desc')}
                    </p>
                  </CardContent>
                </Card>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 transform -translate-y-1/2"></div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <Card className="relative bg-white dark:bg-gray-900 border-0 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{t('how_it_works.employer_step3_title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                      {t('how_it_works.employer_step3_desc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title_part1')} <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('features.title_part2')}</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('features.verified_skills_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('features.verified_skills_desc')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('features.lightning_fast_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('features.lightning_fast_desc')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('features.affordable_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('features.affordable_desc')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('features.data_driven_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('features.data_driven_desc')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('features.custom_tests_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('features.custom_tests_desc')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-900 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('features.support_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('features.support_desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


    </div>
  );
}

