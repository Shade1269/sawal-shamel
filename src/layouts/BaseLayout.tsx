import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useDarkMode } from '@/shared/components/DarkModeProvider';

/**
 * Base Layout - Foundation for all app layouts
 * Provides common structure: Header, Sidebar, Main Content, Footer
 */

export interface BaseLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
  contentClassName?: string;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  header,
  sidebar,
  footer,
  showHeader = true,
  showSidebar = true,
  showFooter = false,
  className = '',
  contentClassName = ''
}) => {
  const { isDarkMode: _isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      {showHeader && header && (
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
          {header}
        </header>
      )}

      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        {/* Sidebar - Now always rendered, ModernSidebar handles its own responsive behavior */}
        {showSidebar && sidebar && (
          <>
            {sidebar}
          </>
        )}

        {/* Main Content - Responsive padding and width */}
        <main className={`flex-1 overflow-auto w-full md:me-16 lg:me-72 ${contentClassName}`}>
          <div className="w-full px-4 py-6 md:px-6 md:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && footer && (
        <footer className="border-t border-border bg-card/50 py-6">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default BaseLayout;
