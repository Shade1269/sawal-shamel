import React, { useState, useCallback } from 'react';
import { Palette, Eye, Save, RotateCcw, Download, Upload, Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    ring: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: number;
      scale: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    base: number;
    scale: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duration: number;
    easing: string;
    enabled: boolean;
  };
  layout: {
    maxWidth: string;
    containerPadding: number;
    gridGap: number;
  };
}

interface ThemeBuilderProps {
  currentTheme?: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  onSaveTheme: (theme: ThemeConfig) => void;
  previewMode?: boolean;
  className?: string;
}

const defaultTheme: ThemeConfig = {
  id: 'custom-theme',
  name: 'تصميم مخصص',
  colors: {
    primary: 'hsl(142, 76%, 36%)',
    secondary: 'hsl(210, 40%, 98%)',
    accent: 'hsl(210, 40%, 96%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(210, 40%, 96%)',
    border: 'hsl(214.3, 31.8%, 91.4%)',
    ring: 'hsl(142, 76%, 36%)'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: { base: 16, scale: 1.125 },
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 }
  },
  spacing: { base: 4, scale: 1.5 },
  borderRadius: { sm: 4, md: 6, lg: 8, xl: 12 },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },
  animations: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    enabled: true
  },
  layout: {
    maxWidth: '1200px',
    containerPadding: 24,
    gridGap: 24
  }
};

const presetThemes: ThemeConfig[] = [
  {
    ...defaultTheme,
    id: 'elegant-dark',
    name: 'الأناقة المظلمة',
    colors: {
      primary: 'hsl(262, 83%, 58%)',
      secondary: 'hsl(215, 27.9%, 16.9%)',
      accent: 'hsl(215, 27.9%, 16.9%)',
      background: 'hsl(224, 71.4%, 4.1%)',
      foreground: 'hsl(210, 20%, 98%)',
      muted: 'hsl(215, 27.9%, 16.9%)',
      border: 'hsl(215, 27.9%, 16.9%)',
      ring: 'hsl(262, 83%, 58%)'
    }
  },
  {
    ...defaultTheme,
    id: 'ocean-blue',
    name: 'محيط أزرق',
    colors: {
      primary: 'hsl(221, 83%, 53%)',
      secondary: 'hsl(210, 40%, 98%)',
      accent: 'hsl(210, 40%, 96%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222.2, 84%, 4.9%)',
      muted: 'hsl(210, 40%, 96%)',
      border: 'hsl(214.3, 31.8%, 91.4%)',
      ring: 'hsl(221, 83%, 53%)'
    }
  },
  {
    ...defaultTheme,
    id: 'sunset-orange',
    name: 'غروب برتقالي',
    colors: {
      primary: 'hsl(20, 91%, 48%)',
      secondary: 'hsl(33, 100%, 96%)',
      accent: 'hsl(33, 100%, 94%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222.2, 84%, 4.9%)',
      muted: 'hsl(33, 100%, 96%)',
      border: 'hsl(214.3, 31.8%, 91.4%)',
      ring: 'hsl(20, 91%, 48%)'
    }
  }
];

const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Cairo', value: 'Cairo, sans-serif' },
  { name: 'Tajawal', value: 'Tajawal, sans-serif' },
  { name: 'Almarai', value: 'Almarai, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' }
];

