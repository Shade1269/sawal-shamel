import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createStoreUrl } from '@/utils/domains';
import { 
  Store, 
  Settings, 
  Palette, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Eye,
  Edit,
  Save,
  Upload,
  QrCode,
  Share2,
  Smartphone,
  Monitor,
  Globe,
  Image as ImageIcon,
  Grid,
  AlignLeft,
  Star,
  Heart,
  Plus,
  Trash2,
  Package,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  ShoppingCart
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  parseFeaturedCategories,
  useStoreSettings,
  type StoreCategory,
  type StoreCategoryBannerProduct
} from '@/hooks/useStoreSettings';
import { useQRGenerator } from '@/hooks/useQRGenerator';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { ImageUpload } from '@/components/ui/image-upload';
import { CategoryEditDialog } from './CategoryEditDialog';
import { ProductManagement } from './ProductManagement';
import { AffiliateProductsManager } from './AffiliateProductsManager';
import { OrderCommissionManagement } from './OrderCommissionManagement';
import AffiliateCouponManager from '@/components/marketing/AffiliateCouponManager';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { StoreThemeSelector } from '@/components/store/StoreThemeSelector';

interface AffiliateStoreManagerProps {
  store: {
    id: string;
    store_name: string;
    bio: string;
    store_slug: string;
    logo_url?: string;
    theme: string;
    total_sales: number;
    total_orders: number;
  };
  onUpdateStore?: (storeData: any) => void;
  onGenerateQR?: () => void;
}

type AffiliateProductWithDetails = {
  products?: {
    id: string;
    category: string | null;
    is_active: boolean | null;
  } | null;
};

type StoreProductOption = {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  isVisible: boolean;
};

