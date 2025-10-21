import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSmartNavigation } from './SmartNavigationProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTouchFriendlySize } from '@/utils/deviceUtils';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export function MobileBottomNavigation() {
  const { state, getNavigationForDevice, toggleMobileMenu } = useSmartNavigation();
  const device = useDeviceDetection();
  const touchSize = getTouchFriendlySize(device);
  
  const navigationItems = getNavigationForDevice();
  const mainItems = navigationItems.slice(0, 4); // First 4 items
  const hasMoreItems = navigationItems.length > 4;
  const hasVisibleItems = mainItems.length > 0 || hasMoreItems;

  if (!state.bottomNavVisible || !hasVisibleItems) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border/50">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Main Navigation Items */}
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.currentPath === item.href;
            
            return (
              <NavLink
                key={item.id}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 rounded-lg min-w-[60px] relative transition-all duration-200",
                  touchSize.buttonHeight,
                  isActive 
                    ? "text-primary bg-primary/10 scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  {Icon && <Icon className="h-5 w-5 mb-1" />}
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-[50px]">
                  {item.title}
                </span>
              </NavLink>
            );
          })}
          
          {/* More Menu - Shows when there are more than 4 items */}
          {hasMoreItems && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center justify-center px-2 py-2 rounded-lg min-w-[60px]",
                    touchSize.buttonHeight
                  )}
                >
                  <Menu className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">المزيد</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>جميع الصفحات</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = state.currentPath === item.href;
                    
                    return (
                      <NavLink
                        key={item.id}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          touchSize.buttonHeight,
                          isActive 
                            ? "text-primary bg-primary/10" 
                            : "text-foreground hover:bg-muted/50"
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                        {item.badge && item.badge > 0 && (
                          <Badge variant="secondary">
                            {item.badge > 9 ? '9+' : item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16" />
    </>
  );
}