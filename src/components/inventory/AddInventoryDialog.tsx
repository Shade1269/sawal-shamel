import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UnifiedButton as Button } from '@/components/design-system';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Upload, X, Save, Package } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const addInventorySchema = z.object({
  warehouse_id: z.string().min(1, 'يجب اختيار المخزن'),
  title: z.string().min(1, 'اسم المنتج مطلوب'),
  sku: z.string().min(1, 'كود المنتج مطلوب'),
  price_sar: z.number().min(0, 'السعر يجب أن يكون رقماً موجباً'),
  description: z.string().optional(),
  unit_cost: z.number().min(0, 'التكلفة يجب أن تكون أكبر من أو تساوي صفر'),
  location: z.string().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  reason: z.string().min(1, 'سبب الإضافة مطلوب'),
});

type AddInventoryForm = z.infer<typeof addInventorySchema>;

interface ProductVariant {
  color: string;
  size: string;
  quantity: number;
}

interface AddInventoryDialogProps {
  warehouses: Array<{ id: string; name: string; code: string }>;
  onSuccess: () => void;
}

export function AddInventoryDialog({ warehouses, onSuccess }: AddInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([{ color: '', size: '', quantity: 0 }]);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AddInventoryForm>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      warehouse_id: '',
      title: '',
      sku: '',
      price_sar: 0,
      description: '',
      unit_cost: 0,
      location: '',
      batch_number: '',
      expiry_date: '',
      reason: '',
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
      sonnerToast.success(`تم رفع ${files.length} صورة بنجاح`);
    } catch (error: any) {
      console.error('Image upload error:', error);
      sonnerToast.error('حدث خطأ في رفع الصور: ' + (error?.message || 'غير معروف'));
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: AddInventoryForm) => {
    setLoading(true);
    try {
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // الحصول على معرف الملف الشخصي
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error('لم يتم العثور على ملف المستخدم');
      }

      const profileId = profile.id;

      // البحث عن merchant أو إنشاء واحد إذا لم يكن موجوداً
      let { data: merchant, error: _merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (!merchant) {
        // إنشاء merchant جديد للأدمن
        const { data: newMerchant, error: createError } = await supabase
          .from('merchants')
          .insert({
            profile_id: profileId,
            business_name: 'مخزن النظام',
            business_license: 'ADMIN-INV-' + Date.now(),
          })
          .select()
          .single();

        if (createError) throw createError;
        merchant = newMerchant;
      }

      // إنشاء المنتج الأساسي
      const productData = {
        title: values.title,
        sku: values.sku,
        price_sar: values.price_sar,
        description: values.description,
        image_urls: imageUrls,
        is_active: true,
        stock: variants.reduce((sum, v) => sum + v.quantity, 0),
        merchant_id: merchant.id,
        created_via: 'inventory_admin',
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      // إنشاء متغيرات المنتج وربطها بالمخزون
      for (const variant of variants) {
        if (variant.quantity > 0) {
          const variantSku = `${values.sku}-${variant.color}-${variant.size}`
            .replace(/--/g, '-')
            .replace(/^-|-$/g, '');

          // إنشاء المتغير
          const { data: createdVariant, error: variantError } = await supabase
            .from('product_variants_advanced')
            .insert({
              product_id: product.id,
              sku: variantSku,
              color: variant.color || null,
              size: variant.size || null,
              quantity: variant.quantity,
              is_active: true,
              min_stock_alert: 5,
            })
            .select()
            .single();

          if (variantError) throw variantError;

          // إضافة للمخزون
          const { error: inventoryError } = await supabase
            .from('inventory_items')
            .insert({
              warehouse_id: values.warehouse_id,
              product_variant_id: createdVariant.id,
              sku: variantSku,
              quantity_available: variant.quantity,
              quantity_reserved: 0,
              quantity_on_order: 0,
              reorder_level: 5,
              unit_cost: values.unit_cost,
              location: values.location || null,
              batch_number: values.batch_number || null,
              expiry_date: values.expiry_date || null,
            });

          if (inventoryError) throw inventoryError;
        }
      }

      // تحديث الكاش
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_movements'] });

      sonnerToast.success('تم إضافة المنتج بنجاح للمخزون');
      
      // إعادة تعيين النموذج
      form.reset();
      setVariants([{ color: '', size: '', quantity: 0 }]);
      setImages([]);
      setImageUrls([]);
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error adding product to inventory:', error);
      toast({
        title: "خطأ في إضافة المنتج",
        description: error.message || "حدث خطأ أثناء إضافة المنتج للمخزون",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Package className="h-4 w-4" />
          إضافة منتج كامل للمخزون
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            إضافة منتج جديد للمخزون (كامل المعلومات)
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* معلومات المنتج الأساسية */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg">معلومات المنتج الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المنتج *</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم المنتج" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كود المنتج (SKU) *</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: PRD-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_sar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر (ريال) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التكلفة (ريال) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>وصف المنتج</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="وصف اختياري للمنتج"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* رفع الصور */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg">صور المنتج</h3>
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
                <span className="text-sm text-muted-foreground">
                  {imageUrls.length > 0 ? `${imageUrls.length} صورة` : 'لم يتم رفع صور'}
                </span>
              </div>
              
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`صورة ${index + 1}`}
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
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">متغيرات المنتج (لون، مقاس، كمية)</h3>
                <Button type="button" onClick={addVariant} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة متغير
                </Button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
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
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="الكمية"
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

            {/* معلومات المخزن */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg">معلومات المخزن</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warehouse_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المخزن *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المخزن" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} ({warehouse.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموقع (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثل: A1-B2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batch_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الدفعة (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم الدفعة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ انتهاء الصلاحية (اختياري)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>سبب الإضافة *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="مثل: شراء جديد، تحويل من مخزن آخر، تعديل جرد..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                  setVariants([{ color: '', size: '', quantity: 0 }]);
                  setImages([]);
                  setImageUrls([]);
                }}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading || uploading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    حفظ وإضافة للمخزون
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}