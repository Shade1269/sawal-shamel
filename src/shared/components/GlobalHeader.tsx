import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const GlobalHeader: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* App Logo/Title can go here */}
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Globe className="h-4 w-4" />
                <span className="sr-only">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem
                onClick={toggleLanguage}
                className="cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {language === 'ar' ? (
                    <>
                      🇺🇸 {t('english')}
                    </>
                  ) : (
                    <>
                      🇸🇦 {t('arabic')}
                    </>
                  )}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-primary"
              aria-label={isDarkMode ? t('lightMode') : t('darkMode')}
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;