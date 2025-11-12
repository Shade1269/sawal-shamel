import { Button } from "@/components/ui/button";
import { Bell, Search, User, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFastAuth } from "@/hooks/useFastAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MerchantHeader() {
  const { profile, user } = useFastAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="h-16 border-b border-gradient-muted bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
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
                  <AvatarFallback className="bg-gradient-primary text-white font-bold text-sm">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-card/95 backdrop-blur-xl border border-border/50 shadow-glow" align="end">
              <DropdownMenuLabel className="font-normal px-4 py-3">
                <div className="flex flex-col space-y-2">
                  <p className="text-base font-bold leading-none bg-gradient-primary bg-clip-text text-transparent">
                    {profile?.full_name || 'تاجر'}
                  </p>
                  <p className="text-sm leading-none text-muted-foreground/80">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-muted" />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="px-4 py-3 hover:bg-accent/50 transition-colors duration-200">
                <User className="mr-3 h-4 w-4" />
                <span className="font-medium">الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/merchant')} className="px-4 py-3 hover:bg-accent/50 transition-colors duration-200">
                <Store className="mr-3 h-4 w-4" />
                <span className="font-medium">لوحة التحكم</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gradient-muted" />
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
  );
}
