import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedThemes, type ColorPalette } from '@/hooks/useAdvancedThemes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Palette, 
  Wand2, 
  Eye, 
  Save, 
  Download, 
  Upload, 
  RefreshCw,
  Sparkles,
  Crown,
  Zap,
  Heart,
  Star,
  Layers,
  Settings,
  Play,
  Square
} from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedThemeBuilderProps {
  storeId?: string;
  onThemeApplied?: (theme: any) => void;
}

export const AdvancedThemeBuilder: React.FC<AdvancedThemeBuilderProps> = ({
  storeId,
  onThemeApplied
}) => {
  const {
    templates,
    customThemes,
    currentTheme,
    isLoading,
    previewMode,
    fetchTemplates,
    saveCustomTheme,
    applyTemplate,
    previewTheme,
    exitPreview,
    generateSmartPalette,
    categories
  } = useAdvancedThemes(storeId);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customConfig, setCustomConfig] = useState<any>({});
  const [colorPalette, setColorPalette] = useState<ColorPalette>({
    primary: '#0066FF',
    secondary: '#F0F4F8',
    accent: '#0052CC',
    neutral: '#FFFFFF',
    dark: '#1A1D21'
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [themeName, setThemeName] = useState('');

  // تحديث القوالب عند تغيير الفئة
  useEffect(() => {
    fetchTemplates(selectedCategory);
  }, [selectedCategory, fetchTemplates]);

  // توليد لوحة ألوان ذكية
  const handleGenerateSmartPalette = (baseColor: string) => {
    const newPalette = generateSmartPalette(baseColor);
    setColorPalette(newPalette);
    updateCustomConfig('colors', newPalette);
  };

  // تحديث التكوين المخصص
  const updateCustomConfig = (section: string, updates: any) => {
    const newConfig = {
      ...customConfig,
      [section]: {
        ...customConfig[section],
        ...updates
      }
    };
    setCustomConfig(newConfig);
  };

  // معاينة الثيم
  const handlePreview = () => {
    const themeConfig = selectedTemplate ? {
      ...selectedTemplate.theme_config,
      ...customConfig
    } : customConfig;
    
    previewTheme(themeConfig);
  };

  // تطبيق الثيم
  const handleApply = async () => {
    if (!selectedTemplate) {
      toast.error('يرجى اختيار قالب أولاً');
      return;
    }

    const success = await applyTemplate(selectedTemplate.id, customConfig);
    if (success && onThemeApplied) {
      onThemeApplied({
        ...selectedTemplate,
        customizations: customConfig
      });
    }
  };

  // حفظ الثيم المخصص
  const handleSaveCustomTheme = async () => {
    if (!themeName.trim()) {
      toast.error('يرجى إدخال اسم للثيم');
      return;
    }

    const themeConfig = selectedTemplate ? {
      ...selectedTemplate.theme_config,
      ...customConfig
    } : customConfig;

    const saved = await saveCustomTheme(themeName, themeConfig, colorPalette);
    if (saved) {
      setShowSaveDialog(false);
      setThemeName('');
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-primary/5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">منشئ الثيمات المتقدم</h1>
            <p className="text-muted-foreground">صمم متجرك بالطريقة التي تحبها</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {previewMode ? (
            <Button onClick={exitPreview} variant="outline" className="gap-2">
              <Square className="w-4 h-4" />
              إنهاء المعاينة
            </Button>
          ) : (
            <Button onClick={handlePreview} variant="outline" className="gap-2">
              <Play className="w-4 h-4" />
              معاينة
            </Button>
          )}
          
          <Button onClick={handleApply} className="gap-2 bg-gradient-to-r from-primary to-accent">
            <Zap className="w-4 h-4" />
            تطبيق الثيم
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
        {/* Templates Gallery */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              مكتبة القوالب
            </CardTitle>
            <CardDescription>اختر من بين القوالب المصممة بعناية</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Categories Filter */}
            <div className="p-4 border-b">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Templates Grid */}
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-4">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                  ))
                ) : (
                  <AnimatePresence>
                    {templates.map((template) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`relative group cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                          selectedTemplate?.id === template.id
                            ? 'border-primary shadow-lg shadow-primary/20'
                            : 'border-transparent hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="p-4 bg-gradient-to-br from-card to-card/80 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {template.name_ar}
                                {template.is_premium && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {template.description_ar}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryName(template.category)}
                            </Badge>
                          </div>
                          
                          {/* Color Preview */}
                          <div className="flex gap-2 mb-3">
                            {Object.entries(template.color_palette).slice(0, 4).map(([key, color]) => (
                              <div
                                key={key}
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color as string }}
                              />
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">
                                {template.popularity_score}
                              </span>
                            </div>
                            <Badge
                              variant={template.difficulty_level === 'beginner' ? 'default' : 
                                     template.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {getDifficultyName(template.difficulty_level)}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Customization Panel */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              التخصيص المتقدم
            </CardTitle>
            <CardDescription>اضبط التفاصيل حسب ذوقك</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[680px]">
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-4 m-4">
                  <TabsTrigger value="colors" className="text-xs">الألوان</TabsTrigger>
                  <TabsTrigger value="typography" className="text-xs">الخط</TabsTrigger>
                  <TabsTrigger value="layout" className="text-xs">التخطيط</TabsTrigger>
                  <TabsTrigger value="effects" className="text-xs">التأثيرات</TabsTrigger>
                </TabsList>

                <div className="p-4">
                  {/* Colors Tab */}
                  <TabsContent value="colors" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">لوحة الألوان</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateSmartPalette(colorPalette.primary)}
                        className="gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        توليد ذكي
                      </Button>
                    </div>

                    {Object.entries(colorPalette).map(([key, color]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{getColorName(key)}</Label>
                        <div className="flex gap-3">
                          <div
                            className="w-12 h-12 rounded-lg border shadow-sm cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'color';
                              input.value = color;
                              input.onchange = (e) => {
                                const newColor = (e.target as HTMLInputElement).value;
                                const newPalette = { ...colorPalette, [key]: newColor };
                                setColorPalette(newPalette);
                                updateCustomConfig('colors', newPalette);
                              };
                              input.click();
                            }}
                          />
                          <Input
                            value={color}
                            onChange={(e) => {
                              const newPalette = { ...colorPalette, [key]: e.target.value };
                              setColorPalette(newPalette);
                              updateCustomConfig('colors', newPalette);
                            }}
                            className="font-mono"
                          />
                        </div>
                      </div>
                    ))}

                    <Separator />
                    
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleGenerateSmartPalette(colorPalette.primary)}
                    >
                      <Sparkles className="w-4 h-4" />
                      إنشاء لوحة متناسقة
                    </Button>
                  </TabsContent>

                  {/* Typography Tab */}
                  <TabsContent value="typography" className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold">الخط الأساسي</Label>
                      <Select
                        value={customConfig.typography?.fontFamily || 'Inter'}
                        onValueChange={(value) => updateCustomConfig('typography', { fontFamily: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter (عصري)</SelectItem>
                          <SelectItem value="Roboto">Roboto (واضح)</SelectItem>
                          <SelectItem value="Playfair Display">Playfair Display (أنيق)</SelectItem>
                          <SelectItem value="Cairo">Cairo (عربي)</SelectItem>
                          <SelectItem value="Amiri">Amiri (تراثي)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-semibold">خط العناوين</Label>
                      <Select
                        value={customConfig.typography?.headingFont || 'Inter'}
                        onValueChange={(value) => updateCustomConfig('typography', { headingFont: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Amiri">Amiri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-semibold">
                        حجم الخط الأساسي: {customConfig.typography?.fontSize || '16'}px
                      </Label>
                      <Slider
                        value={[customConfig.typography?.fontSize || 16]}
                        onValueChange={([value]) => updateCustomConfig('typography', { fontSize: value })}
                        min={12}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </TabsContent>

                  {/* Layout Tab */}
                  <TabsContent value="layout" className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold">
                        استدارة الزوايا: {customConfig.layout?.borderRadius || '8'}px
                      </Label>
                      <Slider
                        value={[parseInt(customConfig.layout?.borderRadius?.replace('px', '') || '8')]}
                        onValueChange={([value]) => updateCustomConfig('layout', { borderRadius: `${value}px` })}
                        min={0}
                        max={24}
                        step={2}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-semibold">التباعد</Label>
                      <Select
                        value={customConfig.layout?.spacing || 'medium'}
                        onValueChange={(value) => updateCustomConfig('layout', { spacing: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tight">ضيق</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="comfortable">مريح</SelectItem>
                          <SelectItem value="spacious">واسع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-semibold">نمط البطاقات</Label>
                      <Select
                        value={customConfig.layout?.cardStyle || 'elevated'}
                        onValueChange={(value) => updateCustomConfig('layout', { cardStyle: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">مسطح</SelectItem>
                          <SelectItem value="elevated">مرتفع</SelectItem>
                          <SelectItem value="outlined">محدد</SelectItem>
                          <SelectItem value="luxury">فاخر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Effects Tab */}
                  <TabsContent value="effects" className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold">الظلال</Label>
                      <Select
                        value={customConfig.effects?.shadows || 'subtle'}
                        onValueChange={(value) => updateCustomConfig('effects', { shadows: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">بدون</SelectItem>
                          <SelectItem value="subtle">خفيف</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="strong">قوي</SelectItem>
                          <SelectItem value="elegant">أنيق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-semibold">الحركات</Label>
                      <Select
                        value={customConfig.effects?.animations || 'smooth'}
                        onValueChange={(value) => updateCustomConfig('effects', { animations: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">بدون</SelectItem>
                          <SelectItem value="gentle">هادئ</SelectItem>
                          <SelectItem value="smooth">سلس</SelectItem>
                          <SelectItem value="dynamic">ديناميكي</SelectItem>
                          <SelectItem value="luxurious">فاخر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">التدرجات اللونية</Label>
                      <Switch
                        checked={customConfig.effects?.gradients !== false}
                        onCheckedChange={(checked) => updateCustomConfig('effects', { gradients: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">تأثيرات التمرير</Label>
                      <Switch
                        checked={customConfig.effects?.hoverEffects !== false}
                        onCheckedChange={(checked) => updateCustomConfig('effects', { hoverEffects: checked })}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Preview & Actions */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              المعاينة والحفظ
            </CardTitle>
            <CardDescription>شاهد النتيجة النهائية واحفظ إبداعك</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Preview Area */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">معاينة سريعة</Label>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 space-y-4">
                <div
                  className="h-8 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.accent})` 
                  }}
                />
                <div className="space-y-2">
                  <div 
                    className="h-4 w-3/4 rounded"
                    style={{ backgroundColor: colorPalette.secondary }}
                  />
                  <div 
                    className="h-4 w-1/2 rounded"
                    style={{ backgroundColor: colorPalette.neutral }}
                  />
                </div>
                <div className="flex gap-2">
                  {Object.values(colorPalette).slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    حفظ كثيم مخصص
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>حفظ الثيم المخصص</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>اسم الثيم</Label>
                      <Input
                        value={themeName}
                        onChange={(e) => setThemeName(e.target.value)}
                        placeholder="ثيمي الرائع"
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSaveCustomTheme} className="flex-1">
                        حفظ
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSaveDialog(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                تصدير الثيم
              </Button>

              <Button variant="outline" className="w-full gap-2">
                <Upload className="w-4 h-4" />
                استيراد ثيم
              </Button>
            </div>

            <Separator />

            {/* Selected Template Info */}
            {selectedTemplate && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">القالب المحدد</Label>
                <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedTemplate.name_ar}</span>
                    {selectedTemplate.is_premium && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description_ar}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{selectedTemplate.popularity_score} نقطة</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper functions
const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {
    modern: 'عصري',
    luxury: 'فاخر',
    nature: 'طبيعي',
    minimalist: 'بسيط',
    classic: 'كلاسيكي',
    bold: 'جريء'
  };
  return names[category] || category;
};

const getDifficultyName = (level: string): string => {
  const names: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم'
  };
  return names[level] || level;
};

const getColorName = (key: string): string => {
  const names: Record<string, string> = {
    primary: 'الأساسي',
    secondary: 'الثانوي',
    accent: 'المميز',
    neutral: 'المحايد',
    dark: 'الداكن',
    success: 'النجاح',
    warning: 'التحذير',
    error: 'الخطأ'
  };
  return names[key] || key;
};

export default AdvancedThemeBuilder;