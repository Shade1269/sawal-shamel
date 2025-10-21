import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { shouldShowOnDevice } from '@/utils/deviceUtils';
import type { DeviceInfo } from '@/hooks/useDeviceDetection';

interface DeviceAwareProps {
  children: React.ReactNode;
  showOn?: ('mobile' | 'tablet' | 'desktop')[];
  hideOn?: ('mobile' | 'tablet' | 'desktop')[];
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on device type
 */
export function DeviceAware({ 
  children, 
  showOn, 
  hideOn, 
  className,
  fallback = null 
}: DeviceAwareProps) {
  const device = useDeviceDetection();

  // Show logic
  if (showOn) {
    const shouldShow = shouldShowOnDevice(device, showOn);
    if (!shouldShow) {
      return <>{fallback}</>;
    }
  }

  // Hide logic
  if (hideOn) {
    const shouldHide = shouldShowOnDevice(device, hideOn);
    if (shouldHide) {
      return <>{fallback}</>;
    }
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface DeviceSpecificProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Render different content for different device types
 */
export function DeviceSpecific({ 
  mobile, 
  tablet, 
  desktop, 
  fallback,
  className 
}: DeviceSpecificProps) {
  const device = useDeviceDetection();

  let content = fallback;

  switch (device.deviceType) {
    case 'mobile':
      content = mobile || fallback;
      break;
    case 'tablet':
      content = tablet || fallback;
      break;
    case 'desktop':
      content = desktop || fallback;
      break;
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

interface AdaptiveProps {
  children: (device: DeviceInfo) => React.ReactNode;
  className?: string;
}

/**
 * Render-prop component that provides device info to children
 */
export function Adaptive({ children, className }: AdaptiveProps) {
  const device = useDeviceDetection();

  return (
    <div className={className}>
      {children(device)}
    </div>
  );
}