
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, TouchpadIcon, Mouse } from 'lucide-react';

interface DeviceDebuggerProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  minimal?: boolean;
}

export function DeviceDebugger({ 
  position = 'bottom-left', 
  minimal = false 
}: DeviceDebuggerProps) {
  const device = useDeviceDetection();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  const getDeviceIcon = () => {
    switch (device.deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getDeviceColor = () => {
    switch (device.deviceType) {
      case 'mobile':
        return 'bg-info';
      case 'tablet':
        return 'bg-success';
      case 'desktop':
        return 'bg-premium';
      default:
        return 'bg-muted-foreground';
    }
  };

  if (minimal) {
    return (
      <div className={`${positionClasses[position]} z-50`}>
        <Badge 
          variant="outline" 
          className={`${getDeviceColor()} text-primary-foreground border-0 flex items-center gap-2`}
        >
          {getDeviceIcon()}
          <span className="capitalize">{device.deviceType}</span>
          <span className="text-xs opacity-75">
            {device.viewport.width}×{device.viewport.height}
          </span>
          {device.hasTouch && <TouchpadIcon className="h-3 w-3" />}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`${positionClasses[position]} z-50 max-w-xs`}>
      <Card className="bg-background/95 backdrop-blur border shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {getDeviceIcon()}
            Device Debug Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Primary Device Type */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className={`${getDeviceColor()} text-primary-foreground border-0`}>
              {device.deviceType}
            </Badge>
          </div>

          {/* Screen Info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Viewport:</span>
              <span className="font-mono">
                {device.viewport.width}×{device.viewport.height}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Screen Size:</span>
              <Badge variant="secondary">{device.screenSize}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Orientation:</span>
              <span className="capitalize">{device.orientation}</span>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Touch:</span>
              <div className="flex items-center gap-1">
              {device.hasTouch ? (
                  <>
                    <TouchpadIcon className="h-3 w-3 text-success" />
                    <span className="text-success">Yes</span>
                  </>
                ) : (
                  <>
                    <Mouse className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">No</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs">Platform:</span>
            <div className="flex flex-wrap gap-1">
              {device.platform.isIOS && <Badge variant="outline" className="text-xs">iOS</Badge>}
              {device.platform.isAndroid && <Badge variant="outline" className="text-xs">Android</Badge>}
              {device.platform.isWindows && <Badge variant="outline" className="text-xs">Windows</Badge>}
              {device.platform.isMac && <Badge variant="outline" className="text-xs">Mac</Badge>}
              {device.platform.isLinux && <Badge variant="outline" className="text-xs">Linux</Badge>}
            </div>
          </div>

          {/* Browser */}
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs">Browser:</span>
            <div className="flex flex-wrap gap-1">
              {device.browser.isChrome && <Badge variant="outline" className="text-xs">Chrome</Badge>}
              {device.browser.isFirefox && <Badge variant="outline" className="text-xs">Firefox</Badge>}
              {device.browser.isSafari && <Badge variant="outline" className="text-xs">Safari</Badge>}
              {device.browser.isEdge && <Badge variant="outline" className="text-xs">Edge</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Convenience component for minimal display
export function DeviceIndicator() {
  return <DeviceDebugger minimal={true} position="bottom-right" />;
}