import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Unified Sidebar Component
 * Single sidebar component for all sections (Admin, Affiliate, Merchant)
 */

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarSection {
  id: string;
  label: string;
  items: SidebarItem[];
  color?: string; // e.g., 'primary', 'success', 'warning'
}

interface UnifiedSidebarProps {
  /** Sidebar sections */
  sections: SidebarSection[];
  /** Is sidebar collapsed */
  collapsed?: boolean;
  /** Toggle collapse */
  onToggleCollapse?: () => void;
  /** Custom header element */
  header?: React.ReactNode;
  /** Custom footer element */
  footer?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Mobile drawer open state */
  mobileOpen?: boolean;
  /** Mobile drawer close handler */
  onMobileClose?: () => void;
}

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  sections,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  className,
  mobileOpen = false,
  onMobileClose,
}) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const toggleGroup = (itemId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getSectionColor = (color?: string) => {
    const colors: Record<string, string> = {
      primary: 'hsl(var(--primary-hsl))',
      success: 'hsl(var(--success-hsl))',
      warning: 'hsl(var(--warning-hsl))',
      danger: 'hsl(var(--danger-hsl))',
      accent: 'hsl(var(--accent-hsl))',
    };
    return colors[color || 'primary'] || colors.primary;
  };

  const handleItemClick = () => {
    // Close mobile sidebar when item is clicked
    if (onMobileClose && mobileOpen) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 z-50 h-screen border-l glass-card-strong transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        // Mobile drawer behavior
        'max-md:transform max-md:translate-x-0',
        !mobileOpen && 'max-md:translate-x-full',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        {header && (
          <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
            {!collapsed && header}
          </div>
        )}

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="space-y-2">
                {/* Section Label */}
                {!collapsed && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.label}
                    </h3>
                  </div>
                )}

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedGroups.includes(item.id);

                    return (
                      <div key={item.id}>
                        {/* Main Item */}
                        {hasChildren ? (
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-full justify-start gap-3 rounded-xl transition-all duration-200',
                              active
                                ? 'bg-primary/10 text-primary font-semibold shadow-soft'
                                : 'text-foreground hover:bg-accent/50',
                              collapsed && 'justify-center px-2'
                            )}
                            onClick={() => toggleGroup(item.id)}
                          >
                            <Icon
                              className="h-5 w-5 flex-shrink-0"
                              style={
                                active
                                  ? { color: getSectionColor(section.color) }
                                  : undefined
                              }
                            />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-right">{item.label}</span>
                                {item.badge && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                    {item.badge}
                                  </span>
                                )}
                                <ChevronLeft
                                  className={cn(
                                    'h-4 w-4 transition-transform',
                                    isExpanded && 'rotate-90'
                                  )}
                                />
                              </>
                            )}
                          </Button>
                        ) : (
                          <Link to={item.href} onClick={handleItemClick}>
                            <Button
                              variant="ghost"
                              className={cn(
                                'w-full justify-start gap-3 rounded-xl transition-all duration-200',
                                active
                                  ? 'bg-primary/10 text-primary font-semibold shadow-soft'
                                  : 'text-foreground hover:bg-accent/50',
                                collapsed && 'justify-center px-2'
                              )}
                            >
                              <Icon
                                className="h-5 w-5 flex-shrink-0"
                                style={
                                  active
                                    ? { color: getSectionColor(section.color) }
                                    : undefined
                                }
                              />
                              {!collapsed && (
                                <>
                                  <span className="flex-1 text-right">{item.label}</span>
                                  {item.badge && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                      {item.badge}
                                    </span>
                                  )}
                                </>
                              )}
                            </Button>
                          </Link>
                        )}

                        {/* Children Items */}
                        {hasChildren && isExpanded && !collapsed && (
                          <div className="mr-4 mt-1 space-y-1 border-r-2 border-border/40 pr-2">
                            {item.children!.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = isActive(child.href);

                              return (
                                <Link key={child.id} to={child.href} onClick={handleItemClick}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      'w-full justify-start gap-2 rounded-lg transition-all duration-200',
                                      childActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                    )}
                                  >
                                    <ChildIcon className="h-4 w-4" />
                                    <span className="flex-1 text-right text-sm">
                                      {child.label}
                                    </span>
                                    {child.badge && (
                                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                        {child.badge}
                                      </span>
                                    )}
                                  </Button>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border/40 p-3">
            {!collapsed && footer}
          </div>
        )}

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <div className="border-t border-border/40 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-full rounded-xl hover:bg-accent/50 transition-all duration-200"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="mr-2">طي القائمة</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default UnifiedSidebar;
