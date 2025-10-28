import { Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Bell, Search, User, Sun, Moon, PanelLeft, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BottomNavMobile } from "@/components/app-shell/BottomNavMobile"
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
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useDarkMode } from "@/shared/components/DarkModeProvider"
import { AffiliateSidebar } from "@/components/navigation"
import { Home, BarChart3, Package, Wallet } from "lucide-react";

const bottomNavItems = [
  { to: '/affiliate', label: 'الرئيسية', icon: Home },
  { to: '/affiliate/storefront', label: 'المتجر', icon: Package },
  { to: '/affiliate/analytics', label: 'التحليلات', icon: BarChart3 },
  { to: '/affiliate/wallet', label: 'المحفظة', icon: Wallet },
];

export default function ModernAffiliateLayout() {
  const { profile, user } = useFastAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

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

  const bottomNavItems = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/affiliate', label: 'المسوق', icon: BarChart3 },
    { to: '/affiliate/store/settings?tab=products', label: 'المنتجات', icon: Package },
    { to: '/affiliate/wallet', label: 'المحفظة', icon: Wallet },
    { to: '/notifications', label: 'الإشعارات', icon: Bell },
    { to: '/profile', label: 'حسابي', icon: User },
  ];

  return (
    <div className={`relative min-h-screen flex w-full overflow-hidden transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
    }`}>
      {/* Decorative background */}
      {isDarkMode ? (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent blur-3xl animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-400/25 via-pink-500/15 to-transparent blur-3xl animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-transparent blur-3xl" />
        </>
      ) : (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/40 via-purple-400/30 to-transparent blur-3xl animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-400/35 via-pink-400/25 to-transparent blur-3xl animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-r from-yellow-400/25 via-orange-400/20 to-transparent blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-bl from-cyan-400/30 via-indigo-400/20 to-transparent blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-gradient-to-tr from-rose-400/25 via-violet-400/15 to-transparent blur-2xl" />
        </>
      )}
      {/* Sidebar */}
      <AffiliateSidebar />

      {/* Main Content */}
        <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[color:var(--glass-bg)]/10 via-transparent to-[color:var(--glass-bg-strong, var(--surface-2))]/10'
            : 'bg-gradient-to-br from-blue-50/60 via-white/80 to-purple-50/40'
        }`}>
        {/* Header */}
        <header className={`h-16 border-b backdrop-blur sticky top-0 z-40 transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-background/90 supports-[backdrop-filter]:bg-background/60 shadow-sm border-border/50'
            : 'bg-white/90 supports-[backdrop-filter]:bg-white/60 shadow-lg border-slate-200/50'
        }`}>
          <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
            <Button variant="ghost" size="sm" className="lg:hidden">
              <PanelLeft className="h-5 w-5" />
            </Button>
              
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-500 ${
                  isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
                }`} />
                <Input
                  type="search"
                  placeholder="البحث في لوحة المسوق..."
                  className={`pl-10 h-10 rounded-xl transition-colors duration-500 ${
                    isDarkMode 
                      ? 'bg-background/60 border-border/60 focus:border-primary/60' 
                      : 'bg-white/80 border-slate-200/60 focus:border-blue-500/60'
                  }`}
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDarkMode}
                className="transition-all duration-300 hover:scale-110"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  2
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'مسوق'}
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
                  <DropdownMenuItem onClick={() => navigate('/affiliate/store/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>إعدادات المتجر</span>
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
        <main className="flex-1 overflow-auto pb-24">
          <div className="w-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      <BottomNavMobile items={bottomNavItems} />
    </div>
  )
}