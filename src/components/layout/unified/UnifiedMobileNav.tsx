import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * Unified Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 */

export interface MobileNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
}

interface UnifiedMobileNavProps {
  /** Navigation items */
  items: MobileNavItem[];
  /** Custom className */
  className?: string;
}

export const UnifiedMobileNav: React.FC<UnifiedMobileNavProps> = ({
  items,
  className,
}) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'h-16 glass-card-strong border-t border-border/40',
        'safe-area-bottom',
        className
      )}
    >
      <div className="flex h-full items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', active && 'scale-110')} />
                {item.badge && (
                  <span className="absolute -top-2 -left-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-medium px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  active ? 'font-semibold' : 'font-normal'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default UnifiedMobileNav;
