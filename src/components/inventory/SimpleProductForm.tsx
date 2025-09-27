import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const productSchema = z.object({
  title: z.string().min(1, 'اسم المنتج مطلوب'),
  sku: z.string().min(1, 'رمز المنتج مطلوب'),
  price_sar: z.number().min(0, 'السعر يجب أن يكون رقم موجب'),
  description: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

interface ProductVariant {
  color: string;
  size: string;
  quantity: number;
}

interface SimpleProductFormProps {
  onSuccess?: () => void;
  warehouseId?: string;
}

export function SimpleProductForm({ onSuccess, warehouseId }: SimpleProductFormProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([{ color: '', size: '', quantity: 0 }]);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      sku: '',
      price_sar: 0,
      description: '',
    },
  });

  const addVariant = () => {
    setVariants([...variants, { color: '', size: '', quantity: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImages([...images, ...files]);
      setImageUrls([...imageUrls, ...uploadedUrls]);
      toast.success(`تم رفع ${files.length} صورة بنجاح`);
    } catch (error: any) {
      toast.error('حدث خطأ في رفع الصور: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // إنشاء المنتج الأساسي
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: data.title,
          sku: data.sku,
          price_sar: data.price_sar,
          description: data.description,
          image_urls: imageUrls,
          is_active: true,
          stock: variants.reduce((sum, v) => sum + v.quantity, 0),
          merchant_id: user.id, // استخدام معرف المستخدم الحالي
        })
        .select()
        .single();

      if (productError) throw productError;

      // إنشاء متغيرات المنتج
      for (const variant of variants) {
        if (variant.color || variant.size || variant.quantity > 0) {
          await supabase.from('product_variants_advanced').insert({
            product_id: product.id,
            sku: `${data.sku}-${variant.color}-${variant.size}`.replace(/--/g, '-').replace(/^-|-$/g, ''),
            color: variant.color || null,
            size: variant.size || null,
            quantity: variant.quantity,
            is_active: true,
            min_stock_alert: 5,
          });

          // إضافة عنصر للمخزون إذا كان هناك warehouse
          if (warehouseId && variant.quantity > 0) {
            await supabase.from('inventory_items').insert({
              warehouse_id: warehouseId,
              product_variant_id: product.id,
              sku: `${data.sku}-${variant.color}-${variant.size}`.replace(/--/g, '-').replace(/^-|-$/g, ''),
              quantity_available: variant.quantity,
              quantity_reserved: 0,
              quantity_on_order: 0,
              reorder_level: 5,
              unit_cost: data.price_sar * 0.7, // تكلفة تقديرية
            });
          }
        }
      }

      // تحديث الكاش
      queryClient.invalidateQueries({ queryKey: ['real_inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-products'] });

      toast.success('تم إضافة المنتج بنجاح');
      
      // إعادة تعيين النموذج
      form.reset();
      setVariants([{ color: '', size: '', quantity: 0 }]);
      setImages([]);
      setImageUrls([]);
      
      onSuccess?.();
    } catch (error: any) {
      toast.error('حدث خطأ في إضافة المنتج: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          إضافة منتج جديد
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
              <Label htmlFor="sku">رمز المنتج (SKU) *</Label>
              <Input
                id="sku"
                {...form.register('sku')}
                placeholder="مثال: PRD-001"
              />
              {form.formState.errors.sku && (
                <p className="text-sm text-destructive">{form.formState.errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_sar">السعر (ريال سعودي) *</Label>
              <Input
                id="price_sar"
                type="number"
                step="0.01"
                {...form.register('price_sar', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.price_sar && (
                <p className="text-sm text-destructive">{form.formState.errors.price_sar.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المنتج</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="وصف اختياري للمنتج"
                rows={3}
              />
            </div>
          </div>

          {/* رفع الصور */}
          <div className="space-y-4">
            <Label>صور المنتج</Label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
                <Button type="button" variant="outline" disabled={uploading} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'جاري الرفع...' : 'رفع صور'}
                </Button>
              </label>
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

          {/* المتغيرات */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>متغيرات المنتج (لون، مقاس، كمية)</Label>
              <Button type="button" onClick={addVariant} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة متغير
              </Button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="اللون"
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="المقاس"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="العدد"
                      value={variant.quantity}
                      onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeVariant(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* زر الحفظ */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}