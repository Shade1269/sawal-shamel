import { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppBreadcrumb } from './AppBreadcrumb';
import { MobileHeader } from './MobileHeader';
import { DesktopHeader } from './DesktopHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { TabletDrawer } from './TabletDrawer';
import { DeviceIndicator } from '@/components/dev/DeviceDebugger';
import { useFastAuth } from '@/hooks/useFastAuth';

interface AdaptiveLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  showBreadcrumb?: boolean;
  showHeader?: boolean;
  fullscreen?: boolean;
  className?: string;
}

export function AdaptiveLayout({
  children,
  showNavigation = true,
  showBreadcrumb = true,
  showHeader = true,
  fullscreen = false,
  className = ''
}: AdaptiveLayoutProps) {
  const device = useDeviceDetection();
  const { isAuthenticated } = useFastAuth();

  // Check if it's an auth page
  const authPath = window.location.pathname;
  const isAuthPage = authPath === '/auth' || authPath.startsWith('/auth/');

  // For auth pages or fullscreen mode, return minimal layout
  if (isAuthPage || fullscreen) {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        <main className="h-full w-full">
          {children}
        </main>
        <DeviceIndicator />
      </div>
    );
  }

  // Public pages (not authenticated)
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-background flex flex-col ${className}`}>
        {showHeader && (
          device.isMobile ? (
            <MobileHeader showAuth={true} />
          ) : (
            <DesktopHeader showAuth={true} />
          )
        )}
        
        <main className="flex-1 w-full">
          <div className={`${fullscreen ? '' : 'container mx-auto px-4 py-4'}`}>
            {children}
          </div>
        </main>
        
        <DeviceIndicator />
      </div>
    );
  }

  // Authenticated layouts - device specific
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {device.isMobile && <MobileLayout 
        showNavigation={showNavigation}
        showBreadcrumb={showBreadcrumb}
        showHeader={showHeader}
      >
        {children}
      </MobileLayout>}
      
      {device.isTablet && <TabletLayout 
        showNavigation={showNavigation}
        showBreadcrumb={showBreadcrumb}
        showHeader={showHeader}
      >
        {children}
      </TabletLayout>}
      
      {device.isDesktop && <DesktopLayout 
        showNavigation={showNavigation}
        showBreadcrumb={showBreadcrumb}
        showHeader={showHeader}
      >
        {children}
      </DesktopLayout>}
      
      <DeviceIndicator />
    </div>
  );
}

// Mobile Layout Component
interface LayoutProps {
  children: ReactNode;
  showNavigation: boolean;
  showBreadcrumb: boolean;
  showHeader: boolean;
}

function MobileLayout({ children, showNavigation, showHeader }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      {/* Mobile Header */}
      {showHeader && <MobileHeader />}
      
      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        <div className="w-full px-3 py-4">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      {showNavigation && <MobileBottomNav />}
    </div>
  );
}

// Tablet Layout Component
function TabletLayout({ children, showNavigation, showBreadcrumb, showHeader }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Collapsible Drawer Navigation */}
      {showNavigation && <TabletDrawer />}
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tablet Header */}
        {showHeader && <DesktopHeader compact={true} />}
        
        {/* Breadcrumb */}
        {showBreadcrumb && <AppBreadcrumb />}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full">
          <div className="w-full px-4 py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Desktop Layout Component
function DesktopLayout({ children, showNavigation, showBreadcrumb, showHeader }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Full Sidebar */}
        {showNavigation && <AppSidebar />}
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Header */}
          {showHeader && <DesktopHeader />}
          
          {/* Breadcrumb */}
          {showBreadcrumb && <AppBreadcrumb />}
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}