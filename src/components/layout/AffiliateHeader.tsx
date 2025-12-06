import { Button } from "@/components/ui/button";
import { Bell, Search, User, Sun, Moon, PanelLeft, Settings, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useDarkMode } from "@/shared/components/DarkModeProvider";
import { useSidebarState } from "@/hooks/useSidebarState";

export function AffiliateHeader() {
  const { profile, user } = useFastAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { toggleCollapse } = useSidebarState();

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
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 shadow-[0_4px_24px_rgba(90,38,71,0.06)]">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden text-primary hover:bg-secondary/50"
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث في لوحة المسوق..."
              className="pl-10 h-10 rounded-xl bg-secondary/30 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Home Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="rounded-xl text-primary hover:bg-secondary/50"
            title="الصفحة الرئيسية"
          >
            <Home className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="rounded-xl text-primary hover:bg-secondary/50"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-xl text-primary hover:bg-secondary/50">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-accent text-accent-foreground"
            >
              2
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary/50">
                <Avatar className="h-9 w-9 border-2 border-secondary">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'م'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border shadow-[0_8px_40px_rgba(90,38,71,0.1)]" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {profile?.full_name || 'مسوق'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="hover:bg-secondary/50 focus:bg-secondary/50">
                <User className="mr-2 h-4 w-4 text-primary" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/affiliate/store/settings')} className="hover:bg-secondary/50 focus:bg-secondary/50">
                <Settings className="mr-2 h-4 w-4 text-accent" />
                <span>إعدادات المتجر</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
