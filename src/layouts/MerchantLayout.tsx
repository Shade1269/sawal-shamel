import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search, User, Package, ShoppingCart, Home, Store, Wallet } from "lucide-react"
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
    url: "/merchant/orders",
    icon: ShoppingCart
  },
  {
    title: "المحفظة المالية",
    url: "/merchant/wallet",
    icon: Wallet
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
    
    return `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:scale-[1.02] ${
      isActive 
        ? "bg-gradient-to-r from-primary/25 via-primary/15 to-primary/10 text-primary border border-primary/30 font-semibold shadow-lg shadow-primary/10 backdrop-blur-sm" 
        : "text-muted-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:text-accent-foreground hover:shadow-md hover:backdrop-blur-sm"
    }`;
  };

  return (
    <SidebarComponent className="border-l border-gradient-to-b from-primary/20 via-primary/10 to-transparent bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-2xl shadow-2xl shadow-primary/5 sidebar-enhanced">
      <SidebarContent className="px-3 py-6">
        {/* Logo/Header */}
        <div className={`px-3 mb-8 ${isCollapsed ? "text-center" : ""}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 ring-2 ring-primary/20">
                <Store className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-xl font-black bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent tracking-tight">
                  لوحة التاجر
                </h2>
                <p className="text-sm text-muted-foreground/80 font-medium">إدارة منتجاتك بذكاء</p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mx-auto shadow-lg shadow-primary/25 ring-2 ring-primary/20">
              <Store className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-4 ${isCollapsed ? "sr-only" : ""}`}>
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink 
                      to={item.url} 
                      end={item.exact}
                      className={`${getNavClassName(item.url, item.exact)} nav-item`}
                    >
                      {!isCollapsed && (
                        <span className="flex-1 text-right font-semibold text-sm">{item.title}</span>
                      )}
                      <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""} transition-transform duration-200 group-hover:scale-110`} />
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
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-green-500/10 to-teal-500/15 border border-emerald-200/30 shadow-lg shadow-emerald-500/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 animate-pulse shadow-sm"></div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
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
  const { profile, user, hasRole } = useFastAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Ensure merchant account exists for merchant users
  useEffect(() => {
    const ensureMerchant = async () => {
      try {
        if (!profile?.auth_user_id || !((profile.role === 'merchant') || hasRole?.('merchant'))) return;

        // Resolve profiles.id from auth_user_id to avoid mismatch with user_profiles
        const { data: profRow, error: profErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', profile.auth_user_id)
          .maybeSingle();

        if (profErr && profErr.code !== 'PGRST116') {
          console.error('Profile lookup error:', profErr);
          return;
        }

        const profileId = profRow?.id;
        if (!profileId) return;

        const { data: existing, error } = await supabase
          .from('merchants')
          .select('id')
          .eq('profile_id', profileId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Merchant lookup error:', error);
          return;
        }

        if (!existing) {
          const { error: insertError } = await supabase
            .from('merchants')
            .insert({
              profile_id: profileId,
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
      <div className="min-h-screen flex w-full bg-background" data-merchant-layout>
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-gradient-to-r from-transparent via-border/50 to-transparent bg-gradient-to-r from-background/98 via-background/95 to-background/98 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 shadow-lg shadow-black/5 header-enhanced">
            <div className="flex h-16 items-center gap-6 px-6 lg:px-8">
              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105 ring-2 ring-transparent hover:ring-primary/20">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-sm">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10" align="end">
                    <DropdownMenuLabel className="font-normal px-4 py-3">
                      <div className="flex flex-col space-y-2">
                        <p className="text-base font-bold leading-none bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {profile?.full_name || 'تاجر'}
                        </p>
                        <p className="text-sm leading-none text-muted-foreground/80">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="px-4 py-3 hover:bg-accent/50 transition-colors duration-200">
                      <User className="mr-3 h-4 w-4" />
                      <span className="font-medium">الملف الشخصي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/merchant')} className="px-4 py-3 hover:bg-accent/50 transition-colors duration-200">
                      <Store className="mr-3 h-4 w-4" />
                      <span className="font-medium">لوحة التحكم</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                    <DropdownMenuItem onClick={handleSignOut} className="px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200">
                      <span className="font-medium">تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative group">
                  <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary transition-colors duration-200" />
                  <Input
                    type="search"
                    placeholder="البحث في المنتجات..."
                    className="pr-12 h-11 text-right bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:bg-background/80"
                  />
                </div>
              </div>

              <SidebarTrigger className="-mr-2 h-11 w-11 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105" />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background/95 to-muted/20 content-enhanced">
            <div className="container mx-auto p-8">
              <div className="relative">
                <Outlet />
              </div>
            </div>
          </main>
        </div>

        {/* Sidebar - Right Side */}
        <MerchantSidebar />
      </div>
    </SidebarProvider>
  )
}
