import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Copy,
  Trash2,
  MoveUp,
  MoveDown,
  Layout,
  Type,
  Image,
  Grid3X3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LayerItem {
  id: string;
  name: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  isVisible: boolean;
  isLocked: boolean;
  children?: LayerItem[];
}

export const LayersPanel: React.FC = () => {
  const [layers, setLayers] = React.useState<LayerItem[]>([
    {
      id: 'hero-1',
      name: 'قسم البطل',
      type: 'hero',
      icon: Layout,
      isVisible: true,
      isLocked: false,
      children: [
        {
          id: 'hero-title',
          name: 'العنوان الرئيسي',
          type: 'text',
          icon: Type,
          isVisible: true,
          isLocked: false
        },
        {
          id: 'hero-subtitle',
          name: 'العنوان الفرعي',
          type: 'text',
          icon: Type,
          isVisible: true,
          isLocked: false
        }
      ]
    },
    {
      id: 'product-grid-1',
      name: 'شبكة المنتجات',
      type: 'product-grid',
      icon: Grid3X3,
      isVisible: true,
      isLocked: false,
      children: [
        {
          id: 'product-1',
          name: 'منتج 1',
          type: 'product',
          icon: Image,
          isVisible: true,
          isLocked: false
        },
        {
          id: 'product-2',
          name: 'منتج 2',
          type: 'product',
          icon: Image,
          isVisible: true,
          isLocked: false
        },
        {
          id: 'product-3',
          name: 'منتج 3',
          type: 'product',
          icon: Image,
          isVisible: true,
          isLocked: false
        }
      ]
    },
    {
      id: 'cta-1',
      name: 'دعوة للعمل',
      type: 'cta',
      icon: Layout,
      isVisible: true,
      isLocked: false
    }
  ]);

  const [selectedLayer, setSelectedLayer] = React.useState<string>('hero-1');

  const toggleVisibility = (layerId: string) => {
    const updateLayer = (layers: LayerItem[]): LayerItem[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, isVisible: !layer.isVisible };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  };

  const toggleLock = (layerId: string) => {
    const updateLayer = (layers: LayerItem[]): LayerItem[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, isLocked: !layer.isLocked };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  };

  const renderLayer = (layer: LayerItem, depth: number = 0) => {
    const isSelected = selectedLayer === layer.id;
    
    return (
      <motion.div
        key={layer.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${depth > 0 ? 'mr-4 border-r border-muted pr-3' : ''}`}
      >
        <Card 
          className={`mb-2 transition-all cursor-pointer ${
            isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}
          onClick={() => setSelectedLayer(layer.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <layer.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{layer.name}</span>
                <Badge variant="outline" className="text-xs">
                  {layer.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(layer.id);
                  }}
                  className="w-6 h-6 p-0"
                >
                  {layer.isVisible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(layer.id);
                  }}
                  className="w-6 h-6 p-0"
                >
                  {layer.isLocked ? (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {layer.children && layer.children.map(child => renderLayer(child, depth + 1))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          طبقات الصفحة
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          إدارة ترتيب وخصائص العناصر
        </p>
      </div>

      {/* Layer Controls */}
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" className="flex-1">
          <MoveUp className="w-4 h-4 mr-1" />
          للأعلى
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <MoveDown className="w-4 h-4 mr-1" />
          للأسفل
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" className="flex-1">
          <Copy className="w-4 h-4 mr-1" />
          نسخ
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-1" />
          حذف
        </Button>
      </div>

      {/* Layers Tree */}
      <div className="space-y-2">
        {layers.map(layer => renderLayer(layer))}
      </div>

      {/* Layer Statistics */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {layers.reduce((acc, layer) => acc + 1 + (layer.children?.length || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">إجمالي العناصر</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {layers.filter(layer => layer.isVisible).length}
              </div>
              <div className="text-xs text-muted-foreground">عناصر مرئية</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};