import { Link } from 'react-router-dom';
import { Button } from '@/ui/Button';
import { cn } from '@/lib/utils';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  to?: string;
  action?: () => void;
}

interface QuickActionsPanelProps {
  actions: QuickAction[];
}

export function QuickActionsPanel({ actions }: QuickActionsPanelProps) {
  const { isDarkMode } = useDarkMode();

  const quickActionLinkClass = `flex items-center justify-between gap-[var(--spacing-md)] rounded-[var(--radius-m)] border px-[var(--spacing-md)] py-[var(--spacing-sm)] text-right transition-all duration-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
    isDarkMode 
      ? 'border-border/50 bg-card/80 text-foreground hover:bg-card/60 focus-visible:ring-offset-card'
      : 'border-slate-200/50 bg-slate-50/80 text-slate-800 hover:bg-slate-100 focus-visible:ring-offset-white'
  }`;

  return (
    <div className={`flex h-full flex-col gap-[var(--spacing-md)] rounded-[var(--radius-l)] border p-[var(--spacing-lg)] backdrop-blur-xl transition-colors duration-500 ${
      isDarkMode 
        ? 'border-border/50 bg-card/88 shadow-glass-soft'
        : 'border-slate-200/50 bg-white/90 shadow-lg'
    }`}>
      <h2 className={`text-sm font-semibold heading-ar transition-colors duration-500 ${
        isDarkMode ? 'text-foreground' : 'text-slate-800'
      }`}>روابط سريعة</h2>
      <nav aria-label="روابط عمليات المسوق" className="flex flex-col gap-[var(--spacing-sm)]">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <span className="flex flex-1 flex-col text-right">
              <span className={`text-sm font-medium premium-text transition-colors duration-500 ${
                isDarkMode ? 'text-foreground' : 'text-slate-800'
              }`}>{action.label}</span>
              <span className={`text-xs elegant-text transition-colors duration-500 ${
                isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
              }`}>{action.description}</span>
            </span>
          );

          return action.to ? (
            <Link key={action.id} to={action.to} className={cn(quickActionLinkClass, 'w-full')}>
              <Icon className={`h-5 w-5 transition-colors duration-500 ${
                isDarkMode ? 'text-accent' : 'text-blue-600'
              }`} aria-hidden />
              {content}
            </Link>
          ) : (
            <Button
              key={action.id}
              type="button"
              variant="ghost"
              onClick={action.action}
              className={cn(quickActionLinkClass, 'group w-full')}
            >
              <Icon className={`h-5 w-5 transition-all duration-200 group-hover:scale-110 ${
                isDarkMode ? 'text-accent' : 'text-blue-600'
              }`} aria-hidden />
              {content}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
