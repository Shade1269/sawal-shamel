import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStoreThemes, StoreThemeConfig } from '@/hooks/useStoreThemes';

interface StoreThemeContextType {
  themeConfig: StoreThemeConfig | null;
  applyThemeStyles: (config: StoreThemeConfig) => void;
  resetTheme: () => void;
}

const StoreThemeContext = createContext<StoreThemeContextType | null>(null);

interface StoreThemeProviderProps {
  children: React.ReactNode;
  storeId?: string;
}

export const StoreThemeProvider: React.FC<StoreThemeProviderProps> = ({ 
  children, 
  storeId 
}) => {
  const [themeConfig, setThemeConfig] = useState<StoreThemeConfig | null>(null);
  const { getThemeConfig, applyThemeToCSS } = useStoreThemes();

  const applyThemeStyles = (config: StoreThemeConfig) => {
    setThemeConfig(config);
    applyThemeToCSS(config);
  };

  const resetTheme = () => {
    setThemeConfig(null);
    // إعادة تعيين المتغيرات إلى القيم الافتراضية
    const root = document.documentElement;
    const defaultVars = [
      '--primary', '--secondary', '--accent', '--background', 
      '--foreground', '--muted', '--card', '--border'
    ];
    
    defaultVars.forEach(varName => {
      root.style.removeProperty(varName);
    });
  };

  useEffect(() => {
    if (storeId) {
      getThemeConfig(storeId).then(config => {
        if (config) {
          applyThemeStyles(config);
        }
      });
    }
  }, [storeId]);

  const contextValue: StoreThemeContextType = {
    themeConfig,
    applyThemeStyles,
    resetTheme
  };

  return (
    <StoreThemeContext.Provider value={contextValue}>
      {children}
    </StoreThemeContext.Provider>
  );
};

export const useStoreTheme = () => {
  const context = useContext(StoreThemeContext);
  if (!context) {
    throw new Error('useStoreTheme must be used within StoreThemeProvider');
  }
  return context;
};