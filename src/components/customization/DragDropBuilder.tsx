import React, { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Layout, 
  Grid3X3, 
  Image as ImageIcon, 
  Type, 
  ShoppingCart, 
  Star, 
  Trash2,
  Copy,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// Tabs imported but used internally
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Component types
interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
  defaultProps: Record<string, any>;
  editableProps: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'image';
    options?: string[];
  }>;
}

interface DroppedComponent {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: Record<string, any>;
  zIndex: number;
}

interface DragItem {
  type: string;
  componentType: string;
  id?: string;
}

// Available components
const componentLibrary: ComponentConfig[] = [
  {
    id: 'hero-section',
    type: 'hero-section',
    name: 'قسم البطل',
    icon: Layout,
    category: 'layout',
    defaultProps: {
      title: 'مرحباً بك في متجرنا',
      subtitle: 'اكتشف أفضل المنتجات بأسعار رائعة',
      buttonText: 'تسوق الآن',
      backgroundImage: '',
      backgroundColor: 'hsl(142, 76%, 36%)',
      textColor: '#ffffff'
    },
    editableProps: [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
      { key: 'buttonText', label: 'نص الزر', type: 'text' },
      { key: 'backgroundColor', label: 'لون الخلفية', type: 'color' },
      { key: 'textColor', label: 'لون النص', type: 'color' },
      { key: 'backgroundImage', label: 'صورة الخلفية', type: 'image' }
    ]
  },
  {
    id: 'product-grid',
    type: 'product-grid',
    name: 'شبكة المنتجات',
    icon: Grid3X3,
    category: 'products',
    defaultProps: {
      columns: 4,
      spacing: 16,
      showPrices: true,
      showRatings: true,
      backgroundColor: 'transparent'
    },
    editableProps: [
      { key: 'columns', label: 'عدد الأعمدة', type: 'number' },
      { key: 'spacing', label: 'المسافة بين المنتجات', type: 'number' },
      { key: 'showPrices', label: 'إظهار الأسعار', type: 'boolean' },
      { key: 'showRatings', label: 'إظهار التقييمات', type: 'boolean' },
      { key: 'backgroundColor', label: 'لون الخلفية', type: 'color' }
    ]
  },
  {
    id: 'text-block',
    type: 'text-block',
    name: 'كتلة نص',
    icon: Type,
    category: 'content',
    defaultProps: {
      content: 'أدخل النص هنا',
      fontSize: 16,
      textAlign: 'right',
      textColor: '#000000',
      backgroundColor: 'transparent'
    },
    editableProps: [
      { key: 'content', label: 'المحتوى', type: 'text' },
      { key: 'fontSize', label: 'حجم الخط', type: 'number' },
      { key: 'textAlign', label: 'محاذاة النص', type: 'select', options: ['right', 'center', 'left'] },
      { key: 'textColor', label: 'لون النص', type: 'color' },
      { key: 'backgroundColor', label: 'لون الخلفية', type: 'color' }
    ]
  },
  {
    id: 'image-banner',
    type: 'image-banner',
    name: 'بانر صورة',
    icon: ImageIcon,
    category: 'media',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400',
      alt: 'صورة البانر',
      link: '',
      borderRadius: 8
    },
    editableProps: [
      { key: 'src', label: 'رابط الصورة', type: 'image' },
      { key: 'alt', label: 'نص بديل', type: 'text' },
      { key: 'link', label: 'رابط الوجهة', type: 'text' },
      { key: 'borderRadius', label: 'استدارة الزوايا', type: 'number' }
    ]
  },
  {
    id: 'cta-button',
    type: 'cta-button',
    name: 'زر الإجراء',
    icon: ShoppingCart,
    category: 'interactive',
    defaultProps: {
      text: 'اشترِ الآن',
      link: '#',
      backgroundColor: 'hsl(142, 76%, 36%)',
      textColor: '#ffffff',
      size: 'large'
    },
    editableProps: [
      { key: 'text', label: 'نص الزر', type: 'text' },
      { key: 'link', label: 'الرابط', type: 'text' },
      { key: 'backgroundColor', label: 'لون الخلفية', type: 'color' },
      { key: 'textColor', label: 'لون النص', type: 'color' },
      { key: 'size', label: 'الحجم', type: 'select', options: ['small', 'medium', 'large'] }
    ]
  }
];

// Draggable component from library
interface DraggableComponentProps {
  component: ComponentConfig;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type: 'component', componentType: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const IconComponent = component.icon;

