import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Store, Sparkles } from 'lucide-react';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';

interface CreateAffiliateStoreProps {
  onStoreCreated?: () => void;
}

export const CreateAffiliateStore: React.FC<CreateAffiliateStoreProps> = ({ onStoreCreated }) => {
  const { createStore, isCreating } = useAffiliateStore();
  const [formData, setFormData] = useState({
    store_name: '',
    bio: '',
    store_slug: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSlug = (slug: string) => {
    // يجب أن يحتوي على أحرف إنجليزية فقط، أرقام، وشرطات
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slug) return 'اسم المتجر بالإنجليزية مطلوب';
    if (slug.length < 3) return 'يجب أن يكون 3 أحرف على الأقل';
    if (slug.length > 50) return 'يجب أن يكون أقل من 50 حرف';
    if (!slugRegex.test(slug)) return 'يجب استخدام أحرف إنجليزية وأرقام وشرطات فقط';
    if (slug.startsWith('-') || slug.endsWith('-')) return 'لا يمكن أن يبدأ أو ينتهي بشرطة';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    const newErrors: Record<string, string> = {};
    
    if (!formData.store_name.trim()) {
      newErrors.store_name = 'اسم المتجر مطلوب';
    }
    
    // التحقق من slug فقط إذا أدخله المستخدم
    if (formData.store_slug.trim()) {
      const slugError = validateSlug(formData.store_slug);
      if (slugError) {
        newErrors.store_slug = slugError;
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    createStore(formData, {
      onSuccess: () => {
        onStoreCreated?.();
      }
    });
  };

  const handleSlugChange = (value: string) => {
    // تنظيف الإدخال للتأكد من الصيغة الصحيحة
    const cleanSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // السماح بالأحرف الإنجليزية والأرقام والشرطات فقط
      .replace(/--+/g, '-'); // منع تكرار الشرطات
    
    setFormData(prev => ({
      ...prev,
      store_slug: cleanSlug
    }));
    
    // إزالة رسالة الخطأ عند التصحيح
    if (errors.store_slug && validateSlug(cleanSlug) === '') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.store_slug;
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10" dir="rtl">
      <Card className="w-full max-w-md mx-4 shadow-2xl border border-border/50 bg-card backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              إنشاء متجرك الخاص
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              ابدئي رحلتك في التسويق وأنشئي متجرك الإلكتروني الخاص
            </CardDescription>
          </div>
        </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="store_name" className="text-sm font-medium text-foreground">
                  اسم المتجر *
                </Label>
                <Input
                  id="store_name"
                  type="text"
                  placeholder="مثال: متجر فاطمة للأزياء"
                  value={formData.store_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                  className={`text-base bg-background ${errors.store_name ? 'border-destructive' : ''}`}
                  required
                  disabled={isCreating}
                />
                {errors.store_name && (
                  <p className="text-sm text-destructive">{errors.store_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_slug" className="text-sm font-medium text-foreground">
                  اسم المتجر بالإنجليزية (اختياري)
                </Label>
                <Input
                  id="store_slug"
                  type="text"
                  placeholder="fatima-fashion-store"
                  value={formData.store_slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={`text-base bg-background ${errors.store_slug ? 'border-destructive' : ''}`}
                  disabled={isCreating}
                  dir="ltr"
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>رابط المتجر: </span>
                  <span className="font-medium text-foreground">{window.location.origin}/{formData.store_slug || "سيُنشأ-تلقائياً"}</span>
                </div>
                {errors.store_slug && (
                  <p className="text-sm text-destructive">{errors.store_slug}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  يُسمح بالأحرف الإنجليزية الصغيرة والأرقام والشرطات فقط. إذا تركته فارغاً سيتم توليده تلقائياً.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                  وصف المتجر (اختياري)
                </Label>
                <Textarea
                  id="bio"
                  placeholder="اكتبي وصفاً مختصراً عن متجرك وما يميزه..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-20 resize-none bg-background"
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  يمكنك تعديل الوصف لاحقاً من إعدادات المتجر
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isCreating || !formData.store_name.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري إنشاء المتجر...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 ml-2" />
                    إنشاء المتجر
                  </>
                )}
              </Button>
            </form>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-card-foreground mb-2">ماذا بعد إنشاء المتجر؟</h4>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• اختيار تصميم المتجر من الثيمات المتاحة</li>
                  <li>• إضافة المنتجات وتنظيمها</li>
                  <li>• تخصيص البنر والعروض الترويجية</li>
                  <li>• مشاركة رابط المتجر مع العملاء</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};