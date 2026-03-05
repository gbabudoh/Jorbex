'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import CookieConsent from '@/components/shared/CookieConsent';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInterviewPage = pathname?.startsWith('/interview');

  if (isInterviewPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <CookieConsent />
      <Footer />
    </>
  );
}
