'use client';

import { NavigationCards } from '@/components/shared/NavigationCards';
import { Header } from '@/components/shared/Header';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5 pt-[70px]">
      <Header />
      
      <div className="container mx-auto px-4 pt-2 pb-6 max-w-7xl">
        {/* Persistent Navigation Hub */}
        <div className="mb-6 sticky top-[72px] z-50">
          <NavigationCards />
        </div>

        {/* Dynamic Content Area */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}

