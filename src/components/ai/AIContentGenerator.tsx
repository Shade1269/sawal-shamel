import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
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

export function AIContentGenerator({ productContext, onContentGenerated }: AIContentGeneratorProps) {
  const [selectedType, setSelectedType] = useState('product_description');
  const [customPrompt, setCustomPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const context = {
        ...productContext,
        prompt: customPrompt,
        platform,
        topic: customPrompt || productContext?.name,
        productName: productContext?.name,
      };

      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: { type: selectedType, context }
      });

      if (error) throw error;

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
          <TabsList className="grid grid-cols-5 gap-1">
            {contentTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs px-2">
                <type.icon className="h-3 w-3 ml-1" />
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
