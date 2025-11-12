import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MerchantSidebarModern } from '@/components/navigation';
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
        <MerchantSidebarModern />
      </div>
    </SidebarProvider>
  )
}
