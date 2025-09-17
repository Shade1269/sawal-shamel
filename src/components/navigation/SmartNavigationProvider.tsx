import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useFastAuth } from '@/hooks/useFastAuth';

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ElementType;
  badge?: number;
  description?: string;
  keywords?: string[];
  roles?: string[];
  isVisible?: boolean;
  isActive?: boolean;
  children?: NavigationItem[];
  group?: string;
  order?: number;
}

interface NavigationState {
  // Current navigation state
  currentPath: string;
  activeItem: NavigationItem | null;
  breadcrumbs: NavigationItem[];
  
  // Mobile navigation state
  mobileMenuOpen: boolean;
  bottomNavVisible: boolean;
  
  // Search and quick access
  searchQuery: string;
  recentPages: NavigationItem[];
  favoritePages: NavigationItem[];
  
  // Navigation history
  navigationHistory: string[];
  canGoBack: boolean;
  canGoForward: boolean;
}

interface SmartNavigationContextType {
  // State
  state: NavigationState;
  items: NavigationItem[];
  
  // Actions
  navigate: (path: string, options?: { replace?: boolean }) => void;
  goBack: () => void;
  goForward: () => void;
  toggleMobileMenu: () => void;
  setBottomNavVisible: (visible: boolean) => void;
  searchNavigation: (query: string) => NavigationItem[];
  addToFavorites: (item: NavigationItem) => void;
  removeFromFavorites: (itemId: string) => void;
  addToRecent: (item: NavigationItem) => void;
  
  // Utilities
  isItemVisible: (item: NavigationItem) => boolean;
  getNavigationForDevice: () => NavigationItem[];
  getBreadcrumbs: () => NavigationItem[];
}

const SmartNavigationContext = createContext<SmartNavigationContextType | undefined>(undefined);

interface SmartNavigationProviderProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
}

export function SmartNavigationProvider({ 
  children, 
  navigationItems 
}: SmartNavigationProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const device = useDeviceDetection();
  const { profile } = useFastAuth();

  const [state, setState] = useState<NavigationState>({
    currentPath: location.pathname,
    activeItem: null,
    breadcrumbs: [],
    mobileMenuOpen: false,
    bottomNavVisible: device.isMobile,
    searchQuery: '',
    recentPages: [],
    favoritePages: JSON.parse(localStorage.getItem('nav-favorites') || '[]'),
    navigationHistory: [location.pathname],
    canGoBack: false,
    canGoForward: false
  });

  // Update current path and active item when location changes
  useEffect(() => {
    const currentItem = findItemByPath(navigationItems, location.pathname);
    const breadcrumbs = generateBreadcrumbs(navigationItems, location.pathname);
    
    setState(prev => ({
      ...prev,
      currentPath: location.pathname,
      activeItem: currentItem,
      breadcrumbs,
      navigationHistory: [...prev.navigationHistory.slice(-9), location.pathname],
      canGoBack: prev.navigationHistory.length > 1
    }));

    // Add to recent pages
    if (currentItem) {
      addToRecent(currentItem);
    }

    // Close mobile menu on navigation
    if (device.isMobile) {
      setState(prev => ({ ...prev, mobileMenuOpen: false }));
    }
  }, [location.pathname, navigationItems, device.isMobile]);

  // Update bottomNavVisible when device type changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      bottomNavVisible: device.isMobile
    }));
  }, [device.isMobile]);

  // Actions
  const handleNavigate = (path: string, options?: { replace?: boolean }) => {
    navigate(path, options);
  };

  const goBack = () => {
    if (state.canGoBack) {
      navigate(-1);
    }
  };

  const goForward = () => {
    navigate(1);
  };

  const toggleMobileMenu = () => {
    setState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  };

  const setBottomNavVisible = (visible: boolean) => {
    setState(prev => ({ ...prev, bottomNavVisible: visible }));
  };

  const searchNavigation = (query: string): NavigationItem[] => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return navigationItems.filter(item => {
      const searchableText = [
        item.title,
        item.description,
        ...(item.keywords || [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchTerms.every(term => 
        searchableText.includes(term)
      ) && isItemVisible(item);
    });
  };

  const addToFavorites = (item: NavigationItem) => {
    const newFavorites = [...state.favoritePages.filter(fav => fav.id !== item.id), item];
    setState(prev => ({ ...prev, favoritePages: newFavorites }));
    localStorage.setItem('nav-favorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (itemId: string) => {
    const newFavorites = state.favoritePages.filter(fav => fav.id !== itemId);
    setState(prev => ({ ...prev, favoritePages: newFavorites }));
    localStorage.setItem('nav-favorites', JSON.stringify(newFavorites));
  };

  const addToRecent = (item: NavigationItem) => {
    const newRecent = [
      item,
      ...state.recentPages.filter(recent => recent.id !== item.id)
    ].slice(0, 10); // Keep only 10 recent items
    
    setState(prev => ({ ...prev, recentPages: newRecent }));
  };

  // Utilities
  const isItemVisible = (item: NavigationItem): boolean => {
    // Check role permissions
    if (item.roles && item.roles.length > 0) {
      if (!profile?.role || !item.roles.includes(profile.role)) {
        return false;
      }
    }
    
    // Check explicit visibility
    if (item.isVisible === false) {
      return false;
    }
    
    return true;
  };

  const getNavigationForDevice = (): NavigationItem[] => {
    const visibleItems = navigationItems.filter(isItemVisible);
    
    if (device.isMobile) {
      // For mobile, prioritize main navigation items
      return visibleItems
        .filter(item => !item.group || ['main', 'primary'].includes(item.group))
        .slice(0, 5); // Limit to 5 items for bottom nav
    }
    
    return visibleItems;
  };

  const getBreadcrumbs = (): NavigationItem[] => {
    return state.breadcrumbs;
  };

  const contextValue: SmartNavigationContextType = {
    state,
    items: navigationItems,
    navigate: handleNavigate,
    goBack,
    goForward,
    toggleMobileMenu,
    setBottomNavVisible,
    searchNavigation,
    addToFavorites,
    removeFromFavorites,
    addToRecent,
    isItemVisible,
    getNavigationForDevice,
    getBreadcrumbs
  };

  return (
    <SmartNavigationContext.Provider value={contextValue}>
      {children}
    </SmartNavigationContext.Provider>
  );
}

export function useSmartNavigation() {
  const context = useContext(SmartNavigationContext);
  if (context === undefined) {
    throw new Error('useSmartNavigation must be used within a SmartNavigationProvider');
  }
  return context;
}

// Helper functions
function findItemByPath(items: NavigationItem[], path: string): NavigationItem | null {
  for (const item of items) {
    if (item.href === path) {
      return item;
    }
    if (item.children) {
      const found = findItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
}

function generateBreadcrumbs(items: NavigationItem[], path: string): NavigationItem[] {
  const breadcrumbs: NavigationItem[] = [];
  
  function findPath(items: NavigationItem[], targetPath: string, current: NavigationItem[]): boolean {
    for (const item of items) {
      const newPath = [...current, item];
      
      if (item.href === targetPath) {
        breadcrumbs.push(...newPath);
        return true;
      }
      
      if (item.children && findPath(item.children, targetPath, newPath)) {
        return true;
      }
    }
    return false;
  }
  
  findPath(items, path, []);
  return breadcrumbs;
}