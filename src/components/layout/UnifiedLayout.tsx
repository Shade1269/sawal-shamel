import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppBreadcrumb } from "./AppBreadcrumb";
import Header from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, Sun, Moon } from "lucide-react";
import { useFastAuth } from "@/hooks/useFastAuth";
import { GlobalSearch, GlobalNotifications } from "@/shared/components";
import { ShoppingCartDrawer } from "@/features/commerce";
import { QuickActions } from "./QuickActions";

interface UnifiedLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showBreadcrumb?: boolean;
  showFullHeader?: boolean;
}

export function UnifiedLayout({ 
  children, 
  showSidebar = true, 
  showBreadcrumb = true,
  showFullHeader = true 
}: UnifiedLayoutProps) {
  const { isAuthenticated } = useFastAuth();

  // For auth pages, don't show header
  if (window.location.pathname.includes('/auth') || 
      window.location.pathname.includes('/login') || 
      window.location.pathname.includes('/signup')) {
    return (
      <div className="min-h-screen bg-background">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !showSidebar) {
    return (
      <div className="min-h-screen bg-background">
        {showFullHeader && <Header />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {showSidebar && <AppSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Top Header Bar */}
          <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 h-full">
              <div className="flex items-center gap-3">
                {showSidebar && (
                  <SidebarTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SidebarTrigger>
                )}
                
                <div className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  منصة الأفيليت
                </div>
              </div>

              <div className="flex items-center gap-2">
                <QuickActions />
                <GlobalSearch />
                <GlobalNotifications />
                <ShoppingCartDrawer />
              </div>
            </div>
          </header>

          {/* Breadcrumb */}
          {showBreadcrumb && <AppBreadcrumb />}

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}