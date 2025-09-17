import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EnhancedSidebar, type NavigationGroup } from '@/components/ui/navigation/EnhancedSidebar';
import { EnhancedBreadcrumb } from '@/components/ui/navigation/EnhancedBreadcrumb';
import { NavigationTransitions } from '@/components/navigation/NavigationTransitions';
import { QuickCommandPalette } from '@/components/navigation/QuickCommandPalette';
import { SmartSearch } from '@/components/navigation/SmartSearch';
import { useNavigationShortcuts } from '@/hooks/useNavigationShortcuts';
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
  Settings, 
  Users, 
  BarChart3, 
  FileText, 
  Shield, 
  Package,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Truck,
  AlertTriangle,
  Crown,
  Store
} from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

const EnhancedAdminLayout: React.FC = () => {
  const { profile, user } = useFastAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  
  // Setup navigation shortcuts
  useNavigationShortcuts(setCommandPaletteOpen);

  // Simple breadcrumb generation
  const generateBreadcrumb = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const breadcrumb = [];

    let currentPath = '';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      const routeLabels: Record<string, string> = {
        'admin': 'لوحة الإدارة',
        'users': 'المستخدمون',
        'analytics': 'التحليلات',
        'reports': 'التقارير',
        'settings': 'الإعدادات'
      };

      breadcrumb.push({
        label: routeLabels[segment] || segment,
        href: currentPath
      });
    });

    return breadcrumb;
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const adminNavigation: NavigationGroup[] = [
    {
      label: "الرئيسية",
      icon: Crown,
      items: [
        {
          title: "لوحة التحكم",
          href: "/admin",
          icon: BarChart3,
          description: "نظرة شاملة على النظام"
        },
        {
          title: "التحليلات",
          href: "/admin/analytics", 
          icon: BarChart3,
          badge: "جديد",
          description: "تحليلات مفصلة ومتقدمة"
        }
      ]
    },
    {
      label: "إدارة المستخدمين",
      icon: Users,
      items: [
        {
          title: "المستخدمون",
          href: "/admin/users",
          icon: Users,
          description: "إدارة حسابات المستخدمين"
        },
        {
          title: "الصلاحيات",
          href: "/admin/permissions",
          icon: Shield,
          description: "إدارة الصلاحيات والأدوار"
        },
        {
          title: "سجل النشاطات",
          href: "/admin/activity",
          icon: FileText,
          description: "مراقبة نشاطات المستخدمين"
        }
      ]
    },
    {
      label: "التجارة الإلكترونية",
      icon: Store,
      items: [
        {
          title: "إدارة المنتجات",
          href: "/admin/products",
          icon: Package,
          description: "إضافة وإدارة المنتجات"
        },
        {
          title: "إدارة الطلبات", 
          href: "/admin/orders",
          icon: ShoppingCart,
          badge: "3",
          description: "متابعة ومعالجة الطلبات"
        },
        {
          title: "إدارة المخزن",
          href: "/admin/inventory",
          icon: Package,
          description: "مراقبة المخزون والكميات"
        },
        {
          title: "إدارة الشحن",
          href: "/admin/shipping",
          icon: Truck,
          description: "متابعة عمليات الشحن"
        }
      ]
    },
    {
      label: "المالية والدفع",
      icon: DollarSign,
      items: [
        {
          title: "المدفوعات",
          href: "/admin/payments",
          icon: CreditCard,
          description: "إدارة المدفوعات والتحويلات"
        },
        {
          title: "الفواتير",
          href: "/admin/invoices", 
          icon: FileText,
          description: "إنشاء ومتابعة الفواتير"
        },
        {
          title: "بوابات الدفع",
          href: "/admin/payment-gateways",
          icon: CreditCard,
          description: "إعدادات بوابات الدفع"
        },
        {
          title: "المرتجعات",
          href: "/admin/refunds",
          icon: AlertTriangle,
          description: "إدارة المرتجعات والاسترداد"
        }
      ]
    },
    {
      label: "التقارير والتحليلات",
      icon: BarChart3,
      items: [
        {
          title: "التقارير",
          href: "/admin/reports",
          icon: FileText,
          description: "تقارير مفصلة عن الأداء"
        },
        {
          title: "لوحة التنفيذيين",
          href: "/admin/executive",
          icon: Crown,
          description: "تحليلات تنفيذية متقدمة"
        },
        {
          title: "التسويق",
          href: "/admin/marketing",
          icon: BarChart3,
          description: "تحليلات التسويق والحملات"
        }
      ]
    },
    {
      label: "الأمان والإعدادات",
      icon: Settings,
      items: [
        {
          title: "الأمان",
          href: "/admin/security",
          icon: Shield,
          description: "إعدادات الأمان والحماية"
        },
        {
          title: "إعدادات النظام",
          href: "/admin/settings",
          icon: Settings,
          description: "إعدادات عامة للنظام"
        }
      ]
    }
  ];

  const breadcrumbItems = generateBreadcrumb();

  const sidebarHeader = (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Crown className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="font-bold text-lg">لوحة الإدارة</h2>
        <p className="text-xs text-muted-foreground">نظام إدارة متقدم</p>
      </div>
    </div>
  );

  const sidebarFooter = (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground text-center">
        مرحباً، {profile?.full_name || 'مدير النظام'}
      </div>
      <Badge variant="luxury" className="w-full justify-center">
        مدير النظام
      </Badge>
    </div>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-persian-bg">
        {/* Enhanced Sidebar */}
        <EnhancedSidebar
          sidebarVariant="default"
          sidebarAnimation="slide"
          navigation={adminNavigation}
          header={sidebarHeader}
          footer={sidebarFooter}
          showGroupLabels={true}
          compactMode={false}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
            <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
              <SidebarTrigger className="hover:bg-accent/50 transition-colors" />
              
              {/* Breadcrumb */}
              <div className="flex-1 min-w-0">
                <EnhancedBreadcrumb
                  items={breadcrumbItems.slice(1)} // Remove home from admin breadcrumb
                  variant="luxury"
                  showHome={false}
                />
              </div>

              {/* Smart Search */}
              <div className="hidden md:flex max-w-md flex-1">
                <SmartSearch 
                  placeholder="البحث الذكي في لوحة التحكم..."
                  className="w-full"
                  showRecentSearches={true}
                  showSuggestions={true}
                  showFilters={true}
                />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative hover:bg-accent/50">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs animate-pulse-glow"
                  >
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-luxury text-white font-bold">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2 p-2">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || 'مدير النظام'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <Badge variant="luxury" size="sm" className="w-fit">
                          مدير النظام
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>إعدادات الإدارة</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content with Transitions */}
          <main className="flex-1 overflow-auto">
            <NavigationTransitions transition="persian" duration={400}>
              <div className="container mx-auto p-6 space-y-6">
                <Outlet />
              </div>
            </NavigationTransitions>
          </main>
        </div>

        {/* Command Palette */}
        <QuickCommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      </div>
    </SidebarProvider>
  );
};

export { EnhancedAdminLayout };
export default EnhancedAdminLayout;