import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Save, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const productSchema = z.object({
  title: z.string().min(1, 'اسم المنتج مطلوب'),
  sku: z.string().optional(),
  merchant_base_price_sar: z.number().min(0, 'السعر يجب أن يكون رقم موجب'),
  description: z.string().optional(),
  stock: z.number().min(0, 'المخزون يجب أن يكون رقم موجب'),
});

type ProductForm = z.infer<typeof productSchema>;

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  merchant_base_price_sar?: number;
  sku?: string;
  stock: number;
  images?: string[];
  image_urls?: string[];
}

interface MerchantProductEditFormProps {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MerchantProductEditForm({ product, onSuccess, onCancel }: MerchantProductEditFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(product.images || product.image_urls || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product.title || '',
      sku: product.sku || '',
      merchant_base_price_sar: product.merchant_base_price_sar || product.price_sar || 0,
      description: product.description || '',
      stock: product.stock || 0,
    },
  });

  const merchantBasePrice = form.watch('merchant_base_price_sar') || 0;
  const catalogPrice = merchantBasePrice * 1.25;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || 'image/*',
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImageUrls(prev => [...prev, ...uploadedUrls]);
      toast.success(`تم رفع ${files.length} صورة بنجاح`);
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error('حدث خطأ في رفع الصور');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: data.title,
          sku: data.sku,
          merchant_base_price_sar: data.merchant_base_price_sar,
          price_sar: data.merchant_base_price_sar * 1.25,
          description: data.description,
          stock: data.stock,
          image_urls: imageUrls,
          approval_status: 'pending', // يعود للمراجعة بعد التعديل
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success('تم تحديث المنتج بنجاح - سيتم مراجعته مجدداً');
      onSuccess?.();
    } catch (error: any) {
      console.error('Product update error:', error);
      toast.error('حدث خطأ في تحديث المنتج: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          تعديل المنتج
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* معلومات المنتج الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">اسم المنتج *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="أدخل اسم المنتج"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">رمز المنتج (SKU)</Label>
              <Input
                id="sku"
                {...form.register('sku')}
                placeholder="مثال: PRD-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant_base_price_sar">سعرك الأساسي (ريال) *</Label>
              <Input
                id="merchant_base_price_sar"
                type="number"
                step="0.01"
                {...form.register('merchant_base_price_sar', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {merchantBasePrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  سعر الكتالوج: {catalogPrice.toFixed(2)} ريال
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">المخزون</Label>
              <Input
                id="stock"
                type="number"
                {...form.register('stock', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">وصف المنتج</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="وصف المنتج"
                rows={3}
              />
            </div>
          </div>

          {/* رفع الصور */}
          <div className="space-y-4">
            <Label>صور المنتج</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'جارٍ الرفع...' : 'رفع صور'}
              </Button>
            </div>
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* أزرار */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                إلغاء
              </Button>
            )}
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
