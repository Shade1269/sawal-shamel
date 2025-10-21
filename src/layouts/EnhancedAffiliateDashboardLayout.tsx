import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EnhancedSidebar, type NavigationGroup } from '@/components/ui/navigation/EnhancedSidebar';
import { EnhancedBreadcrumb } from '@/components/ui/navigation/EnhancedBreadcrumb';
import { NavigationTransitions } from '@/components/navigation/NavigationTransitions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Store, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  BarChart3, 
  Palette,
  Search,
  Bell,
  User,
  Settings,
  TrendingUp,
  Heart
} from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';

const EnhancedAffiliateDashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useFastAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();

      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    } finally {
      navigate('/auth', { replace: true });
    }
  };

  // جلب المتاجر الخاصة بالمسوق
  const { data: stores } = useQuery({
    queryKey: ['affiliate-stores', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('id, store_name')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const primaryStore = stores?.[0];

  // Generate breadcrumb
  const generateBreadcrumb = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const breadcrumb = [];

    let currentPath = '';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      const routeLabels: Record<string, string> = {
        'dashboard': 'لوحة المسوق',
        'products': 'المنتجات',
        'orders': 'الطلبات',
        'commissions': 'العمولات',
        'store-themes': 'ثيمات المتجر'
      };

      breadcrumb.push({
        label: routeLabels[segment] || segment,
        href: currentPath
      });
    });

    return breadcrumb;
  };

  const affiliateNavigation: NavigationGroup[] = [
    {
      label: "الرئيسية",
      icon: Store,
      items: [
        {
          title: 'نظرة عامة',
          href: '/affiliate',
          icon: BarChart3,
          description: 'إحصائيات شاملة للمبيعات'
        }
      ]
    },
    {
      label: "إدارة المتجر",
      icon: Store,
      items: [
        {
          title: 'واجهة المتجر',
          href: '/affiliate/storefront',
          icon: Package,
          description: 'إدارة واجهة المتجر والإعدادات'
        },
        {
          title: 'الطلبات',
          href: '/affiliate/orders',
          icon: ShoppingBag,
          badge: '5',
          description: 'متابعة الطلبات الجديدة'
        },
        {
          title: 'التحليلات',
          href: '/affiliate/analytics',
          icon: DollarSign,
          badge: 'جديد',
          description: 'عمولاتك ومكاسبك'
        }
      ]
    }
  ];

  // Add theme management if store exists
  if (primaryStore) {
    affiliateNavigation.push({
      label: "التخصيص",
      icon: Palette,
      items: [{
        title: 'ثيمات المتجر',
        href: `/store-themes/${primaryStore.id}`,
        icon: Palette,
        description: 'تخصيص مظهر متجرك'
      }]
    });
  }

  const breadcrumbItems = generateBreadcrumb();

  const sidebarHeader = (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-luxury">
        <Store className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="font-bold text-lg">لوحة المسوق</h2>
        <p className="text-xs text-muted-foreground">
          {primaryStore?.store_name || 'متجر إلكتروني'}
        </p>
      </div>
    </div>
  );

  const sidebarFooter = (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground text-center">
        مرحباً، {profile?.full_name || 'مسوق'}
      </div>
      <Badge variant="premium" className="w-full justify-center">
        <TrendingUp className="h-3 w-3 mr-1" />
        مسوق نشط
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
          navigation={affiliateNavigation}
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
                  items={breadcrumbItems.slice(1)}
                  variant="persian"
                  showHome={false}
                />
              </div>

              {/* Search */}
              <div className="hidden md:flex max-w-md flex-1">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="البحث في المنتجات..."
                    className="pl-10 h-10 bg-background/50 border-border/50"
                  />
                </div>
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
                    2
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-persian text-white font-bold">
                          {profile?.full_name?.charAt(0) || 'م'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2 p-2">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || 'مسوق'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email}
                        </p>
                        <Badge variant="persian" size="sm" className="w-fit">
                          <Heart className="h-3 w-3 mr-1" />
                          مسوق نشط
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>إعدادات المتجر</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onSelect={handleSignOut}
                    >
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
      </div>
    </SidebarProvider>
  );
};

// Replace original layout
export const AffiliateDashboardLayout = EnhancedAffiliateDashboardLayout;
export { EnhancedAffiliateDashboardLayout };