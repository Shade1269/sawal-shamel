import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Video, Loader2, Sparkles, Download, Copy, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoSettings {
  productName: string;
  productDescription: string;
  productImage?: string;
  style: 'showcase' | 'promotional' | 'tutorial' | 'story' | 'social';
  duration: '15s' | '30s' | '60s';
  language: 'ar' | 'en';
  includeVoiceover: boolean;
  includeMusic: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function AIVideoGenerator() {
  const [settings, setSettings] = useState<VideoSettings>({
    productName: '',
    productDescription: '',
    style: 'showcase',
    duration: '30s',
    language: 'ar',
    includeVoiceover: true,
    includeMusic: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!settings.productName.trim()) {
      toast.error('الرجاء إدخال اسم المنتج');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-video-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('فشل في توليد الفيديو');
      }

      const data = await response.json();
      setResult(data);
      toast.success('تم إنشاء سكربت الفيديو بنجاح!');
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('حدث خطأ أثناء التوليد');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ!');
  };

  const styleOptions = [
    { value: 'showcase', label: 'عرض المنتج', icon: '🎬' },
    { value: 'promotional', label: 'إعلان ترويجي', icon: '📢' },
    { value: 'tutorial', label: 'شرح تعليمي', icon: '📚' },
    { value: 'story', label: 'قصة تسويقية', icon: '📖' },
    { value: 'social', label: 'سوشيال ميديا', icon: '📱' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            توليد فيديو المنتج
          </CardTitle>
          <CardDescription>
            أنشئ سكربت فيديو احترافي لمنتجك باستخدام الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* اسم المنتج */}
          <div className="space-y-2">
            <Label>اسم المنتج *</Label>
            <Input
              placeholder="مثال: ساعة ذكية فاخرة"
              value={settings.productName}
              onChange={(e) => setSettings({ ...settings, productName: e.target.value })}
            />
          </div>

          {/* وصف المنتج */}
          <div className="space-y-2">
            <Label>وصف المنتج</Label>
            <Textarea
              placeholder="أدخل وصفاً تفصيلياً للمنتج ومميزاته..."
              value={settings.productDescription}
              onChange={(e) => setSettings({ ...settings, productDescription: e.target.value })}
              rows={3}
            />
          </div>

          {/* نمط الفيديو */}
          <div className="space-y-2">
            <Label>نمط الفيديو</Label>
            <Select
              value={settings.style}
              onValueChange={(value: any) => setSettings({ ...settings, style: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* مدة الفيديو واللغة */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المدة</Label>
              <Select
                value={settings.duration}
                onValueChange={(value: any) => setSettings({ ...settings, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15s">15 ثانية</SelectItem>
                  <SelectItem value="30s">30 ثانية</SelectItem>
                  <SelectItem value="60s">60 ثانية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>اللغة</Label>
              <Select
                value={settings.language}
                onValueChange={(value: any) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* خيارات إضافية */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.includeVoiceover}
                onCheckedChange={(checked) => setSettings({ ...settings, includeVoiceover: checked })}
              />
              <Label>تعليق صوتي</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.includeMusic}
                onCheckedChange={(checked) => setSettings({ ...settings, includeMusic: checked })}
              />
              <Label>موسيقى خلفية</Label>
            </div>
          </div>

          {/* زر التوليد */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !settings.productName.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري إنشاء السكربت...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ml-2" />
                إنشاء سكربت الفيديو
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
                <Play className="h-5 w-5" />
                سكربت الفيديو جاهز
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Thumbnail */}
              {result.thumbnail && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={result.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>السكربت</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.videoScript)}
                  >
                    <Copy className="h-4 w-4 ml-1" />
                    نسخ
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {result.videoScript}
                </div>
              </div>

              {/* Next Steps */}
              {result.nextSteps && (
                <div className="space-y-2">
                  <Label>الخطوات التالية</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.nextSteps.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
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
