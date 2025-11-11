import React from 'react';
import { Palette, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UnifiedButton } from '@/components/design-system';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

/**
 * Theme Switcher Component
 * Dropdown menu for selecting application theme
 */

interface ThemeSwitcherProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  variant = 'icon',
  className 
}) => {
  const { themeId, setThemeId, availableThemes } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <UnifiedButton
            variant="ghost"
            size="icon"
            className={className}
            aria-label="اختر الثيم"
          >
            <Palette className="h-5 w-5" />
          </UnifiedButton>
        ) : (
          <UnifiedButton
            variant="outline"
            className={cn('gap-2', className)}
          >
            <Palette className="h-4 w-4" />
            <span>الثيم</span>
          </UnifiedButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glass-card">
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setThemeId(theme.id)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              'hover:bg-primary/10 transition-colors',
              themeId === theme.id && 'bg-primary/20'
            )}
          >
            <span className="elegant-text">{theme.name}</span>
            {themeId === theme.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
