'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/employers': 'Employers',
  '/admin/candidates': 'Candidates',
  '/admin/jobs': 'Jobs',
  '/admin/applications': 'Applications',
  '/admin/verifications': 'Verifications',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/tests': 'Tests & Results',
  '/admin/cms': 'Content Management',
  '/admin/settings': 'Settings',
};

export default function AdminTopBar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  const title = pathname
    ? (pageTitles[pathname] || pageTitles[Object.keys(pageTitles).find(k => pathname.startsWith(k)) || ''] || 'Admin')
    : 'Admin';

  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-600 to-violet-600" />
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</p>
          <p className="text-[10px] text-slate-400">{user.email}</p>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-[#0066FF] to-[#00D9A5] rounded-full flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/25">
          {user.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
