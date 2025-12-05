import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Volume2, Loader2, Sparkles, Copy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TTSSettings {
  text: string;
  voice: 'male-formal' | 'female-formal' | 'male-casual' | 'female-casual';
  dialect: 'msa' | 'saudi' | 'gulf' | 'egyptian';
  speed: 'slow' | 'normal' | 'fast';
  useCase: 'product' | 'ad' | 'notification' | 'assistant';
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function AITextToSpeech() {
  const [settings, setSettings] = useState<TTSSettings>({
    text: '',
    voice: 'female-formal',
    dialect: 'msa',
    speed: 'normal',
    useCase: 'product'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!settings.text.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('فشل في توليد الصوت');
      }

      const data = await response.json();
      setResult(data);
      toast.success('تم تحسين النص للنطق!');
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('حدث خطأ أثناء التوليد');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ!');
  };

  const voiceOptions = [
    { value: 'male-formal', label: 'رجل - رسمي', icon: '👔' },
    { value: 'female-formal', label: 'امرأة - رسمي', icon: '👩‍💼' },
    { value: 'male-casual', label: 'رجل - ودود', icon: '😊' },
    { value: 'female-casual', label: 'امرأة - ودود', icon: '😄' }
  ];

  const dialectOptions = [
    { value: 'msa', label: 'الفصحى الحديثة' },
    { value: 'saudi', label: 'السعودية' },
    { value: 'gulf', label: 'الخليجية' },
    { value: 'egyptian', label: 'المصرية' }
  ];

  const useCaseOptions = [
    { value: 'product', label: 'وصف منتج' },
    { value: 'ad', label: 'إعلان' },
    { value: 'notification', label: 'إشعار' },
    { value: 'assistant', label: 'مساعد صوتي' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            توليد الصوت (TTS)
          </CardTitle>
          <CardDescription>
            حوّل النص إلى صوت عربي احترافي بلهجات مختلفة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* النص */}
          <div className="space-y-2">
            <Label>النص *</Label>
            <Textarea
              placeholder="أدخل النص المراد تحويله إلى صوت..."
              value={settings.text}
              onChange={(e) => setSettings({ ...settings, text: e.target.value })}
              rows={4}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-left">
              {settings.text.length}/5000
            </p>
          </div>

          {/* الصوت واللهجة */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع الصوت</Label>
              <Select
                value={settings.voice}
                onValueChange={(value: any) => setSettings({ ...settings, voice: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((option) => (
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

            <div className="space-y-2">
              <Label>اللهجة</Label>
              <Select
                value={settings.dialect}
                onValueChange={(value: any) => setSettings({ ...settings, dialect: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dialectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* السرعة والاستخدام */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>السرعة</Label>
              <Select
                value={settings.speed}
                onValueChange={(value: any) => setSettings({ ...settings, speed: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">بطيء</SelectItem>
                  <SelectItem value="normal">عادي</SelectItem>
                  <SelectItem value="fast">سريع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نوع الاستخدام</Label>
              <Select
                value={settings.useCase}
                onValueChange={(value: any) => setSettings({ ...settings, useCase: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {useCaseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* زر التوليد */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !settings.text.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري التحسين...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ml-2" />
                تحسين وتوليد الصوت
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
                <Volume2 className="h-5 w-5" />
                النص المحسّن للنطق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* النص المحسن */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>النص المحسّن</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.optimizedText)}
                  >
                    <Copy className="h-4 w-4 ml-1" />
                    نسخ
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {result.optimizedText}
                </div>
              </div>

              {/* المدة المتوقعة */}
              {result.estimatedDuration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>المدة المتوقعة: {result.estimatedDuration} ثانية</span>
                </div>
              )}

              {/* SSML */}
              {result.ssml && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>كود SSML</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.ssml)}
                    >
                      <Copy className="h-4 w-4 ml-1" />
                      نسخ
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {result.ssml}
                  </div>
                </div>
              )}

              {/* الخدمات المدعومة */}
              {result.supportedServices && (
                <div className="space-y-2">
                  <Label>خدمات TTS المدعومة</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {result.supportedServices.map((service: any, i: number) => (
                      <div
                        key={i}
                        className="bg-muted p-2 rounded text-center text-xs"
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-muted-foreground">{service.quality}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
