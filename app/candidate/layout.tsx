'use client';

import { usePathname } from 'next/navigation';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Simple layout - no auth blocking for now to avoid errors
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066FF]/5 via-white to-[#00D9A5]/5">
      {children}
    </div>
  );
}

