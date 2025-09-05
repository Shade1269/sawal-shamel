import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Store, Settings, Upload, Package, BarChart3, Loader2, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StoreProductsSection from '@/components/StoreProductsSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [storeUrl, setStoreUrl] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [theme, setTheme] = useState<string>('classic');

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
          setTheme(shop.theme || 'classic');
          setStoreUrl(`https://atlantiss.tech/store/${shop.slug}`);
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

  // Reserved names that cannot be used as subdomains
  const reservedNames = ['www', 'api', 'mail', 'admin', 'support', 'app', 'help', 'blog', 'shop', 'store'];

  // Step 2: Generate subdomain from store name
  const generateSubdomain = (storeName: string): string => {
    // Arabic to Latin transliteration map (basic)
    const arabicToLatin: { [key: string]: string } = {
      'أ': 'a', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
      'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
      'ط': 't', 'ظ': 'th', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
      'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ى': 'a'
    };

    let slug = storeName.toLowerCase().trim();
    
    // Convert Arabic characters to Latin
    slug = slug.split('').map(char => arabicToLatin[char] || char).join('');
    
    // Keep only letters, numbers, and spaces
    slug = slug.replace(/[^a-z0-9\s]/g, '');
    
    // Replace spaces with hyphens and clean up
    slug = slug.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    return slug;
  };

  // Step 3: Validate slug against regex and reserved names
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
    if (reservedNames.includes(slug)) {
      return { isValid: false, error: 'اسم الرابط محجوز ولا يمكن استخدامه، يرجى اختيار اسم آخر' };
    }
    return { isValid: true };
  };

  // Step 4: Ensure unique subdomain
  const ensureUniqueSubdomain = async (slug: string): Promise<string> => {
    let finalSlug = slug;
    let counter = 1;
    
    while (true) {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('slug')
          .eq('slug', finalSlug)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        // If no existing record found, slug is available
        if (!data) {
          break;
        }
        
        // Generate next variant
        counter++;
        finalSlug = `${slug}-${counter}`;
        if (counter > 100) break; // Safety limit
      } catch (error) {
        console.error('Error checking slug availability:', error);
        break;
      }
    }
    
    return finalSlug;
  };

  // Step 5: Upsert store data
  const upsertStore = async (storeData: {
    subdomain: string;
    store_name: string;
    logo_url?: string | null;
    is_active: boolean;
    owner_id: string;
  }) => {
    if (userShop) {
      // Update existing shop
      const updateData: any = {
        display_name: storeData.store_name,
        slug: storeData.subdomain,
      };
      
      if (storeData.logo_url) {
        updateData.logo_url = storeData.logo_url;
      }

      const { data, error } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', userShop.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new shop
      const shopData: any = {
        owner_id: storeData.owner_id,
        display_name: storeData.store_name,
        slug: storeData.subdomain,
      };
      
      if (storeData.logo_url) {
        shopData.logo_url = storeData.logo_url;
      }

      const { data, error } = await supabase
        .from('shops')
        .insert(shopData)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  // Generate slug from Arabic or English text (for auto-completion)
  const generateSlugFromText = (text: string): string => {
    return generateSubdomain(text);
  };

  // Check if slug is available in database
  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return !data; // true if available (no existing record)
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  };

  // Generate unique slug with number suffix if needed
  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    return ensureUniqueSubdomain(baseSlug);
  };

  const handleStoreSlugChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setStoreSlug(slug);
  };

  // Auto-generate slug from store name
  const handleStoreNameChange = (name: string) => {
    setStoreName(name);
    
    // Auto-generate slug if user hasn't manually set one
    if (!storeSlug || storeSlug === generateSlugFromText(storeName)) {
      const newSlug = generateSlugFromText(name);
      setStoreSlug(newSlug);
    }
  };

  const handleSaveStore = async () => {
    // Step 1: Take store_name from field
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
      // Step 2: Execute slug = generateSubdomain(store_name)
      let slug = storeSlug.trim();
      if (!slug) {
        slug = generateSubdomain(storeName);
      }

      // Step 3: Validate slug against regex and reserved names
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

      // Step 4: slug = ensureUniqueSubdomain(slug)
      const uniqueSlug = await ensureUniqueSubdomain(slug);

      // Get user profile for owner_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (profileError || !profile) {
        throw new Error('لم يتم العثور على الملف الشخصي');
      }

      // Handle logo upload
      let logoUrl = null;
      if (storeLogo) {
        const fileExt = storeLogo.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user?.id}/${fileName}`, storeLogo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${user?.id}/${fileName}`);
        
        logoUrl = publicUrl;
      }

      // Step 5: store = upsertStore({subdomain: slug, store_name, logo_url, is_active: true})
      const store = await upsertStore({
        subdomain: uniqueSlug,
        store_name: storeName,
        logo_url: logoUrl,
        is_active: true,
        owner_id: profile.id
      });

      // Step 6: Generate store URL (always use your production domain)
      const baseUrl = 'https://atlantiss.tech';
      const store_url = `${baseUrl}/store/${uniqueSlug}`;
      setStoreUrl(store_url);
      setShowSuccessCard(true);

      // Step 7: Show success toast with copy button
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

      // Update local state
      setUserShop(store);
      setStoreSlug(uniqueSlug);

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

  // Copy store URL to clipboard
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

  // Open store in new tab
  const openStoreInNewTab = () => {
    window.open(storeUrl, '_blank');
  };

  // Update theme in DB and local state
  const updateTheme = async (newTheme: string) => {
    try {
      setTheme(newTheme);
      if (!userShop?.id) return;
      const { error } = await supabase
        .from('shops')
        .update({ theme: newTheme })
        .eq('id', userShop.id);
      if (error) throw error;
      toast({ title: 'تم التحديث', description: 'تم تحديث تصميم المتجر بنجاح' });
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message || 'تعذر تحديث التصميم', variant: 'destructive' });
    }
  };

  const sections = [
    { id: 'settings', title: 'إعدادات المتجر', icon: Settings },
    { id: 'products', title: 'إدارة المنتجات', icon: Package },
    { id: 'store', title: 'المتجر', icon: Store },
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
              {/* Success Card - Show store URL after successful creation/update */}
              {showSuccessCard && storeUrl && (
                <Card className="mb-6 border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      تم إنشاء المتجر بنجاح
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      متجرك الإلكتروني جاهز الآن ويمكن الوصول إليه عبر الرابط التالي
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Store URL Display */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-700">رابط المتجر:</Label>
                      <div className="flex gap-2">
                        <Input
                          value={storeUrl}
                          readOnly
                          className="bg-white border-green-200 text-green-800 font-mono"
                          dir="ltr"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyStoreUrl}
                          className="border-green-200 hover:bg-green-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={openStoreInNewTab}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        فتح المتجر
                      </Button>
                      <Button
                        variant="outline"
                        onClick={copyStoreUrl}
                        className="border-green-200 text-green-700 hover:bg-green-100 flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        نسخ الرابط
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowSuccessCard(false)}
                        className="text-green-700 hover:bg-green-100"
                      >
                        إغلاق
                      </Button>
                    </div>
                    
                    {/* Step 8: Clickable text link that opens in new tab */}
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-sm text-green-600 mb-2">أو انقر على الرابط مباشرة:</p>
                      <button
                        onClick={openStoreInNewTab}
                        className="text-green-700 hover:text-green-800 underline decoration-green-300 hover:decoration-green-500 transition-colors font-mono text-sm"
                        dir="ltr"
                      >
                        {storeUrl}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                          onChange={(e) => handleStoreNameChange(e.target.value)}
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
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground" dir="ltr">
                              Domain: {storeSlug}.yoursite.com
                            </p>
                            {(() => {
                              const validation = validateSlug(storeSlug);
                              if (!validation.isValid) {
                                return (
                                  <p className="text-sm text-destructive">
                                    {validation.error}
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
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

              {activeSection === 'store' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Store className="h-6 w-6" />
                      المتجر
                    </CardTitle>
                    <CardDescription>
                      استعرض شكل المتجر كما سيظهر للعملاء، وخصص التصميم.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!userShop || !storeSlug ? (
                      <div className="text-center py-12">
                        <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">قم بإنشاء المتجر أولاً</h3>
                        <p className="text-muted-foreground mb-4">بعد حفظ الإعدادات سيظهر لك المعاينة هنا.</p>
                        <Button onClick={() => setActiveSection('settings')}>الذهاب للإعدادات</Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-1 space-y-4">
                            <div className="space-y-2">
                              <Label>رابط المتجر</Label>
                              <div className="flex gap-2" dir="ltr">
                                <Input value={storeUrl} readOnly className="font-mono" />
                                <Button variant="outline" size="icon" onClick={copyStoreUrl}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" size="icon" onClick={openStoreInNewTab}>
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>تصميم المتجر</Label>
                              <Select value={theme} onValueChange={updateTheme}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="اختر التصميم" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="classic">كلاسيك</SelectItem>
                                  <SelectItem value="modern">مودرن</SelectItem>
                                  <SelectItem value="minimal">مينيمال</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">يتم حفظ التغييرات تلقائياً.</p>
                            </div>
                          </div>

                          <div className="lg:col-span-2">
                            <div className="rounded-lg border overflow-hidden animate-fade-in bg-background">
                              <iframe
                                src={`/store/${storeSlug}`}
                                className="w-full h-[900px]"
                                title="Store Preview"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
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