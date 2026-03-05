'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import CookieConsent from '@/components/shared/CookieConsent';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInterviewPage = pathname?.startsWith('/interview');
  const isProfilePage = pathname?.startsWith('/candidate/profile') || pathname?.startsWith('/employer');

  if (isInterviewPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow pt-20">
        {children}
      </main>
      {!isProfilePage && <CookieConsent />}
      {!isProfilePage && <Footer />}
    </>
  );
}
