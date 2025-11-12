import React, { useState, useRef } from 'react';
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
  merchant_base_price_sar: z.number().min(0, 'السعر يجب أن يكون رقم موجب'),
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      sku: '',
      merchant_base_price_sar: 0,
      description: '',
    },
  });

  // حساب سعر الكتالوج تلقائياً
  const merchantBasePrice = form.watch('merchant_base_price_sar') || 0;
  const catalogPrice = merchantBasePrice * 1.25;

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

      setImages(prev => [...prev, ...files]);
      setImageUrls(prev => [...prev, ...uploadedUrls]);
      toast.success(`تم رفع ${files.length} صورة بنجاح`);
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error('حدث خطأ في رفع الصور: ' + (error?.message || 'غير معروف'));
    } finally {
      setUploading(false);
      // إعادة تعيين الحقل للسماح برفع نفس الملف مرة أخرى
      input.value = '';
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

      console.log('Current user ID:', user.id);

      // الحصول على معرف الملف الشخصي ثم التاجر والمتجر
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error('لم يتم العثور على ملف المستخدم');
      }

      const profileId = profile.id;

      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', profileId)
        .maybeSingle();

      if (merchantError) {
        throw merchantError;
      }

      if (!merchant?.id) {
        throw new Error('لا يوجد حساب تاجر مرتبط بحسابك. يرجى إنشاء حساب تاجر أولاً.');
      }

      // إنشاء بيانات المنتج مع merchant_id الصحيح، وإضافة shop_id إن وجد
      const productData = {
        title: data.title,
        sku: data.sku,
        merchant_base_price_sar: data.merchant_base_price_sar,
        price_sar: data.merchant_base_price_sar * 1.25, // سعر الكتالوج (سعر التاجر + 25%)
        description: data.description,
        image_urls: imageUrls,
        is_active: true,
        stock: variants.reduce((sum, v) => sum + v.quantity, 0),
        merchant_id: merchant.id,
        shop_id: shop?.id ?? null,
      } as any;

      console.log('Creating product with data:', productData);

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) {
        console.error('Product creation error:', productError);
        throw productError;
      }

      console.log('Product created successfully:', product);

      // إنشاء متغيرات المنتج
      for (const variant of variants) {
        if (variant.color || variant.size || variant.quantity > 0) {
          const { data: createdVariant, error: variantError } = await supabase
            .from('product_variants_advanced')
            .insert({
              product_id: product.id,
              sku: `${data.sku}-${variant.color}-${variant.size}`.replace(/--/g, '-').replace(/^-|-$/g, ''),
              color: variant.color || null,
              size: variant.size || null,
              quantity: variant.quantity,
              is_active: true,
              min_stock_alert: 5,
            })
            .select()
            .single();

          if (variantError || !createdVariant) {
            console.error('Variant creation error:', variantError);
            throw variantError || new Error('فشل إنشاء متغير المنتج');
          }

          // إضافة عنصر للمخزون إذا كان هناك warehouse
          if (warehouseId && variant.quantity > 0) {
            await supabase.from('inventory_items').insert({
              warehouse_id: warehouseId,
              product_variant_id: createdVariant.id,
              sku: `${data.sku}-${variant.color}-${variant.size}`.replace(/--/g, '-').replace(/^-|-$/g, ''),
              quantity_available: variant.quantity,
              quantity_reserved: 0,
              quantity_on_order: 0,
              reorder_level: 5,
              unit_cost: data.merchant_base_price_sar * 0.7, // تكلفة تقديرية
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
      console.error('Product creation error:', error);
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
          {/* شرح نظام التسعير */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              كيف يعمل نظام التسعير؟
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• <strong>سعرك الأساسي:</strong> المبلغ الذي تحصل عليه مباشرة من كل بيعة</p>
              <p>• <strong>سعر الكتالوج:</strong> سعرك + 25% (نصيب المنصة) = {catalogPrice.toFixed(2)} ريال</p>
              <p>• <strong>السعر النهائي:</strong> المسوق يحدده ويحصل على الفرق كعمولة</p>
            </div>
            {merchantBasePrice > 0 && (
              <div className="mt-3 p-3 bg-white dark:bg-blue-900/30 rounded border border-blue-300 dark:border-blue-700">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  مثال على منتجك:
                </p>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                  <p>✓ أنت تحصل على: <strong>{merchantBasePrice.toFixed(2)} ريال</strong></p>
                  <p>✓ المنصة تحصل على: <strong>{(merchantBasePrice * 0.25).toFixed(2)} ريال</strong></p>
                  <p>✓ سعر الكتالوج: <strong>{catalogPrice.toFixed(2)} ريال</strong></p>
                  <p>✓ إذا باع المسوق بـ 1500 ريال، عمولته: <strong>{(1500 - catalogPrice).toFixed(2)} ريال</strong></p>
                </div>
              </div>
            )}
          </div>

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
              <Label htmlFor="merchant_base_price_sar">سعرك الأساسي (ريال سعودي) *</Label>
              <Input
                id="merchant_base_price_sar"
                type="number"
                step="0.01"
                {...form.register('merchant_base_price_sar', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.merchant_base_price_sar && (
                <p className="text-sm text-destructive">{form.formState.errors.merchant_base_price_sar.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                المبلغ الذي ستحصل عليه من كل مبيعة
              </p>
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
                      alt={`صورة ${index + 1} - ${form.watch('title') || 'منتج'}`}
                      loading="lazy"
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