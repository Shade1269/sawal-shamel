import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebarModern } from '@/components/navigation';
import { Button } from "@/components/ui/button"
import { Bell, Search, User } from "lucide-react"
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

export default function AdminLayout() {
  const { profile, user } = useFastAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background" data-admin-layout>
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-gradient-to-r from-transparent via-border/50 to-transparent bg-gradient-to-r from-background/98 via-background/95 to-background/98 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 shadow-lg shadow-black/5 admin-header-enhanced">
            <div className="flex h-16 items-center gap-6 px-6 lg:px-8">
              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs animate-pulse"
                  >
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105 ring-2 ring-transparent hover:ring-primary/20">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-sm">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.full_name || 'مدير النظام'}
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
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                      لوحة الإدارة
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      تسجيل الخروج
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
                    placeholder="البحث في لوحة التحكم..."
                    className="pr-12 h-11 text-right bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:bg-background/80"
                  />
                </div>
              </div>

              <SidebarTrigger className="-mr-2 h-11 w-11 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105" />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background/95 to-muted/20 admin-content-enhanced">
            <div className="container mx-auto p-8">
              <div className="relative">
                <Outlet />
              </div>
            </div>
          </main>
        </div>

        {/* Sidebar - Right Side */}
        <AdminSidebarModern />
      </div>
    </SidebarProvider>
  )
}