export const AffiliateStoreManager = ({
  store,
  onUpdateStore,
  onGenerateQR
}: AffiliateStoreManagerProps) => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    store_name: store.store_name,
    bio: store.bio,
    theme: store.theme
  });

  // تحديث URL عند تغيير التبويب
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  // استخدام خطافات الإعدادات والتحسينات
  const { settings, updateSettings, uploadImage, refetch } = useStoreSettings(store.id);
  const { generateQR, downloadQR, qrCodeDataUrl, isGenerating } = useQRGenerator();
  const { analytics, loading: analyticsLoading } = useStoreAnalytics(store.id);

  const storeUrl = createStoreUrl(store.store_slug);

  // حالات الإعدادات المتقدمة
  const [heroSettings, setHeroSettings] = useState({
    hero_title: settings?.hero_title || '',
    hero_subtitle: settings?.hero_subtitle || '',
    hero_description: settings?.hero_description || '',
    hero_cta_text: settings?.hero_cta_text || 'تسوق الآن',
    hero_cta_color: settings?.hero_cta_color || 'primary',
    hero_image_url: settings?.hero_image_url || ''
  });

  // تحديث heroSettings عند تحميل settings من قاعدة البيانات
  useEffect(() => {
    if (settings) {
      setHeroSettings({
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        hero_description: settings.hero_description || '',
        hero_cta_text: settings.hero_cta_text || 'تسوق الآن',
        hero_cta_color: settings.hero_cta_color || 'primary',
        hero_image_url: settings.hero_image_url || ''
      });
    }
  }, [settings]);

  // حالة لتحديد القسم الحالي
  const [currentSection, setCurrentSection] = useState<'main' | 'products' | 'orders'>('main');

  const themes = [
    { value: 'classic', label: 'كلاسيكي', colors: 'من الأزرق إلى الرمادي' },
    { value: 'modern', label: 'عصري', colors: 'من الأسود إلى الفضي' },
    { value: 'elegant', label: 'أنيق', colors: 'من الذهبي إلى الكريمي' },
    { value: 'vibrant', label: 'نابض بالحياة', colors: 'من الأحمر إلى البرتقالي' },
    { value: 'nature', label: 'طبيعي', colors: 'من الأخضر إلى البني' },
    { value: 'feminine', label: 'أنثوي', colors: 'من الوردي إلى البنفسجي' },
    { value: 'professional', label: 'مهني', colors: 'من الأزرق الداكن إلى الرمادي' },
    { value: 'luxury', label: 'فخم', colors: 'من الذهبي إلى الأسود' }
  ];

  const handleSaveChanges = () => {
    if (onUpdateStore) {
      onUpdateStore(editData);
    }
    setIsEditing(false);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ تغييرات المتجر بنجاح",
    });
  };

  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    toast({
      title: "تم نسخ الرابط",
      description: "تم نسخ رابط متجرك إلى الحافظة",
    });
  };

  const shareStore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store.store_name,
          text: store.bio,
          url: storeUrl,
        });
      } catch (error) {
        copyStoreLink();
      }
    } else {
      copyStoreLink();
    }
  };

  // وظائف إدارة الصور
  const handleLogoUpload = async (file: File) => {
    const result = await uploadImage(file, 'logos');
    if (result.success && onUpdateStore) {
      onUpdateStore({ logo_url: result.url });
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    const result = await uploadImage(file, 'hero');
    if (result.success) {
      setHeroSettings(prev => ({ ...prev, hero_image_url: result.url }));
    }
  };

  // حفظ إعدادات القسم الرئيسي
  const saveHeroSettings = async () => {
    const success = await updateSettings(heroSettings);
    if (success) {
      // إعادة جلب البيانات لتحديث المعاينة
      await refetch();
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات القسم الرئيسي بنجاح. يمكنك معاينة التغييرات الآن."
      });
    }
  };

  // إضافة المتغيرات للفئات وطريقة العرض
  const [displayStyle, setDisplayStyle] = useState('grid');
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [availableCategories, setAvailableCategories] = useState<StoreCategory[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!settings?.category_display_style) {
      setDisplayStyle('grid');
      return;
    }

    setDisplayStyle(settings.category_display_style);
  }, [settings?.category_display_style]);

  useEffect(() => {
    const loadCategories = async () => {
      if (!store.id) return;

      try {
        const { data, error } = await supabase
          .from('affiliate_products')
          .select(`
            id,
            is_visible,
            products (
              id,
              category,
              is_active
            )
          `)
          .eq('affiliate_store_id', store.id)
          .eq('is_visible', true);

        if (error) throw error;

        const categoryCounts = new Map<string, number>();

        (data as AffiliateProductWithDetails[] | null)?.forEach((item) => {
          const product = item.products;
          if (!product || product.is_active === false) return;

          const categoryName = product.category || 'غير مصنف';
          categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
        });

        const derivedCategories: StoreCategory[] = Array.from(categoryCounts.entries()).map(([name, count]) => ({
          id: name,
          name,
          isActive: true,
          productCount: count,
          bannerProducts: []
        }));

        setAvailableCategories(derivedCategories);
      } catch (error) {
        console.error('Error loading available categories for affiliate store:', error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل الفئات المرتبطة بمنتجات المتجر',
          variant: 'destructive'
        });
      }
    };

    loadCategories();
  }, [store.id, toast]);

  useEffect(() => {
    const loadStoreProducts = async () => {
      if (!store.id) return;

      setLoadingProducts(true);

      try {
        const { data, error } = await supabase
          .from('affiliate_products')
          .select(`
            id,
            is_visible,
            products (
              id,
              title,
              image_urls,
              category,
              is_active
            )
          `)
          .eq('affiliate_store_id', store.id);

        if (error) throw error;

        const formattedProducts: StoreProductOption[] = (data || [])
          .map((item: any) => {
            const product = item.products as any;
            if (!product || product.is_active === false || item?.is_visible === false) {
              return null;
            }

            const imageUrl = Array.isArray(product.image_urls) && product.image_urls.length > 0
              ? product.image_urls[0]
              : null;

            return {
              id: product.id,
              title: product.title,
              category: product.category || null,
              image_url: imageUrl,
              isVisible: item?.is_visible ?? true
            };
          })
          .filter((product): product is StoreProductOption => Boolean(product.id));

        setStoreProducts(formattedProducts);
      } catch (error) {
        console.error('Error loading products for affiliate store:', error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل المنتجات المتاحة للاختيار',
          variant: 'destructive'
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    loadStoreProducts();
  }, [store.id, toast]);

  useEffect(() => {
    const storedCategories = parseFeaturedCategories(settings?.featured_categories);

    if (storedCategories.length === 0 && availableCategories.length === 0) {
      setCategories([]);
      return;
    }

    const availableById = new Map(availableCategories.map((category) => [category.id, category]));

    const mergedCategories: StoreCategory[] = availableCategories.map((category) => {
      const stored = storedCategories.find((item) => item.id === category.id || item.name === category.name);
      return {
        ...category,
        isActive: stored?.isActive ?? true,
        productCount: stored?.productCount ?? category.productCount,
        bannerProducts: stored?.bannerProducts ?? category.bannerProducts ?? []
      };
    });

    storedCategories.forEach((category) => {
      const exists = availableById.has(category.id) || mergedCategories.some((item) => item.name === category.name);
      if (!exists) {
        mergedCategories.push({
          id: category.id,
          name: category.name,
          isActive: category.isActive,
          productCount: category.productCount,
          bannerProducts: category.bannerProducts ?? []
        });
      }
    });

    setCategories(mergedCategories);
  }, [settings?.featured_categories, availableCategories]);

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const handleCategoryEdit = (updatedCategory: Partial<StoreCategory>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat
    ));
  };

  const handleAddCategory = (newCategory: Partial<StoreCategory>) => {
    setCategories(prev => [
      ...prev,
      {
        ...(newCategory as StoreCategory),
        bannerProducts: newCategory.bannerProducts ?? []
      }
    ]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const getDisplayStyleLabel = (style: string) => {
    switch (style) {
      case 'grid': return 'شبكة مع صور';
      case 'horizontal': return 'قائمة أفقية';
      case 'circular': return 'دائرية مميزة';
      default: return 'شبكة مع صور';
    }
  };

  // حفظ إعدادات الفئات
  const saveCategorySettings = async () => {
    const success = await updateSettings({
      category_display_style: displayStyle,
      featured_categories: JSON.parse(JSON.stringify(categories))
    });

    if (success) {
      // إعادة جلب البيانات لتحديث العرض
      await refetch();
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الفئات بنجاح. سيتم تحديث المتجر تلقائياً."
      });
    }
  };

  // توليد وتحميل رمز QR
  const handleGenerateQR = async () => {
    const result = await generateQR(storeUrl, 512);
    if (result.success && result.downloadUrl) {
      toast({
        title: "تم إنتاج رمز QR",
        description: "يمكنك الآن تحميل الرمز"
      });
    }
  };

  // عرض الأقسام المختلفة حسب الاختيار
  if (currentSection === 'products') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentSection('main')}>
            ← العودة لإدارة المتجر
          </Button>
          <h2 className="text-xl font-semibold">إدارة المنتجات</h2>
        </div>
        <ProductManagement storeId={store.id} />
      </div>
    );
  }

  if (currentSection === 'orders') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentSection('main')}>
            ← العودة لإدارة المتجر
          </Button>
          <h2 className="text-xl font-semibold">الطلبات والعمولات</h2>
        </div>
        <OrderCommissionManagement storeId={store.id} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Store Header */}
      <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />
                ) : (
                  <Store className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                )}
              </div>
              <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold truncate">{store.store_name}</h1>
                <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{store.bio}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{store.theme}</Badge>
                  <Badge variant="secondary" className="text-xs">
                    {store.total_orders} طلب
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch md:self-auto">
              <Button 
                variant="outline" 
                onClick={() => window.open(storeUrl, '_blank')}
                className="flex-1 md:flex-none"
                size="sm"
              >
                <Eye className="h-4 w-4 md:ml-2" />
                <span className="hidden md:inline">معاينة</span>
              </Button>
              <Button 
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 md:flex-none"
                size="sm"
              >
                <Edit className="h-4 w-4 md:ml-2" />
                <span className="hidden md:inline">{isEditing ? "إلغاء" : "تعديل"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Management Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        {/* قائمة منسدلة للجوال */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">⚙️ الإعدادات العامة</SelectItem>
              <SelectItem value="appearance">🎨 المظهر</SelectItem>
              <SelectItem value="hero">🖼️ القسم الرئيسي</SelectItem>
              <SelectItem value="categories">📂 إدارة الفئات</SelectItem>
              <SelectItem value="products">🛍️ إدارة المنتجات</SelectItem>
              <SelectItem value="coupons">🎟️ الكوبونات</SelectItem>
              <SelectItem value="sharing">📤 المشاركة</SelectItem>
              <SelectItem value="analytics">📊 الإحصائيات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* تبويبات للشاشات الكبيرة */}
        <TabsList className="hidden md:grid w-full grid-cols-8">
          <TabsTrigger value="general">الإعدادات العامة</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="hero">القسم الرئيسي</TabsTrigger>
          <TabsTrigger value="categories">إدارة الفئات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="coupons">الكوبونات</TabsTrigger>
          <TabsTrigger value="sharing">المشاركة</TabsTrigger>
          <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                تحديث معلومات متجرك الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name" className="text-sm">اسم المتجر</Label>
                  <Input
                    id="store_name"
                    value={isEditing ? editData.store_name : store.store_name}
                    onChange={(e) => setEditData({...editData, store_name: e.target.value})}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_slug" className="text-sm">رابط المتجر</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="store_slug"
                      value={store.store_slug}
                      disabled
                      className="flex-1 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={copyStoreLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm">وصف المتجر</Label>
                <Textarea
                  id="bio"
                  value={isEditing ? editData.bio : store.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  disabled={!isEditing}
                  className="min-h-20 text-sm"
                />
              </div>

              {isEditing && (
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                  <Button onClick={handleSaveChanges} className="w-full md:w-auto" size="sm">
                    <Save className="h-4 w-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full md:w-auto" size="sm">
                    إلغاء
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 md:space-y-6">
          <StoreThemeSelector
            storeId={store.id}
            onThemeApplied={(theme) => {
              toast({
                title: "✨ تم تحديث الثيم!",
                description: `تم تطبيق ثيم "${theme.name_ar}" بنجاح على متجرك`
              });
            }}
          />
          
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                إعدادات إضافية
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                تخصيص الشعار والإعدادات الأخرى
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">

              <div className="space-y-2">
                <Label className="text-sm">شعار المتجر</Label>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <Store className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <ImageUpload
                    onImageSelect={handleLogoUpload}
                    currentImage={store.logo_url}
                    accept="image/*"
                    className="w-full md:w-auto"
                  >
                    <Button variant="outline" disabled={!isEditing} className="w-full md:w-auto" size="sm">
                      <Upload className="h-4 w-4 ml-2" />
                      رفع شعار
                    </Button>
                  </ImageUpload>
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleSaveChanges} className="w-full md:w-auto" size="sm">
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                إعدادات القسم الرئيسي
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                تخصيص القسم الرئيسي لمتجرك بالصور والنصوص الجذابة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              {/* Hero Image */}
              <div className="space-y-3">
                <Label className="text-sm">صورة الخلفية الرئيسية</Label>
                <ImageUpload
                  onImageSelect={handleHeroImageUpload}
                  currentImage={heroSettings.hero_image_url}
                  accept="image/*"
                  className="h-48 md:h-64"
                />
              </div>

              {/* Hero Text */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">العنوان الرئيسي</Label>
                  <Input 
                    value={heroSettings.hero_title}
                    onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                    placeholder="مرحباً بكم في متجري" 
                    className="text-right text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">العنوان الفرعي</Label>
                  <Input 
                    value={heroSettings.hero_subtitle}
                    onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                    placeholder="أفضل المنتجات بأسعار منافسة" 
                    className="text-right text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">وصف مختصر</Label>
                <Textarea 
                  value={heroSettings.hero_description}
                  onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_description: e.target.value }))}
                  placeholder="اكتشف مجموعة رائعة من المنتجات عالية الجودة..."
                  className="min-h-20 text-right text-sm"
                />
              </div>

              {/* Call to Action */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">نص زر العمل</Label>
                  <Input 
                    value={heroSettings.hero_cta_text}
                    onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_cta_text: e.target.value }))}
                    placeholder="تسوق الآن" 
                    className="text-right text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">لون زر العمل</Label>
                  <Select value={heroSettings.hero_cta_color} onValueChange={(value) => setHeroSettings(prev => ({ ...prev, hero_cta_color: value }))}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="اختر اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">اللون الأساسي</SelectItem>
                      <SelectItem value="secondary">اللون الثانوي</SelectItem>
                      <SelectItem value="accent">لون مميز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full md:w-auto" onClick={saveHeroSettings} size="sm">
                <Save className="h-4 w-4 ml-2" />
                حفظ إعدادات القسم الرئيسي
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Grid className="h-4 w-4 md:h-5 md:w-5" />
                إدارة الفئات المرئية
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                تنظيم وعرض الفئات بطريقة جذابة للعملاء
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              {/* Category Display Style */}
              <div className="space-y-3">
                <Label className="text-sm">طريقة عرض الفئات</Label>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">النمط الحالي: {getDisplayStyleLabel(displayStyle)}</p>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <Card 
                    className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                      displayStyle === 'grid' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setDisplayStyle('grid')}
                  >
                    <CardContent className="p-3 md:p-4 text-center">
                      <Grid className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                      <p className="text-xs md:text-sm font-medium">شبكة مع صور</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                      displayStyle === 'horizontal' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setDisplayStyle('horizontal')}
                  >
                    <CardContent className="p-3 md:p-4 text-center">
                      <AlignLeft className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                      <p className="text-xs md:text-sm font-medium">قائمة أفقية</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                      displayStyle === 'circular' ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setDisplayStyle('circular')}
                  >
                    <CardContent className="p-3 md:p-4 text-center">
                      <Star className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                      <p className="text-xs md:text-sm font-medium">دائرية مميزة</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Featured Categories */}
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <Label className="text-sm">الفئات المميزة</Label>
                  <CategoryEditDialog
                    isNew
                    onSave={handleAddCategory}
                    products={storeProducts}
                    isLoadingProducts={loadingProducts}
                  >
                    <Button variant="outline" size="sm" className="w-full md:w-auto">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة فئة
                    </Button>
                  </CategoryEditDialog>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  فعل أو ألغ الفئات التي تريد عرضها في متجرك
                </p>
                <div className="space-y-3">
                  {categories.length === 0 ? (
                    <div className="text-center text-muted-foreground border border-dashed rounded-lg py-6">
                      لا توجد فئات مفعلة بعد، قم بإضافة فئات أو فعلها لعرضها في متجرك.
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            category.isActive ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <Heart className={`h-5 w-5 ${
                              category.isActive ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div>
                            <p className={`font-medium ${
                              category.isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}>{category.name}</p>
                            <p className="text-sm text-muted-foreground">{category.productCount} منتج</p>
                            {category.bannerProducts && category.bannerProducts.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {category.bannerProducts.slice(0, 3).map((product: StoreCategoryBannerProduct) => (
                                  <Badge key={product.id} variant="secondary" className="text-xs">
                                    {product.title}
                                  </Badge>
                                ))}
                                {category.bannerProducts.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{category.bannerProducts.length - 3} منتج
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={() => toggleCategoryStatus(category.id)}
                          />
                          <CategoryEditDialog
                            category={category}
                            onSave={handleCategoryEdit}
                            products={storeProducts}
                            isLoadingProducts={loadingProducts}
                          >
                            <Button variant="outline" size="sm" disabled={!category.isActive}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CategoryEditDialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button className="w-full md:w-auto" onClick={saveCategorySettings} size="sm">
                <Save className="h-4 w-4 ml-2" />
                حفظ إعدادات الفئات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                مشاركة المتجر
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                شارك متجرك مع العملاء والمتابعين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              {/* Store Link */}
              <div className="space-y-2">
                <Label className="text-sm">رابط المتجر</Label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input value={storeUrl} disabled className="flex-1 text-sm" />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyStoreLink} className="flex-1 md:flex-none" size="sm">
                      <Copy className="h-4 w-4" />
                      <span className="md:hidden ml-2">نسخ</span>
                    </Button>
                    <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')} className="flex-1 md:flex-none" size="sm">
                      <ExternalLink className="h-4 w-4" />
                      <span className="md:hidden ml-2">فتح</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-2">
                <Label className="text-sm">رمز QR للمتجر</Label>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code" className="w-28 h-28 rounded" />
                    ) : (
                      <QrCode className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2 w-full md:w-auto">
                    <p className="text-xs md:text-sm text-muted-foreground text-center md:text-right">
                      يمكن للعملاء مسح هذا الرمز للوصول إلى متجرك مباشرة
                    </p>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button variant="outline" onClick={handleGenerateQR} disabled={isGenerating} className="w-full md:w-auto" size="sm">
                        {isGenerating ? 'جاري الإنتاج...' : 'توليد رمز QR'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => qrCodeDataUrl && downloadQR(qrCodeDataUrl, `qr-${store.store_slug}.png`)}
                        disabled={!qrCodeDataUrl}
                        className="w-full md:w-auto"
                        size="sm"
                      >
                        تحميل الصورة
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="space-y-2">
                <Label className="text-sm">المشاركة على وسائل التواصل</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={shareStore} size="sm" className="w-full">
                    <Share2 className="h-4 w-4 md:ml-2" />
                    <span className="hidden md:inline">مشاركة</span>
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`تسوق من متجري: ${storeUrl}`)}`)} size="sm" className="w-full">
                    <span className="text-xs md:text-sm">واتساب</span>
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`تسوق من متجري: ${storeUrl}`)}`)} size="sm" className="w-full">
                    <span className="text-xs md:text-sm">تويتر</span>
                  </Button>
                </div>
              </div>

              {/* Device Preview */}
              <div className="space-y-2">
                <Label className="text-sm">معاينة على الأجهزة</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')} size="sm">
                    <Monitor className="h-4 w-4 md:ml-2" />
                    <span className="text-xs md:text-sm">كمبيوتر</span>
                  </Button>
                  <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')}>
                    <Smartphone className="h-4 w-4 ml-2" />
                    جوال
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-6">
          <AffiliateCouponManager />
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <AffiliateProductsManager storeId={store.id} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analyticsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{analytics?.totalViews?.toLocaleString('ar-EG') || '0'}</div>
                    <div className="text-sm text-muted-foreground">إجمالي المشاهدات</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <LinkIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{analytics?.productClicks?.toLocaleString('ar-EG') || '0'}</div>
                    <div className="text-sm text-muted-foreground">النقرات على المنتجات</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Globe className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{analytics?.uniqueVisitors?.toLocaleString('ar-EG') || '0'}</div>
                    <div className="text-sm text-muted-foreground">زوار فريدون</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Store className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{analytics?.totalOrders?.toLocaleString('ar-EG') || store.total_orders}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
                  </CardContent>
                </Card>
              </div>

              {/* إحصائيات إضافية */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-green-600">{analytics?.conversionRate || 0}%</div>
                    <div className="text-sm text-muted-foreground">معدل التحويل</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-blue-600">{analytics?.averageOrderValue?.toLocaleString('ar-EG') || 0} ر.س</div>
                    <div className="text-sm text-muted-foreground">متوسط قيمة الطلب</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-purple-600">{analytics?.totalSales?.toLocaleString('ar-EG') || store.total_sales} ر.س</div>
                    <div className="text-sm text-muted-foreground">إجمالي المبيعات</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};