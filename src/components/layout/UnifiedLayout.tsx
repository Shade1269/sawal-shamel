import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppBreadcrumb } from "./AppBreadcrumb";
import Header from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useFastAuth } from "@/hooks/useFastAuth";
import { GlobalSearch, GlobalNotifications } from "@/shared/components";
import { ShoppingCartDrawer } from "@/features/commerce";
import { QuickActions } from "./QuickActions";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { DeviceIndicator } from "@/components/dev/DeviceDebugger";
import { getContainerSpacing } from "@/utils/deviceUtils";
import { AdaptiveNavigation } from "@/components/navigation";

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
  const containerSpacing = getContainerSpacing(device);
  
  // For mobile devices, adjust sidebar behavior
  const shouldShowSidebar = showSidebar && (device.isDesktop || device.isTablet);
  const headerHeight = device.isMobile ? 'h-16' : 'h-14'; // Taller header on mobile

  // For auth pages, don't show header
  const authPath = window.location.pathname;
  if (authPath === '/auth' || authPath.startsWith('/auth/')) {
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
        <main className={`flex-1 ${device.isMobile ? 'pb-20' : 'pb-6'}`}>
          {children}
        </main>
        
        {/* Adaptive Navigation for non-authenticated and mobile users */}
        <AdaptiveNavigation />
        
        <DeviceIndicator />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        {shouldShowSidebar && <AppSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Enhanced Top Header Bar */}
          <header className={`${headerHeight} border-b bg-card/80 backdrop-blur-md sticky top-0 z-40 shadow-sm`}>
            <div className={`flex items-center justify-between ${containerSpacing.padding} h-full min-w-0`}>
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                {shouldShowSidebar && (
                  <SidebarTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size={device.isMobile ? "default" : "sm"} 
                      className={`${device.isMobile ? "p-2.5" : "p-2"} flex-shrink-0 hover:bg-primary/10 transition-colors`}
                    >
                      <Menu className={device.isMobile ? "h-5 w-5" : "h-4 w-4"} />
                    </Button>
                  </SidebarTrigger>
                )}
                
                <div className={`${device.isMobile ? 'text-sm' : 'text-lg'} font-bold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent truncate`}>
                  {device.isMobile ? 'أفيليت' : 'منصة الأفيليت'}
                </div>
              </div>

              <div className={`flex items-center ${device.isMobile ? 'gap-1' : 'gap-2'} flex-shrink-0`}>
                {!device.isMobile && <QuickActions />}
                <GlobalSearch />
                <GlobalNotifications />
                <ShoppingCartDrawer />
              </div>
            </div>
          </header>

          {/* Breadcrumb with subtle background */}
          {showBreadcrumb && !device.isMobile && (
            <div className="bg-muted/30 border-b border-border/30">
              <AppBreadcrumb />
            </div>
          )}

          {/* Main Content with improved spacing */}
          <main className="flex-1 overflow-auto bg-gradient-to-b from-transparent to-muted/10">
            <div className={`container mx-auto ${containerSpacing.padding} ${device.isMobile ? 'pb-20 pt-4' : 'pb-8 pt-6'} max-w-full`}>
              {children}
            </div>
          </main>
        </div>
        
        {/* Adaptive Navigation - Works on all devices */}
        <AdaptiveNavigation />
        
        <DeviceIndicator />
      </div>
    </SidebarProvider>
  );
}