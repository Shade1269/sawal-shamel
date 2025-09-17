import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Home, 
  ArrowLeft,
  Search,
  User,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-mobile';

const mobileNavVariants = cva(
  "w-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        glass: "glass-effect backdrop-blur-xl",
        luxury: "luxury-effect text-white", 
        persian: "persian-effect text-white"
      },
      position: {
        top: "top-0",
        bottom: "bottom-0",
        left: "left-0 top-0 h-full",
        right: "right-0 top-0 h-full"
      }
    },
    defaultVariants: {
      variant: "glass",
      position: "left"
    }
  }
);

export interface MobileNavItem {
  id: string;
  title: string;
  description?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: MobileNavItem[];
  divider?: boolean;
  action?: () => void;
}

export interface MobileNavigationProps 
  extends VariantProps<typeof mobileNavVariants> {
  items: MobileNavItem[];
  trigger?: React.ReactNode;
  title?: string;
  logo?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  useDrawer?: boolean;
  searchEnabled?: boolean;
  onSearchClick?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  trigger,
  title = "القائمة",
  logo,
  headerContent,
  footerContent,
  variant,
  position,
  useDrawer,
  searchEnabled = false,
  onSearchClick
}) => {
  const [open, setOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<MobileNavItem[]>(items);
  const [breadcrumb, setBreadcrumb] = useState<MobileNavItem[]>([]);
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Auto-determine drawer vs sheet based on device
  const shouldUseDrawer = useDrawer ?? isMobile;

  // Close navigation on route change
  useEffect(() => {
    setOpen(false);
    setCurrentLevel(items);
    setBreadcrumb([]);
  }, [location.pathname, items]);

  const handleItemClick = (item: MobileNavItem) => {
    if (item.children && item.children.length > 0) {
      // Navigate to submenu
      setBreadcrumb(prev => [...prev, item]);
      setCurrentLevel(item.children!);
    } else if (item.action) {
      // Execute action
      item.action();
      setOpen(false);
    } else if (item.href) {
      // Navigate to route
      setOpen(false);
    }
  };

  const handleBackClick = () => {
    if (breadcrumb.length > 0) {
      const newBreadcrumb = [...breadcrumb];
      const parent = newBreadcrumb.pop();
      setBreadcrumb(newBreadcrumb);
      
      if (newBreadcrumb.length === 0) {
        setCurrentLevel(items);
      } else {
        const parentItem = newBreadcrumb[newBreadcrumb.length - 1];
        setCurrentLevel(parentItem.children || items);
      }
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  );

  const renderNavItem = (item: MobileNavItem, index: number) => {
    const ItemComponent = item.href ? Link : 'div';
    const itemProps = item.href ? { to: item.href } : {};
    const isActive = item.href && location.pathname === item.href;

    return (
      <React.Fragment key={item.id}>
        {item.divider && index > 0 && (
          <Separator className="my-2" />
        )}
        
        <ItemComponent
          {...itemProps}
          onClick={() => handleItemClick(item)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
            "hover:bg-accent/50 active:bg-accent/80",
            isActive && "bg-primary/10 text-primary border border-primary/20"
          )}
        >
          {item.icon && (
            <item.icon className={cn(
              "h-5 w-5 shrink-0",
              isActive && "text-primary"
            )} />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium truncate",
                isActive && "text-primary"
              )}>
                {item.title}
              </span>
              {item.badge && (
                <Badge 
                  variant={isActive ? "default" : "secondary"}
                  size="sm"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {item.description}
              </p>
            )}
          </div>
          
          {item.children && item.children.length > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </ItemComponent>
      </React.Fragment>
    );
  };

  const navigationContent = (
    <div className={cn(mobileNavVariants({ variant }), "h-full flex flex-col")}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          {breadcrumb.length > 0 ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : logo ? (
            <div className="flex items-center gap-2">
              {logo}
            </div>
          ) : (
            <Home className="h-5 w-5" />
          )}
          
          <div>
            <h2 className="font-semibold">
              {breadcrumb.length > 0 
                ? breadcrumb[breadcrumb.length - 1].title 
                : title
              }
            </h2>
            {breadcrumb.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {breadcrumb.map(item => item.title).join(' > ')}
              </p>
            )}
          </div>
        </div>

        {/* Search Button */}
        {searchEnabled && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSearchClick}
            className="p-2"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Additional Header Content */}
      {headerContent && (
        <div className="p-4 border-b border-border/30">
          {headerContent}
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {currentLevel.map((item, index) => renderNavItem(item, index))}
      </div>

      {/* Footer Content */}
      {footerContent && (
        <div className="p-4 border-t border-border/30">
          {footerContent}
        </div>
      )}
    </div>
  );

  if (shouldUseDrawer) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="h-[85vh] p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {navigationContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {navigationContent}
      </SheetContent>
    </Sheet>
  );
};

// Bottom Navigation for Mobile
interface BottomNavItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  variant?: 'default' | 'glass' | 'luxury' | 'persian';
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  variant = 'glass',
  className
}) => {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 md:hidden",
      "border-t border-border/30 shadow-luxury",
      variant === 'default' && "bg-background",
      variant === 'glass' && "glass-effect backdrop-blur-xl",
      variant === 'luxury' && "luxury-effect",
      variant === 'persian' && "persian-effect",
      className
    )}>
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-0 flex-1 transition-all duration-200",
                "hover:bg-accent/30 rounded-lg",
                isActive && "text-primary"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive && "text-primary scale-110"
                )} />
                {item.badge && (
                  <Badge 
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs truncate w-full text-center",
                isActive && "font-medium text-primary"
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export { MobileNavigation, BottomNavigation, mobileNavVariants };