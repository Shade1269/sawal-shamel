import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ImageIcon, Loader2, Download, Sparkles } from 'lucide-react';

interface AIImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
}

const imageStyles = [
  { id: 'professional', label: 'احترافي (خلفية بيضاء)' },
  { id: 'lifestyle', label: 'لايف ستايل' },
  { id: 'minimal', label: 'مينيمال' },
  { id: 'banner', label: 'بانر إعلاني' },
  { id: 'social', label: 'سوشيال ميديا' },
];

const IMAGE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image-generator`;

export function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('الرجاء إدخال وصف للصورة');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    
    try {
      const response = await fetch(IMAGE_GEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt, style })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في توليد الصورة');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onImageGenerated?.(data.imageUrl);
        toast.success('تم توليد الصورة بنجاح');
      } else {
        throw new Error('لم يتم توليد الصورة');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'فشل في توليد الصورة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('جاري تحميل الصورة');
    } catch (error) {
      toast.error('فشل في تحميل الصورة');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-primary" />
          مولد الصور الذكي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">وصف الصورة</label>
          <Input
            placeholder="مثال: صورة احترافية لساعة يد فاخرة..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">نمط الصورة</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder="اختر النمط" />
            </SelectTrigger>
            <SelectContent>
              {imageStyles.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري التوليد...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 ml-2" />
              توليد الصورة
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">الصورة المولدة:</span>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 ml-1" />
                تحميل
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={generatedImage} 
                alt="Generated" 
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
