import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';

export const VisualThemeEditor: React.FC = () => {
  const [themeConfig, setThemeConfig] = React.useState({
    // Color Palette
    colors: {
      primary: '#0066FF',
      secondary: '#F0F4F8',
      accent: '#0052CC',
      background: '#FFFFFF',
      foreground: '#1A1D21',
      muted: '#F8FAFC',
      border: '#E2E8F0'
    },
    
    // Typography
    typography: {
      fontFamily: 'system-ui',
      fontSize: {
        base: 16,
        scale: 1.25
      },
      lineHeight: 1.6,
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    
    // Layout
    layout: {
      containerWidth: '1200px',
      spacing: 16,
      borderRadius: 8,
      shadows: true
    },
    
    // Animation
    animation: {
      enabled: true,
      duration: 0.3,
      easing: 'ease-in-out'
    }
  });

  const colorPresets = [
    { name: 'افتراضي', colors: { primary: '#0066FF', secondary: '#F0F4F8', accent: '#0052CC' } },
    { name: 'أخضر طبيعي', colors: { primary: '#10B981', secondary: '#ECFDF5', accent: '#059669' } },
    { name: 'بنفسجي ملكي', colors: { primary: '#8B5CF6', secondary: '#F3E8FF', accent: '#7C3AED' } },
    { name: 'برتقالي حيوي', colors: { primary: '#F59E0B', secondary: '#FEF3C7', accent: '#D97706' } },
    { name: 'وردي أنثوي', colors: { primary: '#EC4899', secondary: '#FCE7F3', accent: '#DB2777' } }
  ];

  const fontOptions = [
    { value: 'system-ui', label: 'النظام الافتراضي' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Cairo', label: 'Cairo (عربي)' },
    { value: 'Tajawal', label: 'Tajawal (عربي)' }
  ];

  const updateColor = (colorKey: string, value: string) => {
    setThemeConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const applyColorPreset = (preset: any) => {
    setThemeConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...preset.colors
      }
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          محرر الثيمات المرئي
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          خصص مظهر صفحتك بالكامل
        </p>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="text-xs">
            <Palette className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="typography" className="text-xs">
            <Type className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">
            <Layout className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-xs">
            <Sparkles className="w-3 h-3" />
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          {/* Color Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">الألوان المحفوظة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {colorPresets.map((preset, index) => (
                <motion.div
                  key={preset.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => applyColorPreset(preset)}
                  >
                    <span className="text-xs">{preset.name}</span>
                    <div className="flex gap-1">
                      {Object.values(preset.colors).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">الألوان المخصصة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(themeConfig.colors).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-xs capitalize">{key}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">الخطوط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">عائلة الخط</Label>
                <Select 
                  value={themeConfig.typography.fontFamily} 
                  onValueChange={(value) => setThemeConfig(prev => ({
                    ...prev,
                    typography: { ...prev.typography, fontFamily: value }
                  }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">الحجم الأساسي</Label>
                <Slider
                  value={[themeConfig.typography.fontSize.base]}
                  onValueChange={(value) => setThemeConfig(prev => ({
                    ...prev,
                    typography: {
                      ...prev.typography,
                      fontSize: { ...prev.typography.fontSize, base: value[0] }
                    }
                  }))}
                  min={12}
                  max={24}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {themeConfig.typography.fontSize.base}px
                </div>
              </div>

              <div>
                <Label className="text-xs">مقياس الحجم</Label>
                <Slider
                  value={[themeConfig.typography.fontSize.scale]}
                  onValueChange={(value) => setThemeConfig(prev => ({
                    ...prev,
                    typography: {
                      ...prev.typography,
                      fontSize: { ...prev.typography.fontSize, scale: value[0] }
                    }
                  }))}
                  min={1.1}
                  max={1.5}
                  step={0.05}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {themeConfig.typography.fontSize.scale}x
                </div>
              </div>

              <div>
                <Label className="text-xs">ارتفاع السطر</Label>
                <Slider
                  value={[themeConfig.typography.lineHeight]}
                  onValueChange={(value) => setThemeConfig(prev => ({
                    ...prev,
                    typography: { ...prev.typography, lineHeight: value[0] }
                  }))}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {themeConfig.typography.lineHeight}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">التخطيط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">عرض الحاوية</Label>
                <Input
                  value={themeConfig.layout.containerWidth}
                  onChange={(e) => setThemeConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, containerWidth: e.target.value }
                  }))}
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">المسافات</Label>
                <Slider
                  value={[themeConfig.layout.spacing]}
                  onValueChange={(value) => setThemeConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, spacing: value[0] }
                  }))}
                  min={4}
                  max={32}
                  step={2}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {themeConfig.layout.spacing}px
                </div>
              </div>

              <div>
                <Label className="text-xs">انحناء الزوايا</Label>
                <Slider
                  value={[themeConfig.layout.borderRadius]}
                  onValueChange={(value) => setThemeConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, borderRadius: value[0] }
                  }))}
                  min={0}
                  max={24}
                  step={1}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {themeConfig.layout.borderRadius}px
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">الظلال</Label>
                <Switch
                  checked={themeConfig.layout.shadows}
                  onCheckedChange={(checked) => setThemeConfig(prev => ({
                    ...prev,
                    layout: { ...prev.layout, shadows: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">التأثيرات والحركة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">تفعيل الحركة</Label>
                <Switch
                  checked={themeConfig.animation.enabled}
                  onCheckedChange={(checked) => setThemeConfig(prev => ({
                    ...prev,
                    animation: { ...prev.animation, enabled: checked }
                  }))}
                />
              </div>

              {themeConfig.animation.enabled && (
                <>
                  <div>
                    <Label className="text-xs">مدة الحركة</Label>
                    <Slider
                      value={[themeConfig.animation.duration]}
                      onValueChange={(value) => setThemeConfig(prev => ({
                        ...prev,
                        animation: { ...prev.animation, duration: value[0] }
                      }))}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {themeConfig.animation.duration}s
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">نوع الحركة</Label>
                    <Select 
                      value={themeConfig.animation.easing} 
                      onValueChange={(value) => setThemeConfig(prev => ({
                        ...prev,
                        animation: { ...prev.animation, easing: value }
                      }))}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ease">سهل</SelectItem>
                        <SelectItem value="ease-in">دخول سهل</SelectItem>
                        <SelectItem value="ease-out">خروج سهل</SelectItem>
                        <SelectItem value="ease-in-out">دخول وخروج سهل</SelectItem>
                        <SelectItem value="linear">خطي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1 text-xs gap-1">
          <Save className="w-4 h-4" />
          حفظ الثيم
        </Button>
        <Button variant="outline" className="text-xs">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="text-xs">
          <Upload className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="text-xs">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};