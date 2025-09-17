import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdvancedThemeBuilder } from '@/components/themes/AdvancedThemeBuilder';
import { RealtimeThemePreview } from '@/components/themes/RealtimeThemePreview';
import { SmartColorPalette } from '@/components/themes/SmartColorPalette';
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
  Wand2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ThemeStudioPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState<any>(null);
  const [previewConfig, setPreviewConfig] = useState<any>({
    colors: {
      primary: '#0066FF',
      secondary: '#F0F4F8',
      accent: '#0052CC',
      background: '#FFFFFF',
      foreground: '#1A1D21'
    }
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                رجوع
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    استوديو الثيمات
                  </h1>
                  <p className="text-muted-foreground">صمم متجرك بطريقة احترافية</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2">
                <Crown className="w-4 h-4" />
                الإصدار المتقدم
              </Badge>
              
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>
              
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent">
                <Save className="w-4 h-4" />
                حفظ ونشر
              </Button>
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
                storeId={storeId}
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
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      لوحة الألوان الذكية
                    </CardTitle>
                    <CardDescription>
                      اختر ألوان متناسقة ومتوافقة مع معايير الوصول
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SmartColorPalette
                      initialPalette={previewConfig.colors}
                      onPaletteChange={handleColorPaletteChange}
                      showAISuggestions={true}
                    />
                  </CardContent>
                </Card>

                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      المعاينة الفورية
                    </CardTitle>
                    <CardDescription>
                      شاهد التغييرات مباشرة أثناء التصميم
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RealtimeThemePreview
                      themeConfig={previewConfig}
                      isActive={true}
                      showControls={true}
                      onConfigChange={setPreviewConfig}
                    />
                  </CardContent>
                </Card>
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        المعاينة المباشرة والتفاعلية
                      </CardTitle>
                      <CardDescription>
                        اختبر تصميمك على مختلف الصفحات والأجهزة
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        جوال
                      </Button>
                      <Button size="sm" variant="outline">
                        تابلت
                      </Button>
                      <Button size="sm">
                        ديسكتوب
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-2">98%</div>
                        <div className="text-sm text-muted-foreground">سرعة التحميل</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-500 mb-2">AA</div>
                        <div className="text-sm text-muted-foreground">إمكانية الوصول</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-500 mb-2">95%</div>
                        <div className="text-sm text-muted-foreground">تجربة المستخدم</div>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    مساعد الذكاء الاصطناعي للتصميم
                  </CardTitle>
                  <CardDescription>
                    اتركنا نساعدك في إنشاء تصميم مثالي لمتجرك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">توليد تلقائي للثيمات</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        أدخل وصف لمتجرك واتركنا ننشئ ثيمات متعددة مناسبة لك
                      </p>
                      <Button className="w-full gap-2">
                        <Sparkles className="w-4 h-4" />
                        ابدأ التوليد
                      </Button>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Eye className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold">تحليل المنافسين</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        احصل على إلهام من أفضل المتاجر في مجالك
                      </p>
                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="w-4 h-4" />
                        تحليل الآن
                      </Button>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Palette className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">اقتراحات الألوان الذكية</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        احصل على لوحات ألوان مثالية حسب طبيعة منتجاتك
                      </p>
                      <Button variant="outline" className="w-full gap-2">
                        <Palette className="w-4 h-4" />
                        اقتراحات
                      </Button>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <Wand2 className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="font-semibold">تحسين تلقائي</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        اتركنا نحسن تصميمك للحصول على أفضل معدلات التحويل
                      </p>
                      <Button variant="outline" className="w-full gap-2">
                        <Wand2 className="w-4 h-4" />
                        تحسين
                      </Button>
                    </Card>
                  </div>

                  <Separator />

                  {/* AI Chat Interface */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">محادثة مع المساعد الذكي</h3>
                    <div className="border rounded-lg p-4 bg-muted/30 min-h-[200px] flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Sparkles className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">مرحباً! كيف يمكنني مساعدتك في تصميم متجرك؟</p>
                        <Button className="gap-2">
                          <Sparkles className="w-4 h-4" />
                          ابدأ المحادثة
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThemeStudioPage;