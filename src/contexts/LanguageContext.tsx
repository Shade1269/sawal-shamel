import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Simple translations object
const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    chat: 'المحادثة', 
    store: 'المتجر',
    inventory: 'المخزون',
    admin: 'الإدارة',
    // Common
    language: 'اللغة',
    darkMode: 'الوضع المظلم',
    lightMode: 'الوضع المضيء',
    arabic: 'العربية',
    english: 'الإنجليزية'
  },
  en: {
    // Navigation  
    home: 'Home',
    chat: 'Chat',
    store: 'Store', 
    inventory: 'Inventory',
    admin: 'Admin',
    // Common
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode', 
    arabic: 'Arabic',
    english: 'English'
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // Initialize language from localStorage or default to Arabic
  useEffect(() => {
    try {
      const stored = (typeof window !== 'undefined' ? window.localStorage?.getItem('language') : null) as 'ar' | 'en' | null;
      const defaultLang = stored === 'ar' || stored === 'en' ? stored : 'ar';
      setLanguage(defaultLang);
      updateDocumentDirection(defaultLang);
    } catch (e) {
      // Safari (especially Private mode) may block localStorage access
      setLanguage('ar');
      updateDocumentDirection('ar');
    }
  }, []);

  const updateDocumentDirection = (lang: 'ar' | 'en') => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('language', newLang);
      }
    } catch {
      // ignore storage errors (Safari private mode)
    }
    updateDocumentDirection(newLang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  const value: LanguageContextType = {
    language,
    direction: (language === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};