import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, Copy, Loader2, FileText, Share2, Mail, Search, Megaphone } from 'lucide-react';

interface AIContentGeneratorProps {
  productContext?: {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
  };
  onContentGenerated?: (content: string, type: string) => void;
}

const contentTypes = [
  { id: 'product_description', label: 'وصف منتج', icon: FileText },
  { id: 'social_media', label: 'منشور سوشيال', icon: Share2 },
  { id: 'marketing_email', label: 'بريد تسويقي', icon: Mail },
  { id: 'seo_keywords', label: 'كلمات SEO', icon: Search },
  { id: 'ad_copy', label: 'نص إعلاني', icon: Megaphone },
];

const CONTENT_GEN_URL = 'https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/ai-content-generator';

export function AIContentGenerator({ productContext, onContentGenerated }: AIContentGeneratorProps) {
  const [selectedType, setSelectedType] = useState('product_description');
  const [customPrompt, setCustomPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent('');
    
    try {
      const context = {
        ...productContext,
        prompt: customPrompt,
        platform,
        topic: customPrompt || productContext?.name,
        productName: productContext?.name,
      };

      const response = await fetch(CONTENT_GEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA',
        },
        body: JSON.stringify({ type: selectedType, context })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في توليد المحتوى');
      }

      setGeneratedContent(data.content);
      onContentGenerated?.(data.content, selectedType);
      toast.success('تم توليد المحتوى بنجاح');
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(error.message || 'فشل في توليد المحتوى');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('تم نسخ المحتوى');
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          مولد المحتوى الذكي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-muted/50">
            {contentTypes.map((type) => (
              <TabsTrigger 
                key={type.id} 
                value={type.id} 
                className="text-xs px-3 py-2 whitespace-nowrap"
              >
                <type.icon className="h-3 w-3 ml-1.5" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {contentTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              {type.id === 'social_media' && (
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنصة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="snapchat">Snapchat</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Textarea
                placeholder={
                  type.id === 'product_description' 
                    ? 'أدخل تفاصيل إضافية عن المنتج...' 
                    : 'أدخل الموضوع أو الفكرة...'
                }
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[80px]"
              />

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
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
                    توليد المحتوى
                  </>
                )}
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        {generatedContent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">المحتوى المولد:</span>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 ml-1" />
                نسخ
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {generatedContent}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
