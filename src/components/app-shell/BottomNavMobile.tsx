import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onPrefetch?: () => void;
  isActive?: (pathname: string) => boolean;
}

export interface BottomNavMobileProps {
  items: BottomNavItem[];
}

export const BottomNavMobile: React.FC<BottomNavMobileProps> = React.memo(({ items }) => {
  const reduceMotion = usePrefersReducedMotion();
  const motionClass = reduceMotion ? 'transition-none' : 'transition-all duration-200';
  const location = useLocation();

  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card/90 px-2 py-2 text-card-foreground shadow-soft backdrop-blur-2xl md:hidden"
      data-component="bottom-nav-mobile"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.isActive
          ? item.isActive(location.pathname)
          : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

        return (
          <Link
            key={item.to}
            to={item.to}
            className={[
              'relative flex flex-col items-center rounded-[var(--radius-s)] px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card',
              motionClass,
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-card-foreground',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
            onMouseEnter={() => item.onPrefetch?.()}
            onFocus={() => item.onPrefetch?.()}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-muted text-card-foreground">
              <Icon className="h-5 w-5" aria-hidden />
              {typeof item.badge === 'number' && item.badge > 0 ? (
                <span className="absolute -top-1 -left-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="mt-1 text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});

BottomNavMobile.displayName = 'BottomNavMobile';

export default BottomNavMobile;
