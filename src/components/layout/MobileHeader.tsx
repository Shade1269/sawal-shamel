import { UnifiedButton } from '@/components/design-system';
import { Menu, User } from 'lucide-react';
import { GlobalSearch, GlobalNotifications } from '@/shared/components';
import { ShoppingCartDrawer } from '@/features/commerce';

interface MobileHeaderProps {
  showAuth?: boolean;
  onMenuClick?: () => void;
}

export function MobileHeader({ showAuth = false, onMenuClick }: MobileHeaderProps) {

  return (
    <header className="h-16 bg-card/30 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          {!showAuth && (
            <UnifiedButton 
              variant="ghost" 
              size="sm"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </UnifiedButton>
          )}
          
          <div className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
            منصة الأفيليت
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {showAuth ? (
            // Auth pages - minimal header
            <UnifiedButton variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </UnifiedButton>
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