import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Heart,
  ShoppingCart,
  Tag,
  Gift,
  Star,
  Zap,
  Crown,
  Flame,
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface BannerTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: {
    background: string;
    textColor: string;
    accentColor: string;
  };
  config: {
    layout: 'hero' | 'strip' | 'square' | 'vertical';
    animation: string;
    elements: {
      title: string;
      subtitle: string;
      cta: string;
      icon?: string;
    };
    style: {
      fontFamily: string;
      borderRadius: number;
      shadow: boolean;
      gradient: boolean;
    };
  };
  tags: string[];
  premium: boolean;
  popularity: number;
}

const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'modern-sale',
    name: 'تخفيضات عصرية',
    category: 'sales',
    description: 'بنر تخفيضات بتصميم عصري وألوان جذابة',
    preview: {
      background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
      textColor: '#ffffff',
      accentColor: '#ff4757'
    },
    config: {
      layout: 'hero',
      animation: 'slideIn',
      elements: {
        title: 'تخفيضات هائلة',
        subtitle: 'وفر حتى 70% على جميع المنتجات',
        cta: 'تسوق الآن',
        icon: 'Tag'
      },
      style: {
        fontFamily: 'Cairo',
        borderRadius: 12,
        shadow: true,
        gradient: true
      }
    },
    tags: ['تخفيضات', 'عروض', 'توفير'],
    premium: false,
    popularity: 95
  },
  {
    id: 'elegant-luxury',
    name: 'أناقة فاخرة',
    category: 'luxury',
    description: 'بنر فاخر بألوان ذهبية ومظهر أنيق',
    preview: {
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
      textColor: '#f39c12',
      accentColor: '#e74c3c'
    },
    config: {
      layout: 'hero',
      animation: 'fadeIn',
      elements: {
        title: 'مجموعة حصرية',
        subtitle: 'اكتشف أحدث صيحات الموضة',
        cta: 'استكشف المجموعة',
        icon: 'Crown'
      },
      style: {
        fontFamily: 'Playfair Display',
        borderRadius: 16,
        shadow: true,
        gradient: true
      }
    },
    tags: ['فخامة', 'حصري', 'موضة'],
    premium: true,
    popularity: 88
  },
  {
    id: 'flash-deal',
    name: 'صفقة البرق',
    category: 'flash',
    description: 'بنر سريع للعروض المحدودة بالوقت',
    preview: {
      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      textColor: '#ffffff',
      accentColor: '#f39c12'
    },
    config: {
      layout: 'strip',
      animation: 'pulse',
      elements: {
        title: 'عرض محدود!',
        subtitle: 'ينتهي خلال 24 ساعة',
        cta: 'اشتري الآن',
        icon: 'Zap'
      },
      style: {
        fontFamily: 'Cairo',
        borderRadius: 8,
        shadow: true,
        gradient: true
      }
    },
    tags: ['سريع', 'محدود', 'عاجل'],
    premium: false,
    popularity: 92
  },
  {
    id: 'seasonal-winter',
    name: 'شتاء دافئ',
    category: 'seasonal',
    description: 'بنر شتوي بألوان دافئة ومريحة',
    preview: {
      background: 'linear-gradient(135deg, #3498db, #2980b9)',
      textColor: '#ffffff',
      accentColor: '#e67e22'
    },
    config: {
      layout: 'square',
      animation: 'snow',
      elements: {
        title: 'مجموعة الشتاء',
        subtitle: 'ملابس دافئة وأنيقة',
        cta: 'تسوق الشتاء',
        icon: 'Heart'
      },
      style: {
        fontFamily: 'Cairo',
        borderRadius: 20,
        shadow: true,
        gradient: true
      }
    },
    tags: ['شتاء', 'دافئ', 'موسمي'],
    premium: false,
    popularity: 76
  },
  {
    id: 'minimalist-clean',
    name: 'بساطة أنيقة',
    category: 'minimal',
    description: 'تصميم بسيط ونظيف بألوان هادئة',
    preview: {
      background: 'linear-gradient(135deg, #ecf0f1, #bdc3c7)',
      textColor: '#2c3e50',
      accentColor: '#3498db'
    },
    config: {
      layout: 'hero',
      animation: 'fadeIn',
      elements: {
        title: 'جودة عالية',
        subtitle: 'منتجات مختارة بعناية',
        cta: 'اكتشف المزيد'
      },
      style: {
        fontFamily: 'Inter',
        borderRadius: 8,
        shadow: false,
        gradient: false
      }
    },
    tags: ['بسيط', 'نظيف', 'أنيق'],
    premium: false,
    popularity: 84
  },
  {
    id: 'vibrant-summer',
    name: 'صيف نابض',
    category: 'seasonal',
    description: 'بنر صيفي بألوان زاهية ومشرقة',
    preview: {
      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
      textColor: '#ffffff',
      accentColor: '#4ecdc4'
    },
    config: {
      layout: 'hero',
      animation: 'bounce',
      elements: {
        title: 'مجموعة الصيف',
        subtitle: 'ألوان زاهية وتصاميم منعشة',
        cta: 'تسوق الصيف',
        icon: 'Star'
      },
      style: {
        fontFamily: 'Cairo',
        borderRadius: 16,
        shadow: true,
        gradient: true
      }
    },
    tags: ['صيف', 'زاهي', 'منعش'],
    premium: false,
    popularity: 89
  },
  {
    id: 'gift-special',
    name: 'هدايا خاصة',
    category: 'gifts',
    description: 'بنر هدايا بتصميم احتفالي',
    preview: {
      background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
      textColor: '#2d3436',
      accentColor: '#fd79a8'
    },
    config: {
      layout: 'square',
      animation: 'glow',
      elements: {
        title: 'هدايا مميزة',
        subtitle: 'للمناسبات الخاصة',
        cta: 'اختر هديتك',
        icon: 'Gift'
      },
      style: {
        fontFamily: 'Cairo',
        borderRadius: 12,
        shadow: true,
        gradient: true
      }
    },
    tags: ['هدايا', 'مناسبات', 'خاص'],
    premium: true,
    popularity: 91
  },
  {
    id: 'tech-modern',
    name: 'تقني حديث',
    category: 'tech',
    description: 'بنر تقني بتصميم مستقبلي',
    preview: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      textColor: '#ffffff',
      accentColor: '#f093fb'
    },
    config: {
      layout: 'hero',
      animation: 'matrix',
      elements: {
        title: 'تقنية متقدمة',
        subtitle: 'أحدث الابتكارات التقنية',
        cta: 'اكتشف التقنية'
      },
      style: {
        fontFamily: 'Roboto',
        borderRadius: 0,
        shadow: true,
        gradient: true
      }
    },
    tags: ['تقنية', 'حديث', 'مستقبلي'],
    premium: true,
    popularity: 87
  }
];

