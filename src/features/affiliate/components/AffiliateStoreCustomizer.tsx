import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { createStoreUrl } from '@/utils/domains';
import { 
  Palette, 
  Type, 
  Layout,
  Image as ImageIcon,
  Settings,
  Eye,
  Save,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Brush,
  Grid,
  AlignLeft,
  Star,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoreCustomizerProps {
  store: any;
  onUpdateStore: (data: any) => void;
}

const colorSchemes = [
  { 
    name: 'كلاسيكي', 
    value: 'classic',
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#F1F5F9',
    preview: 'linear-gradient(135deg, #3B82F6, #64748B)'
  },
  { 
    name: 'عصري', 
    value: 'modern',
    primary: '#000000',
    secondary: '#6B7280',
    accent: '#F9FAFB',
    preview: 'linear-gradient(135deg, #000000, #6B7280)'
  },
  { 
    name: 'أنيق', 
    value: 'elegant',
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#FEF3C7',
    preview: 'linear-gradient(135deg, #D97706, #F59E0B)'
  },
  { 
    name: 'نابض بالحياة', 
    value: 'vibrant',
    primary: '#DC2626',
    secondary: '#F97316',
    accent: '#FEE2E2',
    preview: 'linear-gradient(135deg, #DC2626, #F97316)'
  },
  { 
    name: 'طبيعي', 
    value: 'nature',
    primary: '#059669',
    secondary: '#047857',
    accent: '#D1FAE5',
    preview: 'linear-gradient(135deg, #059669, #047857)'
  },
  { 
    name: 'أنثوي', 
    value: 'feminine',
    primary: '#EC4899',
    secondary: '#A855F7',
    accent: '#FCE7F3',
    preview: 'linear-gradient(135deg, #EC4899, #A855F7)'
  },
  { 
    name: 'فخم', 
    value: 'luxury',
    primary: '#B45309',
    secondary: '#000000',
    accent: '#FEF3C7',
    preview: 'linear-gradient(135deg, #B45309, #000000)'
  }
];

const layoutOptions = [
  { name: 'شبكة', value: 'grid', icon: Grid },
  { name: 'قائمة', value: 'list', icon: AlignLeft }
];

const AffiliateStoreCustomizer = ({ store, onUpdateStore }: StoreCustomizerProps) => {
  const { toast } = useToast();
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [customization, setCustomization] = useState({
    theme: store.theme || 'classic',
    layout: 'grid',
    showRatings: true,
    showDiscounts: true,
    showStock: true,
    showCategories: true,
    headerStyle: 'default',
    cardCorners: [8],
    cardShadow: [2],
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B',
    accentColor: '#F1F5F9',
    fontFamily: 'Inter',
    fontSize: [16],
    productSpacing: [24],
    borderRadius: [8],
    customCSS: '',
    enableAnimations: true,
    showWishlist: true,
    showQuickView: true,
    showSocialShare: true
  });

  const handleCustomizationChange = (key: string, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveCustomization = () => {
    onUpdateStore({
      theme: customization.theme,
      customization: customization
    });
    
    toast({
      title: "تم الحفظ",
      description: "تم حفظ إعدادات التخصيص بنجاح",
    });
  };

  const previewUrl = createStoreUrl(store.store_slug);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 gradient-card-accent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Brush className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">تخصيص المتجر</h1>
                <p className="text-muted-foreground">صمم متجرك بالطريقة التي تريدها</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.open(previewUrl, '_blank')}>
                <Eye className="h-4 w-4 ml-2" />
                معاينة
              </Button>
              <Button onClick={handleSaveCustomization}>
                <Save className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Preview Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            معاينة الجهاز
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={activeDevice === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDevice('desktop')}
            >
              <Monitor className="h-4 w-4 ml-2" />
              كمبيوتر
            </Button>
            <Button
              variant={activeDevice === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDevice('tablet')}
            >
              <Tablet className="h-4 w-4 ml-2" />
              تابلت
            </Button>
            <Button
              variant={activeDevice === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveDevice('mobile')}
            >
              <Smartphone className="h-4 w-4 ml-2" />
              جوال
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customization Tabs */}
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">الألوان والقوالب</TabsTrigger>
          <TabsTrigger value="layout">التخطيط</TabsTrigger>
          <TabsTrigger value="features">الميزات</TabsTrigger>
          <TabsTrigger value="advanced">متقدم</TabsTrigger>
        </TabsList>

        {/* Colors & Themes */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                الألوان والقوالب
              </CardTitle>
              <CardDescription>
                اختر القالب اللوني المناسب لمتجرك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Schemes */}
              <div>
                <Label className="text-base font-semibold mb-4 block">القوالب الجاهزة</Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {colorSchemes.map((scheme) => (
                    <div
                      key={scheme.value}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        customization.theme === scheme.value 
                          ? 'border-primary shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleCustomizationChange('theme', scheme.value)}
                    >
                      <div 
                        className="w-full h-20 rounded-lg mb-3"
                        style={{ background: scheme.preview }}
                      />
                      <h3 className="font-medium text-center">{scheme.name}</h3>
                      {customization.theme === scheme.value && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary text-primary-foreground">
                            <Sparkles className="h-3 w-3 ml-1" />
                            محدد
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Colors */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">تخصيص الألوان</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary">اللون الأساسي</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primary"
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary">اللون الثانوي</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondary"
                        value={customization.secondaryColor}
                        onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={customization.secondaryColor}
                        onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent">لون التمييز</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="accent"
                        value={customization.accentColor}
                        onChange={(e) => handleCustomizationChange('accentColor', e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={customization.accentColor}
                        onChange={(e) => handleCustomizationChange('accentColor', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                تخطيط المتجر
              </CardTitle>
              <CardDescription>
                تخصيص شكل وترتيب عناصر المتجر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Layout Style */}
              <div>
                <Label className="text-base font-semibold mb-4 block">نمط العرض</Label>
                <div className="grid grid-cols-2 gap-4">
                  {layoutOptions.map((layout) => (
                    <div
                      key={layout.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        customization.layout === layout.value 
                          ? 'border-primary shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleCustomizationChange('layout', layout.value)}
                    >
                      <layout.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium text-center">{layout.name}</h3>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Spacing & Dimensions */}
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    المسافات بين المنتجات: {customization.productSpacing[0]}px
                  </Label>
                  <Slider
                    value={customization.productSpacing}
                    onValueChange={(value) => handleCustomizationChange('productSpacing', value)}
                    max={48}
                    min={8}
                    step={4}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    زوايا البطاقات: {customization.cardCorners[0]}px
                  </Label>
                  <Slider
                    value={customization.cardCorners}
                    onValueChange={(value) => handleCustomizationChange('cardCorners', value)}
                    max={24}
                    min={0}
                    step={2}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    ظل البطاقات: {customization.cardShadow[0]}
                  </Label>
                  <Slider
                    value={customization.cardShadow}
                    onValueChange={(value) => handleCustomizationChange('cardShadow', value)}
                    max={5}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                ميزات المتجر
              </CardTitle>
              <CardDescription>
                تحكم في الميزات المتاحة للعملاء
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">عرض التقييمات</Label>
                    <p className="text-sm text-muted-foreground">إظهار تقييمات المنتجات</p>
                  </div>
                  <Switch
                    checked={customization.showRatings}
                    onCheckedChange={(checked) => handleCustomizationChange('showRatings', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">عرض الخصومات</Label>
                    <p className="text-sm text-muted-foreground">إظهار نسب الخصم على المنتجات</p>
                  </div>
                  <Switch
                    checked={customization.showDiscounts}
                    onCheckedChange={(checked) => handleCustomizationChange('showDiscounts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">عرض الكمية المتوفرة</Label>
                    <p className="text-sm text-muted-foreground">إظهار عدد القطع المتوفرة</p>
                  </div>
                  <Switch
                    checked={customization.showStock}
                    onCheckedChange={(checked) => handleCustomizationChange('showStock', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">فلتر الفئات</Label>
                    <p className="text-sm text-muted-foreground">إمكانية التصفية حسب الفئات</p>
                  </div>
                  <Switch
                    checked={customization.showCategories}
                    onCheckedChange={(checked) => handleCustomizationChange('showCategories', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">قائمة الأمنيات</Label>
                    <p className="text-sm text-muted-foreground">إمكانية إضافة المنتجات للأمنيات</p>
                  </div>
                  <Switch
                    checked={customization.showWishlist}
                    onCheckedChange={(checked) => handleCustomizationChange('showWishlist', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">المعاينة السريعة</Label>
                    <p className="text-sm text-muted-foreground">عرض تفاصيل المنتج في نافذة منبثقة</p>
                  </div>
                  <Switch
                    checked={customization.showQuickView}
                    onCheckedChange={(checked) => handleCustomizationChange('showQuickView', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">الحركات المتحركة</Label>
                    <p className="text-sm text-muted-foreground">تأثيرات متحركة عند التنقل</p>
                  </div>
                  <Switch
                    checked={customization.enableAnimations}
                    onCheckedChange={(checked) => handleCustomizationChange('enableAnimations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                إعدادات متقدمة
              </CardTitle>
              <CardDescription>
                تخصيص متقدم للمطورين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Typography */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">الخطوط والنصوص</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الخط</Label>
                    <Select 
                      value={customization.fontFamily}
                      onValueChange={(value) => handleCustomizationChange('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Cairo">Cairo</SelectItem>
                        <SelectItem value="Tajawal">Tajawal</SelectItem>
                        <SelectItem value="Almarai">Almarai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>حجم الخط: {customization.fontSize[0]}px</Label>
                    <Slider
                      value={customization.fontSize}
                      onValueChange={(value) => handleCustomizationChange('fontSize', value)}
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Custom CSS */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">CSS مخصص</Label>
                <Textarea
                  placeholder="أضف CSS مخصص هنا..."
                  value={customization.customCSS}
                  onChange={(e) => handleCustomizationChange('customCSS', e.target.value)}
                  className="min-h-32 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  يمكنك إضافة أكواد CSS مخصصة لتغيير شكل المتجر بالكامل
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateStoreCustomizer;