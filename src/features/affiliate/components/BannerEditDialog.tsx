import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoreBanner {
  id?: string;
  store_id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  link_type: 'product' | 'category' | 'external' | 'none';
  position: number;
  is_active: boolean;
}

interface BannerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: StoreBanner | null;
  storeId: string;
  onSave: () => void;
}

export const BannerEditDialog: React.FC<BannerEditDialogProps> = ({
  open,
  onOpenChange,
  banner,
  storeId,
  onSave,
}) => {
  const [formData, setFormData] = useState<StoreBanner>({
    store_id: storeId,
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    link_type: 'none',
    position: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData(banner);
      setImagePreview(banner.image_url);
    } else {
      setFormData({
        store_id: storeId,
        title: '',
        subtitle: '',
        image_url: '',
        link_url: '',
        link_type: 'none',
        position: 0,
        is_active: true,
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [banner, storeId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const fileName = `${user.user.id}/banners/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('store-banners')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('store-banners')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان البانر');
      return;
    }

    if (!imageFile && !formData.image_url) {
      toast.error('يرجى اختيار صورة للبانر');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImage(imageFile);
        setUploading(false);
      }

      const bannerData = {
        ...formData,
        image_url: imageUrl,
        store_id: storeId,
      };

      if (banner?.id) {
        const { error } = await (supabase as any)
          .from('store_banners')
          .update(bannerData)
          .eq('id', banner.id);

        if (error) throw error;
        toast.success('تم تحديث البانر بنجاح');
      } else {
        const { error } = await (supabase as any)
          .from('store_banners')
          .insert([bannerData]);

        if (error) throw error;
        toast.success('تم إضافة البانر بنجاح');
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('فشل في حفظ البانر');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{banner ? 'تعديل البانر' : 'إضافة بانر جديد'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="banner-image">صورة البانر *</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="danger"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                      setFormData({ ...formData, image_url: '' });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!imagePreview && (
                <div className="w-full">
                  <Input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الحجم المقترح: 1920x600 بكسل
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-title">عنوان البانر *</Label>
            <Input
              id="banner-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: عروض الموسم"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-subtitle">عنوان فرعي</Label>
            <Textarea
              id="banner-subtitle"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="مثال: خصومات تصل إلى 50%"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-type">نوع الرابط</Label>
            <Select
              value={formData.link_type}
              onValueChange={(value: any) => setFormData({ ...formData, link_type: value })}
            >
              <SelectTrigger id="link-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون رابط</SelectItem>
                <SelectItem value="product">رابط لمنتج</SelectItem>
                <SelectItem value="category">رابط لفئة</SelectItem>
                <SelectItem value="external">رابط خارجي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.link_type !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="link-url">
                {formData.link_type === 'product' && 'معرّف المنتج (Product ID)'}
                {formData.link_type === 'category' && 'اسم الفئة'}
                {formData.link_type === 'external' && 'عنوان URL'}
              </Label>
              <Input
                id="link-url"
                value={formData.link_url || ''}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder={
                  formData.link_type === 'product'
                    ? 'مثال: 0262c7c9-f7d8-451b-a024-c34940a1d4ce'
                    : formData.link_type === 'category'
                    ? 'مثال: ملابس رياضية'
                    : 'مثال: https://example.com'
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position">الترتيب</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              الأرقام الأقل تظهر أولاً
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is-active">نشط</Label>
            <Switch
              id="is-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {(saving || uploading) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {uploading ? 'جاري الرفع...' : saving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
