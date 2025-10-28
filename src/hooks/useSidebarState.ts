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
        return getDefaultState();
      }
    }
    return getDefaultState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleCollapse = () => {
    setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }));
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
  return {
    isCollapsed: false,
    expandedSections: [],
    recentPages: [],
    favorites: [],
    searchQuery: ''
  };
}