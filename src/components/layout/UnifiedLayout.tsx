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
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { DeviceIndicator } from "@/components/dev/DeviceDebugger";
import { getTouchFriendlySize, getContainerSpacing } from "@/utils/deviceUtils";

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
  const device = useDeviceDetection();
  
  // Get device-specific sizing
  const touchSize = getTouchFriendlySize(device);
  const containerSpacing = getContainerSpacing(device);
  
  // For mobile devices, adjust sidebar behavior
  const shouldShowSidebar = showSidebar && (device.isDesktop || device.isTablet);
  const headerHeight = device.isMobile ? 'h-16' : 'h-14'; // Taller header on mobile

  // For auth pages, don't show header
  if (window.location.pathname.includes('/auth') || 
      window.location.pathname.includes('/login') || 
      window.location.pathname.includes('/signup')) {
    return (
      <div className="min-h-screen bg-background">
        <main className="flex-1">
          {children}
        </main>
        <DeviceIndicator />
      </div>
    );
  }

  if (!isAuthenticated || !shouldShowSidebar) {
    return (
      <div className="min-h-screen bg-background">
        {showFullHeader && <Header />}
        <main className="flex-1">
          {children}
        </main>
        <DeviceIndicator />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {shouldShowSidebar && <AppSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Top Header Bar - Responsive */}
          <header className={`${headerHeight} border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40`}>
            <div className={`flex items-center justify-between ${containerSpacing.padding} h-full`}>
              <div className="flex items-center gap-3">
                {shouldShowSidebar && (
                  <SidebarTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size={device.isMobile ? "default" : "sm"} 
                      className={device.isMobile ? "p-3" : "p-2"}
                    >
                      <Menu className={device.isMobile ? "h-5 w-5" : "h-4 w-4"} />
                    </Button>
                  </SidebarTrigger>
                )}
                
                <div className={`${device.isMobile ? 'text-base' : 'text-lg'} font-semibold bg-gradient-primary bg-clip-text text-transparent`}>
                  منصة الأفيليت
                </div>
              </div>

              <div className={`flex items-center ${device.isMobile ? 'gap-1' : 'gap-2'}`}>
                {/* Hide some elements on mobile to save space */}
                {!device.isMobile && <QuickActions />}
                <GlobalSearch />
                <GlobalNotifications />
                <ShoppingCartDrawer />
              </div>
            </div>
          </header>

          {/* Breadcrumb - Hide on mobile for space */}
          {showBreadcrumb && !device.isMobile && <AppBreadcrumb />}

          {/* Main Content - Responsive */}
          <main className="flex-1 overflow-auto">
            <div className={`container mx-auto ${containerSpacing.padding}`}>
              {children}
            </div>
          </main>
        </div>
        
        <DeviceIndicator />
      </div>
    </SidebarProvider>
  );
}