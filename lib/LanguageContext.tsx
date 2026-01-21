'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'fr' | 'ar' | 'pt';

type Translations = {
  [key: string]: string | Translations | string[];
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const VALID_LOCALES: Locale[] = ['en', 'fr', 'ar', 'pt'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Use lazy initializer to avoid synchronous setState in useEffect
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale;
      if (saved && VALID_LOCALES.includes(saved)) {
        return saved;
      }
    }
    return 'en';
  });

  const [translations, setTranslations] = useState<Translations>({});

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`);
        const data = await response.json();
        setTranslations(data as Translations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, [locale]);

  // Update HTML dir attribute for RTL support
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: Translations | string | string[] = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        value = (value as Translations)[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
