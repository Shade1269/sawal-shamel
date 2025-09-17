import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getModalSize } from '@/utils/deviceUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface AdaptiveModalProps {
  children: React.ReactNode;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  forceDialog?: boolean;
  forceDrawer?: boolean;
}

export function AdaptiveModal({
  children,
  title,
  isOpen,
  onClose,
  className,
  forceDialog = false,
  forceDrawer = false
}: AdaptiveModalProps) {
  const device = useDeviceDetection();
  const modalSize = getModalSize(device);

  // Force specific type if specified
  const useDrawer = forceDrawer || (device.isMobile && !forceDialog);

  if (useDrawer) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className={cn("max-h-[95vh]", className)}>
          {title && (
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
          )}
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          modalSize.width,
          modalSize.height,
          modalSize.maxWidth,
          modalSize.borderRadius,
          modalSize.position,
          "overflow-auto",
          className
        )}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="flex-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}