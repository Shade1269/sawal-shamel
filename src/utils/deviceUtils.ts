import { DeviceInfo } from '@/hooks/useDeviceDetection';

/**
 * Device utility functions for conditional logic and styling
 */

// Touch-friendly sizing utilities
export const getTouchFriendlySize = (device: DeviceInfo) => {
  if (device.isMobile) {
    return {
      buttonHeight: 'h-12', // 48px - minimum touch target
      buttonPadding: 'px-6 py-3',
      iconSize: 'h-6 w-6',
      fontSize: 'text-base',
      spacing: 'space-y-4'
    };
  }
  
  if (device.isTablet) {
    return {
      buttonHeight: 'h-11',
      buttonPadding: 'px-5 py-2.5',
      iconSize: 'h-5 w-5',
      fontSize: 'text-sm',
      spacing: 'space-y-3'
    };
  }
  
  // Desktop
  return {
    buttonHeight: 'h-10',
    buttonPadding: 'px-4 py-2',
    iconSize: 'h-4 w-4',
    fontSize: 'text-sm',
    spacing: 'space-y-2'
  };
};

// Container spacing utilities
export const getContainerSpacing = (device: DeviceInfo) => {
  if (device.isMobile) {
    return {
      padding: 'p-4',
      marginY: 'my-4',
      marginX: 'mx-4',
      gap: 'gap-4'
    };
  }
  
  if (device.isTablet) {
    return {
      padding: 'p-6',
      marginY: 'my-6',
      marginX: 'mx-6',
      gap: 'gap-6'
    };
  }
  
  // Desktop
  return {
    padding: 'p-8',
    marginY: 'my-8',
    marginX: 'mx-8',
    gap: 'gap-8'
  };
};

// Grid column utilities
export const getResponsiveColumns = (device: DeviceInfo, maxCols: number = 4) => {
  if (device.isMobile) {
    return Math.min(1, maxCols);
  }
  
  if (device.isTablet) {
    return Math.min(2, maxCols);
  }
  
  // Desktop
  return maxCols;
};

// Navigation type utilities
export const getNavigationType = (device: DeviceInfo) => {
  if (device.isMobile) {
    return 'bottom'; // Bottom navigation for mobile
  }
  
  if (device.isTablet) {
    return 'drawer'; // Collapsible drawer for tablet
  }
  
  return 'sidebar'; // Full sidebar for desktop
};

// Modal/Dialog sizing utilities
export const getModalSize = (device: DeviceInfo) => {
  if (device.isMobile) {
    return {
      width: 'w-full',
      height: 'h-full',
      maxWidth: 'max-w-none',
      borderRadius: 'rounded-none',
      position: 'absolute inset-0'
    };
  }
  
  if (device.isTablet) {
    return {
      width: 'w-11/12',
      height: 'max-h-[90vh]',
      maxWidth: 'max-w-2xl',
      borderRadius: 'rounded-lg',
      position: 'relative'
    };
  }
  
  // Desktop
  return {
    width: 'w-auto',
    height: 'max-h-[80vh]',
    maxWidth: 'max-w-lg',
    borderRadius: 'rounded-lg',
    position: 'relative'
  };
};

// Typography utilities
export const getTypographyScale = (device: DeviceInfo) => {
  const baseScale = {
    h1: device.isMobile ? 'text-2xl' : device.isTablet ? 'text-3xl' : 'text-4xl',
    h2: device.isMobile ? 'text-xl' : device.isTablet ? 'text-2xl' : 'text-3xl',
    h3: device.isMobile ? 'text-lg' : device.isTablet ? 'text-xl' : 'text-2xl',
    h4: device.isMobile ? 'text-base' : device.isTablet ? 'text-lg' : 'text-xl',
    body: device.isMobile ? 'text-sm' : 'text-base',
    small: device.isMobile ? 'text-xs' : 'text-sm'
  };
  
  return baseScale;
};

// Form utilities
export const getFormSpacing = (device: DeviceInfo) => {
  if (device.isMobile) {
    return {
      fieldSpacing: 'space-y-4',
      inputHeight: 'h-12',
      inputPadding: 'px-4 py-3',
      labelSpacing: 'mb-2'
    };
  }
  
  if (device.isTablet) {
    return {
      fieldSpacing: 'space-y-3',
      inputHeight: 'h-11',
      inputPadding: 'px-3 py-2.5',
      labelSpacing: 'mb-1.5'
    };
  }
  
  // Desktop
  return {
    fieldSpacing: 'space-y-2',
    inputHeight: 'h-10',
    inputPadding: 'px-3 py-2',
    labelSpacing: 'mb-1'
  };
};

// Animation preferences
export const getAnimationPreferences = (device: DeviceInfo) => {
  // Reduce animations on mobile for better performance
  if (device.isMobile) {
    return {
      duration: 'duration-150',
      easing: 'ease-out',
      reduceMotion: true
    };
  }
  
  return {
    duration: 'duration-300',
    easing: 'ease-persian',
    reduceMotion: false
  };
};

// Conditional rendering utilities
export const shouldShowOnDevice = (
  device: DeviceInfo, 
  showOn: ('mobile' | 'tablet' | 'desktop')[]
): boolean => {
  return showOn.some(deviceType => {
    switch (deviceType) {
      case 'mobile':
        return device.isMobile;
      case 'tablet':
        return device.isTablet;
      case 'desktop':
        return device.isDesktop;
      default:
        return false;
    }
  });
};

// Performance utilities
export const getPerformanceConfig = (device: DeviceInfo) => {
  if (device.isMobile) {
    return {
      lazyLoadThreshold: 0.1, // Load earlier on mobile
      imageQuality: 'medium',
      animationsEnabled: false, // Disable complex animations
      virtualScrolling: true // Enable for long lists
    };
  }
  
  if (device.isTablet) {
    return {
      lazyLoadThreshold: 0.2,
      imageQuality: 'high',
      animationsEnabled: true,
      virtualScrolling: false
    };
  }
  
  // Desktop
  return {
    lazyLoadThreshold: 0.3,
    imageQuality: 'high',
    animationsEnabled: true,
    virtualScrolling: false
  };
};