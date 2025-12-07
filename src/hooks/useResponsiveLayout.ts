import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ResponsiveConfig<T> {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
}

interface LayoutBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

const defaultBreakpoints: LayoutBreakpoints = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px) and (max-width: 1440px)',
  wide: '(min-width: 1441px)'
};

export const useResponsiveLayout = (customBreakpoints?: Partial<LayoutBreakpoints>) => {
  void { ...defaultBreakpoints, ...customBreakpoints }; // Reserved for future use
  
  const isMobile = useIsMobile();
  const isTablet = !isMobile; // Simplified
  const isDesktop = !isMobile;
  const isWide = !isMobile;

  // Current breakpoint
  const currentBreakpoint: Breakpoint = useMemo(() => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isDesktop) return 'desktop';
    if (isWide) return 'wide';
    return 'desktop'; // fallback
  }, [isMobile, isTablet, isDesktop, isWide]);

  // Get responsive value based on current breakpoint
  const getResponsiveValue = <T>(config: ResponsiveConfig<T> | T): T => {
    if (typeof config !== 'object' || config === null) {
      return config as T;
    }

    const responsiveConfig = config as ResponsiveConfig<T>;
    
    // Try to get value for current breakpoint, then fallback
    return responsiveConfig[currentBreakpoint] ??
           responsiveConfig.desktop ??
           responsiveConfig.tablet ??
           responsiveConfig.mobile ??
           responsiveConfig.wide ??
           (Object.values(responsiveConfig)[0] as T);
  };

  // Layout utilities
  const layoutUtils = useMemo(() => ({
    // Grid columns
    getGridCols: (config: ResponsiveConfig<number> | number) => {
      const cols = getResponsiveValue(config);
      return `grid-cols-${cols}`;
    },

    // Spacing
    getSpacing: (config: ResponsiveConfig<number> | number) => {
      const spacing = getResponsiveValue(config);
      return `gap-${spacing}`;
    },

    // Padding
    getPadding: (config: ResponsiveConfig<number> | number) => {
      const padding = getResponsiveValue(config);
      return `p-${padding}`;
    },

    // Text size
    getTextSize: (config: ResponsiveConfig<string> | string) => {
      return getResponsiveValue(config);
    },

    // Show/hide based on breakpoint
    getVisibilityClass: (showOn: Breakpoint[]) => {
      const classes = [];
      
      if (showOn.includes('mobile')) classes.push('block md:hidden');
      if (showOn.includes('tablet')) classes.push('hidden md:block lg:hidden');
      if (showOn.includes('desktop')) classes.push('hidden lg:block xl:hidden');
      if (showOn.includes('wide')) classes.push('hidden xl:block');
      
      return classes.join(' ');
    }
  }), [getResponsiveValue]);

  // Container utilities
  const containerUtils = useMemo(() => ({
    // Max width based on breakpoint
    getMaxWidth: () => {
      switch (currentBreakpoint) {
        case 'mobile': return 'max-w-full';
        case 'tablet': return 'max-w-3xl';
        case 'desktop': return 'max-w-6xl';
        case 'wide': return 'max-w-7xl';
        default: return 'max-w-6xl';
      }
    },

    // Container padding
    getContainerPadding: () => {
      switch (currentBreakpoint) {
        case 'mobile': return 'px-4';
        case 'tablet': return 'px-6';
        case 'desktop': return 'px-8';
        case 'wide': return 'px-12';
        default: return 'px-6';
      }
    },

    // Sidebar width
    getSidebarWidth: (collapsed: boolean = false) => {
      if (collapsed) return 'w-16';
      
      switch (currentBreakpoint) {
        case 'mobile': return 'w-full';
        case 'tablet': return 'w-64';
        case 'desktop': return 'w-72';
        case 'wide': return 'w-80';
        default: return 'w-64';
      }
    }
  }), [currentBreakpoint]);

  // Navigation utilities
  const navigationUtils = useMemo(() => ({
    // Should use mobile navigation
    shouldUseMobileNav: () => isMobile,

    // Should use drawer instead of sheet
    shouldUseDrawer: () => isMobile,

    // Navigation item count that fits
    getVisibleNavItems: (maxItems: ResponsiveConfig<number>) => {
      return getResponsiveValue(maxItems);
    },

    // Tab size for different screens
    getTabSize: (): 'sm' | 'md' | 'lg' => {
      switch (currentBreakpoint) {
        case 'mobile': return 'sm';
        case 'tablet': return 'md';
        case 'desktop': return 'md';
        case 'wide': return 'lg';
        default: return 'md';
      }
    }
  }), [currentBreakpoint, isMobile, getResponsiveValue]);

  // Performance utilities
  const performanceUtils = useMemo(() => ({
    // Should virtualize long lists
    shouldVirtualize: (itemCount: number) => {
      const threshold = currentBreakpoint === 'mobile' ? 50 : 100;
      return itemCount > threshold;
    },

    // Items per page for pagination
    getItemsPerPage: (config?: ResponsiveConfig<number>) => {
      const defaultConfig = {
        mobile: 10,
        tablet: 20,
        desktop: 25,
        wide: 30
      };
      return getResponsiveValue(config || defaultConfig);
    },

    // Load more threshold
    getLoadMoreThreshold: () => {
      switch (currentBreakpoint) {
        case 'mobile': return 2;
        case 'tablet': return 3;
        case 'desktop': return 5;
        case 'wide': return 8;
        default: return 3;
      }
    }
  }), [currentBreakpoint, getResponsiveValue]);

  return {
    // Current state
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    
    // Core utilities
    getResponsiveValue,
    
    // Specialized utilities
    layout: layoutUtils,
    container: containerUtils,
    navigation: navigationUtils,
    performance: performanceUtils,
    
    // Direct breakpoint checks
    breakpoint: {
      isMobile,
      isTablet,
      isDesktop,
      isWide,
      is: (bp: Breakpoint) => currentBreakpoint === bp,
      isAtLeast: (bp: Breakpoint) => {
        const order: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide'];
        const currentIndex = order.indexOf(currentBreakpoint);
        const targetIndex = order.indexOf(bp);
        return currentIndex >= targetIndex;
      }
    }
  };
};

// Hook for responsive columns
export const useResponsiveColumns = (
  config: ResponsiveConfig<number> = { mobile: 1, tablet: 2, desktop: 3, wide: 4 }
) => {
  const { getResponsiveValue } = useResponsiveLayout();
  return getResponsiveValue(config);
};

// Hook for responsive spacing
export const useResponsiveSpacing = (
  config: ResponsiveConfig<number> = { mobile: 4, tablet: 6, desktop: 8, wide: 12 }
) => {
  const { getResponsiveValue } = useResponsiveLayout();
  return getResponsiveValue(config);
};