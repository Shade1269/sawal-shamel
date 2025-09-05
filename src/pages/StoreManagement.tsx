import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Store, Settings, Upload, Package, BarChart3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StoreProductsSection from '@/components/StoreProductsSection';

const StoreManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Store management form state
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storeLogo, setStoreLogo] = useState<File | null>(null);
  const [storeEnabled, setStoreEnabled] = useState(false);
  const [activeSection, setActiveSection] = useState('settings');
  const [userShop, setUserShop] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Fetch user's shop on component mount
  React.useEffect(() => {
    fetchUserShop();
  }, [user]);

  const fetchUserShop = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (profile) {
        const { data: shop } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', profile.id)
          .single();
        
        setUserShop(shop);
        if (shop) {
          setStoreName(shop.display_name || '');
          setStoreSlug(shop.slug || '');
          setStoreEnabled(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user shop:', error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStoreLogo(file);
    }
  };

  const handleStoreSlugChange = (value: string) => {
    // Convert to lowercase and replace spaces with hyphens for URL-friendly slug
    const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setStoreSlug(slug);
  };

  const handleSaveStore = async () => {
    if (!storeName.trim() || !storeSlug.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم المتجر والاسم بالإنجليزية",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) {
        throw new Error('لم يتم العثور على الملف الشخصي');
      }

      let logoUrl = null;
      
      // Upload logo if exists
      if (storeLogo) {
        const fileExt = storeLogo.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`shop-logos/${fileName}`, storeLogo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`shop-logos/${fileName}`);
        
        logoUrl = publicUrl;
      }

      if (userShop) {
        // Update existing shop
        const { error } = await supabase
          .from('shops')
          .update({
            display_name: storeName,
            slug: storeSlug,
            ...(logoUrl && { logo_url: logoUrl })
          })
          .eq('id', userShop.id);

        if (error) throw error;
      } else {
        // Create new shop
        const { data: newShop, error } = await supabase
          .from('shops')
          .insert({
            owner_id: profile.id,
            display_name: storeName,
            slug: storeSlug,
            ...(logoUrl && { logo_url: logoUrl })
          })
          .select()
          .single();

        if (error) throw error;
        setUserShop(newShop);
      }

      toast({
        title: "تم بنجاح",
        description: userShop ? "تم تحديث المتجر بنجاح" : "تم إنشاء المتجر بنجاح"
      });

      // Refresh shop data
      await fetchUserShop();

    } catch (error: any) {
      console.error('Error saving store:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ المتجر",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'settings', title: 'إعدادات المتجر', icon: Settings },
    { id: 'products', title: 'إدارة المنتجات', icon: Package },
    { id: 'analytics', title: 'الإحصائيات', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للرئيسية
            </Button>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">إدارة المتجر</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">أقسام الإدارة</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-muted/50 transition-colors ${
                            activeSection === section.id 
                              ? 'bg-primary/10 border-r-2 border-primary text-primary' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{section.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeSection === 'settings' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Settings className="h-6 w-6" />
                      إعدادات المتجر
                    </CardTitle>
                    <CardDescription>
                      قم بتخصيص إعدادات متجرك الإلكتروني
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Store Name */}
                      <div className="space-y-2">
                        <Label htmlFor="storeName">اسم المتجر</Label>
                        <Input
                          id="storeName"
                          placeholder="أدخل اسم متجرك"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                        />
                      </div>

                      {/* Store Slug (English) */}
                      <div className="space-y-2">
                        <Label htmlFor="storeSlug">الاسم بالإنجليزية (للدومين)</Label>
                        <Input
                          id="storeSlug"
                          placeholder="mystore"
                          value={storeSlug}
                          onChange={(e) => handleStoreSlugChange(e.target.value)}
                          dir="ltr"
                        />
                        {storeSlug && (
                          <p className="text-sm text-muted-foreground" dir="ltr">
                            Domain: {storeSlug}.yoursite.com
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label>شعار المتجر</Label>
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <label 
                          htmlFor="logo-upload" 
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            اضغط لرفع الشعار
                          </span>
                          {storeLogo && (
                            <span className="text-sm text-primary font-medium">
                              تم اختيار: {storeLogo.name}
                            </span>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Store Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div>
                        <Label htmlFor="store-enabled" className="text-base font-medium">
                          تشغيل المتجر
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {storeEnabled ? 'المتجر نشط ومتاح للعملاء' : 'المتجر معطل حالياً'}
                        </p>
                      </div>
                      <Switch
                        id="store-enabled"
                        checked={storeEnabled}
                        onCheckedChange={setStoreEnabled}
                      />
                    </div>

                    {/* Save Button */}
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleSaveStore}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : userShop ? (
                        'تحديث إعدادات المتجر'
                      ) : (
                        'إنشاء المتجر'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeSection === 'products' && (
                <StoreProductsSection userShop={userShop} />
              )}

              {activeSection === 'analytics' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <BarChart3 className="h-6 w-6" />
                      الإحصائيات
                    </CardTitle>
                    <CardDescription>
                      تتبع أداء متجرك ومبيعاتك
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">الإحصائيات والتحليل</h3>
                      <p className="text-muted-foreground mb-4">
                        سيتم إضافة هذا القسم قريباً
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;