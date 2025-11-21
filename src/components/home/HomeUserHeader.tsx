import { UnifiedButton } from '@/components/design-system';
import { User, Languages, Sun, Moon, LogOut } from 'lucide-react';

interface HomeUserHeaderProps {
  userName: string;
  language: string;
  isDarkMode: boolean;
  onLanguageToggle: () => void;
  onDarkModeToggle: () => void;
  onSignOut: () => void;
}

export const HomeUserHeader = ({
  userName,
  language,
  isDarkMode,
  onLanguageToggle,
  onDarkModeToggle,
  onSignOut
}: HomeUserHeaderProps) => {
  return (
    <div className="border-b glass-card-strong border-border/20 shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 glass-button px-4 py-2 rounded-xl border border-border/30 shadow-soft">
            <User className="h-5 w-5 text-primary animate-float" />
            <span className="text-base font-semibold text-primary">
              مرحباً، {userName}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={onLanguageToggle}
              className="gap-2 interactive-scale glass-button border border-border/20"
            >
              <Languages className="h-4 w-4" />
              {language === 'ar' ? 'EN' : 'AR'}
            </UnifiedButton>
            
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={onDarkModeToggle}
              className="gap-2 interactive-scale glass-button border border-border/20"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDarkMode ? 'نهاري' : 'ليلي'}
            </UnifiedButton>
            
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="gap-2 interactive-scale glass-button border border-border/20"
            >
              <LogOut className="h-4 w-4" />
              تسجيل خروج
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  );
};
