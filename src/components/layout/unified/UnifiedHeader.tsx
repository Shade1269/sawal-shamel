import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Unified Header Component
 * Single header component for all sections (Admin, Affiliate, Merchant)
 */

interface UnifiedHeaderProps {
  /** Show search bar */
  showSearch?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Show notifications bell */
  showNotifications?: boolean;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Show dark mode toggle */
  showDarkModeToggle?: boolean;
  /** Additional actions to show in header */
  actions?: React.ReactNode;
  /** Custom logo/brand element */
  logo?: React.ReactNode;
  /** Sidebar toggle handler */
  onSidebarToggle?: () => void;
  /** Custom className */
  className?: string;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  showSearch = true,
  searchPlaceholder = 'البحث...',
  showNotifications = true,
  notificationCount = 0,
  showDarkModeToggle = true,
  actions,
  logo,
  onSidebarToggle,
  className,
}) => {
  const navigate = useNavigate();
  const { profile, user } = useFastAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'تم تسجيل الخروج',
        description: 'تم تسجيل خروجك بنجاح',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0);
    if (user?.email) return user.email.charAt(0);
    return 'م';
  };

  return (
    <header
      className={cn(
        'h-16 border-b sticky top-0 z-40 glass-card-strong',
        className
      )}
    >
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Sidebar Toggle */}
        {onSidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="rounded-xl hover:bg-accent transition-all duration-200 hover:scale-105"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo/Brand */}
        {logo ? (
          <div className="flex items-center gap-2">{logo}</div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl glass-button px-3 py-1.5 shadow-soft">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary text-sm font-bold">
              {getUserInitial()}
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">منصة</span>
              <span className="text-sm font-semibold text-foreground">أتلانتس</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="flex-1 max-w-md md:max-w-lg">
            <div className="relative group">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary transition-colors duration-200" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pr-10 h-10 text-right glass-button border-border/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Dark Mode Toggle */}
        {showDarkModeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-xl hover:bg-accent transition-all duration-200 hover:scale-105"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Notifications */}
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-accent transition-all duration-200 hover:scale-105"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs animate-pulse"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-accent transition-all duration-200 hover:scale-105 ring-2 ring-transparent hover:ring-primary/20"
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-primary text-white font-bold text-sm">
                  {getUserInitial()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-card border-border/50" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none premium-text">
                  {profile?.full_name || 'مستخدم'}
                </p>
                <p className="text-xs leading-none text-muted-foreground elegant-text">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default UnifiedHeader;
