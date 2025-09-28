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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.store_name.trim()) return;

    createStore(formData, {
      onSuccess: () => {
        onStoreCreated?.();
      }
    });
  };

  const handleStoreNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      store_name: value,
      // Auto-generate slug from store name
      store_slug: value
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s]/g, '') // Keep Arabic, English, numbers, and spaces
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .trim()
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5" dir="rtl">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              إنشاء متجرك الخاص
            </CardTitle>
            <CardDescription className="text-base mt-2">
              ابدئي رحلتك في التسويق وأنشئي متجرك الإلكتروني الخاص
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="store_name" className="text-sm font-medium">
                اسم المتجر *
              </Label>
              <Input
                id="store_name"
                type="text"
                placeholder="مثال: متجر فاطمة للأزياء"
                value={formData.store_name}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                className="text-base"
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_slug" className="text-sm font-medium">
                رابط المتجر
              </Label>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>lovable.app/store/</span>
                <span className="font-medium text-foreground">{formData.store_slug}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                وصف المتجر
              </Label>
              <Textarea
                id="bio"
                placeholder="اكتبي وصفاً مختصراً عن متجرك وما يميزه..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="min-h-20 resize-none"
                disabled={isCreating}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
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

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              بعد إنشاء متجرك، ستتمكني من إضافة المنتجات وتخصيص التصميم ومشاركة رابط المتجر مع العملاء
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};