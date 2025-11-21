import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { GlobalSearch, GlobalNotifications } from '@/shared/components';
import { ShoppingCartDrawer } from '@/features/commerce';
import { QuickActions } from './QuickActions';

interface DesktopHeaderProps {
  showAuth?: boolean;
  compact?: boolean;
}

export function DesktopHeader({ showAuth = false, compact = false }: DesktopHeaderProps) {
  const headerHeight = compact ? 'h-12' : 'h-14';
  const titleSize = compact ? 'text-base' : 'text-lg';

  return (
    <header className={`${headerHeight} border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-40`}>
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-3">
          {!showAuth && (
            <SidebarTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-4 w-4" />
              </Button>
            </SidebarTrigger>
          )}
          
          <div className={`${titleSize} font-semibold bg-gradient-primary bg-clip-text text-transparent`}>
            منصة الأفيليت
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showAuth && !compact && <QuickActions />}
          <GlobalSearch />
          <GlobalNotifications />
          {!showAuth && <ShoppingCartDrawer />}
        </div>
      </div>
    </header>
  );
}