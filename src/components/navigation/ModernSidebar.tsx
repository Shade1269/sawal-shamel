import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Clock,
  Star,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarState } from '@/hooks/useSidebarState';
import { SidebarSearch } from './SidebarSearch';
import { SidebarSection } from './SidebarSection';
import { SidebarItem, SidebarItemData } from './SidebarItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModernSidebarProps {
  navigationSections: Array<{
    id: string;
    title: string;
    icon?: any;
    color?: string;
    items: SidebarItemData[];
  }>;
}

export function ModernSidebar({ navigationSections }: ModernSidebarProps) {
  const {
    state,
    toggleCollapse,
    toggleSection,
    addRecentPage,
    toggleFavorite,
    setSearchQuery
  } = useSidebarState();
  
  const location = useLocation();

  // Track recent pages
  useEffect(() => {
    addRecentPage(location.pathname);
  }, [location.pathname, addRecentPage]);

  // Close sidebar on mobile when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector('[data-sidebar="true"]');
      const isSmallScreen = window.innerWidth < 768; // md breakpoint
      
      if (isSmallScreen && !state.isCollapsed && sidebar && !sidebar.contains(target)) {
        toggleCollapse();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.isCollapsed, toggleCollapse]);

  // Close on navigation (mobile)
  useEffect(() => {
    const isSmallScreen = window.innerWidth < 768;
    if (isSmallScreen && !state.isCollapsed) {
      toggleCollapse();
    }
  }, [location.pathname]);

  // Filter items based on search
  const filteredSections = state.searchQuery
    ? navigationSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.title.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : navigationSections;

  // Get recent pages items
  const recentItems = state.recentPages
    .slice(0, 5)
    .map(path => {
      for (const section of navigationSections) {
        const item = section.items.find(i => i.href === path);
        if (item) return item;
      }
      return null;
    })
    .filter(Boolean) as SidebarItemData[];

  // Get favorite items
  const favoriteItems = state.favorites
    .map(id => {
      for (const section of navigationSections) {
        const item = section.items.find(i => i.id === id);
        if (item) return item;
      }
      return null;
    })
    .filter(Boolean) as SidebarItemData[];

  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Overlay for mobile */}
      {!state.isCollapsed && isSmallScreen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleCollapse}
        />
      )}
      
      <aside
        data-sidebar="true"
        className={cn(
          "fixed right-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
          "backdrop-blur-xl shadow-2xl",
          // Mobile: full overlay drawer
          "md:top-16 md:h-[calc(100vh-4rem)]",
          // Collapsed state
          state.isCollapsed 
            ? "translate-x-full md:translate-x-0 md:w-16" 
            : "translate-x-0 w-80 md:w-64"
        )}
        style={{
          backgroundColor: `hsl(var(--sidebar-glass-bg) / var(--sidebar-glass-opacity))`,
          borderLeft: `1px solid hsl(var(--sidebar-border))`,
        }}
      >
        <div className="flex flex-col h-full">
        {/* Header with Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--sidebar-border))]">
          {!state.isCollapsed && (
            <h2 className="text-lg font-bold text-[hsl(var(--sidebar-text))]">
              عناقتي
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-text))]"
          >
            {state.isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Search */}
        <SidebarSearch
          value={state.searchQuery}
          onChange={setSearchQuery}
          isCollapsed={state.isCollapsed}
        />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          {/* Favorites Section */}
          {!state.isCollapsed && favoriteItems.length > 0 && (
            <SidebarSection
              id="favorites"
              title="المفضلة"
              icon={<Star className="h-4 w-4" />}
              isCollapsed={state.isCollapsed}
            >
              {favoriteItems.map(item => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={state.isCollapsed}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </SidebarSection>
          )}

          {/* Recent Pages Section */}
          {!state.isCollapsed && !state.searchQuery && recentItems.length > 0 && (
            <SidebarSection
              id="recent"
              title="الأخيرة"
              icon={<Clock className="h-4 w-4" />}
              isCollapsed={state.isCollapsed}
            >
              {recentItems.map(item => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={state.isCollapsed}
                  isFavorite={state.favorites.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </SidebarSection>
          )}

          {/* Main Navigation Sections */}
          {filteredSections.map(section => (
            <SidebarSection
              key={section.id}
              id={section.id}
              title={section.title}
              icon={section.icon}
              color={section.color}
              isCollapsed={state.isCollapsed}
              isExpanded={state.expandedSections.includes(section.id)}
              onToggle={toggleSection}
            >
              {section.items.map(item => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={state.isCollapsed}
                  isFavorite={state.favorites.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </SidebarSection>
          ))}
        </ScrollArea>

          {/* Footer - User Info (if needed) */}
          {!state.isCollapsed && (
            <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
              <p className="text-xs text-[hsl(var(--sidebar-text-secondary))] text-center">
                © 2025 عناقتي
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}