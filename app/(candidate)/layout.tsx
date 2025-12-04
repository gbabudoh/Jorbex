'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  
  // Allow onboarding page to be accessed without strict auth check
  const isOnboardingPage = pathname === '/candidate/onboarding';

  useEffect(() => {
    // Skip auth check for onboarding page
    if (isOnboardingPage) {
      setIsChecking(false);
      return;
    }

    if (status === 'loading') {
      return;
    }
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.userType !== 'candidate') {
      router.push('/employer/search');
      return;
    }

    setIsChecking(false);
  }, [session, status, router, isOnboardingPage, pathname]);

  // Show loading only for non-onboarding pages
  if (isChecking && !isOnboardingPage && status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  // Allow onboarding page to render immediately
  if (isOnboardingPage) {
    return <div className="min-h-screen bg-gradient-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5">{children}</div>;
  }

  // Block other pages if not authenticated or not a candidate
  if (!session || session.user?.userType !== 'candidate') {
    return null;
  }

  return <div className="min-h-screen bg-gradient-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5">{children}</div>;
}

