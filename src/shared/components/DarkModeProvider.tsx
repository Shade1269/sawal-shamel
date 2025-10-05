import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: React.ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    try {
      const stored = (typeof window !== 'undefined' ? window.localStorage?.getItem('darkMode') : null);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = stored !== null ? stored === 'true' : prefersDark;
      setIsDarkMode(shouldBeDark);
      updateDarkModeClass(shouldBeDark);
    } catch {
      // Safari Private mode may block localStorage
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      updateDarkModeClass(prefersDark);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = (typeof window !== 'undefined' ? window.localStorage?.getItem('darkMode') : null);
        if (stored === null) {
          // Only follow system preference if user hasn't set a preference
          setIsDarkMode(e.matches);
          updateDarkModeClass(e.matches);
        }
      } catch {
        setIsDarkMode(e.matches);
        updateDarkModeClass(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateDarkModeClass = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('darkMode', newMode.toString());
      }
    } catch {
      // ignore storage errors
    }
    updateDarkModeClass(newMode);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};