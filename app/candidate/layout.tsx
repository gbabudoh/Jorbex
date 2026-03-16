'use client';

import { NavigationCards } from '@/components/shared/NavigationCards';
import { Header } from '@/components/shared/Header';
import { BottomNav } from '@/components/mobile/BottomNav';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5 pt-14">
      <Header />

      {/* Desktop: fixed nav bar below header — hidden on mobile */}
      <div className="hidden md:block fixed top-[72px] left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50">
        <div className="container mx-auto px-4 max-w-7xl py-2">
          <NavigationCards />
        </div>
      </div>

      {/* Main content */}
      {/* Desktop: pt-24 clears header + fixed nav. Mobile: pt-2, pb-20 clears bottom nav */}
      <div className="container mx-auto px-4 max-w-7xl pt-2 pb-24 md:pt-24 md:pb-6">
        <main className="relative">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab navigation */}
      <BottomNav />
    </div>
  );
}
