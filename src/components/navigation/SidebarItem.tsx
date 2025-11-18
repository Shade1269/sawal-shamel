import { NavLink, useLocation } from 'react-router-dom';
import { LucideIcon, Star, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SidebarItemData {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  children?: SidebarItemData[];
  color?: string;
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
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200",
          "text-[hsl(var(--sidebar-text-secondary))]",
          "hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-text))]",
          "hover:scale-[1.02] active:scale-[0.98]",
          isActive && [
            "gradient-sidebar-active",
            "text-primary-foreground font-medium shadow-lg",
            "shadow-[hsl(var(--sidebar-active-glow))]/30"
          ],
          isCollapsed && "justify-center px-2",
          level > 0 && "mr-6"
        )}
        style={
          isActive && item.color
            ? {
                background: `linear-gradient(135deg, hsl(${item.color}), hsl(var(--sidebar-active)))`,
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
          />
        )}
        
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium truncate">
              {item.title}
            </span>
            
            {item.badge && (
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full font-semibold",
                isActive 
                  ? "bg-white/20 text-white"
                  : "bg-[hsl(var(--sidebar-active))]/10 text-[hsl(var(--sidebar-active))]"
              )}>
                {item.badge}
              </span>
            )}
            
            {item.children && item.children.length > 0 && (
              <ChevronLeft className="h-4 w-4 opacity-50" />
            )}
          </>
        )}
      </NavLink>

      {/* Favorite Star */}
      {!isCollapsed && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(item.id);
          }}
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
            "transition-all duration-200 hover:scale-110",
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
          />
        </button>
      )}

      {/* Active Indicator */}
      {isActive && !isCollapsed && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-lg" />
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