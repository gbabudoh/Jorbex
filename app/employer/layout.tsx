'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/employer/subscription'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (isPublicRoute) return; // Skip auth check for public routes
    
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.userType !== 'employer') {
      router.push('/candidate/profile');
      return;
    }
  }, [session, status, router, pathname, isPublicRoute]);

  // Show loading only for protected routes
  if (!isPublicRoute && status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  // Allow public routes to render without authentication
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes require authentication
  if (!session || session.user?.userType !== 'employer') {
    return null;
  }

  return <div className="min-h-screen bg-gradient-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5">{children}</div>;
}

