import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
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
      const toggleButton = document.querySelector('[data-sidebar-toggle="true"]');
      const isSmallScreen = window.innerWidth < 768; // md breakpoint
      
      // Don't close if clicking the toggle button or any of its children
      if (toggleButton && (toggleButton.contains(target) || target.closest('[data-sidebar-toggle="true"]'))) {
        return;
      }
      
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
          "fixed z-40 h-screen transition-all duration-300 ease-in-out",
          "backdrop-blur-xl shadow-2xl border-s border-border/50",
          "bg-gradient-to-br from-card/95 via-card/90 to-background/95",
          // Desktop: right side, below header
          "md:end-0 md:top-16 md:h-[calc(100vh-4rem)]",
          // Mobile: full screen overlay from right
          "top-0 end-0",
          // Collapsed state
          state.isCollapsed
            ? "translate-x-full md:translate-x-0 md:w-16"
            : "translate-x-0 w-[85vw] max-w-80 md:w-72"
        )}
      >
        <div className="flex flex-col h-full">
        {/* Header with Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-l from-primary/5 to-transparent">
          {!state.isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center text-white font-bold text-sm shadow-lg">
                أ
              </div>
              <h2 className="text-lg font-bold bg-gradient-premium bg-clip-text text-transparent">
                أناقتي
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-200"
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


          {/* Main Navigation Sections */}
          {filteredSections.map(section => (
            <SidebarSection
              key={section.id}
              id={section.id}
              title={section.title}
              icon={section.icon}
              color={section.color}
              isCollapsed={state.isCollapsed}
              isExpanded={state.expandedSections.length === 0 || state.expandedSections.includes(section.id)}
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

          {/* Footer - User Info */}
          {!state.isCollapsed && (
            <div className="p-4 border-t border-border/50 bg-gradient-to-t from-primary/5 to-transparent">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>© 2025</span>
                <span className="font-semibold bg-gradient-premium bg-clip-text text-transparent">أناقتي</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}