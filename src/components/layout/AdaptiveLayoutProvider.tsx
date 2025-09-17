import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDeviceDetection, DeviceInfo } from '@/hooks/useDeviceDetection';
import { getNavigationType, getPerformanceConfig } from '@/utils/deviceUtils';

interface LayoutState {
  // Navigation state
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  tabletDrawerOpen: boolean;
  
  // Layout preferences
  compactMode: boolean;
  showBreadcrumbs: boolean;
  showQuickActions: boolean;
  
  // Performance settings
  animationsEnabled: boolean;
  lazyLoadEnabled: boolean;
}

interface AdaptiveLayoutContextType {
  device: DeviceInfo;
  layoutState: LayoutState;
  
  // Actions
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleTabletDrawer: () => void;
  setCompactMode: (compact: boolean) => void;
  toggleBreadcrumbs: () => void;
  toggleQuickActions: () => void;
  
  // Utilities
  navigationType: 'sidebar' | 'drawer' | 'bottom';
  shouldReduceAnimations: boolean;
  optimizedForTouch: boolean;
}

const AdaptiveLayoutContext = createContext<AdaptiveLayoutContextType | undefined>(undefined);

interface AdaptiveLayoutProviderProps {
  children: React.ReactNode;
  initialState?: Partial<LayoutState>;
}

export function AdaptiveLayoutProvider({ 
  children, 
  initialState = {} 
}: AdaptiveLayoutProviderProps) {
  const device = useDeviceDetection();
  const performanceConfig = getPerformanceConfig(device);
  const navigationType = getNavigationType(device);

  const [layoutState, setLayoutState] = useState<LayoutState>({
    sidebarOpen: !device.isMobile,
    mobileMenuOpen: false,
    tabletDrawerOpen: false,
    compactMode: device.isMobile,
    showBreadcrumbs: !device.isMobile,
    showQuickActions: !device.isMobile,
    animationsEnabled: performanceConfig.animationsEnabled,
    lazyLoadEnabled: device.isMobile,
    ...initialState
  });

  // Update layout state when device changes
  useEffect(() => {
    setLayoutState(prev => ({
      ...prev,
      sidebarOpen: device.isDesktop,
      compactMode: device.isMobile,
      showBreadcrumbs: !device.isMobile,
      showQuickActions: !device.isMobile,
      animationsEnabled: performanceConfig.animationsEnabled,
      // Close mobile menu when switching to desktop
      mobileMenuOpen: device.isMobile ? prev.mobileMenuOpen : false,
      tabletDrawerOpen: device.isTablet ? prev.tabletDrawerOpen : false
    }));
  }, [device.deviceType, performanceConfig.animationsEnabled]);

  // Actions
  const toggleSidebar = () => {
    setLayoutState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const toggleMobileMenu = () => {
    setLayoutState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  };

  const toggleTabletDrawer = () => {
    setLayoutState(prev => ({ ...prev, tabletDrawerOpen: !prev.tabletDrawerOpen }));
  };

  const setCompactMode = (compact: boolean) => {
    setLayoutState(prev => ({ ...prev, compactMode: compact }));
  };

  const toggleBreadcrumbs = () => {
    setLayoutState(prev => ({ ...prev, showBreadcrumbs: !prev.showBreadcrumbs }));
  };

  const toggleQuickActions = () => {
    setLayoutState(prev => ({ ...prev, showQuickActions: !prev.showQuickActions }));
  };

  const contextValue: AdaptiveLayoutContextType = {
    device,
    layoutState,
    toggleSidebar,
    toggleMobileMenu,
    toggleTabletDrawer,
    setCompactMode,
    toggleBreadcrumbs,
    toggleQuickActions,
    navigationType,
    shouldReduceAnimations: !layoutState.animationsEnabled || device.isMobile,
    optimizedForTouch: device.hasTouch
  };

  return (
    <AdaptiveLayoutContext.Provider value={contextValue}>
      {children}
    </AdaptiveLayoutContext.Provider>
  );
}

export function useAdaptiveLayout() {
  const context = useContext(AdaptiveLayoutContext);
  if (context === undefined) {
    throw new Error('useAdaptiveLayout must be used within an AdaptiveLayoutProvider');
  }
  return context;
}

// Hook for quick device checks
export function useLayoutDevice() {
  const { device } = useAdaptiveLayout();
  return {
    isMobile: device.isMobile,
    isTablet: device.isTablet,
    isDesktop: device.isDesktop,
    hasTouch: device.hasTouch,
    orientation: device.orientation,
    screenSize: device.screenSize
  };
}