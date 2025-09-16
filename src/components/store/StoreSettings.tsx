import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Store, 
  Palette, 
  Bell, 
  Shield, 
  CreditCard,
  Users,
  BarChart3,
  Save,
  Upload
} from 'lucide-react';
import { ThemeManager } from './ThemeManager';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StoreSettingsProps {
  storeId: string;
  storeData: any;
  onUpdate?: (data: any) => void;
}

export const StoreSettings = ({ storeId, storeData, onUpdate }: StoreSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    store_name: storeData?.store_name || '',
    bio: storeData?.bio || '',
    logo_url: storeData?.logo_url || '',
    is_active: storeData?.is_active || true,
    // إعدادات إضافية
    notifications_enabled: true,
    auto_approve_orders: false,
    show_stock_count: true,
    enable_reviews: true,
  });
  
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('affiliate_stores')
        .update({
          store_name: formData.store_name,
          bio: formData.bio,
          logo_url: formData.logo_url,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId);

      if (error) throw error;

      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث إعدادات المتجر بنجاح',
      });

      onUpdate?.(formData);
    } catch (error: any) {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message || 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeId}/logo.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: 'تم رفع الشعار',
        description: 'تم رفع شعار المتجر بنجاح',
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في رفع الملف',
        description: error.message || 'حدث خطأ أثناء رفع الشعار',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-7 w-7" />
          إعدادات المتجر
        </h1>
        <p className="text-muted-foreground mt-2">
          إدارة وتخصيص متجرك بالكامل
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            الثيمات
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            التنبيهات
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            المدفوعات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        {/* الإعدادات العامة */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المتجر الأساسية</CardTitle>
              <CardDescription>
                إعدادات المتجر الأساسية والمعلومات العامة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="store_name">اسم المتجر</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      store_name: e.target.value 
                    }))}
                    placeholder="اسم متجرك"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">شعار المتجر</Label>
                  <div className="flex items-center gap-4">
                    {formData.logo_url && (
                      <img 
                        src={formData.logo_url} 
                        alt="شعار المتجر"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">وصف المتجر</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    bio: e.target.value 
                  }))}
                  placeholder="وصف مختصر عن متجرك ومنتجاتك"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_active">حالة المتجر</Label>
                  <p className="text-sm text-muted-foreground">
                    تفعيل أو إلغاء تفعيل المتجر للعملاء
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    is_active: checked 
                  }))}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* إعدادات الثيمات */}
        <TabsContent value="themes">
          <ThemeManager 
            storeId={storeId}
            onThemeChanged={(theme) => {
              toast({
                title: 'تم تطبيق الثيم',
                description: `تم تطبيق ثيم "${theme.name_ar}" بنجاح`,
              });
            }}
          />
        </TabsContent>

        {/* إعدادات التنبيهات */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التنبيهات</CardTitle>
              <CardDescription>
                إدارة التنبيهات والإشعارات للمتجر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>تنبيهات الطلبات الجديدة</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي إشعار عند وصول طلب جديد
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      notifications_enabled: checked 
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>الموافقة التلقائية على الطلبات</Label>
                    <p className="text-sm text-muted-foreground">
                      تأكيد الطلبات تلقائياً بدون مراجعة
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_approve_orders}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      auto_approve_orders: checked 
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* إعدادات الأمان */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>
                إعدادات الحماية والأمان للمتجر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  قريباً - إعدادات أمان متقدمة
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* إعدادات المدفوعات */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المدفوعات</CardTitle>
              <CardDescription>
                إدارة طرق الدفع والعمولات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  قريباً - ربط بوابات الدفع
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* إعدادات التحليلات */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التحليلات</CardTitle>
              <CardDescription>
                إعدادات تتبع الأداء والتحليلات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>إظهار عدد المخزون</Label>
                    <p className="text-sm text-muted-foreground">
                      إظهار كمية المنتجات المتاحة للعملاء
                    </p>
                  </div>
                  <Switch
                    checked={formData.show_stock_count}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      show_stock_count: checked 
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل التقييمات</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للعملاء بتقييم المنتجات
                    </p>
                  </div>
                  <Switch
                    checked={formData.enable_reviews}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      enable_reviews: checked 
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};