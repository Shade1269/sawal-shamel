import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { AdvancedThemeBuilder } from '@/components/themes/AdvancedThemeBuilder';
import { RealtimeThemePreview } from '@/components/themes/RealtimeThemePreview';
import { SmartColorPalette } from '@/components/themes/SmartColorPalette';
import { useAdvancedThemes } from '@/hooks/useAdvancedThemes';
import { 
  Palette, 
  Eye, 
  Layers, 
  Sparkles, 
  Save, 
  Share2,
  ArrowLeft,
  Crown,
  Zap,
  Wand2,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ThemeStudioPage: React.FC = () => {
  const { storeId: paramStoreId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const queryStoreId = searchParams.get('storeId');
  const storeId = paramStoreId || queryStoreId;
  
  const navigate = useNavigate();
  const [_currentTheme, setCurrentTheme] = useState<any>(null);
  const [previewConfig, setPreviewConfig] = useState<any>({
    colors: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
      accent: 'hsl(var(--accent))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))'
    }
  });

  // استخدام محرك الثيمات المتقدم
  const {
    applyTemplate,
    previewTheme,
    exitPreview,
    generateSmartPalette
  } = useAdvancedThemes(storeId ?? undefined);
  void [applyTemplate, previewTheme, exitPreview, generateSmartPalette];

  const handleThemeApplied = (theme: any) => {
    setCurrentTheme(theme);
    toast.success('تم تطبيق الثيم بنجاح!');
  };

  const handleColorPaletteChange = (palette: any) => {
    const newConfig = {
      ...previewConfig,
      colors: palette
    };
    setPreviewConfig(newConfig);
  };

  const handleBackToStore = () => {
    if (storeId) {
      navigate(`/store-themes/${storeId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <UnifiedButton
                variant="ghost"
                size="sm"
                onClick={handleBackToStore}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {storeId ? 'العودة للمتجر' : 'رجوع'}
              </UnifiedButton>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl gradient-btn-accent shadow-lg">
                  <Palette className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text-accent">
                    استوديو الثيمات
                  </h1>
                  <p className="text-muted-foreground">صمم متجرك بطريقة احترافية</p>
                  {storeId && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        <Info className="w-3 h-3 mr-1" />
                        متصل بالمتجر: {storeId.slice(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UnifiedBadge variant="info" leadingIcon={<Crown className="w-4 h-4" />}>
                الإصدار المتقدم
              </UnifiedBadge>
              
              <UnifiedButton variant="outline" leftIcon={<Share2 className="w-4 h-4" />}>
                مشاركة
              </UnifiedButton>
              
              <UnifiedButton variant="hero" leftIcon={<Save className="w-4 h-4" />}>
                حفظ ونشر
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="builder" className="gap-2">
              <Layers className="w-4 h-4" />
              منشئ الثيمات
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="w-4 h-4" />
              الألوان الذكية
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 w-4" />
              المعاينة المباشرة
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              الذكاء الاصطناعي
            </TabsTrigger>
          </TabsList>

          {/* Theme Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AdvancedThemeBuilder
                storeId={storeId ?? undefined}
                onThemeApplied={handleThemeApplied}
              />
            </motion.div>
          </TabsContent>

          {/* Smart Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UnifiedCard variant="default" padding="md" className="h-fit">
                  <UnifiedCardHeader>
                    <UnifiedCardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      لوحة الألوان الذكية
                    </UnifiedCardTitle>
                    <UnifiedCardDescription>
                      اختر ألوان متناسقة ومتوافقة مع معايير الوصول
                    </UnifiedCardDescription>
                  </UnifiedCardHeader>
                  <UnifiedCardContent>
                    <SmartColorPalette
                      initialPalette={previewConfig.colors}
                      onPaletteChange={handleColorPaletteChange}
                      showAISuggestions={true}
                    />
                  </UnifiedCardContent>
                </UnifiedCard>

                <UnifiedCard variant="default" padding="md" className="h-fit">
                  <UnifiedCardHeader>
                    <UnifiedCardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      المعاينة الفورية
                    </UnifiedCardTitle>
                    <UnifiedCardDescription>
                      شاهد التغييرات مباشرة أثناء التصميم
                    </UnifiedCardDescription>
                  </UnifiedCardHeader>
                  <UnifiedCardContent>
                    <RealtimeThemePreview
                      themeConfig={previewConfig}
                      isActive={true}
                      showControls={true}
                      onConfigChange={setPreviewConfig}
                    />
                  </UnifiedCardContent>
                </UnifiedCard>
              </div>
            </motion.div>
          </TabsContent>

          {/* Realtime Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <UnifiedCard variant="default" padding="md">
                <UnifiedCardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <UnifiedCardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        المعاينة المباشرة والتفاعلية
                      </UnifiedCardTitle>
                      <UnifiedCardDescription>
                        اختبر تصميمك على مختلف الصفحات والأجهزة
                      </UnifiedCardDescription>
                    </div>
                    <div className="flex gap-2">
                      <UnifiedButton size="sm" variant="outline">
                        جوال
                      </UnifiedButton>
                      <UnifiedButton size="sm" variant="outline">
                        تابلت
                      </UnifiedButton>
                      <UnifiedButton size="sm" variant="primary">
                        ديسكتوب
                      </UnifiedButton>
                    </div>
                  </div>
                </UnifiedCardHeader>
                <UnifiedCardContent>
                  <div className="space-y-6">
                    <RealtimeThemePreview
                      themeConfig={previewConfig}
                      isActive={true}
                      showControls={true}
                      onConfigChange={setPreviewConfig}
                    />
                    
                    <Separator />
                    
                    {/* Performance Analysis */}
                    <div className="grid grid-cols-3 gap-4">
                      <UnifiedCard variant="default" padding="md" className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">98%</div>
                        <div className="text-sm text-muted-foreground">سرعة التحميل</div>
                      </UnifiedCard>
                      <UnifiedCard variant="default" padding="md" className="text-center">
                        <div className="text-2xl font-bold text-success mb-2">AA</div>
                        <div className="text-sm text-muted-foreground">إمكانية الوصول</div>
                      </UnifiedCard>
                      <UnifiedCard variant="default" padding="md" className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">95%</div>
                        <div className="text-sm text-muted-foreground">تجربة المستخدم</div>
                      </UnifiedCard>
                    </div>
                  </div>
                </UnifiedCardContent>
              </UnifiedCard>
            </motion.div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <UnifiedCard variant="default" padding="md">
                <UnifiedCardHeader>
                  <UnifiedCardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    مساعد الذكاء الاصطناعي للتصميم
                  </UnifiedCardTitle>
                  <UnifiedCardDescription>
                    اتركنا نساعدك في إنشاء تصميم مثالي لمتجرك
                  </UnifiedCardDescription>
                </UnifiedCardHeader>
                <UnifiedCardContent className="space-y-6">
                  {/* AI Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UnifiedCard variant="default" padding="md" hover="lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-info/10">
                          <Zap className="w-5 h-5 text-info" />
                        </div>
                        <h3 className="font-semibold">توليد تلقائي للثيمات</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        أدخل وصف لمتجرك واتركنا ننشئ ثيمات متعددة مناسبة لك
                      </p>
                      <UnifiedButton variant="primary" fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
                        ابدأ التوليد
                      </UnifiedButton>
                    </UnifiedCard>

                    <UnifiedCard variant="default" padding="md" hover="lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-success/10">
                          <Eye className="w-5 h-5 text-success" />
                        </div>
                        <h3 className="font-semibold">تحليل المنافسين</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        احصل على إلهام من أفضل المتاجر في مجالك
                      </p>
                      <UnifiedButton variant="outline" fullWidth leftIcon={<Eye className="w-4 h-4" />}>
                        تحليل الآن
                      </UnifiedButton>
                    </UnifiedCard>

                    <UnifiedCard variant="default" padding="md" hover="lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-premium/10">
                          <Palette className="w-5 h-5 text-premium" />
                        </div>
                        <h3 className="font-semibold">اقتراحات الألوان الذكية</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        احصل على لوحات ألوان مثالية حسب طبيعة منتجاتك
                      </p>
                      <UnifiedButton variant="outline" fullWidth leftIcon={<Palette className="w-4 h-4" />}>
                        اقتراحات
                      </UnifiedButton>
                    </UnifiedCard>

                    <UnifiedCard variant="default" padding="md" hover="lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-warning/10">
                          <Wand2 className="w-5 h-5 text-warning" />
                        </div>
                        <h3 className="font-semibold">تحسين تلقائي</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        اتركنا نحسن تصميمك للحصول على أفضل معدلات التحويل
                      </p>
                      <UnifiedButton variant="outline" fullWidth leftIcon={<Wand2 className="w-4 h-4" />}>
                        تحسين
                      </UnifiedButton>
                    </UnifiedCard>
                  </div>

                  <Separator />

                  {/* AI Chat Interface */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">محادثة مع المساعد الذكي</h3>
                    <div className="border rounded-lg p-4 bg-muted/30 min-h-[200px] flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Sparkles className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">مرحباً! كيف يمكنني مساعدتك في تصميم متجرك؟</p>
                        <UnifiedButton variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
                          ابدأ المحادثة
                        </UnifiedButton>
                      </div>
                    </div>
                  </div>
                </UnifiedCardContent>
              </UnifiedCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThemeStudioPage;