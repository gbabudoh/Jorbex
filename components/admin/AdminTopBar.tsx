'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/employers': 'Employers',
  '/admin/candidates': 'Candidates',
  '/admin/jobs': 'Jobs',
  '/admin/applications': 'Applications',
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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <div className="w-9 h-9 bg-linear-to-br from-[#0066FF] to-[#00D9A5] rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
