import { useState } from 'react';
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
  Heart
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useQRGenerator } from '@/hooks/useQRGenerator';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { ImageUpload } from '@/components/ui/image-upload';

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

export const AffiliateStoreManager = ({ 
  store, 
  onUpdateStore,
  onGenerateQR 
}: AffiliateStoreManagerProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    store_name: store.store_name,
    bio: store.bio,
    theme: store.theme
  });

  // استخدام خطافات الإعدادات والتحسينات
  const { settings, updateSettings, uploadImage } = useStoreSettings(store.id);
  const { generateQR, downloadQR, isGenerating } = useQRGenerator();
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

  const [categorySettings, setCategorySettings] = useState({
    display_style: settings?.category_display_style || 'grid',
    featured_categories: settings?.featured_categories || []
  });

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
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات القسم الرئيسي بنجاح"
      });
    }
  };

  // حفظ إعدادات الفئات
  const saveCategorySettings = async () => {
    const success = await updateSettings({
      category_display_style: categorySettings.display_style,
      featured_categories: categorySettings.featured_categories
    });
    if (success) {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الفئات بنجاح"
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

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="w-12 h-12 rounded-full" />
                ) : (
                  <Store className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{store.store_name}</h1>
                <p className="text-muted-foreground">{store.bio}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{store.theme}</Badge>
                  <Badge variant="secondary">
                    {store.total_orders} طلب
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')}>
                <Eye className="h-4 w-4 ml-2" />
                معاينة
              </Button>
              <Button 
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 ml-2" />
                {isEditing ? "إلغاء" : "تعديل"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Management Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">الإعدادات العامة</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="hero">القسم الرئيسي</TabsTrigger>
          <TabsTrigger value="categories">إدارة الفئات</TabsTrigger>
          <TabsTrigger value="sharing">المشاركة</TabsTrigger>
          <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                تحديث معلومات متجرك الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">اسم المتجر</Label>
                  <Input
                    id="store_name"
                    value={isEditing ? editData.store_name : store.store_name}
                    onChange={(e) => setEditData({...editData, store_name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_slug">رابط المتجر</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="store_slug"
                      value={store.store_slug}
                      disabled
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={copyStoreLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">وصف المتجر</Label>
                <Textarea
                  id="bio"
                  value={isEditing ? editData.bio : store.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  disabled={!isEditing}
                  className="min-h-20"
                />
              </div>

              {isEditing && (
                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveChanges}>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    إلغاء
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                مظهر المتجر
              </CardTitle>
              <CardDescription>
                اختر القالب والألوان المناسبة لمتجرك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>قالب المتجر</Label>
                <Select 
                  value={isEditing ? editData.theme : store.theme}
                  onValueChange={(value) => setEditData({...editData, theme: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div>
                          <div className="font-medium">{theme.label}</div>
                          <div className="text-xs text-muted-foreground">{theme.colors}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>شعار المتجر</Label>
                <div className="flex items-center gap-4">
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
                    className="w-20 h-20"
                  >
                    <Button variant="outline" disabled={!isEditing}>
                      <Upload className="h-4 w-4 ml-2" />
                      رفع شعار
                    </Button>
                  </ImageUpload>
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                إعدادات القسم الرئيسي
              </CardTitle>
              <CardDescription>
                تخصيص القسم الرئيسي لمتجرك بالصور والنصوص الجذابة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Image */}
              <div className="space-y-3">
                <Label>صورة الخلفية الرئيسية</Label>
                <ImageUpload
                  onImageSelect={handleHeroImageUpload}
                  currentImage={heroSettings.hero_image_url}
                  accept="image/*"
                  className="h-64"
                />
              </div>

              {/* Hero Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>العنوان الرئيسي</Label>
                  <Input 
                    value={heroSettings.hero_title}
                    onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                    placeholder="مرحباً بكم في متجري" 
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان الفرعي</Label>
                  <Input 
                    value={heroSettings.hero_subtitle}
                    onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                    placeholder="أفضل المنتجات بأسعار منافسة" 
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>وصف مختصر</Label>
                <Textarea 
                  value={heroSettings.hero_description}
                  onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_description: e.target.value }))}
                  placeholder="اكتشف مجموعة رائعة من المنتجات عالية الجودة..."
                  className="min-h-20 text-right"
                />
              </div>

              {/* Call to Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نص زر العمل</Label>
                  <Input 
                    value={heroSettings.hero_cta_text}
                    onChange={(e) => setHeroSettings(prev => ({ ...prev, hero_cta_text: e.target.value }))}
                    placeholder="تسوق الآن" 
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>لون زر العمل</Label>
                  <Select value={heroSettings.hero_cta_color} onValueChange={(value) => setHeroSettings(prev => ({ ...prev, hero_cta_color: value }))}>
                    <SelectTrigger>
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

              <Button className="w-full" onClick={saveHeroSettings}>
                <Save className="h-4 w-4 mr-2" />
                حفظ إعدادات القسم الرئيسي
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="h-5 w-5" />
                إدارة الفئات المرئية
              </CardTitle>
              <CardDescription>
                تنظيم وعرض الفئات بطريقة جذابة للعملاء
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Display Style */}
              <div className="space-y-3">
                <Label>طريقة عرض الفئات</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <Grid className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">شبكة مع صور</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <AlignLeft className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">قائمة أفقية</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">دائرية مميزة</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Featured Categories */}
              <div className="space-y-3">
                <Label>الفئات المميزة</Label>
                <div className="space-y-3">
                  {['أزياء نسائية', 'إكسسوارات', 'أحذية', 'حقائب'].map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{category}</p>
                          <p className="text-sm text-muted-foreground">12 منتج</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={saveCategorySettings}>
                <Save className="h-4 w-4 mr-2" />
                حفظ إعدادات الفئات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                مشاركة المتجر
              </CardTitle>
              <CardDescription>
                شارك متجرك مع العملاء والمتابعين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Link */}
              <div className="space-y-2">
                <Label>رابط المتجر</Label>
                <div className="flex items-center gap-2">
                  <Input value={storeUrl} disabled className="flex-1" />
                  <Button variant="outline" onClick={copyStoreLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-2">
                <Label>رمز QR للمتجر</Label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      يمكن للعملاء مسح هذا الرمز للوصول إلى متجرك مباشرة
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleGenerateQR} disabled={isGenerating}>
                        {isGenerating ? 'جاري الإنتاج...' : 'توليد رمز QR'}
                      </Button>
                      <Button variant="outline" disabled>
                        تحميل الصورة
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="space-y-2">
                <Label>المشاركة على وسائل التواصل</Label>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={shareStore}>
                    <Share2 className="h-4 w-4 ml-2" />
                    مشاركة
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`تسوق من متجري: ${storeUrl}`)}`)}>
                    واتساب
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`تسوق من متجري: ${storeUrl}`)}`)}>
                    تويتر
                  </Button>
                </div>
              </div>

              {/* Device Preview */}
              <div className="space-y-2">
                <Label>معاينة على الأجهزة</Label>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')}>
                    <Monitor className="h-4 w-4 ml-2" />
                    كمبيوتر
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