export const ThemeBuilder: React.FC<ThemeBuilderProps> = ({
  currentTheme = defaultTheme,
  onThemeChange,
  onSaveTheme,
  previewMode = false,
  className = ''
}) => {
  const [theme, setTheme] = useState<ThemeConfig>(currentTheme);
  const [activeTab, setActiveTab] = useState('colors');
  const [isGenerating, setIsGenerating] = useState(false);

  // Update theme and notify parent
  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    onThemeChange(newTheme);
  }, [theme, onThemeChange]);

  // Generate AI theme
  const generateAITheme = async () => {
    setIsGenerating(true);
    
    // Simulate AI theme generation
    setTimeout(() => {
      const aiTheme: ThemeConfig = {
        ...defaultTheme,
        id: `ai-generated-${Date.now()}`,
        name: 'تصميم ذكي',
        colors: {
          primary: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
          secondary: 'hsl(210, 40%, 98%)',
          accent: `hsl(${Math.floor(Math.random() * 360)}, 60%, 95%)`,
          background: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222.2, 84%, 4.9%)',
          muted: 'hsl(210, 40%, 96%)',
          border: 'hsl(214.3, 31.8%, 91.4%)',
          ring: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
        },
        borderRadius: {
          sm: Math.floor(Math.random() * 8) + 2,
          md: Math.floor(Math.random() * 12) + 4,
          lg: Math.floor(Math.random() * 16) + 6,
          xl: Math.floor(Math.random() * 20) + 8
        }
      };
      
      updateTheme(aiTheme);
      setIsGenerating(false);
      
      toast({
        title: '✨ تم إنشاء تصميم ذكي',
        description: 'تم إنشاء تصميم مخصص باستخدام الذكاء الاصطناعي'
      });
    }, 2000);
  };

  // Apply preset theme
  const applyPreset = (preset: ThemeConfig) => {
    updateTheme(preset);
    toast({
      title: 'تم تطبيق التصميم',
      description: `تم تطبيق تصميم ${preset.name}`
    });
  };

  // Save current theme
  const saveTheme = () => {
    onSaveTheme(theme);
    toast({
      title: '💾 تم حفظ التصميم',
      description: `تم حفظ تصميم ${theme.name} بنجاح`
    });
  };

  // Export theme as JSON
  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import theme from JSON
  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string);
        updateTheme(importedTheme);
        toast({
          title: 'تم استيراد التصميم',
          description: 'تم تحميل التصميم بنجاح'
        });
      } catch (error) {
        toast({
          title: 'خطأ في الاستيراد',
          description: 'فشل في قراءة ملف التصميم',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">منشئ التصاميم المرئي</CardTitle>
              <CardDescription>
                أنشئ وخصص تصميم متجرك بصرياً
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAITheme}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              ذكاء اصطناعي
            </Button>
            
            <Button variant="outline" size="sm" onClick={exportTheme}>
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="import-theme" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                استيراد
              </label>
            </Button>
            <input
              id="import-theme"
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
            
            <Button onClick={saveTheme}>
              <Save className="h-4 w-4 mr-2" />
              حفظ
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Presets */}
        <div>
          <h3 className="text-lg font-semibold mb-3">تصاميم جاهزة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presetThemes.map((preset) => (
              <motion.div
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
                  onClick={() => applyPreset(preset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{preset.name}</h4>
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: preset.colors.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: preset.colors.secondary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: preset.colors.accent }}
                        />
                      </div>
                    </div>
                    <div 
                      className="h-16 rounded border-2 flex items-center justify-center text-white font-medium"
                      style={{ 
                        backgroundColor: preset.colors.primary,
                        color: preset.colors.background 
                      }}
                    >
                      معاينة التصميم
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Theme Configuration */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">الألوان</TabsTrigger>
            <TabsTrigger value="typography">النصوص</TabsTrigger>
            <TabsTrigger value="layout">التخطيط</TabsTrigger>
            <TabsTrigger value="effects">التأثيرات</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(theme.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">
                    {key === 'primary' && 'اللون الأساسي'}
                    {key === 'secondary' && 'اللون الثانوي'}
                    {key === 'accent' && 'لون التمييز'}
                    {key === 'background' && 'لون الخلفية'}
                    {key === 'foreground' && 'لون النص'}
                    {key === 'muted' && 'لون مكتوم'}
                    {key === 'border' && 'لون الحدود'}
                    {key === 'ring' && 'لون التركيز'}
                  </Label>
                  <div className="flex items-center gap-3">
                    <ColorPicker
                      value={value}
                      onChange={(newValue) =>
                        updateTheme({
                          colors: { ...theme.colors, [key]: newValue }
                        })
                      }
                    />
                    <Input
                      value={value}
                      onChange={(e) =>
                        updateTheme({
                          colors: { ...theme.colors, [key]: e.target.value }
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>نوع الخط</Label>
                <select
                  value={theme.typography.fontFamily}
                  onChange={(e) =>
                    updateTheme({
                      typography: {
                        ...theme.typography,
                        fontFamily: e.target.value
                      }
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>حجم الخط الأساسي: {theme.typography.fontSize.base}px</Label>
                <Slider
                  value={[theme.typography.fontSize.base]}
                  onValueChange={([value]) =>
                    updateTheme({
                      typography: {
                        ...theme.typography,
                        fontSize: { ...theme.typography.fontSize, base: value }
                      }
                    })
                  }
                  min={12}
                  max={24}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>مقياس الحجم: {theme.typography.fontSize.scale}</Label>
                <Slider
                  value={[theme.typography.fontSize.scale]}
                  onValueChange={([value]) =>
                    updateTheme({
                      typography: {
                        ...theme.typography,
                        fontSize: { ...theme.typography.fontSize, scale: value }
                      }
                    })
                  }
                  min={1}
                  max={1.5}
                  step={0.025}
                />
              </div>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>أقصى عرض للمحتوى</Label>
                <Input
                  value={theme.layout.maxWidth}
                  onChange={(e) =>
                    updateTheme({
                      layout: { ...theme.layout, maxWidth: e.target.value }
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>المسافة الداخلية: {theme.layout.containerPadding}px</Label>
                <Slider
                  value={[theme.layout.containerPadding]}
                  onValueChange={([value]) =>
                    updateTheme({
                      layout: { ...theme.layout, containerPadding: value }
                    })
                  }
                  min={8}
                  max={48}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <Label>المسافة بين العناصر: {theme.layout.gridGap}px</Label>
                <Slider
                  value={[theme.layout.gridGap]}
                  onValueChange={([value]) =>
                    updateTheme({
                      layout: { ...theme.layout, gridGap: value }
                    })
                  }
                  min={8}
                  max={48}
                  step={4}
                />
              </div>
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">زوايا التدوير</h4>
                {Object.entries(theme.borderRadius).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">
                      {key === 'sm' && 'صغير'}
                      {key === 'md' && 'متوسط'}
                      {key === 'lg' && 'كبير'}
                      {key === 'xl' && 'كبير جداً'}
                      : {value}px
                    </Label>
                    <Slider
                      value={[value]}
                      onValueChange={([newValue]) =>
                        updateTheme({
                          borderRadius: { ...theme.borderRadius, [key]: newValue }
                        })
                      }
                      min={0}
                      max={24}
                      step={1}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">الحركات والتأثيرات</h4>
                
                <div className="flex items-center justify-between">
                  <Label>تفعيل الحركات</Label>
                  <Switch
                    checked={theme.animations.enabled}
                    onCheckedChange={(enabled) =>
                      updateTheme({
                        animations: { ...theme.animations, enabled }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>سرعة الحركة: {theme.animations.duration}ms</Label>
                  <Slider
                    value={[theme.animations.duration]}
                    onValueChange={([value]) =>
                      updateTheme({
                        animations: { ...theme.animations, duration: value }
                      })
                    }
                    min={100}
                    max={1000}
                    step={50}
                    disabled={!theme.animations.enabled}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Section */}
        {previewMode && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              معاينة التصميم
            </h3>
            
            <div 
              className="space-y-4 p-6 rounded-lg border-2"
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.foreground,
                fontFamily: theme.typography.fontFamily,
                fontSize: `${theme.typography.fontSize.base}px`,
                borderRadius: `${theme.borderRadius.lg}px`
              }}
            >
              <div 
                className="p-4 rounded text-white font-semibold"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: `${theme.borderRadius.md}px`
                }}
              >
                مثال على العنوان الرئيسي
              </div>
              
              <div 
                className="p-4 rounded"
                style={{
                  backgroundColor: theme.colors.secondary,
                  borderRadius: `${theme.borderRadius.sm}px`
                }}
              >
                هذا مثال على المحتوى الثانوي في التصميم
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor: theme.colors.accent,
                    borderRadius: `${theme.borderRadius.sm}px`
                  }}
                >
                  زر عادي
                </button>
                <button 
                  className="px-4 py-2 rounded font-medium text-white"
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: `${theme.borderRadius.sm}px`
                  }}
                >
                  زر أساسي
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeBuilder;