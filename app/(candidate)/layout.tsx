'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { JorbexOfficeWidget } from '@/components/mobile/JorbexOfficeWidget';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Allow onboarding page to be accessed without strict auth check
  const isOnboardingPage = pathname === '/candidate/onboarding';

  useEffect(() => {
    // Skip auth check for onboarding page
    if (isOnboardingPage) return;

    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.userType !== 'candidate') {
      router.push('/employer/search');
      return;
    }
  }, [session, status, router, isOnboardingPage]);

  // Show loading spinner while determining auth state (except for onboarding)
  if (status === 'loading' && !isOnboardingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  // Block rendering if not allowed (except for onboarding)
  const isAuthorized = isOnboardingPage || (session && session.user?.userType === 'candidate');
  
  if (!isAuthorized && status !== 'loading') {
    return null; 
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5">
      {children}
      <JorbexOfficeWidget />
    </div>
  );
}
