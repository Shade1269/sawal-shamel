import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ImageIcon, Loader2, Download, Sparkles, Upload, Pencil, X } from 'lucide-react';

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

const IMAGE_GEN_URL = 'https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/ai-image-generator';

export function AIImageGenerator({ onImageGenerated }: AIImageGeneratorProps) {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [style, setStyle] = useState('professional');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (mode === 'generate' && !prompt.trim()) {
      toast.error('الرجاء إدخال وصف للصورة');
      return;
    }

    if (mode === 'edit' && !uploadedImage) {
      toast.error('الرجاء رفع صورة للتعديل عليها');
      return;
    }

    if (mode === 'edit' && !editPrompt.trim()) {
      toast.error('الرجاء إدخال التعديل المطلوب');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    
    try {
      const body = mode === 'generate' 
        ? { prompt, style, mode: 'generate' }
        : { prompt: editPrompt, sourceImage: uploadedImage, mode: 'edit' };

      const response = await fetch(IMAGE_GEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في معالجة الصورة');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onImageGenerated?.(data.imageUrl);
        toast.success(mode === 'generate' ? 'تم توليد الصورة بنجاح' : 'تم تعديل الصورة بنجاح');
      } else {
        throw new Error('لم يتم معالجة الصورة');
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'فشل في معالجة الصورة');
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
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'generate' | 'edit')}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="h-4 w-4" />
              توليد جديد
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2">
              <Pencil className="h-4 w-4" />
              تعديل صورة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">وصف الصورة</label>
              <Textarea
                placeholder="مثال: صورة احترافية لساعة يد فاخرة..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px]"
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
          </TabsContent>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الصورة الأصلية</label>
              
              {!uploadedImage ? (
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">اضغط لرفع صورة</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, WEBP (أقصى 10MB)</p>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="w-full h-48 object-contain bg-muted"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2 h-8 w-8"
                    onClick={handleRemoveUploadedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">التعديل المطلوب</label>
              <Textarea
                placeholder="مثال: أضف خلفية طبيعية، غير الألوان إلى الأزرق، أزل الخلفية..."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || (mode === 'generate' ? !prompt.trim() : (!uploadedImage || !editPrompt.trim()))}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 ml-2" />
              {mode === 'generate' ? 'توليد الصورة' : 'تعديل الصورة'}
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {mode === 'generate' ? 'الصورة المولدة:' : 'الصورة المعدلة:'}
              </span>
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