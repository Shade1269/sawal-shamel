import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search, User, Package, ShoppingCart, Home, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFastAuth } from "@/hooks/useFastAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "لوحة التحكم",
    url: "/merchant",
    icon: Home,
    exact: true
  },
  {
    title: "إدارة المنتجات",
    url: "/merchant/products",
    icon: Package
  },
  {
    title: "الطلبات",
    url: "/admin/orders",
    icon: ShoppingCart
  }
];

function MerchantSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const getNavClassName = (url: string, exact?: boolean) => {
    const isActive = exact 
      ? location.pathname === url 
      : location.pathname.startsWith(url);
    
    return `flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
      isActive 
        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 font-medium shadow-sm" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;
  };

  return (
    <SidebarComponent className="border-r border-border/40 bg-card/30 backdrop-blur-xl">
      <SidebarContent className="px-2 py-4">
        {/* Logo/Header */}
        <div className={`px-3 mb-6 ${isCollapsed ? "text-center" : ""}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  لوحة التاجر
                </h2>
                <p className="text-xs text-muted-foreground">إدارة منتجاتك</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto">
              <Store className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isCollapsed ? "sr-only" : ""}`}>
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink 
                      to={item.url} 
                      end={item.exact}
                      className={getNavClassName(item.url, item.exact)}
                    >
                      <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                      {!isCollapsed && (
                        <span className="flex-1">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Indicator */}
        {!isCollapsed && (
          <div className="mt-8 px-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  متصل
                </span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </SidebarComponent>
  );
}

export default function MerchantLayout() {
  const { profile, user } = useFastAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Ensure merchant account exists for merchant users
  useEffect(() => {
    const ensureMerchant = async () => {
      try {
        if (!profile?.id || profile.role !== 'merchant') return;

        const { data: existing, error } = await supabase
          .from('merchants')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Merchant lookup error:', error);
          return;
        }

        if (!existing) {
          const { error: insertError } = await supabase
            .from('merchants')
            .insert({
              profile_id: profile.id,
              business_name: profile.full_name || profile.email || 'Merchant',
              default_commission_rate: 10,
              vat_enabled: false,
            });
          if (insertError) {
            console.error('Merchant creation error:', insertError);
          } else {
            toast({ title: 'تم إنشاء حساب التاجر', description: 'يمكنك الآن إضافة المنتجات.' });
          }
        }
      } catch (e) {
        console.error('ensureMerchant error:', e);
      }
    };

    ensureMerchant();
  }, [profile?.id, profile?.role]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/")
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      })
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <MerchantSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
              <SidebarTrigger className="-ml-1" />
              
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="البحث في المنتجات..."
                    className="pl-10 h-9"
                  />
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || 'تاجر'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/merchant')}>
                      لوحة التحكم
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}