import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  language: 'ar' | 'en';
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
    const stored = localStorage.getItem('language') as 'ar' | 'en' | null;
    const defaultLang = stored || 'ar';
    
    setLanguage(defaultLang);
    updateDocumentDirection(defaultLang);
  }, []);

  const updateDocumentDirection = (lang: 'ar' | 'en') => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    updateDocumentDirection(newLang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  const value = {
    language,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};