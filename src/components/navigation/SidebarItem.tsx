import { NavLink, useLocation } from 'react-router-dom';
import { LucideIcon, Star, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Accessible Sidebar Item Component
 * Compliant with WCAG 2.1 & WAI-ARIA 1.2 Standards
 *
 * Standards implemented:
 * - WCAG 2.1.1: Keyboard accessible (Tab, Enter)
 * - WCAG 2.4.3: Logical focus order
 * - WCAG 2.4.7: Visible focus indicator
 * - WCAG 2.4.4: Link Purpose (In Context)
 * - WCAG 1.4.11: Non-text Contrast (focus indicator)
 * - WAI-ARIA: aria-current for active page
 */

export interface SidebarItemData {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  children?: SidebarItemData[];
  color?: string;
  /** Accessible description for screen readers */
  description?: string;
}

interface SidebarItemProps {
  item: SidebarItemData;
  isCollapsed?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  level?: number;
}

export function SidebarItem({
  item,
  isCollapsed,
  isFavorite,
  onToggleFavorite,
  level = 0
}: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  const itemContent = (
    <div className="relative group">
      <NavLink
        to={item.href}
        // WAI-ARIA: aria-current="page" for active navigation item
        aria-current={isActive ? "page" : undefined}
        // Accessible description if provided
        aria-describedby={item.description ? `${item.id}-desc` : undefined}
        className={cn(
          // WCAG 2.5.5: Minimum touch target 44px
          "flex items-center gap-3 px-3 min-h-[44px] py-3 mx-2 rounded-lg transition-all duration-200",
          "text-muted-foreground",
          // Touch-friendly: prevent accidental zoom on double-tap
          "touch-manipulation",
          // Hover state - Desktop (pink background, maroon text as per UX spec)
          "hover:bg-[hsl(0_60%_97%)] hover:text-primary hover:shadow-sm",
          "hover:scale-[1.02]",
          // Active state - Mobile touch
          "active:bg-[hsl(0_60%_97%)] active:text-primary active:scale-[0.98]",
          // Focus visible indicator (WCAG 2.4.7)
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          // Current/Active page state
          isActive && [
            "bg-gradient-to-l from-primary/20 via-primary/10 to-transparent",
            "text-primary font-semibold shadow-md border-l-2 border-primary",
            "shadow-primary/10"
          ],
          isCollapsed && "justify-center px-2",
          level > 0 && "mr-6"
        )}
        style={
          isActive && item.color
            ? {
                background: `linear-gradient(90deg, hsl(${item.color})/0.2, hsl(${item.color})/0.05, transparent)`,
                borderLeftColor: `hsl(${item.color})`
              }
            : undefined
        }
      >
        {Icon && (
          <Icon
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
              isActive && "drop-shadow-sm"
            )}
            aria-hidden="true"
          />
        )}

        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium truncate">
              {item.title}
            </span>

            {item.badge && (
              <span
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[hsl(var(--sidebar-active))]/10 text-[hsl(var(--sidebar-active))]"
                )}
                // Screen reader announcement for badge
                aria-label={`${item.badge} عنصر`}
              >
                {item.badge}
              </span>
            )}

            {item.children && item.children.length > 0 && (
              <ChevronLeft className="h-4 w-4 opacity-50" aria-hidden="true" />
            )}
          </>
        )}

        {/* Hidden description for screen readers */}
        {item.description && (
          <span id={`${item.id}-desc`} className="sr-only">
            {item.description}
          </span>
        )}
      </NavLink>

      {/* Favorite Star */}
      {!isCollapsed && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(item.id);
          }}
          // Accessible label for screen readers
          aria-label={isFavorite ? `إزالة ${item.title} من المفضلة` : `إضافة ${item.title} للمفضلة`}
          aria-pressed={isFavorite}
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
            "transition-all duration-200 hover:scale-110",
            // Focus visible indicator (WCAG 2.4.7)
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded",
            isFavorite && "opacity-100"
          )}
        >
          <Star
            className={cn(
              "h-3.5 w-3.5",
              isFavorite
                ? "fill-yellow-400 text-yellow-400"
                : "text-[hsl(var(--sidebar-text-secondary))]"
            )}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );

  if (isCollapsed && Icon) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {itemContent}
          </TooltipTrigger>
          <TooltipContent side="left" className="font-arabic">
            <p>{item.title}</p>
            {item.badge && (
              <span className="mr-2 text-xs opacity-75">({item.badge})</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return itemContent;
}