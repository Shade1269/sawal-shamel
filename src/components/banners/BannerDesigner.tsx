import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Settings, 
  Play,
  Save,
  Eye,
  Copy,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Layout
} from 'lucide-react';

interface BannerDesign {
  id?: string;
  template: string;
  size: string;
  backgroundColor: string;
  backgroundImage?: string;
  text: {
    title: string;
    subtitle: string;
    cta: string;
  };
  colors: {
    title: string;
    subtitle: string;
    cta: string;
    ctaBackground: string;
  };
  fonts: {
    titleSize: number;
    subtitleSize: number;
    ctaSize: number;
    titleWeight: string;
    subtitleWeight: string;
  };
  animation: {
    enabled: boolean;
    type: string;
    duration: number;
    delay: number;
  };
  positioning: {
    textAlign: string;
    verticalAlign: string;
    padding: number;
  };
  effects: {
    shadow: boolean;
    blur: number;
    opacity: number;
  };
}

const BANNER_TEMPLATES = [
  {
    id: 'modern-gradient',
    name: 'متدرج عصري',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'gradient'
  },
  {
    id: 'elegant-dark',
    name: 'أنيق داكن',
    preview: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    category: 'dark'
  },
  {
    id: 'warm-sunset',
    name: 'غروب دافئ',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    category: 'warm'
  },
  {
    id: 'ocean-breeze',
    name: 'نسيم المحيط',
    preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    category: 'fresh'
  },
  {
    id: 'royal-purple',
    name: 'بنفسجي ملكي',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'luxury'
  },
  {
    id: 'golden-hour',
    name: 'الساعة الذهبية',
    preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    category: 'warm'
  }
];

const BANNER_SIZES = [
  { id: 'hero', name: 'Hero Banner', width: 1200, height: 400 },
  { id: 'wide', name: 'Wide Banner', width: 1000, height: 300 },
  { id: 'square', name: 'Square Banner', width: 500, height: 500 },
  { id: 'vertical', name: 'Vertical Banner', width: 300, height: 600 },
  { id: 'mobile', name: 'Mobile Banner', width: 375, height: 200 },
  { id: 'story', name: 'Story Banner', width: 375, height: 667 }
];

const ANIMATION_TYPES = [
  { id: 'none', name: 'بدون حركة' },
  { id: 'fadeIn', name: 'ظهور تدريجي' },
  { id: 'slideInLeft', name: 'انزلاق من اليسار' },
  { id: 'slideInRight', name: 'انزلاق من اليمين' },
  { id: 'slideInUp', name: 'انزلاق من الأسفل' },
  { id: 'zoomIn', name: 'تكبير' },
  { id: 'bounceIn', name: 'ارتداد' },
  { id: 'pulse', name: 'نبضة' },
  { id: 'shake', name: 'اهتزاز' },
  { id: 'glow', name: 'توهج' }
];

interface BannerDesignerProps {
  onSave?: (design: BannerDesign) => void;
  initialDesign?: Partial<BannerDesign>;
  storeId?: string;
}

