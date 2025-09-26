import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

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

const baseLinkClasses =
  'group relative flex items-center gap-3 rounded-[var(--radius-m)] border border-transparent px-3 py-2 text-sm font-medium text-[color:var(--muted-foreground)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]';

export const SidebarDesktop: React.FC<SidebarDesktopProps> = React.memo(({ groups, onClose, className }) => {
  const reduceMotion = usePrefersReducedMotion();
  const motionClass = reduceMotion ? 'transition-none' : 'transition-colors duration-200';
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden h-screen min-w-[280px] max-w-[320px] flex-col gap-6 border-l border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 px-4 py-6 text-[color:var(--glass-fg)] shadow-[var(--shadow-glass-soft)] backdrop-blur-2xl lg:flex',
        className
      )}
      data-component="sidebar-desktop"
    >
      <nav aria-label="التنقل الرئيسي" className="flex-1 space-y-6 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.id} className="space-y-3" data-group-id={group.id}>
            <div className="px-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
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
                      baseLinkClasses,
                      motionClass,
                      isActive
                        ? 'border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--glass-fg)] shadow-[var(--shadow-glass-soft)]'
                        : 'hover:border-[color:var(--glass-border)] hover:bg-[color:var(--glass-bg-strong, var(--surface-2))] hover:text-[color:var(--glass-fg)]'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onMouseEnter={() => item.onPrefetch?.()}
                    onFocus={() => item.onPrefetch?.()}
                    onClick={onClose}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--glass-fg)]">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="flex flex-1 flex-col items-start">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {item.description ? (
                        <span className="text-xs text-[color:var(--muted-foreground)]">{item.description}</span>
                      ) : null}
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 ? (
                      <Badge variant="secondary" className="ml-auto">
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
      <div className="rounded-[var(--radius-m)] border border-dashed border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] p-4 text-xs text-[color:var(--muted-foreground)]">
        <p className="font-semibold text-[color:var(--glass-fg)]">نصائح الأداء</p>
        <p className="mt-2 leading-relaxed">
          التنقل هنا يدعم التحميل المسبق عند التحويم لضمان فتح الصفحات الثقيلة بسرعة، ويتم احترام تفضيل تقليل الحركة.
        </p>
      </div>
    </aside>
  );
});

SidebarDesktop.displayName = 'SidebarDesktop';

export default SidebarDesktop;