  return (
    <div ref={drag} className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <IconComponent className="h-5 w-5 text-primary" />
            <div>
              <h4 className="text-sm font-medium">{component.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {component.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Droppable canvas area
interface DroppableCanvasProps {
  children: React.ReactNode;
  onDrop: (item: DragItem, offset: { x: number; y: number }) => void;
  className?: string;
}

const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ children, onDrop, className = '' }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: DragItem, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const dropOffset = monitor.getClientOffset();
      
      if (canvasRect && dropOffset) {
        const relativeOffset = {
          x: dropOffset.x - canvasRect.left,
          y: dropOffset.y - canvasRect.top,
        };
        onDrop(item, relativeOffset);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        drop(node);
      }}
      className={`relative min-h-[600px] border-2 border-dashed transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
      } ${className}`}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
          <p className="text-lg font-medium text-primary">اسحب هنا لإضافة المكون</p>
        </div>
      )}
    </div>
  );
};

// Individual dropped component
interface DroppedComponentRendererProps {
  component: DroppedComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdateProps: (props: Record<string, any>) => void;
}

const DroppedComponentRenderer: React.FC<DroppedComponentRendererProps> = ({
  component,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'hero-section':
        return (
          <div
            className="relative p-8 rounded-lg flex flex-col items-center justify-center text-center min-h-[300px]"
            style={{
              backgroundColor: component.props.backgroundColor,
              color: component.props.textColor,
              backgroundImage: component.props.backgroundImage 
                ? `url(${component.props.backgroundImage})` 
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <h1 className="text-4xl font-bold mb-4">{component.props.title}</h1>
            <p className="text-xl mb-6">{component.props.subtitle}</p>
            <button 
              className="px-6 py-3 rounded-lg font-semibold bg-background text-foreground hover:bg-muted transition-colors"
            >
              {component.props.buttonText}
            </button>
          </div>
        );

      case 'product-grid':
        return (
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: component.props.backgroundColor }}
          >
            <div 
              className="grid gap-4"
              style={{ 
                gridTemplateColumns: `repeat(${component.props.columns}, 1fr)`,
                gap: `${component.props.spacing}px`
              }}
            >
              {Array.from({ length: component.props.columns }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 bg-card">
                  <div className="aspect-square bg-muted rounded mb-3"></div>
                  <h3 className="font-medium mb-2">منتج {i + 1}</h3>
                  {component.props.showPrices && (
                    <p className="text-lg font-bold text-success mb-1">299 ريال</p>
                  )}
                  {component.props.showRatings && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'text-block':
        return (
          <div
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: component.props.backgroundColor,
              color: component.props.textColor,
              fontSize: `${component.props.fontSize}px`,
              textAlign: component.props.textAlign
            }}
          >
            {component.props.content}
          </div>
        );

      case 'image-banner':
        return (
          <div className="overflow-hidden" style={{ borderRadius: `${component.props.borderRadius}px` }}>
            <img
              src={component.props.src}
              alt={component.props.alt}
              className="w-full h-auto object-cover"
            />
          </div>
        );

      case 'cta-button':
        return (
          <button
            className={`font-semibold rounded-lg transition-opacity hover:opacity-90 ${
              component.props.size === 'small' ? 'px-4 py-2 text-sm' :
              component.props.size === 'medium' ? 'px-6 py-3 text-base' :
              'px-8 py-4 text-lg'
            }`}
            style={{
              backgroundColor: component.props.backgroundColor,
              color: component.props.textColor,
            }}
          >
            {component.props.text}
          </button>
        );

      default:
        return (
          <div className="p-4 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">مكون غير معروف: {component.type}</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        zIndex: component.zIndex + (isSelected ? 1000 : 0),
      }}
      onClick={onSelect}
    >
      {renderComponent()}
      
      {isSelected && (
        <div className="absolute -top-10 left-0 flex gap-1 bg-card border rounded-lg shadow-lg p-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Main component
interface DragDropBuilderProps {
  onSave?: (layout: DroppedComponent[]) => void;
  initialLayout?: DroppedComponent[];
  className?: string;
}

export const DragDropBuilder: React.FC<DragDropBuilderProps> = ({
  onSave,
  initialLayout = [],
  className = ''
}) => {
  const [droppedComponents, setDroppedComponents] = useState<DroppedComponent[]>(initialLayout);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [componentCounter, setComponentCounter] = useState(0);

  // Handle dropping components
  const handleDrop = useCallback((item: DragItem, offset: { x: number; y: number }) => {
    const componentConfig = componentLibrary.find(c => c.type === item.componentType);
    if (!componentConfig) return;

    const newComponent: DroppedComponent = {
      id: `${item.componentType}-${componentCounter}`,
      type: item.componentType,
      position: offset,
      size: { width: 400, height: 200 },
      props: { ...componentConfig.defaultProps },
      zIndex: droppedComponents.length,
    };

    setDroppedComponents(prev => [...prev, newComponent]);
    setComponentCounter(prev => prev + 1);
    setSelectedComponent(newComponent.id);

    toast({
      title: 'تمت الإضافة',
      description: `تم إضافة ${componentConfig.name} بنجاح`
    });
  }, [droppedComponents.length, componentCounter]);

  // Delete component
  const deleteComponent = (id: string) => {
    setDroppedComponents(prev => prev.filter(c => c.id !== id));
    setSelectedComponent(null);
    toast({
      title: 'تم الحذف',
      description: 'تم حذف المكون بنجاح'
    });
  };

  // Duplicate component
  const duplicateComponent = (id: string) => {
    const component = droppedComponents.find(c => c.id === id);
    if (!component) return;

    const newComponent: DroppedComponent = {
      ...component,
      id: `${component.type}-${componentCounter}`,
      position: { 
        x: component.position.x + 20, 
        y: component.position.y + 20 
      },
      zIndex: droppedComponents.length,
    };

    setDroppedComponents(prev => [...prev, newComponent]);
    setComponentCounter(prev => prev + 1);
    setSelectedComponent(newComponent.id);
  };

  // Update component props
  const updateComponentProps = (id: string, newProps: Record<string, any>) => {
    setDroppedComponents(prev =>
      prev.map(component =>
        component.id === id
          ? { ...component, props: { ...component.props, ...newProps } }
          : component
      )
    );
  };

  const selectedComponentData = selectedComponent 
    ? droppedComponents.find(c => c.id === selectedComponent)
    : null;

  const selectedComponentConfig = selectedComponentData
    ? componentLibrary.find(c => c.type === selectedComponentData.type)
    : null;

  const getDeviceClass = () => {
    switch (deviceView) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex h-screen bg-background ${className}`}>
        {/* Component Library Sidebar */}
        {!previewMode && (
          <div className="w-80 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-2">مكتبة المكونات</h2>
              <p className="text-sm text-muted-foreground">
                اسحب المكونات إلى اللوح لإضافتها
              </p>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {componentLibrary.map(component => (
                  <DraggableComponent key={component.id} component={component} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b bg-background flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">منشئ التخطيطات</h1>
              <Badge variant="outline">
                {droppedComponents.length} مكون
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDeviceView('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceView === 'tablet' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDeviceView('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDeviceView('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant={previewMode ? 'default' : 'outline'}
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? 'تحرير' : 'معاينة'}
              </Button>

              <Button onClick={() => onSave?.(droppedComponents)} className="gap-2">
                <Settings className="h-4 w-4" />
                حفظ التخطيط
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-muted/50 p-8">
            <div className={getDeviceClass()}>
              <DroppableCanvas
                onDrop={handleDrop}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
              >
                <AnimatePresence>
                  {droppedComponents.map(component => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <DroppedComponentRenderer
                        component={component}
                        isSelected={selectedComponent === component.id}
                        onSelect={() => setSelectedComponent(component.id)}
                        onDelete={() => deleteComponent(component.id)}
                        onDuplicate={() => duplicateComponent(component.id)}
                        onUpdateProps={(props) => updateComponentProps(component.id, props)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </DroppableCanvas>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {!previewMode && selectedComponentData && selectedComponentConfig && (
          <div className="w-80 border-l bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">خصائص المكون</h3>
              <p className="text-sm text-muted-foreground">
                {selectedComponentConfig.name}
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedComponentConfig.editableProps.map(prop => (
                  <div key={prop.key} className="space-y-2">
                    <Label>{prop.label}</Label>
                    
                    {prop.type === 'text' && (
                      <Input
                        value={selectedComponentData.props[prop.key] || ''}
                        onChange={(e) => updateComponentProps(selectedComponentData.id, {
                          [prop.key]: e.target.value
                        })}
                      />
                    )}
                    
                    {prop.type === 'number' && (
                      <Input
                        type="number"
                        value={selectedComponentData.props[prop.key] || 0}
                        onChange={(e) => updateComponentProps(selectedComponentData.id, {
                          [prop.key]: parseInt(e.target.value) || 0
                        })}
                      />
                    )}
                    
                    {prop.type === 'boolean' && (
                      <Switch
                        checked={selectedComponentData.props[prop.key] || false}
                        onCheckedChange={(checked) => updateComponentProps(selectedComponentData.id, {
                          [prop.key]: checked
                        })}
                      />
                    )}
                    
                    {prop.type === 'select' && (
                      <select
                        value={selectedComponentData.props[prop.key] || ''}
                        onChange={(e) => updateComponentProps(selectedComponentData.id, {
                          [prop.key]: e.target.value
                        })}
                        className="w-full p-2 border rounded-md"
                      >
                        {prop.options?.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {prop.type === 'color' && (
                      <Input
                        type="color"
                        value={selectedComponentData.props[prop.key] || '#000000'}
                        onChange={(e) => updateComponentProps(selectedComponentData.id, {
                          [prop.key]: e.target.value
                        })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default DragDropBuilder;