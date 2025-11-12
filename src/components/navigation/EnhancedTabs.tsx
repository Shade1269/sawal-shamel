import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const tabsVariants = cva(
  "flex w-full",
  {
    variants: {
      variant: {
        default: "border-b border-border bg-background",
        luxury: "bg-gradient-luxury text-luxury-foreground border-b border-luxury/20",
        persian: "bg-gradient-persian text-persian-foreground border-b border-persian/20",
        glass: "glass-effect border-b border-border/30",
        filled: "bg-muted/50 rounded-lg p-1"
      },
      size: {
        sm: "h-9",
        md: "h-10", 
        lg: "h-12"
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col w-64"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      orientation: "horizontal"
    }
  }
);

const tabVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative group",
  {
    variants: {
      variant: {
        default: "border-b-2 border-transparent hover:border-primary/60 data-[active=true]:border-primary data-[active=true]:text-primary",
        luxury: "hover:bg-primary-foreground/10 data-[active=true]:bg-primary-foreground/20 data-[active=true]:text-luxury-foreground rounded-md",
        persian: "hover:bg-primary-foreground/10 data-[active=true]:bg-primary-foreground/20 data-[active=true]:text-persian-foreground rounded-md",
        glass: "hover:bg-background/80 data-[active=true]:bg-background data-[active=true]:text-foreground rounded-md",
        filled: "hover:bg-background/60 data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm rounded-md"
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  closeable?: boolean;
  disabled?: boolean;
  href?: string;
}

export interface EnhancedTabsProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsVariants> {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabAdd?: () => void;
  scrollable?: boolean;
  showAddButton?: boolean;
  maxTabs?: number;
}

const EnhancedTabs = React.forwardRef<HTMLDivElement, EnhancedTabsProps>(
  ({ 
    className,
    variant,
    size,
    orientation,
    tabs,
    activeTab,
    onTabChange,
    onTabClose,
    onTabAdd,
    scrollable = false,
    showAddButton = false,
    maxTabs,
    ...props 
  }, ref) => {
    const [internalActiveTab, setInternalActiveTab] = useState(activeTab || tabs[0]?.id);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const tabsRef = useRef<HTMLDivElement>(null);

    const currentActiveTab = activeTab || internalActiveTab;

    const handleTabClick = (tabId: string) => {
      if (onTabChange) {
        onTabChange(tabId);
      } else {
        setInternalActiveTab(tabId);
      }
    };

    const handleTabClose = (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onTabClose?.(tabId);
    };

    const checkScroll = () => {
      const container = tabsRef.current;
      if (!container) return;

      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    };

    const scrollLeft = () => {
      tabsRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    };

    const scrollRight = () => {
      tabsRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    };

    useEffect(() => {
      if (scrollable) {
        checkScroll();
        const container = tabsRef.current;
        container?.addEventListener('scroll', checkScroll);
        return () => container?.removeEventListener('scroll', checkScroll);
      }
    }, [scrollable, tabs]);

    const activeTabContent = tabs.find(tab => tab.id === currentActiveTab)?.content;

    return (
      <div className="w-full space-y-4">
        {/* Tabs Header */}
        <div className="relative">
          <div className={cn(tabsVariants({ variant, size, orientation }), className)} ref={ref} {...props}>
            {/* Scroll Left Button */}
            {scrollable && canScrollLeft && (
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollLeft}
                className="shrink-0 h-full rounded-none border-r"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Tabs Container */}
            <div
              ref={tabsRef}
              className={cn(
                "flex flex-1 min-w-0",
                scrollable && "overflow-x-auto scrollbar-hide",
                orientation === "vertical" && "flex-col"
              )}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  disabled={tab.disabled}
                  data-active={currentActiveTab === tab.id}
                  className={cn(
                    tabVariants({ variant, size }),
                    tab.disabled && "opacity-50 cursor-not-allowed",
                    scrollable && "shrink-0"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon && (
                      <tab.icon className={cn(
                        "h-4 w-4",
                        size === "sm" && "h-3 w-3",
                        size === "lg" && "h-5 w-5"
                      )} />
                    )}
                    <span className={scrollable ? "whitespace-nowrap" : "truncate"}>
                      {tab.label}
                    </span>
                    {tab.badge && (
                      <Badge 
                        variant="secondary" 
                        size="sm"
                        className="ml-1"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                    {tab.closeable && (
                      <button
                        onClick={(e) => handleTabClose(tab.id, e)}
                        className="ml-1 p-0.5 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-60 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Scroll Right Button */}
            {scrollable && canScrollRight && (
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollRight}
                className="shrink-0 h-full rounded-none border-l"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {/* Add Button */}
            {showAddButton && (!maxTabs || tabs.length < maxTabs) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTabAdd}
                className={cn(
                  "shrink-0 h-full rounded-none border-l",
                  variant !== "default" && "hover:bg-white/10"
                )}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTabContent && (
          <div className="tab-content animate-fade-in">
            {activeTabContent}
          </div>
        )}
      </div>
    );
  }
);
EnhancedTabs.displayName = "EnhancedTabs";

export { EnhancedTabs, tabsVariants, tabVariants };