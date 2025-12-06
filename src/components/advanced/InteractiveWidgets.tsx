import React, { useState, useRef, useEffect } from 'react';
import { Move, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Settings } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useDesignSystem } from '@/hooks/useDesignSystem';

// Interactive Widgets System v3.3
// نظام الأدوات التفاعلية - النسخة الثالثة المحسّنة

interface WidgetProps {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'control' | 'display';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
}

const InteractiveWidget: React.FC<{
  widget: WidgetProps;
  onUpdate: (id: string, updates: Partial<WidgetProps>) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ widget, onUpdate, isSelected, onSelect }) => {
  const { patterns } = useDesignSystem();
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: widget.x,
    initialY: widget.y
  });
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === widgetRef.current || widgetRef.current?.contains(e.target as Node)) {
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        initialX: widget.x,
        initialY: widget.y
      });
      onSelect(widget.id);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        onUpdate(widget.id, {
          x: dragState.initialX + deltaX,
          y: dragState.initialY + deltaY
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(prev => ({ ...prev, isDragging: false }));
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, widget.id, onUpdate]);

  return (
    <div
      ref={widgetRef}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      } hover:scale-105 transition-transform duration-200`}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        transform: `rotate(${widget.rotation}deg) scale(${widget.scale})`,
        zIndex: widget.zIndex,
        transformOrigin: 'center'
      }}
      onMouseDown={handleMouseDown}
    >
      <EnhancedCard 
        className={`h-full ${patterns.card} ${dragState.isDragging ? 'shadow-lg' : ''}`}
        variant={isSelected ? 'outline' : 'default'}
      >
        <EnhancedCardHeader className="pb-2">
          <EnhancedCardTitle className="text-sm flex items-center justify-between">
            {widget.title}
            <Badge variant="outline" className="text-xs">
              {widget.type}
            </Badge>
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent className="pt-0">
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {widget.type === 'chart' && (
              <div className="w-full h-full bg-gradient-primary rounded-md flex items-center justify-center">
                📊 Chart Widget
              </div>
            )}
            {widget.type === 'metric' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1,234</div>
                <div className="text-xs">Sample Metric</div>
              </div>
            )}
            {widget.type === 'control' && (
              <div className="space-y-2 w-full">
                <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                <div className="text-xs text-center">Control Widget</div>
              </div>
            )}
            {widget.type === 'display' && (
              <div className="text-center">
                <div className="text-lg font-semibold">Display</div>
                <div className="text-xs">Information Widget</div>
              </div>
            )}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};

export const InteractiveWidgets: React.FC = () => {
  const { patterns: _patterns } = useDesignSystem();
  const [widgets, setWidgets] = useState<WidgetProps[]>([
    {
      id: '1',
      title: 'Sales Chart',
      type: 'chart',
      x: 50,
      y: 50,
      width: 300,
      height: 200,
      rotation: 0,
      scale: 1,
      zIndex: 1
    },
    {
      id: '2',
      title: 'User Count',
      type: 'metric',
      x: 400,
      y: 100,
      width: 200,
      height: 150,
      rotation: 0,
      scale: 1,
      zIndex: 1
    },
    {
      id: '3',
      title: 'Volume Control',
      type: 'control',
      x: 100,
      y: 300,
      width: 250,
      height: 120,
      rotation: 0,
      scale: 1,
      zIndex: 1
    },
    {
      id: '4',
      title: 'Status Display',
      type: 'display',
      x: 450,
      y: 350,
      width: 200,
      height: 100,
      rotation: 0,
      scale: 1,
      zIndex: 1
    }
  ]);

  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const updateWidget = (id: string, updates: Partial<WidgetProps>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  };

  const selectedWidgetData = widgets.find(w => w.id === selectedWidget);

  const handleRotate = (direction: 'left' | 'right') => {
    if (selectedWidget) {
      const rotation = direction === 'left' ? -15 : 15;
      updateWidget(selectedWidget, { 
        rotation: (selectedWidgetData?.rotation || 0) + rotation 
      });
    }
  };

  const handleScale = (direction: 'in' | 'out') => {
    if (selectedWidget) {
      const scaleChange = direction === 'in' ? 0.1 : -0.1;
      const newScale = Math.max(0.5, Math.min(2, (selectedWidgetData?.scale || 1) + scaleChange));
      updateWidget(selectedWidget, { scale: newScale });
    }
  };

  const handleResize = (direction: 'maximize' | 'minimize') => {
    if (selectedWidget) {
      const sizeMultiplier = direction === 'maximize' ? 1.2 : 0.8;
      updateWidget(selectedWidget, { 
        width: Math.max(150, (selectedWidgetData?.width || 200) * sizeMultiplier),
        height: Math.max(100, (selectedWidgetData?.height || 150) * sizeMultiplier)
      });
    }
  };

  const bringToFront = () => {
    if (selectedWidget) {
      const maxZ = Math.max(...widgets.map(w => w.zIndex));
      updateWidget(selectedWidget, { zIndex: maxZ + 1 });
    }
  };

  return (
    <div className="space-y-6">
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Interactive Widgets Control Panel
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="flex flex-wrap gap-2">
            <EnhancedButton
              size="sm"
              variant="outline"
              onClick={() => handleRotate('left')}
              disabled={!selectedWidget}
            >
              <RotateCw className="h-4 w-4 mr-1 rotate-180" />
              Rotate Left
            </EnhancedButton>
            <EnhancedButton
              size="sm"
              variant="outline"
              onClick={() => handleRotate('right')}
              disabled={!selectedWidget}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Rotate Right
            </EnhancedButton>
            <EnhancedButton
              size="sm"
              variant="outline"
              onClick={() => handleScale('in')}
              disabled={!selectedWidget}
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Scale Up
            </EnhancedButton>
            <EnhancedButton
              size="sm"
              variant="outline"
              onClick={() => handleScale('out')}
              disabled={!selectedWidget}
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Scale Down
            </EnhancedButton>
            <EnhancedButton
              size="sm"
              variant="outline"
              onClick={() => handleResize('maximize')}
              disabled={!selectedWidget}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Resize Up
            </EnhancedButton>
            <EnhancedButton
              size="sm"
              variant="outline"
              onClick={() => handleResize('minimize')}
              disabled={!selectedWidget}
            >
              <Minimize2 className="h-4 w-4 mr-1" />
              Resize Down
            </EnhancedButton>
            <EnhancedButton
              size="sm"
              variant="outline"
              onClick={bringToFront}
              disabled={!selectedWidget}
            >
              <Settings className="h-4 w-4 mr-1" />
              Bring to Front
            </EnhancedButton>
          </div>
          {selectedWidget && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Selected Widget: {selectedWidgetData?.title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <div>X: {Math.round(selectedWidgetData?.x || 0)}, Y: {Math.round(selectedWidgetData?.y || 0)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <div>{selectedWidgetData?.width} × {selectedWidgetData?.height}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rotation:</span>
                  <div>{selectedWidgetData?.rotation}°</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Scale:</span>
                  <div>{selectedWidgetData?.scale.toFixed(1)}x</div>
                </div>
              </div>
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Widget Canvas */}
      <EnhancedCard className="relative">
        <EnhancedCardContent className="p-0">
          <div 
            className="relative overflow-hidden bg-gradient-muted min-h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/20"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedWidget(null);
              }
            }}
          >
            <div className="absolute inset-4 text-xs text-muted-foreground pointer-events-none">
              Interactive Widget Canvas - Click and drag widgets to move them around
            </div>
            
            {widgets.map((widget) => (
              <InteractiveWidget
                key={widget.id}
                widget={widget}
                onUpdate={updateWidget}
                isSelected={selectedWidget === widget.id}
                onSelect={setSelectedWidget}
              />
            ))}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};