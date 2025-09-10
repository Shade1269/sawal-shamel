import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Store, Settings, Package, BarChart3, Loader2, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useFirebaseUserData } from '@/hooks/useFirebaseUserData';
import { toast } from '@/hooks/use-toast';
import StoreProductsSection from '@/components/StoreProductsSection';
import { StoreOrders } from '@/components/StoreOrders';

const StoreManagementFirestore = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { 
    userShop, 
    createShop, 
    loading,
    error 
  } = useFirebaseUserData();

  // Store management form state
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [activeSection, setActiveSection] = useState('settings');
  const [saving, setSaving] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Update form data when userShop changes
  React.useEffect(() => {
    if (userShop) {
      setStoreName(userShop.shop_name || '');
      setStoreSlug(userShop.shop_slug || '');
      setStoreUrl(`https://atlantiss.tech/store/${userShop.shop_slug}`);
    }
  }, [userShop]);

  const validateSlug = (slug: string): { isValid: boolean; error?: string } => {
    if (!/^[a-z0-9-]{3,30}$/.test(slug)) {
      if (slug.length < 3) {
        return { isValid: false, error: 'اسم الرابط قصير جداً (أقل من 3 أحرف)' };
      }
      if (slug.length > 30) {
        return { isValid: false, error: 'اسم الرابط طويل جداً (أكثر من 30 حرف)' };
      }
      return { isValid: false, error: 'اسم الرابط يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط' };
    }
    const reservedNames = ['www', 'api', 'mail', 'admin', 'support', 'app', 'help', 'blog', 'shop', 'store'];
    if (reservedNames.includes(slug)) {
      return { isValid: false, error: 'اسم الرابط محجوز ولا يمكن استخدامه، يرجى اختيار اسم آخر' };
    }
    return { isValid: true };
  };

  const generateSubdomain = (storeName: string): string => {
    return storeName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleSaveStore = async () => {
    if (!storeName.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم المتجر",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      let slug = storeSlug.trim();
      if (!slug) {
        slug = generateSubdomain(storeName);
      }

      const validation = validateSlug(slug);
      if (!validation.isValid) {
        toast({
          title: "خطأ في اسم الرابط",
          description: `${validation.error}. يرجى تعديل "اسم الرابط" أدناه.`,
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      await createShop(storeName, slug);

      const store_url = `https://atlantiss.tech/store/${slug}`;
      setStoreUrl(store_url);
      setShowSuccessCard(true);

      toast({
        title: "تم إنشاء المتجر بنجاح",
        description: "يمكنك الآن نسخ رابط المتجر ومشاركته",
        action: (
          <Button
            size="sm"
            onClick={() => copyStoreUrl()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Copy className="h-4 w-4 mr-1" />
            نسخ الرابط
          </Button>
        ),
      });

      setStoreSlug(slug);

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

  const copyStoreUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط المتجر إلى الحافظة"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ الرابط",
        variant: "destructive"
      });
    }
  };

  const openStoreInNewTab = () => {
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    }
  };

  const handleStoreSlugChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setStoreSlug(slug);
  };

  const handleStoreNameChange = (name: string) => {
    setStoreName(name);
    if (!storeSlug || storeSlug === generateSubdomain(storeName)) {
      const newSlug = generateSubdomain(name);
      setStoreSlug(newSlug);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">إدارة المتجر</h1>
              <p className="text-muted-foreground">إنشاء وإدارة متجرك الإلكتروني</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessCard && userShop && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">تم إنشاء متجرك بنجاح!</h3>
                    <p className="text-sm text-green-600">يمكنك الآن إضافة المنتجات ومشاركة رابط المتجر</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyStoreUrl}>
                    <Copy className="h-4 w-4 mr-1" />
                    نسخ الرابط
                  </Button>
                  <Button size="sm" onClick={openStoreInNewTab}>
                    زيارة المتجر
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeSection === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveSection('settings')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            الإعدادات العامة
          </Button>
          {userShop && (
            <>
              <Button
                variant={activeSection === 'products' ? 'default' : 'outline'}
                onClick={() => setActiveSection('products')}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                إدارة المنتجات
              </Button>
              <Button
                variant={activeSection === 'orders' ? 'default' : 'outline'}
                onClick={() => setActiveSection('orders')}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                إدارة الطلبات
              </Button>
            </>
          )}
        </div>

        {/* Content based on active section */}
        <div className="space-y-8">
          {activeSection === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  إعدادات المتجر
                </CardTitle>
                <CardDescription>
                  {userShop ? 'تحديث معلومات متجرك' : 'إنشاء متجرك الإلكتروني الجديد'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">اسم المتجر *</Label>
                    <Input
                      id="storeName"
                      placeholder="اسم متجرك"
                      value={storeName}
                      onChange={(e) => handleStoreNameChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeSlug">اسم الرابط (URL)</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md">
                        atlantiss.tech/store/
                      </span>
                      <Input
                        id="storeSlug"
                        placeholder="store-name"
                        value={storeSlug}
                        onChange={(e) => handleStoreSlugChange(e.target.value)}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveStore} 
                    disabled={saving}
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4 mr-2" />
                        {userShop ? 'تحديث المتجر' : 'إنشاء المتجر'}
                      </>
                    )}
                  </Button>
                </div>

                {userShop && storeUrl && (
                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">رابط متجرك</h4>
                        <p className="text-sm text-muted-foreground">{storeUrl}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyStoreUrl}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={openStoreInNewTab}>
                          زيارة المتجر
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === 'products' && userShop && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  إدارة المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StoreProductsSection userShop={userShop} />
              </CardContent>
            </Card>
          )}

          {activeSection === 'orders' && userShop && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  إدارة الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StoreOrders shopId={userShop?.shop_id || ''} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreManagementFirestore;