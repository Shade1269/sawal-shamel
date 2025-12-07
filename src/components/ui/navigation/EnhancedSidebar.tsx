import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const sidebarVariants = cva(
  "transition-all duration-300 ease-persian",
  {
    variants: {
      variant: {
        default: "bg-sidebar text-sidebar-foreground",
        luxury: "luxury-effect text-white",
        persian: "persian-effect text-white", 
        glass: "glass-effect backdrop-blur-xl",
        gradient: "bg-gradient-persian text-white"
      },
      size: {
        default: "w-64",
        compact: "w-56", 
        wide: "w-72"
      },
      animation: {
        none: "",
        slide: "animate-slide-up",
        fade: "animate-fade-in",
        float: "animate-persian-float"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "slide"
    }
  }
);

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
  isActive?: boolean;
  description?: string;
  permission?: string[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface EnhancedSidebarProps 
  extends React.ComponentProps<typeof Sidebar> {
  navigation: NavigationGroup[];
  header?: React.ReactNode;
  footer?: React.ReactNode; 
  showGroupLabels?: boolean;
  compactMode?: boolean;
  sidebarVariant?: VariantProps<typeof sidebarVariants>['variant'];
  sidebarSize?: VariantProps<typeof sidebarVariants>['size'];
  sidebarAnimation?: VariantProps<typeof sidebarVariants>['animation'];
}

const EnhancedSidebarItem: React.FC<{
  item: NavigationItem;
  level?: number;
  compactMode?: boolean;
}> = ({ item, level = 0, compactMode = false }) => {
  const location = useLocation();
  const { state } = useSidebar();
  const [isOpen, setIsOpen] = React.useState(item.children?.some(child => 
    location.pathname.startsWith(child.href)
  ) || false);
  
  const isActive = location.pathname === item.href || 
    (item.children?.some(child => location.pathname.startsWith(child.href)));
  
  const isCollapsed = state === "collapsed";
  
  if (item.children && item.children.length > 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "w-full justify-between transition-all duration-200",
                isActive && "bg-primary/10 text-primary font-medium border-r-2 border-primary",
                level > 0 && "ml-4",
                isCollapsed && "justify-center"
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0",
                    isActive && "text-primary"
                  )} />
                )}
                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "default" : "secondary"}
                        size="sm"
                        className="ml-auto"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {!isCollapsed && (
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-90"
                )} />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="animate-accordion-down">
            <SidebarMenu>
              {item.children.map((child, index) => (
                <EnhancedSidebarItem
                  key={`${child.href}-${index}`}
                  item={child}
                  level={level + 1}
                  compactMode={compactMode}
                />
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.href}
          className={({ isActive }) => cn(
            "w-full transition-all duration-200 hover:bg-accent/50 group",
            isActive && "bg-primary/10 text-primary font-medium border-r-2 border-primary",
            level > 0 && "ml-4",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex items-center gap-3 w-full">
            {item.icon && (
              <item.icon className={cn(
                "h-4 w-4 shrink-0 group-hover:scale-110 transition-transform",
                location.pathname === item.href && "text-primary"
              )} />
            )}
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  {item.description && compactMode && (
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.badge && (
                  <Badge 
                    variant={location.pathname === item.href ? "default" : "secondary"}
                    size="sm"
                    className="ml-auto"
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </div>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const EnhancedSidebar = React.forwardRef<
  React.ElementRef<typeof Sidebar>,
  EnhancedSidebarProps
>(({ 
  className, 
  sidebarVariant, 
  sidebarSize, 
  sidebarAnimation,
  navigation, 
  header, 
  footer,
  showGroupLabels = true,
  compactMode = false,
  ...props 
}, ref) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      ref={ref}
      className={cn(
        sidebarVariants({ variant: sidebarVariant, size: sidebarSize, animation: sidebarAnimation }),
        "border-r border-border/40 shadow-elegant",
        className
      )}
      {...props}
    >
      {/* Header */}
      {header && (
        <SidebarHeader className={cn(
          "border-b border-border/40 p-4",
          isCollapsed && "px-2"
        )}>
          {header}
        </SidebarHeader>
      )}

      {/* Navigation Content */}
      <SidebarContent className="px-2 py-4">
        {navigation.map((group, groupIndex) => (
          <SidebarGroup 
            key={`${group.label}-${groupIndex}`}
            className="space-y-1"
          >
            {showGroupLabels && !isCollapsed && (
              <SidebarGroupLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                {group.icon && <group.icon className="h-3 w-3" />}
                {group.label}
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => (
                  <EnhancedSidebarItem
                    key={`${item.href}-${itemIndex}`}
                    item={item}
                    compactMode={compactMode}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      {footer && (
        <SidebarFooter className={cn(
          "border-t border-border/40 p-4 mt-auto",
          isCollapsed && "px-2"
        )}>
          {footer}
        </SidebarFooter>
      )}
    </Sidebar>
  );
});
EnhancedSidebar.displayName = "EnhancedSidebar";

export { EnhancedSidebar, sidebarVariants };