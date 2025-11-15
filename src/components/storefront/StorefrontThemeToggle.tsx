import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStoreTheme } from '@/components/store/ThemeProvider';

interface StorefrontThemeToggleProps {
  storeSlug: string;
}

export const StorefrontThemeToggle = ({ storeSlug }: StorefrontThemeToggleProps) => {
  const { currentTheme, applyTheme } = useStoreTheme();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(`storefront_theme_${storeSlug}`);
    return saved === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('storefront-dark');
      localStorage.setItem(`storefront_theme_${storeSlug}`, 'dark');
    } else {
      root.classList.remove('storefront-dark');
      localStorage.setItem(`storefront_theme_${storeSlug}`, 'light');
    }

    // Re-apply store theme so inline variables respect current mode
    if (currentTheme && applyTheme) {
      applyTheme(currentTheme);
    }
  }, [isDark, storeSlug, currentTheme, applyTheme]);

  useEffect(() => {
    if (currentTheme && document.documentElement.classList.contains('storefront-dark')) {
      applyTheme(currentTheme);
    }
  }, [currentTheme, applyTheme]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-lg transition-colors hover:bg-secondary/50"
      aria-label={isDark ? 'التبديل للوضع المشمس' : 'التبديل للوضع المظلم'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-foreground/70" />
      ) : (
        <Moon className="h-5 w-5 text-foreground/70" />
      )}
    </Button>
  );
};
