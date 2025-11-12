import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useToast } from '@/hooks/use-toast';

/**
 * Base Layout - Foundation for all app layouts
 * Provides common structure: Header, Sidebar, Main Content, Footer
 */

export interface BaseLayoutProps {
  children: ReactNode;
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
  children,
  header,
  sidebar,
  footer,
  showHeader = true,
  showSidebar = true,
  showFooter = false,
  className = '',
  contentClassName = ''
}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      {showHeader && header && (
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
          {header}
        </header>
      )}

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-card/50">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-auto ${contentClassName}`}>
          {children}
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
