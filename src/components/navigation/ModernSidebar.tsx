import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Wallet,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  Home,
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

// Navigation Configuration
const navigationSections: Array<{
  id: string;
  title: string;
  icon?: any;
  color?: string;
  items: SidebarItemData[];
}> = [
  {
    id: 'main',
    title: 'الرئيسية',
    icon: <Home className="h-4 w-4" />,
    items: [
      {
        id: 'dashboard',
        title: 'لوحة التحكم',
        href: '/dashboard',
        icon: Home,
      },
    ],
  },
  {
    id: 'wallet',
    title: 'المحفظة',
    icon: <Wallet className="h-4 w-4" />,
    color: '142 76% 36%', // green
    items: [
      {
        id: 'wallet-overview',
        title: 'نظرة عامة',
        href: '/affiliate/wallet',
        icon: Wallet,
        color: '142 76% 36%',
      },
      {
        id: 'wallet-transactions',
        title: 'المعاملات',
        href: '/affiliate/wallet/transactions',
        icon: ShoppingCart,
        color: '142 76% 36%',
      },
    ],
  },
  {
    id: 'store',
    title: 'المتجر',
    icon: <Store className="h-4 w-4" />,
    color: '221 83% 53%', // blue
    items: [
      {
        id: 'storefront',
        title: 'واجهة المتجر',
        href: '/affiliate/storefront',
        icon: Store,
        color: '221 83% 53%',
      },
      {
        id: 'products',
        title: 'المنتجات',
        href: '/affiliate/products',
        icon: ShoppingCart,
        color: '221 83% 53%',
      },
    ],
  },
  {
    id: 'orders',
    title: 'الطلبات',
    icon: <ShoppingCart className="h-4 w-4" />,
    color: '262 83% 58%', // purple
    items: [
      {
        id: 'orders-list',
        title: 'قائمة الطلبات',
        href: '/affiliate/orders',
        icon: ShoppingCart,
        color: '262 83% 58%',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'التحليلات',
    icon: <BarChart3 className="h-4 w-4" />,
    color: '24 95% 53%', // orange
    items: [
      {
        id: 'analytics-overview',
        title: 'نظرة عامة',
        href: '/affiliate/analytics',
        icon: BarChart3,
        color: '24 95% 53%',
      },
    ],
  },
  {
    id: 'settings',
    title: 'الإعدادات',
    icon: <Settings className="h-4 w-4" />,
    color: '215 16% 47%', // gray
    items: [
      {
        id: 'settings-general',
        title: 'عام',
        href: '/settings',
        icon: Settings,
        color: '215 16% 47%',
      },
    ],
  },
];

export function ModernSidebar() {
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

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "backdrop-blur-xl",
        state.isCollapsed ? "w-16" : "w-64"
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
  );
}