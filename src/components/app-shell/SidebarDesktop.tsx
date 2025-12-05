import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  description?: string;
  onPrefetch?: () => void;
  isActive?: (pathname: string) => boolean;
}

export interface SidebarNavGroup {
  id: string;
  title: string;
  items: SidebarNavItem[];
}

export interface SidebarDesktopProps {
  groups: SidebarNavGroup[];
  onClose?: () => void;
  className?: string;
}

export const SidebarDesktop: React.FC<SidebarDesktopProps> = React.memo(({ groups, onClose, className }) => {
  const reduceMotion = usePrefersReducedMotion();
  const motionClass = reduceMotion ? 'transition-none' : 'transition-all duration-200';
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden h-screen min-w-[280px] max-w-[320px] flex-col border-l border-border bg-card px-4 py-6 shadow-lg lg:flex lg:flex-shrink-0',
        className
      )}
      data-component="sidebar-desktop"
    >
      {/* Header Logo */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">أناقتي</h2>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </div>
      </div>

      <nav aria-label="التنقل الرئيسي" className="flex-1 space-y-6 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.id} className="space-y-2" data-group-id={group.id}>
            <div className="px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive
                  ? item.isActive(location.pathname)
                  : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      motionClass,
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-foreground hover:bg-secondary hover:text-primary'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onMouseEnter={() => item.onPrefetch?.()}
                    onFocus={() => item.onPrefetch?.()}
                    onClick={onClose}
                  >
                    <span className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                      isActive 
                        ? 'bg-primary-foreground/20' 
                        : 'bg-secondary group-hover:bg-secondary/80'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4',
                        isActive ? 'text-primary-foreground' : 'text-primary'
                      )} aria-hidden />
                    </span>
                    <div className="flex flex-1 flex-col items-start">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {item.description ? (
                        <span className={cn(
                          'text-xs',
                          isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>{item.description}</span>
                      ) : null}
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 ? (
                      <Badge className={cn(
                        'ml-auto text-xs',
                        isActive 
                          ? 'bg-primary-foreground/20 text-primary-foreground border-0' 
                          : 'bg-accent text-accent-foreground border-0'
                      )}>
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Tips */}
      <div className="rounded-xl border border-border bg-muted p-4 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-accent/20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-accent" />
          </div>
          <p className="font-bold text-foreground">نصيحة</p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          استخدم اختصار Ctrl+B للتبديل السريع بين وضع الشريط الجانبي.
        </p>
      </div>
    </aside>
  );
});

SidebarDesktop.displayName = 'SidebarDesktop';

export default SidebarDesktop;