export const BannerDesigner: React.FC<BannerDesignerProps> = ({
  onSave,
  initialDesign,
  storeId
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [design, setDesign] = useState<BannerDesign>({
    template: 'modern-gradient',
    size: 'hero',
    backgroundColor: '#667eea',
    text: {
      title: 'عنوان البنر الرئيسي',
      subtitle: 'نص فرعي يشرح العرض أو المنتج',
      cta: 'تسوق الآن'
    },
    colors: {
      title: '#ffffff',
      subtitle: '#f0f0f0',
      cta: '#ffffff',
      ctaBackground: '#ff6b6b'
    },
    fonts: {
      titleSize: 32,
      subtitleSize: 18,
      ctaSize: 16,
      titleWeight: 'bold',
      subtitleWeight: 'normal'
    },
    animation: {
      enabled: false,
      type: 'fadeIn',
      duration: 1000,
      delay: 0
    },
    positioning: {
      textAlign: 'center',
      verticalAlign: 'center',
      padding: 40
    },
    effects: {
      shadow: true,
      blur: 0,
      opacity: 100
    },
    ...initialDesign
  });

  const [activeTab, setActiveTab] = useState('template');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const selectedSize = BANNER_SIZES.find(s => s.id === design.size);
  const selectedTemplate = BANNER_TEMPLATES.find(t => t.id === design.template);

  const updateDesign = (path: string, value: any) => {
    setDesign(prev => {
      const newDesign = { ...prev };
      const keys = path.split('.');
      let current = newDesign as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newDesign;
    });
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(design);
      toast.success('تم حفظ تصميم البنر بنجاح!');
    }
  };

  const exportDesign = () => {
    const dataStr = JSON.stringify(design, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'banner-design.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('تم تصدير التصميم بنجاح!');
  };

  const importDesign = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedDesign = JSON.parse(e.target?.result as string);
          setDesign({ ...design, ...importedDesign });
          toast.success('تم استيراد التصميم بنجاح!');
        } catch (error) {
          toast.error('خطأ في استيراد التصميم');
        }
      };
      reader.readAsText(file);
    }
  };

  const generateBannerStyles = (): React.CSSProperties => {
    const template = BANNER_TEMPLATES.find(t => t.id === design.template);
    
    return {
      width: selectedSize?.width || 1200,
      height: selectedSize?.height || 400,
      background: template?.preview || design.backgroundColor,
      backgroundImage: design.backgroundImage ? `url(${design.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      display: 'flex',
      alignItems: design.positioning.verticalAlign === 'center' ? 'center' : 
                 design.positioning.verticalAlign === 'top' ? 'flex-start' : 'flex-end',
      justifyContent: design.positioning.textAlign === 'center' ? 'center' :
                     design.positioning.textAlign === 'left' ? 'flex-start' : 'flex-end',
      padding: design.positioning.padding,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: design.effects.shadow ? '0 20px 40px rgba(0,0,0,0.15)' : 'none',
      filter: `blur(${design.effects.blur}px) opacity(${design.effects.opacity}%)`,
      transform: isPreviewMode && design.animation.enabled ? 'scale(1)' : 'scale(1)',
      transition: 'all 0.3s ease'
    };
  };

  const generateAnimationCSS = () => {
    if (!design.animation.enabled || design.animation.type === 'none') return '';
    
    const keyframes = {
      fadeIn: 'opacity: 0; animation: fadeIn 1s ease forwards;',
      slideInLeft: 'transform: translateX(-100%); animation: slideInLeft 1s ease forwards;',
      slideInRight: 'transform: translateX(100%); animation: slideInRight 1s ease forwards;',
      slideInUp: 'transform: translateY(100%); animation: slideInUp 1s ease forwards;',
      zoomIn: 'transform: scale(0); animation: zoomIn 1s ease forwards;',
      bounceIn: 'animation: bounceIn 1s ease forwards;',
      pulse: 'animation: pulse 2s infinite;',
      shake: 'animation: shake 0.5s infinite;',
      glow: 'animation: glow 2s infinite;'
    };
    
    return keyframes[design.animation.type as keyof typeof keyframes] || '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Preview Panel */}
      <div className="order-2 lg:order-1">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              معاينة البنر
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Play className="h-4 w-4 mr-2" />
                {isPreviewMode ? 'إيقاف' : 'تشغيل'} المعاينة
              </Button>
              <Button variant="outline" size="sm" onClick={exportDesign}>
                <Download className="h-4 w-4" />
              </Button>
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importDesign}
                  className="hidden"
                />
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[300px]">
              <div
                ref={canvasRef}
                style={generateBannerStyles()}
                className={`relative ${isPreviewMode && design.animation.enabled ? 'animate-pulse' : ''}`}
              >
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg" />
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  <h1
                    style={{
                      fontSize: `${design.fonts.titleSize}px`,
                      fontWeight: design.fonts.titleWeight,
                      color: design.colors.title,
                      marginBottom: '16px',
                      textShadow: design.effects.shadow ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {design.text.title}
                  </h1>
                  
                  <p
                    style={{
                      fontSize: `${design.fonts.subtitleSize}px`,
                      fontWeight: design.fonts.subtitleWeight,
                      color: design.colors.subtitle,
                      marginBottom: '24px',
                      textShadow: design.effects.shadow ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {design.text.subtitle}
                  </p>
                  
                  <button
                    style={{
                      fontSize: `${design.fonts.ctaSize}px`,
                      color: design.colors.cta,
                      backgroundColor: design.colors.ctaBackground,
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: design.effects.shadow ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {design.text.cta}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Banner Info */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {selectedSize?.name} ({selectedSize?.width}x{selectedSize?.height})
              </Badge>
              <Badge variant="outline">
                {selectedTemplate?.name}
              </Badge>
              {design.animation.enabled && (
                <Badge variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {ANIMATION_TYPES.find(a => a.id === design.animation.type)?.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="order-1 lg:order-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              أدوات التصميم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="template">قوالب</TabsTrigger>
                <TabsTrigger value="text">نصوص</TabsTrigger>
                <TabsTrigger value="colors">ألوان</TabsTrigger>
                <TabsTrigger value="effects">تأثيرات</TabsTrigger>
                <TabsTrigger value="animation">حركة</TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="template" className="space-y-4">
                <div>
                  <Label>حجم البنر</Label>
                  <Select value={design.size} onValueChange={(value) => updateDesign('size', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BANNER_SIZES.map(size => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name} ({size.width}x{size.height})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>قالب التصميم</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {BANNER_TEMPLATES.map(template => (
                      <div
                        key={template.id}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                          design.template === template.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => updateDesign('template', template.id)}
                      >
                        <div
                          className="w-full h-16 rounded mb-2"
                          style={{ background: template.preview }}
                        />
                        <p className="text-sm text-center">{template.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Text Tab */}
              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label>العنوان الرئيسي</Label>
                  <Input
                    value={design.text.title}
                    onChange={(e) => updateDesign('text.title', e.target.value)}
                    placeholder="أدخل العنوان الرئيسي"
                  />
                </div>

                <div>
                  <Label>النص الفرعي</Label>
                  <Input
                    value={design.text.subtitle}
                    onChange={(e) => updateDesign('text.subtitle', e.target.value)}
                    placeholder="أدخل النص الفرعي"
                  />
                </div>

                <div>
                  <Label>نص الزر</Label>
                  <Input
                    value={design.text.cta}
                    onChange={(e) => updateDesign('text.cta', e.target.value)}
                    placeholder="أدخل نص الزر"
                  />
                </div>

                <div>
                  <Label>حجم العنوان: {design.fonts.titleSize}px</Label>
                  <Slider
                    value={[design.fonts.titleSize]}
                    onValueChange={([value]) => updateDesign('fonts.titleSize', value)}
                    min={16}
                    max={72}
                    step={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>حجم النص الفرعي: {design.fonts.subtitleSize}px</Label>
                  <Slider
                    value={[design.fonts.subtitleSize]}
                    onValueChange={([value]) => updateDesign('fonts.subtitleSize', value)}
                    min={12}
                    max={32}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4">
                <div>
                  <Label>لون العنوان</Label>
                  <ColorPicker
                    value={design.colors.title}
                    onChange={(color) => updateDesign('colors.title', color)}
                  />
                </div>

                <div>
                  <Label>لون النص الفرعي</Label>
                  <ColorPicker
                    value={design.colors.subtitle}
                    onChange={(color) => updateDesign('colors.subtitle', color)}
                  />
                </div>

                <div>
                  <Label>لون نص الزر</Label>
                  <ColorPicker
                    value={design.colors.cta}
                    onChange={(color) => updateDesign('colors.cta', color)}
                  />
                </div>

                <div>
                  <Label>لون خلفية الزر</Label>
                  <ColorPicker
                    value={design.colors.ctaBackground}
                    onChange={(color) => updateDesign('colors.ctaBackground', color)}
                  />
                </div>
              </TabsContent>

              {/* Effects Tab */}
              <TabsContent value="effects" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>ظلال النصوص</Label>
                  <Switch
                    checked={design.effects.shadow}
                    onCheckedChange={(checked) => updateDesign('effects.shadow', checked)}
                  />
                </div>

                <div>
                  <Label>شفافية البنر: {design.effects.opacity}%</Label>
                  <Slider
                    value={[design.effects.opacity]}
                    onValueChange={([value]) => updateDesign('effects.opacity', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>المسافة الداخلية: {design.positioning.padding}px</Label>
                  <Slider
                    value={[design.positioning.padding]}
                    onValueChange={([value]) => updateDesign('positioning.padding', value)}
                    min={0}
                    max={80}
                    step={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>محاذاة النص</Label>
                  <Select 
                    value={design.positioning.textAlign} 
                    onValueChange={(value) => updateDesign('positioning.textAlign', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="right">يمين</SelectItem>
                      <SelectItem value="left">يسار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Animation Tab */}
              <TabsContent value="animation" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل الحركة</Label>
                  <Switch
                    checked={design.animation.enabled}
                    onCheckedChange={(checked) => updateDesign('animation.enabled', checked)}
                  />
                </div>

                {design.animation.enabled && (
                  <>
                    <div>
                      <Label>نوع الحركة</Label>
                      <Select 
                        value={design.animation.type} 
                        onValueChange={(value) => updateDesign('animation.type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ANIMATION_TYPES.map(animation => (
                            <SelectItem key={animation.id} value={animation.id}>
                              {animation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>مدة الحركة: {design.animation.duration}ms</Label>
                      <Slider
                        value={[design.animation.duration]}
                        onValueChange={([value]) => updateDesign('animation.duration', value)}
                        min={200}
                        max={3000}
                        step={100}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>تأخير الحركة: {design.animation.delay}ms</Label>
                      <Slider
                        value={[design.animation.delay]}
                        onValueChange={([value]) => updateDesign('animation.delay', value)}
                        min={0}
                        max={2000}
                        step={100}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                حفظ التصميم
              </Button>
              <Button variant="outline" onClick={() => setDesign({ ...design })}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};