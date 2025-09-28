import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateAffiliateStore } from '@/features/affiliate/components/CreateAffiliateStore';
import { AffiliateStoreManager } from '@/features/affiliate/components/AffiliateStoreManager';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Settings, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreThemeSelector } from '@/components/store/StoreThemeSelector';
import { Button } from '@/components/ui/button';

const StoreSetup = () => {
  const navigate = useNavigate();
  const { store, isLoading } = useAffiliateStore();

  const handleStoreCreated = () => {
    // إعادة تحديث البيانات بعد إنشاء المتجر
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن لدى المستخدم متجر، عرض شاشة إنشاء المتجر
  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">إنشاء متجرك الإلكتروني</h1>
              <p className="text-muted-foreground">
                ابدئي رحلتك في التسويق بالعمولة من خلال إنشاء متجرك الخاص
              </p>
            </div>
            
            <CreateAffiliateStore onStoreCreated={handleStoreCreated} />
          </div>
        </div>
      </div>
    );
  }

  // إذا كان لدى المستخدم متجر، عرض إعدادات المتجر
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8 text-primary" />
                إعدادات المتجر
              </h1>
              <p className="text-muted-foreground mt-2">
                قومي بتخصيص وإدارة متجرك الإلكتروني
              </p>
            </div>
            <Button 
              onClick={() => navigate(`/affiliate/storefront/${store.store_slug}`)} 
              className="gap-2"
            >
              <Store className="h-4 w-4" />
              معاينة المتجر
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="gap-2">
                <Settings className="h-4 w-4" />
                الإعدادات العامة
              </TabsTrigger>
              <TabsTrigger value="themes" className="gap-2">
                <Palette className="h-4 w-4" />
                الثيمات والتصميم
              </TabsTrigger>
              <TabsTrigger value="banner" className="gap-2">
                <Store className="h-4 w-4" />
                البنر والعرض
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <AffiliateStoreManager 
                store={store}
                onUpdateStore={() => window.location.reload()}
              />
            </TabsContent>

            <TabsContent value="themes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    اختيار الثيم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StoreThemeSelector 
                    storeId={store.id}
                    onThemeApplied={() => {
                      // تحديث الصفحة بعد تطبيق الثيم
                      window.location.reload();
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banner" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات البنر والعرض</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Store className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>سيتم إضافة إعدادات البنر والعرض قريباً</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StoreSetup;