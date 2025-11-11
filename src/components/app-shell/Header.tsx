import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { ActionBar, type ActionBarProps } from './ActionBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface HeaderProps extends ActionBarProps {
  notificationsCount?: number;
  onToggleSidebar?: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onSignOut?: () => void | Promise<void>;
  isOffline?: boolean;
}

export const Header: React.FC<HeaderProps> = React.memo(
  ({
    notificationsCount = 0,
    onToggleSidebar,
    userName = 'مستخدم',
    userEmail,
    userRole,
    onSignOut,
    isOffline = false,
    ...actionProps
  }) => {
    const reduceMotion = usePrefersReducedMotion();
    const motionClass = reduceMotion ? 'transition-none' : 'transition-colors duration-200';
    const initials = userName ? userName.charAt(0).toUpperCase() : 'م';

    return (
      <header
        className="sticky top-0 z-40 border-b border-border bg-card/88 backdrop-blur-2xl"
        data-component="app-shell-header"
      >
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              aria-label="فتح القائمة الجانبية"
              className={`h-10 w-10 border border-transparent text-card-foreground hover:border-border hover:bg-muted lg:hidden ${motionClass}`}
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary text-sm font-bold">
                أ
              </span>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs text-muted-foreground">منصة أناقتي</span>
                <span className="text-sm font-semibold text-card-foreground">لوحة التحكم الزجاجية</span>
              </div>
            </div>
          </div>

          <div className="relative hidden min-w-[220px] flex-1 items-center lg:flex">
            <input
              type="search"
              placeholder="ابحث عن المنتجات أو الطلبات أو الشركاء..."
              className={`w-full rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card ${motionClass}`}
              aria-label="بحث"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {isOffline ? (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-warning bg-card/85 px-3 py-1 text-xs font-semibold text-warning shadow-soft"
                role="status"
                aria-live="polite"
                data-testid="header-offline-indicator"
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-warning" aria-hidden />
                <span>وضع غير متصل</span>
              </span>
            ) : null}
            <ActionBar {...actionProps} />

            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="عرض الإشعارات"
              className={`relative h-10 w-10 border border-transparent text-card-foreground hover:border-border hover:bg-muted ${motionClass}`}
            >
              <Link to="/notifications" aria-label="فتح مركز الإشعارات" className="flex h-full w-full items-center justify-center">
                <Bell className="h-5 w-5" aria-hidden />
                {notificationsCount > 0 ? (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -left-1 h-5 min-w-[1.25rem] rounded-full px-1 text-[10px]"
                    aria-label={`${notificationsCount} إشعارات جديدة`}
                  >
                    {notificationsCount}
                  </Badge>
                ) : null}
              </Link>
            </Button>

            <ThemeSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 rounded-full border border-transparent px-2 py-1.5 text-card-foreground hover:border-border hover:bg-muted ${motionClass}`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start text-right">
                    <span className="text-sm font-semibold leading-tight">{userName}</span>
                    <span className="text-[11px] text-muted-foreground">{userRole ?? 'عضو'}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <DropdownMenuLabel>
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold">{userName}</span>
                    {userEmail ? (
                      <span className="text-xs text-muted-foreground">{userEmail}</span>
                    ) : null}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-right" asChild>
                  <Link to="/profile" className="flex flex-1 items-center gap-2">
                    <User className="h-4 w-4" aria-hidden />
                    <span>الملف الشخصي</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-right" asChild>
                  <Link to="/notifications" className="flex flex-1 items-center gap-2">
                    <History className="h-4 w-4" aria-hidden />
                    <span>مركز الإشعارات</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    onSignOut?.();
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;
