import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Wand2, 
  RefreshCw, 
  Copy, 
  Download,
  Sparkles,
  Eye,
  Heart,
  Star,
  ChevronRight,
  Shuffle,
  Camera,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  dark: string;
  success?: string;
  warning?: string;
  error?: string;
}

interface SmartColorPaletteProps {
  initialPalette?: ColorPalette;
  onPaletteChange?: (palette: ColorPalette) => void;
  showAISuggestions?: boolean;
}

export const SmartColorPalette: React.FC<SmartColorPaletteProps> = ({
  initialPalette,
  onPaletteChange,
  showAISuggestions = true
}) => {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(
    initialPalette || {
      primary: '#0066FF',
      secondary: '#F0F4F8',
      accent: '#0052CC',
      neutral: '#FFFFFF',
      dark: '#1A1D21',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  );

  const [suggestedPalettes, setSuggestedPalettes] = useState<ColorPalette[]>([]);
  const [harmonies, setHarmonies] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHarmony, setSelectedHarmony] = useState<string>('complementary');

  // تحديث اللون
  const updateColor = (key: keyof ColorPalette, color: string) => {
    const newPalette = { ...currentPalette, [key]: color };
    setCurrentPalette(newPalette);
    onPaletteChange?.(newPalette);
  };

  // توليد لوحة ألوان ذكية
  const generateSmartPalette = async (baseColor?: string, harmony?: string) => {
    setIsGenerating(true);
    try {
      const base = baseColor || currentPalette.primary;
      const harmonyType = harmony || selectedHarmony;
      
      const newPalette = generateHarmoniousPalette(base, harmonyType);
      setCurrentPalette(newPalette);
      onPaletteChange?.(newPalette);
      
      toast.success('تم توليد لوحة ألوان جديدة');
    } catch (error) {
      toast.error('خطأ في توليد الألوان');
    } finally {
      setIsGenerating(false);
    }
  };

  // توليد اقتراحات AI
  const generateAISuggestions = async () => {
    setIsGenerating(true);
    try {
      const suggestions: ColorPalette[] = [];
      const baseColor = currentPalette.primary;
      
      // توليد مجموعة من الألوان المتناسقة
      const harmonies = ['analogous', 'triadic', 'tetradic', 'monochromatic'];
      
      for (const harmony of harmonies) {
        const palette = generateHarmoniousPalette(baseColor, harmony);
        suggestions.push(palette);
      }
      
      setSuggestedPalettes(suggestions);
      toast.success('تم توليد اقتراحات جديدة');
    } catch (error) {
      toast.error('خطأ في توليد الاقتراحات');
    } finally {
      setIsGenerating(false);
    }
  };

  // استخراج الألواح من صورة
  const extractFromImage = async (imageFile: File) => {
    try {
      const imageUrl = URL.createObjectURL(imageFile);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // استخراج الألوان الأساسية
        const colors = extractDominantColors(ctx!, canvas.width, canvas.height);
        const palette = createPaletteFromColors(colors);
        
        setCurrentPalette(palette);
        onPaletteChange?.(palette);
        toast.success('تم استخراج الألوان من الصورة');
        
        URL.revokeObjectURL(imageUrl);
      };
      
      img.src = imageUrl;
    } catch (error) {
      toast.error('خطأ في معالجة الصورة');
    }
  };

  // نسخ اللوحة
  const copyPalette = () => {
    const paletteText = Object.entries(currentPalette)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    navigator.clipboard.writeText(paletteText);
    toast.success('تم نسخ اللوحة');
  };

  // تصدير اللوحة
  const exportPalette = () => {
    const blob = new Blob([JSON.stringify(currentPalette, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير اللوحة');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-icon-wrapper">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">لوحة الألوان الذكية</h3>
            <p className="text-sm text-muted-foreground">اختر ألوان متناسقة لمتجرك</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyPalette} className="gap-2">
            <Copy className="w-4 h-4" />
            نسخ
          </Button>
          <Button size="sm" variant="outline" onClick={exportPalette} className="gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">المحرر</TabsTrigger>
          <TabsTrigger value="harmony">التناغم</TabsTrigger>
          <TabsTrigger value="suggestions">الاقتراحات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        {/* Color Editor */}
        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                محرر الألوان
              </CardTitle>
              <CardDescription>انقر على أي لون لتعديله</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Primary Colors */}
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">الألوان الأساسية</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(currentPalette).slice(0, 5).map(([key, color]) => (
                      <ColorEditor
                        key={key}
                        label={getColorLabel(key)}
                        color={color}
                        onChange={(newColor) => updateColor(key as keyof ColorPalette, newColor)}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* System Colors */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">ألوان النظام</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(currentPalette).slice(5).map(([key, color]) => (
                      <ColorEditor
                        key={key}
                        label={getColorLabel(key)}
                        color={color || '#000000'}
                        onChange={(newColor) => updateColor(key as keyof ColorPalette, newColor)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button
                  size="sm"
                  onClick={() => generateSmartPalette()}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  توليد ذكي
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateSmartPalette(getRandomColor())}
                  className="gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  عشوائي
                </Button>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && extractFromImage(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  من صورة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Color Preview */}
          <ColorPreview palette={currentPalette} />
        </TabsContent>

        {/* Color Harmony */}
        <TabsContent value="harmony" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نظريات التناغم اللوني</CardTitle>
              <CardDescription>اختر نوع التناغم المناسب لتصميمك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'complementary', name: 'متكامل', description: 'ألوان متقابلة على العجلة' },
                  { key: 'analogous', name: 'متشابه', description: 'ألوان متجاورة على العجلة' },
                  { key: 'triadic', name: 'ثلاثي', description: 'ثلاثة ألوان متباعدة بانتظام' },
                  { key: 'monochromatic', name: 'أحادي', description: 'درجات مختلفة من لون واحد' }
                ].map((harmony) => (
                  <div
                    key={harmony.key}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedHarmony === harmony.key
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedHarmony(harmony.key);
                      generateSmartPalette(currentPalette.primary, harmony.key);
                    }}
                  >
                    <h4 className="font-semibold mb-2">{harmony.name}</h4>
                    <p className="text-sm text-muted-foreground">{harmony.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">اقتراحات ذكية</h3>
            <Button
              onClick={generateAISuggestions}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              اقتراحات جديدة
            </Button>
          </div>

          <div className="grid gap-4">
            {suggestedPalettes.length === 0 ? (
              <Card className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">لا توجد اقتراحات بعد</h3>
                <p className="text-muted-foreground mb-4">انقر على "اقتراحات جديدة" لتوليد لوحات ملونة</p>
                <Button onClick={generateAISuggestions} disabled={isGenerating}>
                  توليد الآن
                </Button>
              </Card>
            ) : (
              suggestedPalettes.map((palette, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {Object.values(palette).slice(0, 5).map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">لوحة {index + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            مناسبة للتصاميم {getThemeDescription(index)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setCurrentPalette(palette);
                            onPaletteChange?.(palette);
                            toast.success('تم تطبيق اللوحة');
                          }}
                        >
                          تطبيق
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Color Analysis */}
        <TabsContent value="analysis" className="space-y-4">
          <ColorAnalysis palette={currentPalette} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// مكون محرر اللون الفردي
const ColorEditor: React.FC<{
  label: string;
  color: string;
  onChange: (color: string) => void;
}> = ({ label, color, onChange }) => {
  const [inputValue, setInputValue] = useState(color);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setInputValue(newColor);
    if (isValidColor(newColor)) {
      onChange(newColor);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <div
          className="w-10 h-10 rounded-lg border shadow-sm cursor-pointer"
          style={{ backgroundColor: color }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = color;
            input.onchange = (e) => {
              const newColor = (e.target as HTMLInputElement).value;
              handleColorChange(newColor);
            };
            input.click();
          }}
        />
        <Input
          value={inputValue}
          onChange={(e) => handleColorChange(e.target.value)}
          className="font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// مكون معاينة الألوان
const ColorPreview: React.FC<{ palette: ColorPalette }> = ({ palette }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          معاينة الألوان
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Color Swatches */}
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(palette).slice(0, 5).map(([key, color]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full h-20 rounded-lg shadow-sm mb-2"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs font-medium">{getColorLabel(key)}</p>
                <p className="text-xs text-muted-foreground font-mono">{color}</p>
              </div>
            ))}
          </div>

          {/* Sample Design */}
          <div className="mt-6 p-4 rounded-lg border">
            <div className="text-center mb-4">
              <h4 className="font-semibold mb-2">مثال على التطبيق</h4>
            </div>
            <div
              className="h-32 rounded-lg flex items-center justify-center text-primary-foreground font-semibold"
              style={{ 
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`
              }}
            >
              عنوان رئيسي
            </div>
            <div className="flex gap-2 mt-4">
              <div
                className="flex-1 h-8 rounded flex items-center justify-center text-primary-foreground text-sm"
                style={{ backgroundColor: palette.primary }}
              >
                زر أساسي
              </div>
              <div
                className="flex-1 h-8 rounded flex items-center justify-center text-sm border"
                style={{ 
                  backgroundColor: palette.secondary,
                  borderColor: palette.primary,
                  color: palette.primary
                }}
              >
                زر ثانوي
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// مكون تحليل الألوان
const ColorAnalysis: React.FC<{ palette: ColorPalette }> = ({ palette }) => {
  const getContrastRatio = (color1: string, color2: string): number => {
    // حساب نسبة التباين (مبسط)
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const contrastRatio = getContrastRatio(palette.primary, palette.neutral);
  const isAccessible = contrastRatio >= 4.5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل لوحة الألوان</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accessibility */}
        <div className="p-4 rounded-lg bg-muted/30">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            إمكانية الوصول
          </h4>
          <div className="flex items-center justify-between">
            <span>نسبة التباين</span>
            <Badge variant={isAccessible ? "default" : "destructive"}>
              {contrastRatio.toFixed(2)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isAccessible 
              ? '✅ الألوان متوافقة مع معايير الوصول'
              : '⚠️ يُنصح بزيادة التباين للوضوح'
            }
          </p>
        </div>

        {/* Color Harmony */}
        <div className="p-4 rounded-lg bg-muted/30">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" />
            التناغم اللوني
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>درجة الحرارة</span>
              <Badge variant="secondary">
                {getColorTemperature(palette.primary)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>التشبع</span>
              <Badge variant="secondary">
                {getSaturationLevel(palette.primary)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Usage Recommendations */}
        <div className="p-4 rounded-lg bg-muted/30">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            توصيات الاستخدام
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• استخدم اللون الأساسي للعناصر المهمة فقط</li>
            <li>• اللون الثانوي مناسب للخلفيات والمساحات الكبيرة</li>
            <li>• اللون المميز للتفاعلات والإشعارات</li>
            <li>• تأكد من وضوح النص على جميع الخلفيات</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
const getColorLabel = (key: string): string => {
  const labels: Record<string, string> = {
    primary: 'الأساسي',
    secondary: 'الثانوي',
    accent: 'المميز',
    neutral: 'المحايد',
    dark: 'الداكن',
    success: 'النجاح',
    warning: 'التحذير',
    error: 'الخطأ'
  };
  return labels[key] || key;
};

const isValidColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getRandomColor = (): string => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

const generateHarmoniousPalette = (baseColor: string, harmony: string): ColorPalette => {
  const hsl = hexToHsl(baseColor);
  
  switch (harmony) {
    case 'complementary':
      return {
        primary: baseColor,
        secondary: hslToHex((hsl.h + 180) % 360, Math.max(hsl.s - 30, 10), Math.min(hsl.l + 40, 95)),
        accent: hslToHex((hsl.h + 180) % 360, hsl.s, Math.max(hsl.l - 10, 20)),
        neutral: hslToHex(hsl.h, Math.max(hsl.s - 50, 5), 95),
        dark: hslToHex(hsl.h, Math.min(hsl.s + 10, 20), 15),
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      };
    case 'analogous':
      return {
        primary: baseColor,
        secondary: hslToHex((hsl.h + 30) % 360, Math.max(hsl.s - 20, 10), Math.min(hsl.l + 30, 90)),
        accent: hslToHex((hsl.h - 30 + 360) % 360, hsl.s, Math.max(hsl.l - 10, 20)),
        neutral: hslToHex(hsl.h, Math.max(hsl.s - 40, 5), 95),
        dark: hslToHex(hsl.h, Math.min(hsl.s + 10, 20), 15),
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      };
    case 'triadic':
      return {
        primary: baseColor,
        secondary: hslToHex((hsl.h + 120) % 360, Math.max(hsl.s - 20, 10), Math.min(hsl.l + 30, 90)),
        accent: hslToHex((hsl.h + 240) % 360, hsl.s, Math.max(hsl.l - 10, 20)),
        neutral: hslToHex(hsl.h, Math.max(hsl.s - 40, 5), 95),
        dark: hslToHex(hsl.h, Math.min(hsl.s + 10, 20), 15),
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      };
    default: // monochromatic
      return {
        primary: baseColor,
        secondary: hslToHex(hsl.h, Math.max(hsl.s - 20, 10), Math.min(hsl.l + 30, 90)),
        accent: hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 15, 20)),
        neutral: hslToHex(hsl.h, Math.max(hsl.s - 50, 5), 95),
        dark: hslToHex(hsl.h, Math.min(hsl.s + 5, 20), 15),
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      };
  }
};

const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const extractDominantColors = (ctx: CanvasRenderingContext2D, width: number, height: number): string[] => {
  // استخراج مبسط للألوان الأساسية
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const colorMap = new Map();
  
  // عينة كل 10 بكسل لتحسين الأداء
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    colorMap.set(color, (colorMap.get(color) || 0) + 1);
  }
  
  // ترتيب الألوان حسب التكرار
  return Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);
};

const createPaletteFromColors = (colors: string[]): ColorPalette => {
  return {
    primary: colors[0] || '#0066FF',
    secondary: colors[1] || '#F0F4F8',
    accent: colors[2] || '#0052CC',
    neutral: colors[3] || '#FFFFFF',
    dark: colors[4] || '#1A1D21',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444'
  };
};

const getThemeDescription = (index: number): string => {
  const descriptions = ['العصرية', 'الكلاسيكية', 'الطبيعية', 'الفاخرة'];
  return descriptions[index] || 'المتنوعة';
};

const getColorTemperature = (color: string): string => {
  const hsl = hexToHsl(color);
  if (hsl.h >= 0 && hsl.h < 60) return 'دافئ';
  if (hsl.h >= 60 && hsl.h < 180) return 'بارد';
  if (hsl.h >= 180 && hsl.h < 240) return 'بارد';
  return 'دافئ';
};

const getSaturationLevel = (color: string): string => {
  const hsl = hexToHsl(color);
  if (hsl.s < 30) return 'منخفض';
  if (hsl.s < 70) return 'متوسط';
  return 'عالي';
};

export default SmartColorPalette;