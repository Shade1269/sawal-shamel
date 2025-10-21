import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getTouchFriendlySize } from '@/utils/deviceUtils';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdaptiveButtonProps extends ButtonProps {
  touchOptimized?: boolean;
  fullWidthOnMobile?: boolean;
}

export function AdaptiveButton({
  className,
  touchOptimized = true,
  fullWidthOnMobile = false,
  children,
  ...props
}: AdaptiveButtonProps) {
  const device = useDeviceDetection();
  const touchSize = getTouchFriendlySize(device);

  const adaptiveClasses = cn(
    // Touch-friendly sizing
    touchOptimized && device.hasTouch && touchSize.buttonHeight,
    touchOptimized && device.hasTouch && touchSize.buttonPadding,
    
    // Full width on mobile if specified
    fullWidthOnMobile && device.isMobile && "w-full",
    
    // Font size adjustment
    touchOptimized && touchSize.fontSize,
    
    className
  );

  return (
    <Button 
      className={adaptiveClasses}
      {...props}
    >
      {children}
    </Button>
  );
}