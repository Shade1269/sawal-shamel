import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ColorPicker } from '@/components/ui/color-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Palette, 
  Settings, 
  Target, 
  Calendar as CalendarIcon,
  Image,
  Type,
  Layout
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { BannerPreview } from './BannerPreview';
import { supabase } from '@/integrations/supabase/client';

interface BannerEditorProps {
  banner?: any;
  storeId?: string;
  affiliateStoreId?: string;
  onClose: () => void;
  onSave: () => void;
}

export const BannerEditor: React.FC<BannerEditorProps> = ({
  banner,
  storeId,
  affiliateStoreId,
  onClose,
  onSave
}) => {
  const { createBanner, updateBanner, isLoading } = usePromotionalBanners(storeId, affiliateStoreId);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    banner_type: 'hero',
    position: 'top',
    priority: 1,
    content_config: {},
    image_url: '',
    background_color: '#ffffff',
    text_color: '#000000',
    button_text: '',
    button_text_ar: '',
    button_url: '',
    button_color: '#0066ff',
    target_audience: {},
    display_conditions: {},
    max_impressions: null,
    max_clicks: null,
    start_date: null,
    end_date: null,
    is_active: true,
    auto_hide_after_interaction: false,
    show_close_button: true,
    animation_type: 'fade'
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        title_ar: banner.title_ar || '',
        description: banner.description || '',
        description_ar: banner.description_ar || '',
        banner_type: banner.banner_type || 'hero',
        position: banner.position || 'top',
        priority: banner.priority || 1,
        content_config: banner.content_config || {},
        image_url: banner.image_url || '',
        background_color: banner.background_color || '#ffffff',
        text_color: banner.text_color || '#000000',
        button_text: banner.button_text || '',
        button_text_ar: banner.button_text_ar || '',
        button_url: banner.button_url || '',
        button_color: banner.button_color || '#0066ff',
        target_audience: banner.target_audience || {},
        display_conditions: banner.display_conditions || {},
        max_impressions: banner.max_impressions || null,
        max_clicks: banner.max_clicks || null,
        start_date: banner.start_date ? new Date(banner.start_date) : null,
        end_date: banner.end_date ? new Date(banner.end_date) : null,
        is_active: banner.is_active ?? true,
        auto_hide_after_interaction: banner.auto_hide_after_interaction ?? false,
        show_close_button: banner.show_close_button ?? true,
        animation_type: banner.animation_type || 'fade'
      });
      const bannerProductIds = Array.isArray(banner.content_config?.product_ids)
 codex/add-product-selection-for-banner-creation-roitqz
        ? banner.content_config.product_ids.map((id: string | number) => id?.toString())

        ? banner.content_config.product_ids
 main
        : [];
      setSelectedProductIds(bannerProductIds);
    }
  }, [banner]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        let query = supabase
          .from('products')
          .select('id,title,description,price_sar,image_urls,images,shop_id,is_active')
          .eq('is_active', true);

        const targetStoreId = storeId || affiliateStoreId;
        if (targetStoreId) {
          query = query.eq('shop_id', targetStoreId);
        }

        const { data, error } = await query;
        if (error) throw error;

        setAvailableProducts(data || []);
      } catch (error) {
        console.error('خطأ في جلب منتجات المتجر للبنر:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, affiliateStoreId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

 codex/add-product-selection-for-banner-creation-roitqz
  const toggleProductSelection = (productId: string | number) => {
    const normalizedId = productId?.toString();

    setSelectedProductIds(prev => (
      prev.includes(normalizedId)
        ? prev.filter(id => id !== normalizedId)
        : [...prev, normalizedId]

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => (
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
 main
    ));
  };

  const selectedProducts = useMemo(
 codex/add-product-selection-for-banner-creation-roitqz
    () => {
      const idSet = new Set(selectedProductIds.map(id => id?.toString()));
      return availableProducts.filter(product => idSet.has(product.id?.toString()));
    },

    () => availableProducts.filter(product => selectedProductIds.includes(product.id)),
 main
    [availableProducts, selectedProductIds]
  );

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        content_config: {
          ...(formData.content_config || {}),
 codex/add-product-selection-for-banner-creation-roitqz
          product_ids: selectedProductIds.map(id => id?.toString())

          product_ids: selectedProductIds
 main
        }
      };

      if (banner) {
        await updateBanner(banner.id, payload as any);
      } else {
        await createBanner(payload as any);
      }
      onSave();
    } catch (error) {
      console.error('خطأ في حفظ البانر:', error);
    }
  };

  const bannerTypes = [
    { value: 'hero', label: 'البانر الرئيسي', description: 'بانر كبير في أعلى الصفحة' },
    { value: 'strip', label: 'الشريط الإعلاني', description: 'شريط رفيع في أعلى أو أسفل الصفحة' },
    { value: 'sidebar', label: 'الشريط الجانبي', description: 'بانر في الجانب الأيمن أو الأيسر' },
    { value: 'popup', label: 'النافذة المنبثقة', description: 'نافذة تظهر فوق المحتوى' }
  ];

  const positions = [
    { value: 'top', label: 'أعلى الصفحة' },
    { value: 'middle', label: 'وسط الصفحة' },
    { value: 'bottom', label: 'أسفل الصفحة' },
    { value: 'floating', label: 'عائم' }
  ];

  const animations = [
    { value: 'fade', label: 'تلاشي' },
    { value: 'slide', label: 'انزلاق' },
    { value: 'scale', label: 'تكبير/تصغير' },
    { value: 'bounce', label: 'ارتداد' }
  ];

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للتحرير
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ البانر'}
          </Button>
        </div>

        <BannerPreview
          banner={{
            ...formData,
            selectedProducts
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            رجوع
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {banner ? 'تحرير البانر' : 'إنشاء بانر جديد'}
            </h2>
            <p className="text-muted-foreground">
              صمم بانراً ترويجياً جذاباً لمتجرك
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            معاينة
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="gap-2">
            <Type className="w-4 h-4" />
            المحتوى
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2">
            <Palette className="w-4 h-4" />
            التصميم
          </TabsTrigger>
          <TabsTrigger value="targeting" className="gap-2">
            <Target className="w-4 h-4" />
            الاستهداف
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* محتوى البانر */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>محتوى البانر</CardTitle>
              <CardDescription>
                أضف النصوص والروابط الخاصة بالبانر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Banner Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_ar">العنوان (العربية)</Label>
                  <Input
                    id="title_ar"
                    value={formData.title_ar}
                    onChange={(e) => handleInputChange('title_ar', e.target.value)}
                    placeholder="عنوان البانر"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف (English)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Banner description..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_ar">الوصف (العربية)</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => handleInputChange('description_ar', e.target.value)}
                    placeholder="وصف البانر..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">رابط الصورة</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">نص الزر (English)</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => handleInputChange('button_text', e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button_text_ar">نص الزر (العربية)</Label>
                  <Input
                    id="button_text_ar"
                    value={formData.button_text_ar}
                    onChange={(e) => handleInputChange('button_text_ar', e.target.value)}
                    placeholder="تسوق الآن"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button_url">رابط الزر</Label>
                  <Input
                    id="button_url"
                    value={formData.button_url}
                    onChange={(e) => handleInputChange('button_url', e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>منتجات البانر</CardTitle>
              <CardDescription>
                اختر المنتجات التي ترغب في إبرازها داخل البانر من منتجات متجرك الحالية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {productsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  لا توجد منتجات متاحة حالياً في متجرك. قم بإضافة منتجات أولاً لربطها بالبانر.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {availableProducts.map((product) => {
 codex/add-product-selection-for-banner-creation-roitqz
                    const normalizedId = product.id?.toString();
                    const isSelected = normalizedId ? selectedProductIds.includes(normalizedId) : false;

                    const isSelected = selectedProductIds.includes(product.id);
 main
                    const imageUrl =
                      (Array.isArray(product.image_urls) && product.image_urls[0]) ||
                      (Array.isArray(product.images) && product.images[0]?.url) ||
                      '/placeholder.svg';

                    return (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => toggleProductSelection(product.id)}
                        className={`relative text-right p-4 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-muted hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                            <img
                              src={imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 line-clamp-1">{product.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description || 'بدون وصف'}
                            </p>
                            <div className="mt-2 text-sm font-medium text-primary">
                              {product.price_sar} ريال
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Badge className="absolute top-3 left-3">مضاف</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedProductIds.length > 0 && (
                <p className="text-sm text-muted-foreground text-right">
                  سيتم عرض {selectedProductIds.length} منتج داخل البانر.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تصميم البانر */}
        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>تصميم البانر</CardTitle>
              <CardDescription>
                اختر نوع البانر والألوان والموضع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* نوع البانر */}
              <div className="space-y-3">
                <Label>نوع البانر</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bannerTypes.map((type) => (
                    <Card 
                      key={type.value}
                      className={`cursor-pointer transition-colors ${
                        formData.banner_type === type.value 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleInputChange('banner_type', type.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                          {formData.banner_type === type.value && (
                            <Badge>محدد</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* الموضع والأولوية */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>الموضع</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleInputChange('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الأولوية</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>نوع الحركة</Label>
                  <Select
                    value={formData.animation_type}
                    onValueChange={(value) => handleInputChange('animation_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animations.map((anim) => (
                        <SelectItem key={anim.value} value={anim.value}>
                          {anim.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* الألوان */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>لون الخلفية</Label>
                  <ColorPicker
                    value={formData.background_color}
                    onChange={(color) => handleInputChange('background_color', color)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>لون النص</Label>
                  <ColorPicker
                    value={formData.text_color}
                    onChange={(color) => handleInputChange('text_color', color)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>لون الزر</Label>
                  <ColorPicker
                    value={formData.button_color}
                    onChange={(color) => handleInputChange('button_color', color)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الاستهداف والشروط */}
        <TabsContent value="targeting">
          <Card>
            <CardHeader>
              <CardTitle>الاستهداف والشروط</CardTitle>
              <CardDescription>
                حدد متى وأين يظهر البانر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* التواريخ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ البداية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formData.start_date ? 
                          format(formData.start_date, 'dd/MM/yyyy', { locale: ar }) : 
                          'اختر التاريخ'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => handleInputChange('start_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>تاريخ النهاية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formData.end_date ? 
                          format(formData.end_date, 'dd/MM/yyyy', { locale: ar }) : 
                          'اختر التاريخ'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => handleInputChange('end_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* حدود العرض */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الحد الأقصى للمشاهدات</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.max_impressions || ''}
                    onChange={(e) => handleInputChange('max_impressions', 
                      e.target.value ? parseInt(e.target.value) : null
                    )}
                    placeholder="غير محدود"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأقصى للنقرات</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.max_clicks || ''}
                    onChange={(e) => handleInputChange('max_clicks', 
                      e.target.value ? parseInt(e.target.value) : null
                    )}
                    placeholder="غير محدود"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الإعدادات */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات البانر</CardTitle>
              <CardDescription>
                إعدادات التفاعل والسلوك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل البانر</Label>
                    <p className="text-sm text-muted-foreground">
                      هل تريد عرض البانر للزوار؟
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إظهار زر الإغلاق</Label>
                    <p className="text-sm text-muted-foreground">
                      يسمح للمستخدمين بإغلاق البانر
                    </p>
                  </div>
                  <Switch
                    checked={formData.show_close_button}
                    onCheckedChange={(checked) => handleInputChange('show_close_button', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إخفاء تلقائي بعد التفاعل</Label>
                    <p className="text-sm text-muted-foreground">
                      يختفي البانر بعد النقر عليه
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_hide_after_interaction}
                    onCheckedChange={(checked) => handleInputChange('auto_hide_after_interaction', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};