import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Download, 
  Upload, 
  Star, 
  Eye, 
  Code, 
  Share2, 
  Filter,
  Search,
  Grid,
  List,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  preview: string;
  code: string;
  props: Record<string, any>;
  rating: number;
  downloads: number;
  created_at: string;
  updated_at: string;
  featured: boolean;
  premium: boolean;
}

interface ComponentLibraryProps {
  onSelectTemplate: (template: ComponentTemplate) => void;
  userRole?: 'basic' | 'premium' | 'affiliate' | 'admin';
  className?: string;
}

const sampleComponents: ComponentTemplate[] = [
  {
    id: '1',
    name: 'بطاقة منتج حديثة',
    description: 'بطاقة منتج أنيقة مع صورة وتقييمات وزر شراء',
    category: 'products',
    tags: ['منتج', 'بطاقة', 'تجارة إلكترونية'],
    author: { id: '1', name: 'أحمد محمد', avatar: '/avatars/1.jpg' },
    preview: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300',
    code: `
<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
  <img src="{product.image}" alt="{product.name}" className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
    <div className="flex items-center mb-3">
      <div className="flex text-yellow-400">
        {Array.from({length: 5}).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
      <span className="text-gray-600 text-sm mr-2">({product.reviews})</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-primary">{product.price} ريال</span>
      <Button>إضافة للسلة</Button>
    </div>
  </div>
</div>
    `,
    props: {
      product: {
        name: 'منتج رائع',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300',
        price: '299',
        reviews: '24'
      }
    },
    rating: 4.8,
    downloads: 1250,
    created_at: '2024-01-15',
    updated_at: '2024-01-20',
    featured: true,
    premium: false
  },
  {
    id: '2',
    name: 'قسم البطل المتحرك',
    description: 'قسم بطل جذاب مع حركات ونصوص متدرجة',
    category: 'hero',
    tags: ['بطل', 'حركات', 'تدرج'],
    author: { id: '2', name: 'سارة أحمد', avatar: '/avatars/2.jpg' },
    preview: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300',
    code: `
<div className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20 overflow-hidden">
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    className="container mx-auto text-center"
  >
    <motion.h1 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="text-5xl font-bold mb-6"
    >
      {title}
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-xl mb-8"
    >
      {subtitle}
    </motion.p>
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ delay: 1 }}
    >
      <Button size="lg" variant="secondary">{buttonText}</Button>
    </motion.div>
  </motion.div>
</div>
    `,
    props: {
      title: 'مرحباً بك في متجرنا الرقمي',
      subtitle: 'اكتشف أفضل المنتجات بأسعار رائعة وجودة عالية',
      buttonText: 'تسوق الآن'
    },
    rating: 4.9,
    downloads: 890,
    created_at: '2024-01-10',
    updated_at: '2024-01-18',
    featured: true,
    premium: true
  },
  {
    id: '3',
    name: 'تذييل شامل',
    description: 'تذييل موقع شامل مع روابط وشبكات اجتماعية',
    category: 'layout',
    tags: ['تذييل', 'روابط', 'شبكات اجتماعية'],
    author: { id: '3', name: 'محمد عبدالله', avatar: '/avatars/3.jpg' },
    preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300',
    code: `
<footer className="bg-gray-900 text-white">
  <div className="container mx-auto py-12 px-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">{company}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-4">روابط سريعة</h4>
        <ul className="space-y-2 text-sm">
          {quickLinks.map(link => (
            <li key={link.name}>
              <a href={link.url} className="text-gray-300 hover:text-white">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">خدمة العملاء</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>هاتف: {phone}</p>
          <p>إيميل: {email}</p>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-4">تابعنا</h4>
        <div className="flex space-x-4">
          {socialLinks.map(social => (
            <a key={social.name} href={social.url} className="text-gray-300 hover:text-white">
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
      <p>© 2024 {company}. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</footer>
    `,
    props: {
      company: 'شركة التجارة الذكية',
      description: 'منصة التجارة الإلكترونية الرائدة في المملكة العربية السعودية',
      phone: '+966 11 234 5678',
      email: 'info@smartcommerce.sa',
      quickLinks: [
        { name: 'الرئيسية', url: '#' },
        { name: 'المنتجات', url: '#' },
        { name: 'من نحن', url: '#' },
        { name: 'اتصل بنا', url: '#' }
      ],
      socialLinks: [
        { name: 'تويتر', url: '#', icon: '🐦' },
        { name: 'انستقرام', url: '#', icon: '📷' },
        { name: 'لينكدإن', url: '#', icon: '💼' }
      ]
    },
    rating: 4.6,
    downloads: 567,
    created_at: '2024-01-12',
    updated_at: '2024-01-16',
    featured: false,
    premium: false
  }
];

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onSelectTemplate,
  userRole = 'basic',
  className = ''
}) => {
  const { user } = useSupabaseAuth();
  
  const [components, setComponents] = useState<ComponentTemplate[]>(sampleComponents);
  const [filteredComponents, setFilteredComponents] = useState<ComponentTemplate[]>(sampleComponents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedComponent, setSelectedComponent] = useState<ComponentTemplate | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Filter components based on search and category
  useEffect(() => {
    let filtered = components;

    if (searchTerm) {
      filtered = filtered.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory);
    }

    setFilteredComponents(filtered);
  }, [components, searchTerm, selectedCategory]);

  const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'products', label: 'المنتجات' },
    { value: 'hero', label: 'الأقسام الرئيسية' },
    { value: 'layout', label: 'التخطيط' },
    { value: 'forms', label: 'النماذج' },
    { value: 'navigation', label: 'التنقل' }
  ];

  const handleSelectComponent = (template: ComponentTemplate) => {
    if (template.premium && userRole === 'basic') {
      toast({
        title: 'مكون مدفوع',
        description: 'هذا المكون متاح للأعضاء المميزين فقط',
        variant: 'destructive'
      });
      return;
    }

    onSelectTemplate(template);
    toast({
      title: 'تم اختيار المكون',
      description: `تم اختيار ${template.name} بنجاح`
    });
  };

  const toggleFavorite = (componentId: string) => {
    setFavorites(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleUploadComponent = async (formData: any) => {
    // Simulate upload
    const newComponent: ComponentTemplate = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map((tag: string) => tag.trim()),
      author: {
        id: user?.id || 'unknown',
        name: user?.email || 'مجهول'
      },
      preview: formData.preview,
      code: formData.code,
      props: {},
      rating: 0,
      downloads: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      featured: false,
      premium: false
    };

    setComponents(prev => [newComponent, ...prev]);
    setShowUploadDialog(false);
    
    toast({
      title: 'تم رفع المكون',
      description: 'تم رفع المكون الخاص بك بنجاح'
    });
  };

  return (
    <Card className={`w-full h-full flex flex-col ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">مكتبة المكونات</CardTitle>
              <CardDescription>
                اختر من مجموعة كبيرة من المكونات الجاهزة
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  رفع مكون
                </Button>
              </DialogTrigger>
              <UploadComponentDialog onSubmit={handleUploadComponent} />
            </Dialog>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن المكونات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs defaultValue="browse" className="h-full flex flex-col">
          <TabsList className="mx-6 mb-4">
            <TabsTrigger value="browse">تصفح</TabsTrigger>
            <TabsTrigger value="favorites">المفضلة</TabsTrigger>
            <TabsTrigger value="my-components">مكوناتي</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6">
              <div className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }`}>
                <AnimatePresence>
                  {filteredComponents.map((component, index) => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ComponentCard
                        component={component}
                        viewMode={viewMode}
                        isFavorite={favorites.includes(component.id)}
                        onSelect={() => handleSelectComponent(component)}
                        onToggleFavorite={() => toggleFavorite(component.id)}
                        onPreview={() => setSelectedComponent(component)}
                        userRole={userRole}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredComponents.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-2">لا توجد مكونات</h3>
                  <p className="text-muted-foreground">
                    جرب البحث بكلمات أخرى أو غير الفئة
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="favorites" className="flex-1">
            <ScrollArea className="h-full px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components
                  .filter(comp => favorites.includes(comp.id))
                  .map(component => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      viewMode="grid"
                      isFavorite={true}
                      onSelect={() => handleSelectComponent(component)}
                      onToggleFavorite={() => toggleFavorite(component.id)}
                      onPreview={() => setSelectedComponent(component)}
                      userRole={userRole}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="my-components" className="flex-1">
            <ScrollArea className="h-full px-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-2">لا توجد مكونات</h3>
                <p className="text-muted-foreground mb-4">
                  لم ترفع أي مكونات بعد
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  رفع مكون جديد
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Component Preview Dialog */}
      {selectedComponent && (
        <ComponentPreviewDialog
          component={selectedComponent}
          isOpen={!!selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onSelect={() => handleSelectComponent(selectedComponent)}
          userRole={userRole}
        />
      )}
    </Card>
  );
};

// Component Card
interface ComponentCardProps {
  component: ComponentTemplate;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onPreview: () => void;
  userRole: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  viewMode,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onPreview,
  userRole
}) => {
  const isLocked = component.premium && userRole === 'basic';

  return (
    <Card className={`group cursor-pointer transition-all hover:shadow-lg ${
      viewMode === 'list' ? 'flex' : ''
    } ${isLocked ? 'opacity-75' : ''}`}>
      <div className={viewMode === 'list' ? 'flex-shrink-0 w-32' : ''}>
        <div className="relative aspect-video bg-muted overflow-hidden rounded-t-lg">
          <img
            src={component.preview}
            alt={component.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          
          {component.premium && (
            <Badge className="absolute top-2 right-2 bg-yellow-500">
              Premium
            </Badge>
          )}
          
          {component.featured && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              مميز
            </Badge>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" onClick={onPreview}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={onSelect}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className={`${viewMode === 'list' ? 'flex-1' : ''} p-4`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold truncate">{component.name}</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleFavorite}
            className="flex-shrink-0"
          >
            {isFavorite ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {component.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          {component.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{component.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>{component.downloads}</span>
            </div>
          </div>
          
          <span className="text-muted-foreground">
            {component.author.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Upload Component Dialog
interface UploadComponentDialogProps {
  onSubmit: (data: any) => void;
}

const UploadComponentDialog: React.FC<UploadComponentDialogProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'products',
    tags: '',
    preview: '',
    code: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.code) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>رفع مكون جديد</DialogTitle>
        <DialogDescription>
          شارك مكونك مع المجتمع
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">اسم المكون *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="مثال: بطاقة منتج حديثة"
            />
          </div>
          
          <div>
            <Label htmlFor="category">الفئة *</Label>
            <Select 
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">المنتجات</SelectItem>
                <SelectItem value="hero">الأقسام الرئيسية</SelectItem>
                <SelectItem value="layout">التخطيط</SelectItem>
                <SelectItem value="forms">النماذج</SelectItem>
                <SelectItem value="navigation">التنقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">الوصف *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="وصف مختصر للمكون وما يقوم به"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="tags">العلامات</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="منتج، بطاقة، تجارة إلكترونية (مفصولة بفواصل)"
          />
        </div>

        <div>
          <Label htmlFor="preview">رابط صورة المعاينة</Label>
          <Input
            id="preview"
            value={formData.preview}
            onChange={(e) => setFormData(prev => ({ ...prev, preview: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label htmlFor="code">كود المكون *</Label>
          <Textarea
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="أدخل كود React/JSX للمكون"
            rows={10}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} className="gap-2">
          <Upload className="h-4 w-4" />
          رفع المكون
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Component Preview Dialog
interface ComponentPreviewDialogProps {
  component: ComponentTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  userRole: string;
}

const ComponentPreviewDialog: React.FC<ComponentPreviewDialogProps> = ({
  component,
  isOpen,
  onClose,
  onSelect,
  userRole
}) => {
  const isLocked = component.premium && userRole === 'basic';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {component.name}
              {component.premium && <Badge className="bg-yellow-500">Premium</Badge>}
              {component.featured && <Badge className="bg-red-500">مميز</Badge>}
            </DialogTitle>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{component.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{component.downloads}</span>
              </div>
            </div>
          </div>
          
          <DialogDescription>{component.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">المعاينة</TabsTrigger>
            <TabsTrigger value="code">الكود</TabsTrigger>
            <TabsTrigger value="info">التفاصيل</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <img
                src={component.preview}
                alt={component.name}
                className="w-full rounded-lg"
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <div className="border rounded-lg">
              <pre className="p-4 text-sm font-mono bg-muted/50 overflow-x-auto">
                <code>{isLocked ? 'كود المكون متاح للأعضاء المميزين فقط' : component.code}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">المؤلف</Label>
              <p className="text-sm text-muted-foreground">{component.author.name}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">الفئة</Label>
              <Badge variant="outline" className="mr-2">{component.category}</Badge>
            </div>
            
            <div>
              <Label className="text-sm font-medium">العلامات</Label>
              <div className="flex gap-2 mt-1">
                {component.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">تاريخ الإنشاء</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(component.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">آخر تحديث</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(component.updated_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {isLocked ? (
            <Button disabled className="gap-2">
              <Star className="h-4 w-4" />
              يتطلب عضوية مميزة
            </Button>
          ) : (
            <Button onClick={onSelect} className="gap-2">
              <Download className="h-4 w-4" />
              استخدام المكون
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentLibrary;