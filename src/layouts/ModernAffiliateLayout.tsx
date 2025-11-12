import { Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Bell, Search, User, Sun, Moon, PanelLeft, Settings } from "lucide-react"
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
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useDarkMode } from "@/shared/components/DarkModeProvider"
import { AffiliateSidebar } from "@/components/navigation"
import { useSidebarState } from "@/hooks/useSidebarState"

export default function ModernAffiliateLayout() {
  const { profile, user } = useFastAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { state: sidebarState, toggleCollapse } = useSidebarState()

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
    <div className="relative min-h-screen flex w-full overflow-hidden bg-background">
      {/* Decorative background - Subtle */}
      {isDarkMode ? (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent blur-3xl animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-400/15 via-pink-500/10 to-transparent blur-3xl animate-pulse" />
        </>
      ) : (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/15 via-purple-400/10 to-transparent blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-400/12 via-pink-400/8 to-transparent blur-3xl" />
        </>
      )}
      {/* Sidebar */}
      <AffiliateSidebar />

      {/* Main Content - Dynamic margin based on sidebar state (desktop only) */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 bg-gradient-to-br from-blue-50/30 via-white/50 to-purple-50/30 ${sidebarState.isCollapsed ? 'md:mr-16' : 'md:mr-64'}`}>
        {/* Header */}
        <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
          <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}
              data-sidebar-toggle="true"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
              
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  type="search"
                  placeholder="البحث في لوحة المسوق..."
                  className="pl-10 h-10 rounded-xl bg-muted/30 border-border/40"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
                className="rounded-xl hover:bg-accent"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-accent">
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
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'م'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-border/50" align="end">
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
        <main className="flex-1 overflow-auto bg-background/50">
          <div className="w-full p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}