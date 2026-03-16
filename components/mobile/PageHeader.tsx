'use client';

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  /** Show a large iOS-style title below the bar (for main tab pages) */
  largeTitle?: boolean;
}

/** Native-style mobile page header. Hidden on md+ screens. */
export function MobilePageHeader({
  title,
  subtitle,
  backHref,
  onBack,
  rightAction,
  largeTitle = false,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  };

  const showBack = !!(backHref || onBack || typeof backHref === 'undefined' && !largeTitle);

  return (
    <div className="md:hidden">
      {/* Compact nav bar */}
      <div className="flex items-center justify-between px-2 py-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800/60 min-h-[50px]">
        {/* Left — back button */}
        <div className="w-24 flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-0.5 text-[#0066FF] active:opacity-50 transition-opacity pl-1 py-1 pr-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[15px] font-medium">Back</span>
            </button>
          )}
        </div>

        {/* Center — title (only when not largeTitle) */}
        {!largeTitle && (
          <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900 dark:text-white truncate px-2">
            {title}
          </h1>
        )}
        {largeTitle && <div className="flex-1" />}

        {/* Right — action */}
        <div className="w-24 flex items-center justify-end pr-1">
          {rightAction}
        </div>
      </div>

      {/* Large title (iOS-style, for main tab pages) */}
      {largeTitle && (
        <div className="px-4 pt-2 pb-3 bg-white/95 dark:bg-slate-950/95">
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
