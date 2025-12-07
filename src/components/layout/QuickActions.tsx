import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Command, 
  Bell, 
  Settings, 
  BarChart3, 
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
  Plus,
  Filter
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SmartSearch } from '@/components/ux/SmartSearch';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function QuickActions() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, _setNotifications] = useState(3);
  const { profile, signOut } = useFastAuth();
  const navigate = useNavigate();

  const { shortcuts: _shortcuts } = useKeyboardShortcuts({
    onSearchOpen: () => setSearchOpen(true),
    onNotificationsOpen: () => { /* Open notifications panel */ },
    onSettingsOpen: () => navigate('/settings')
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const quickCommands = [
    { 
      icon: Plus, 
      label: 'إضافة منتج', 
      shortcut: 'Ctrl+P',
      action: () => navigate('/products/new')
    },
    { 
      icon: BarChart3, 
      label: 'التحليلات', 
      shortcut: 'Ctrl+A',
      action: () => navigate('/analytics')
    },
    {
      icon: Filter,
      label: 'الفلاتر المتقدمة',
      shortcut: 'Ctrl+F',
      action: () => { /* Open advanced filters */ }
    }
  ];

  return (
    <>
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Smart Search */}
        <div className="relative">
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-2 min-w-[200px] justify-start text-muted-foreground hover:text-foreground transition-all",
              searchOpen && "ring-2 ring-primary"
            )}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">بحث سريع...</span>
            <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">Ctrl</span>K
            </kbd>
          </Button>
        </div>

        {/* Quick Commands */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Command className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>الأوامر السريعة</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickCommands.map((command, index) => (
              <DropdownMenuItem
                key={index}
                className="flex items-center gap-2 cursor-pointer"
                onClick={command.action}
              >
                <command.icon className="h-4 w-4" />
                <span className="flex-1">{command.label}</span>
                <kbd className="text-xs text-muted-foreground">
                  {command.shortcut}
                </kbd>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => { /* Show all shortcuts modal */ }}
            >
              <HelpCircle className="h-4 w-4" />
              <span>عرض جميع الاختصارات</span>
              <kbd className="text-xs text-muted-foreground ml-auto">/</kbd>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {notifications > 9 ? '9+' : notifications}
            </motion.div>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 px-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline max-w-[100px] truncate">
                {profile?.full_name || 'المستخدم'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                <Badge variant="secondary" className="w-fit text-xs">
                  {profile?.role === 'admin'
                    ? 'مدير'
                    : profile?.role === 'affiliate' || profile?.role === 'merchant' || profile?.role === 'marketer'
                      ? 'مسوق'
                      : 'مستخدم'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              الإعدادات
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/help')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              المساعدة
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Smart Search Dialog */}
      <SmartSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder="ابحث في المنتجات، الطلبات، العملاء..."
      />
    </>
  );
}