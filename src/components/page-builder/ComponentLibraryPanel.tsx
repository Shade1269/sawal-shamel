import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Layout, 
  Type, 
  Image, 
  Grid3X3, 
  ShoppingCart,
  Star,
  Play,
  Map,
  MessageSquare,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ComponentItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  description: string;
  isPro?: boolean;
}

export const ComponentLibraryPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const components: ComponentItem[] = [
    {
      id: 'hero-section',
      name: 'قسم البطل',
      icon: Layout,
      category: 'layout',
      description: 'قسم رئيسي جذاب للصفحة'
    },
    {
      id: 'text-block',
      name: 'كتلة نصية',
      icon: Type,
      category: 'content',
      description: 'نص قابل للتخصيص'
    },
    {
      id: 'image-banner',
      name: 'بانر صورة',
      icon: Image,
      category: 'media',
      description: 'صورة مع نص تراكبي'
    },
    {
      id: 'product-grid',
      name: 'شبكة المنتجات',
      icon: Grid3X3,
      category: 'ecommerce',
      description: 'عرض المنتجات في شبكة'
    },
    {
      id: 'add-to-cart',
      name: 'زر الإضافة للسلة',
      icon: ShoppingCart,
      category: 'ecommerce',
      description: 'زر شراء تفاعلي'
    },
    {
      id: 'testimonials',
      name: 'آراء العملاء',
      icon: Star,
      category: 'social',
      description: 'عرض تقييمات العملاء',
      isPro: true
    },
    {
      id: 'video-player',
      name: 'مشغل فيديو',
      icon: Play,
      category: 'media',
      description: 'مشغل فيديو متقدم',
      isPro: true
    },
    {
      id: 'contact-form',
      name: 'نموذج التواصل',
      icon: MessageSquare,
      category: 'forms',
      description: 'نموذج تواصل تفاعلي'
    }
  ];

  const categories = [
    { id: 'all', name: 'الكل', count: components.length },
    { id: 'layout', name: 'التخطيط', count: components.filter(c => c.category === 'layout').length },
    { id: 'content', name: 'المحتوى', count: components.filter(c => c.category === 'content').length },
    { id: 'ecommerce', name: 'التجارة', count: components.filter(c => c.category === 'ecommerce').length },
    { id: 'media', name: 'الوسائط', count: components.filter(c => c.category === 'media').length },
    { id: 'forms', name: 'النماذج', count: components.filter(c => c.category === 'forms').length },
    { id: 'social', name: 'اجتماعي', count: components.filter(c => c.category === 'social').length }
  ];

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, component: ComponentItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">مكتبة المكونات</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث في المكونات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              {category.name}
              <Badge variant="secondary" className="mr-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      <div className="space-y-3">
        {filteredComponents.map((component, index) => (
          <motion.div
            key={component.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <component.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{component.name}</h4>
                      {component.isPro && (
                        <Badge variant="secondary" className="text-xs">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {component.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-8">
          <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد مكونات مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
};