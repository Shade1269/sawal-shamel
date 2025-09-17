import React, { useState, useEffect, useCallback } from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { 
  Search, 
  User, 
  Settings, 
  BarChart3, 
  Package, 
  ShoppingCart,
  FileText,
  CreditCard,
  Truck,
  Users,
  Shield,
  Crown,
  Store,
  Palette,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import { cn } from '@/lib/utils';

interface QuickCommand {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
  keywords: string[];
  badge?: string;
  shortcut?: string[];
  roles?: string[];
}

export interface QuickCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickCommandPalette: React.FC<QuickCommandPaletteProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useFastAuth();
  const userRole = profile?.role;
  const [search, setSearch] = useState('');

  // Define commands based on user role
  const generateCommands = useCallback((): QuickCommand[] => {
    const baseCommands: QuickCommand[] = [
      {
        id: 'profile',
        title: 'الملف الشخصي',
        description: 'عرض وتعديل ملفك الشخصي',
        icon: User,
        action: () => navigate('/profile'),
        category: 'عام',
        keywords: ['profile', 'user', 'ملف', 'شخصي', 'حساب']
      },
      {
        id: 'search',
        title: 'البحث العالمي',
        description: 'البحث في جميع أنحاء النظام',
        icon: Search,
        action: () => console.log('Global search'),
        category: 'أدوات',
        keywords: ['search', 'find', 'بحث', 'عثور']
      }
    ];

    // Admin commands
    const adminCommands: QuickCommand[] = [
      {
        id: 'admin-dashboard',
        title: 'لوحة الإدارة',
        description: 'الانتقال إلى لوحة تحكم الإدارة',
        icon: Crown,
        action: () => navigate('/admin'),
        category: 'إدارة',
        keywords: ['admin', 'dashboard', 'إدارة', 'لوحة'],
        shortcut: ['⌘', 'A']
      },
      {
        id: 'users-management',
        title: 'إدارة المستخدمين',
        description: 'عرض وإدارة المستخدمين',
        icon: Users,
        action: () => navigate('/admin/users'),
        category: 'إدارة',
        keywords: ['users', 'مستخدمين', 'حسابات', 'accounts'],
        shortcut: ['⌘', 'U']
      },
      {
        id: 'analytics',
        title: 'التحليلات',
        description: 'عرض تحليلات النظام',
        icon: BarChart3,
        action: () => navigate('/admin/analytics'),
        category: 'تقارير',
        keywords: ['analytics', 'تحليلات', 'إحصائيات', 'stats'],
        shortcut: ['⌘', 'T']
      },
      {
        id: 'products-admin',
        title: 'إدارة المنتجات',
        description: 'إضافة وإدارة المنتجات',
        icon: Package,
        action: () => navigate('/admin/products'),
        category: 'تجارة إلكترونية',
        keywords: ['products', 'منتجات', 'inventory', 'مخزون']
      },
      {
        id: 'orders-admin',
        title: 'إدارة الطلبات',
        description: 'متابعة ومعالجة الطلبات',
        icon: ShoppingCart,
        action: () => navigate('/admin/orders'),
        category: 'تجارة إلكترونية',
        keywords: ['orders', 'طلبات', 'مبيعات', 'sales']
      },
      {
        id: 'payments-admin',
        title: 'إدارة المدفوعات',
        description: 'مراقبة المدفوعات والفواتير',
        icon: CreditCard,
        action: () => navigate('/admin/payments'),
        category: 'مالية',
        keywords: ['payments', 'مدفوعات', 'فواتير', 'invoices']
      },
      {
        id: 'security',
        title: 'الأمان',
        description: 'إعدادات الأمان والحماية',
        icon: Shield,
        action: () => navigate('/admin/security'),
        category: 'أمان',
        keywords: ['security', 'أمان', 'حماية', 'protection']
      },
      {
        id: 'settings-admin',
        title: 'إعدادات النظام',
        description: 'تكوين الإعدادات العامة',
        icon: Settings,
        action: () => navigate('/admin/settings'),
        category: 'إعدادات',
        keywords: ['settings', 'إعدادات', 'تكوين', 'config'],
        shortcut: ['⌘', ',']
      }
    ];

    // Affiliate commands
    const affiliateCommands: QuickCommand[] = [
      {
        id: 'affiliate-dashboard',
        title: 'لوحة المسوق',
        description: 'الانتقال إلى لوحة تحكم المسوق',
        icon: Store,
        action: () => navigate('/dashboard'),
        category: 'تسويق',
        keywords: ['affiliate', 'dashboard', 'مسوق', 'لوحة'],
        shortcut: ['⌘', 'D']
      },
      {
        id: 'products-affiliate',
        title: 'منتجاتي',
        description: 'عرض وإدارة منتجاتك',
        icon: Package,
        action: () => navigate('/dashboard/products'),
        category: 'تسويق',
        keywords: ['products', 'منتجات', 'my products', 'منتجاتي']
      },
      {
        id: 'orders-affiliate',
        title: 'طلباتي',
        description: 'متابعة طلبات العملاء',
        icon: ShoppingCart,
        action: () => navigate('/dashboard/orders'),
        category: 'تسويق',
        keywords: ['orders', 'طلبات', 'my orders', 'طلباتي']
      },
      {
        id: 'commissions',
        title: 'العمولات',
        description: 'عرض عمولاتك ومكاسبك',
        icon: CreditCard,
        action: () => navigate('/dashboard/commissions'),
        category: 'مالية',
        keywords: ['commissions', 'عمولات', 'مكاسب', 'earnings']
      },
      {
        id: 'store-themes',
        title: 'ثيمات المتجر',
        description: 'تخصيص مظهر متجرك',
        icon: Palette,
        action: () => navigate('/store-themes'),
        category: 'تخصيص',
        keywords: ['themes', 'ثيمات', 'تخصيص', 'design']
      }
    ];

    // Combine commands based on role
    let allCommands = [...baseCommands];
    
    if (userRole === 'admin') {
      allCommands.push(...adminCommands);
    } else if (userRole === 'affiliate') {
      allCommands.push(...affiliateCommands);
    }

    return allCommands.filter(cmd => 
      !cmd.roles || cmd.roles.includes(userRole || '')
    );
  }, [navigate, userRole]);

  const commands = generateCommands();

  // Filter commands based on search
  const filteredCommands = commands.filter(command => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      )
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, QuickCommand[]>);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }

      // Close with Escape
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }

      // Handle command shortcuts when palette is closed
      if (!open && (e.metaKey || e.ctrlKey)) {
        const matchingCommand = commands.find(cmd => {
          if (!cmd.shortcut) return false;
          return cmd.shortcut[1].toLowerCase() === e.key.toLowerCase();
        });

        if (matchingCommand) {
          e.preventDefault();
          matchingCommand.action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, commands]);

  const handleSelect = (command: QuickCommand) => {
    command.action();
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-luxury">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b border-border/50 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="ابحث عن أوامر أو اضغط Cmd+K..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Kbd>ESC</Kbd>
            </div>
          </div>
          
          <CommandList className="max-h-[400px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              لا توجد نتائج للبحث "{search}"
            </CommandEmpty>
            
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <CommandGroup key={category} heading={category}>
                {categoryCommands.map((command) => (
                  <CommandItem
                    key={command.id}
                    value={command.id}
                    onSelect={() => handleSelect(command)}
                    className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <command.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{command.title}</span>
                        {command.badge && (
                          <Badge variant="secondary" size="sm">
                            {command.badge}
                          </Badge>
                        )}
                      </div>
                      {command.description && (
                        <p className="text-xs text-muted-foreground">
                          {command.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {command.shortcut && (
                        <div className="flex items-center gap-1">
                          {command.shortcut.map((key, index) => (
                            <Kbd key={index} className="text-xs">
                              {key}
                            </Kbd>
                          ))}
                        </div>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          
          <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 text-xs text-muted-foreground">
            <div>اضغط Enter للتنفيذ</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Kbd>↑↓</Kbd>
                <span>للتنقل</span>
              </div>
              <div className="flex items-center gap-1">
                <Kbd>ESC</Kbd>
                <span>للإغلاق</span>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export { QuickCommandPalette };