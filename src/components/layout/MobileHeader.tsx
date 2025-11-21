import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search, Bell, ShoppingCart, User } from 'lucide-react';
import { GlobalSearch, GlobalNotifications } from '@/shared/components';
import { ShoppingCartDrawer } from '@/features/commerce';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getTouchFriendlySize } from '@/utils/deviceUtils';

interface MobileHeaderProps {
  showAuth?: boolean;
  onMenuClick?: () => void;
}

export function MobileHeader({ showAuth = false, onMenuClick }: MobileHeaderProps) {
  const device = useDeviceDetection();
  const touchSize = getTouchFriendlySize(device);

  return (
    <header className="h-16 bg-card/30 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          {!showAuth && (
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
            منصة الأفيليت
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {showAuth ? (
            // Auth pages - minimal header
            <Button variant="ghost" size="sm" className="p-2">
              <User className="h-5 w-5" />
            </Button>
          ) : (
            // Authenticated pages - full functionality
            <>
              <GlobalSearch />
              <GlobalNotifications />
              <ShoppingCartDrawer />
            </>
          )}
        </div>
      </div>
    </header>
  );
}