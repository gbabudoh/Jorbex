'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS detection (Safari doesn't fire beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    if (ios) {
      const dismissed = sessionStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pwa-dismissed');
      if (!dismissed) setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1');
  };

  if (isInstalled || !show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
          <img src="/icons/icon-72x72.png" alt="Jorbex" className="w-10 h-10 rounded-lg" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Install Jorbex</p>
          {isIOS ? (
            <p className="text-xs text-gray-500 mt-0.5">
              Tap <span className="font-medium">Share</span> then{' '}
              <span className="font-medium">Add to Home Screen</span>
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">
              Add to your home screen for the best experience
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-1 py-1"
            aria-label="Dismiss install prompt"
          >
            Not now
          </button>
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg px-3 py-1.5"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
