import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ImageIcon,
  Loader2,
  Sparkles,
  Download,
  Eraser,
  Wand2,
  ZoomIn,
  Type,
  Palette,
  Brush
} from 'lucide-react';
import { motion } from 'framer-motion';

type EditAction = 'remove-bg' | 'enhance' | 'resize' | 'add-text' | 'style-transfer' | 'upscale' | 'retouch';

interface EditOptions {
  newBackground?: string;
  text?: string;
  textPosition?: 'top' | 'bottom' | 'center';
  textColor?: string;
  width?: number;
  height?: number;
  enhanceLevel?: 'light' | 'medium' | 'heavy';
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function AIImageEditor() {
  const [imageUrl, setImageUrl] = useState('');
  const [action, setAction] = useState<EditAction>('remove-bg');
  const [options, setOptions] = useState<EditOptions>({
    newBackground: 'white',
    enhanceLevel: 'medium',
    textPosition: 'bottom'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleEdit = async () => {
    if (!imageUrl.trim()) {
      toast.error('الرجاء إدخال رابط الصورة');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-image-editor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, action, options })
      });

      if (!response.ok) {
        throw new Error('فشل في تعديل الصورة');
      }

      const data = await response.json();
      setResult(data);
      toast.success('تم تعديل الصورة بنجاح!');
    } catch (error) {
      console.error('Image edit error:', error);
      toast.error('حدث خطأ أثناء التعديل');
    } finally {
      setIsLoading(false);
    }
  };

  const actionOptions = [
    { value: 'remove-bg', label: 'إزالة الخلفية', icon: Eraser },
    { value: 'enhance', label: 'تحسين الجودة', icon: Wand2 },
    { value: 'upscale', label: 'تكبير الدقة', icon: ZoomIn },
    { value: 'add-text', label: 'إضافة نص', icon: Type },
    { value: 'style-transfer', label: 'تغيير الستايل', icon: Palette },
    { value: 'retouch', label: 'ريتاتش احترافي', icon: Brush }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            محرر الصور الذكي
          </CardTitle>
          <CardDescription>
            عدّل صور منتجاتك بالذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* رابط الصورة */}
          <div className="space-y-2">
            <Label>رابط الصورة *</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              dir="ltr"
            />
          </div>

          {/* نوع التعديل */}
          <div className="space-y-2">
            <Label>نوع التعديل</Label>
            <div className="grid grid-cols-3 gap-2">
              {actionOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.value}
                    variant={action === opt.value ? 'default' : 'outline'}
                    className="flex flex-col h-auto py-3 gap-1"
                    onClick={() => setAction(opt.value as EditAction)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{opt.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* خيارات إزالة الخلفية */}
          {action === 'remove-bg' && (
            <div className="space-y-2">
              <Label>الخلفية الجديدة</Label>
              <Select
                value={options.newBackground}
                onValueChange={(value) => setOptions({ ...options, newBackground: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">أبيض</SelectItem>
                  <SelectItem value="transparent">شفاف</SelectItem>
                  <SelectItem value="gradient">تدرج لوني</SelectItem>
                  <SelectItem value="black">أسود</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* خيارات التحسين */}
          {action === 'enhance' && (
            <div className="space-y-2">
              <Label>مستوى التحسين</Label>
              <Select
                value={options.enhanceLevel}
                onValueChange={(value: any) => setOptions({ ...options, enhanceLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">خفيف</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="heavy">قوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* خيارات إضافة النص */}
          {action === 'add-text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>النص</Label>
                <Input
                  placeholder="عرض خاص!"
                  value={options.text || ''}
                  onChange={(e) => setOptions({ ...options, text: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الموضع</Label>
                  <Select
                    value={options.textPosition}
                    onValueChange={(value: any) => setOptions({ ...options, textPosition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">أعلى</SelectItem>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="bottom">أسفل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>لون النص</Label>
                  <Input
                    type="color"
                    value={options.textColor || '#ffffff'}
                    onChange={(e) => setOptions({ ...options, textColor: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* زر التعديل */}
          <Button
            onClick={handleEdit}
            disabled={isLoading || !imageUrl.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري التعديل...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ml-2" />
                تعديل الصورة
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* النتيجة */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <ImageIcon className="h-5 w-5" />
                الصورة المعدلة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* مقارنة الصور */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الأصلية</Label>
                  <div className="rounded-lg overflow-hidden border bg-muted aspect-square">
                    <img
                      src={result.originalImage}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                {result.editedImage && (
                  <div className="space-y-2">
                    <Label>المعدلة</Label>
                    <div className="rounded-lg overflow-hidden border bg-muted aspect-square">
                      <img
                        src={result.editedImage}
                        alt="Edited"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* زر التحميل */}
              {result.editedImage && (
                <Button className="w-full" variant="outline" asChild>
                  <a href={result.editedImage} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 ml-2" />
                    تحميل الصورة
                  </a>
                </Button>
              )}

              {/* نصائح */}
              {result.tips && (
                <div className="space-y-2">
                  <Label>نصائح</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.tips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
