import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  Upload,
  Camera,
  ImageIcon,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchResult {
  product: {
    id: string;
    title: string;
    price_sar: number;
    image_url?: string;
    category?: string;
  };
  similarity: number;
  reason: string;
}

interface ImageAnalysis {
  productType?: string;
  category?: string;
  colors?: string[];
  style?: string;
  keywords?: string[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function AIImageSearch() {
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!imageUrl && !imagePreview) {
      toast.error('الرجاء إدخال رابط صورة أو رفع صورة');
      return;
    }

    setIsLoading(true);
    setResults([]);
    setAnalysis(null);

    try {
      const requestBody: any = {};

      if (imagePreview) {
        // استخراج base64 بدون prefix
        const base64Data = imagePreview.split(',')[1];
        requestBody.imageBase64 = base64Data;
      } else {
        requestBody.imageUrl = imageUrl;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-image-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('فشل البحث');
      }

      const data = await response.json();
      setResults(data.results || []);
      setAnalysis(data.imageAnalysis || null);
      toast.success(`تم العثور على ${data.results?.length || 0} منتج مشابه`);
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageUrl('');
    setResults([]);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            البحث بالصور
          </CardTitle>
          <CardDescription>
            ابحث عن منتجات مشابهة باستخدام صورة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* منطقة رفع الصورة */}
          <div className="space-y-4">
            {!imagePreview ? (
              <>
                {/* رفع صورة */}
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">اضغط لرفع صورة</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP (الحد الأقصى 10MB)
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-sm text-muted-foreground">أو</span>
                  </div>
                </div>

                {/* رابط صورة */}
                <div className="space-y-2">
                  <Label>رابط الصورة</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* زر البحث */}
          <Button
            onClick={handleSearch}
            disabled={isLoading || (!imageUrl && !imagePreview)}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري البحث...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 ml-2" />
                بحث عن منتجات مشابهة
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* تحليل الصورة */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4" />
                تحليل الصورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.productType && (
                  <Badge variant="secondary">{analysis.productType}</Badge>
                )}
                {analysis.category && (
                  <Badge variant="outline">{analysis.category}</Badge>
                )}
                {analysis.style && (
                  <Badge variant="outline">{analysis.style}</Badge>
                )}
                {analysis.colors?.map((color, i) => (
                  <Badge key={i} variant="outline">{color}</Badge>
                ))}
              </div>
              {analysis.keywords && analysis.keywords.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium">كلمات مفتاحية: </span>
                  {analysis.keywords.join('، ')}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* النتائج */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                المنتجات المشابهة ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((result, index) => (
                  <motion.div
                    key={result.product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      {result.product.image_url && (
                        <div className="aspect-square bg-muted">
                          <img
                            src={result.product.image_url}
                            alt={result.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-3 space-y-2">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {result.product.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {result.product.price_sar} ر.س
                          </span>
                          <Badge
                            variant={result.similarity > 0.7 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {Math.round(result.similarity * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.reason}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