const CATEGORIES = [
  { id: 'all', name: 'جميع الفئات', icon: null },
  { id: 'sales', name: 'تخفيضات', icon: Tag },
  { id: 'luxury', name: 'فخامة', icon: Crown },
  { id: 'flash', name: 'عروض سريعة', icon: Zap },
  { id: 'seasonal', name: 'موسمي', icon: Clock },
  { id: 'minimal', name: 'بساطة', icon: Heart },
  { id: 'gifts', name: 'هدايا', icon: Gift },
  { id: 'tech', name: 'تقني', icon: Sparkles }
];

interface BannerTemplatesProps {
  onSelectTemplate: (template: BannerTemplate) => void;
  selectedCategory?: string;
}

export const BannerTemplates: React.FC<BannerTemplatesProps> = ({
  onSelectTemplate,
  selectedCategory = 'all'
}) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');

  // Filter templates
  const filteredTemplates = BANNER_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'popularity') {
      return b.popularity - a.popularity;
    }
    return a.name.localeCompare(b.name, 'ar');
  });

  const handleTemplateSelect = (template: BannerTemplate) => {
    onSelectTemplate(template);
    toast.success(`تم اختيار قالب "${template.name}"`);
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Tag, Heart, ShoppingCart, Gift, Star, Zap, Crown, Flame, Clock, Sparkles
    };
    return icons[iconName] || Star;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">قوالب البنرات</h3>
          <p className="text-sm text-muted-foreground">
            اختر من مجموعة متنوعة من القوالب الجاهزة
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في القوالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popularity' | 'name')}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="popularity">الأكثر شعبية</option>
            <option value="name">الاسم</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredTemplates.length} قالب متاح</span>
        {searchQuery && (
          <span>نتائج البحث عن: "{searchQuery}"</span>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const IconComponent = template.config.elements.icon ? getIcon(template.config.elements.icon) : null;
          
          return (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                {/* Template Preview */}
                <div
                  className="h-40 rounded-t-lg relative overflow-hidden cursor-pointer"
                  style={{ background: template.preview.background }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    {IconComponent && (
                      <IconComponent 
                        className="h-8 w-8 mb-2 opacity-80" 
                        style={{ color: template.preview.textColor }}
                      />
                    )}
                    <h4 
                      className="font-bold text-lg mb-1"
                      style={{ color: template.preview.textColor }}
                    >
                      {template.config.elements.title}
                    </h4>
                    <p 
                      className="text-sm opacity-90 mb-3"
                      style={{ color: template.preview.textColor }}
                    >
                      {template.config.elements.subtitle}
                    </p>
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium transition-transform group-hover:scale-105"
                      style={{ 
                        backgroundColor: template.preview.accentColor,
                        color: '#ffffff'
                      }}
                    >
                      {template.config.elements.cta}
                    </button>
                  </div>
                  
                  {template.premium && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        مميز
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white/90">
                      <Star className="h-3 w-3 mr-1" />
                      {template.popularity}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h5 className="font-semibold">{template.name}</h5>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      {template.config.layout} • {template.config.animation}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                      className="h-8"
                    >
                      استخدام القالب
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold mb-2">لا توجد قوالب</h4>
          <p className="text-muted-foreground">
            لم يتم العثور على قوالب تطابق معايير البحث الحالية
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="mt-4"
          >
            إعادة تعيين المرشحات
          </Button>
        </div>
      )}
    </div>
  );
};