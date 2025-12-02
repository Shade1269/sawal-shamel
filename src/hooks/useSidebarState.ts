import { useState, useEffect } from 'react';

export interface SidebarState {
  isCollapsed: boolean;
  expandedSections: string[];
  recentPages: string[];
  favorites: string[];
  searchQuery: string;
}

const STORAGE_KEY = 'modern-sidebar-state';
const MAX_RECENT = 5;

export function useSidebarState() {
  const [state, setState] = useState<SidebarState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Return default state if stored data is corrupted
        return getDefaultState();
      }
    }
    return getDefaultState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Sync state across components/tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue) as SidebarState;
          setState(next);
        } catch {
          // Ignore JSON parsing errors for storage events
        }
      }
    };

    const onCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent<SidebarState>;
        if (ce.detail) setState(ce.detail);
      } catch {
        // Ignore errors for custom sidebar events
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('sidebar-state', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sidebar-state', onCustom as EventListener);
    };
  }, []);

  const toggleCollapse = () => {
    setState(prev => {
      const next = { ...prev, isCollapsed: !prev.isCollapsed };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Ignore storage errors */ }
      // Broadcast to same tab listeners
      try { window.dispatchEvent(new CustomEvent('sidebar-state', { detail: next })); } catch { /* Ignore dispatch errors */ }
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      expandedSections: prev.expandedSections.includes(sectionId)
        ? prev.expandedSections.filter(id => id !== sectionId)
        : [...prev.expandedSections, sectionId]
    }));
  };

  const addRecentPage = (page: string) => {
    setState(prev => {
      const filtered = prev.recentPages.filter(p => p !== page);
      return {
        ...prev,
        recentPages: [page, ...filtered].slice(0, MAX_RECENT)
      };
    });
  };

  const toggleFavorite = (page: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(page)
        ? prev.favorites.filter(p => p !== page)
        : [...prev.favorites, page]
    }));
  };

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  return {
    state,
    toggleCollapse,
    toggleSection,
    addRecentPage,
    toggleFavorite,
    setSearchQuery
  };
}

function getDefaultState(): SidebarState {
  // On mobile, start collapsed (closed)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return {
    isCollapsed: isMobile, // Start collapsed on mobile
    expandedSections: ['main', 'business', 'users', 'inventory', 'finance', 'settings', 'products', 'orders', 'wallet'], // All sections expanded by default
    recentPages: [],
    favorites: [],
    searchQuery: ''
  };
}