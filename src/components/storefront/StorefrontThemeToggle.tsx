import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface StorefrontThemeToggleProps {
  storeSlug: string;
}

export const StorefrontThemeToggle = ({ storeSlug }: StorefrontThemeToggleProps) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(`storefront_theme_${storeSlug}`);
    return saved === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Helper: sync computed CSS variables from the current mode into inline styles
    const syncComputedVarsToInline = () => {
      const computed = getComputedStyle(root);
      const vars = [
        '--background','--foreground','--card','--card-foreground','--popover','--popover-foreground','--border','--input','--muted','--muted-foreground','--secondary','--secondary-foreground','--accent','--accent-foreground','--ring','--primary','--primary-foreground'
      ];
      vars.forEach(v => {
        const val = computed.getPropertyValue(v).trim();
        if (val) root.style.setProperty(v, val);
      });
    };
    
    if (isDark) {
      root.classList.add('storefront-dark');
      localStorage.setItem(`storefront_theme_${storeSlug}`, 'dark');
    } else {
      root.classList.remove('storefront-dark');
      localStorage.setItem(`storefront_theme_${storeSlug}`, 'light');
    }

    // Wait a frame so the class takes effect, then sync variables so they override ThemeProvider inline values
    requestAnimationFrame(syncComputedVarsToInline);
  }, [isDark, storeSlug]);

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
