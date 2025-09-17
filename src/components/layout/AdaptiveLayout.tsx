import React, { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getTouchFriendlySize, getContainerSpacing, getNavigationType } from '@/utils/deviceUtils';
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
  const touchSize = getTouchFriendlySize(device);
  const containerSpacing = getContainerSpacing(device);
  const navType = getNavigationType(device);

  // Check if it's an auth page
  const isAuthPage = window.location.pathname.includes('/auth') || 
                     window.location.pathname.includes('/login') || 
                     window.location.pathname.includes('/signup');

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
          <div className={`${fullscreen ? '' : 'container mx-auto'} ${containerSpacing.padding}`}>
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
        containerSpacing={containerSpacing}
      >
        {children}
      </MobileLayout>}
      
      {device.isTablet && <TabletLayout 
        showNavigation={showNavigation}
        showBreadcrumb={showBreadcrumb}
        showHeader={showHeader}
        containerSpacing={containerSpacing}
      >
        {children}
      </TabletLayout>}
      
      {device.isDesktop && <DesktopLayout 
        showNavigation={showNavigation}
        showBreadcrumb={showBreadcrumb}
        showHeader={showHeader}
        containerSpacing={containerSpacing}
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
  containerSpacing: any;
}

function MobileLayout({ children, showNavigation, showHeader, containerSpacing }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Header */}
      {showHeader && <MobileHeader />}
      
      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-auto">
        <div className={`${containerSpacing.padding}`}>
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      {showNavigation && <MobileBottomNav />}
    </div>
  );
}

// Tablet Layout Component
function TabletLayout({ children, showNavigation, showBreadcrumb, showHeader, containerSpacing }: LayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Collapsible Drawer Navigation */}
      {showNavigation && <TabletDrawer />}
      
      <div className="flex-1 flex flex-col">
        {/* Tablet Header */}
        {showHeader && <DesktopHeader compact={true} />}
        
        {/* Breadcrumb */}
        {showBreadcrumb && <AppBreadcrumb />}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className={`${containerSpacing.padding}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Desktop Layout Component
function DesktopLayout({ children, showNavigation, showBreadcrumb, showHeader, containerSpacing }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Full Sidebar */}
        {showNavigation && <AppSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          {showHeader && <DesktopHeader />}
          
          {/* Breadcrumb */}
          {showBreadcrumb && <AppBreadcrumb />}
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className={`container mx-auto ${containerSpacing.padding}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}