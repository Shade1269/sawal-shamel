import React from 'react';
import { cn } from '@/lib/utils';
import { UnifiedHeader } from './UnifiedHeader';
import { UnifiedSidebar, type SidebarSection } from './UnifiedSidebar';
import { UnifiedMobileNav, type MobileNavItem } from './UnifiedMobileNav';

/**
 * Unified Layout Component
 * Main layout wrapper that combines Header, Sidebar, and Mobile Navigation
 */

interface UnifiedLayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Sidebar sections */
  sidebarSections?: SidebarSection[];
  /** Mobile navigation items */
  mobileNavItems?: MobileNavItem[];
  /** Show sidebar (desktop) */
  showSidebar?: boolean;
  /** Show mobile navigation */
  showMobileNav?: boolean;
  /** Header configuration */
  header?: {
    showSearch?: boolean;
    searchPlaceholder?: string;
    showNotifications?: boolean;
    notificationCount?: number;
    showDarkModeToggle?: boolean;
    actions?: React.ReactNode;
    logo?: React.ReactNode;
  };
  /** Sidebar header element */
  sidebarHeader?: React.ReactNode;
  /** Sidebar footer element */
  sidebarFooter?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Full width content (no max-width) */
  fullWidth?: boolean;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  sidebarSections = [],
  mobileNavItems = [],
  showSidebar = true,
  showMobileNav = true,
  header,
  sidebarHeader,
  sidebarFooter,
  className,
  fullWidth = false,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      {showSidebar && sidebarSections.length > 0 && (
        <UnifiedSidebar
          sections={sidebarSections}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          header={sidebarHeader}
          footer={sidebarFooter}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          showSidebar && (sidebarCollapsed ? 'mr-16' : 'mr-64'),
          'max-md:mr-0', // No margin on mobile
          className
        )}
      >
        {/* Header */}
        <UnifiedHeader
          onSidebarToggle={showSidebar ? toggleMobileSidebar : undefined}
          onDesktopSidebarToggle={showSidebar ? toggleSidebar : undefined}
          {...header}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div
            className={cn(
              'p-4 md:p-6 lg:p-8',
              !fullWidth && 'container mx-auto',
              showMobileNav && 'pb-20 md:pb-6' // Extra padding for mobile nav
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && mobileNavItems.length > 0 && (
        <UnifiedMobileNav items={mobileNavItems} />
      )}
    </div>
  );
};

export default UnifiedLayout;
