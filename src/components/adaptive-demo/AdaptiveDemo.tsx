import React, { useState } from 'react';
import { 
  AdaptiveContainer, 
  AdaptiveGrid, 
  AdaptiveGridItem,
  AdaptiveButton,
  AdaptiveForm,
  AdaptiveInput,
  AdaptiveModal,
  useAdaptiveLayout 
} from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, TouchpadIcon } from 'lucide-react';

export function AdaptiveDemo() {
  const [showModal, setShowModal] = useState(false);
  const { device, layoutState } = useAdaptiveLayout();

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

  return (
    <div className="space-y-6">
      {/* Device Info Header */}
      <AdaptiveContainer variant="glass" className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          {getDeviceIcon()}
          <h1 className="text-2xl font-bold">Adaptive Layout Demo</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="capitalize">{device.deviceType}</span>
            {device.hasTouch && <TouchpadIcon className="h-3 w-3" />}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          This demo adapts automatically to your device: {device.viewport.width}×{device.viewport.height}
        </p>
      </AdaptiveContainer>

      {/* Device Features Grid */}
      <AdaptiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
        <AdaptiveGridItem>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Mobile Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Bottom Navigation</li>
                <li>✅ Full-width Modals</li>
                <li>✅ Touch-optimized Buttons</li>
                <li>✅ Compact Header</li>
                <li>✅ Reduced Animations</li>
              </ul>
            </CardContent>
          </Card>
        </AdaptiveGridItem>

        <AdaptiveGridItem>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Tablet Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Collapsible Drawer</li>
                <li>✅ Responsive Modals</li>
                <li>✅ Optimized Spacing</li>
                <li>✅ Breadcrumbs</li>
                <li>✅ Smooth Transitions</li>
              </ul>
            </CardContent>
          </Card>
        </AdaptiveGridItem>

        <AdaptiveGridItem>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💻 Desktop Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Full Sidebar</li>
                <li>✅ Complex Layouts</li>
                <li>✅ Quick Actions</li>
                <li>✅ Rich Animations</li>
                <li>✅ Multi-column Grids</li>
              </ul>
            </CardContent>
          </Card>
        </AdaptiveGridItem>
      </AdaptiveGrid>

      {/* Interactive Demo */}
      <AdaptiveContainer variant="card">
        <h2 className="text-xl font-semibold mb-4">Interactive Demo</h2>
        <AdaptiveForm>
          <AdaptiveInput 
            label="Test Input" 
            placeholder="Try typing here..."
            helperText="Notice how the input size adapts to your device"
          />
          <div className="flex gap-2 pt-4">
            <AdaptiveButton 
              variant="default" 
              fullWidthOnMobile
              onClick={() => setShowModal(true)}
            >
              Open Adaptive Modal
            </AdaptiveButton>
            <AdaptiveButton 
              variant="outline" 
              fullWidthOnMobile
            >
              Touch-Optimized Button
            </AdaptiveButton>
          </div>
        </AdaptiveForm>
      </AdaptiveContainer>

      {/* Current Settings */}
      <AdaptiveContainer variant="minimal">
        <Card>
          <CardHeader>
            <CardTitle>Current Layout Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Device Type:</strong> {device.deviceType}
            </div>
            <div>
              <strong>Screen Size:</strong> {device.screenSize}
            </div>
            <div>
              <strong>Has Touch:</strong> {device.hasTouch ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Orientation:</strong> {device.orientation}
            </div>
            <div>
              <strong>Compact Mode:</strong> {layoutState.compactMode ? 'On' : 'Off'}
            </div>
            <div>
              <strong>Animations:</strong> {layoutState.animationsEnabled ? 'On' : 'Off'}
            </div>
          </CardContent>
        </Card>
      </AdaptiveContainer>

      {/* Adaptive Modal */}
      <AdaptiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Adaptive Modal Demo"
      >
        <div className="space-y-4">
          <p>
            This modal automatically becomes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Full-screen drawer</strong> on mobile devices</li>
            <li><strong>Responsive dialog</strong> on tablets</li>
            <li><strong>Standard modal</strong> on desktop</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Current device: <strong>{device.deviceType}</strong>
          </p>
          <AdaptiveButton 
            onClick={() => setShowModal(false)}
            fullWidthOnMobile
            className="mt-4"
          >
            Close
          </AdaptiveButton>
        </div>
      </AdaptiveModal>
    </div>
  );
}