import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MessageCircle, Users, Hash, Package, LogOut, User, Store, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Store management form state
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storeLogo, setStoreLogo] = useState<File | null>(null);
  const [storeEnabled, setStoreEnabled] = useState(false);

  const handleChatClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/chat');
  };

  const handleInventoryClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/inventory');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header with logout button */}
      {user && (
        <div className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  مرحباً، {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                تسجيل خروج
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            مرحباً بك في منصة الدردشة
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            انضم إلى مجتمعنا وتواصل مع الآخرين في بيئة آمنة ومريحة
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">الدردشة الجماعية</CardTitle>
                <CardDescription>
                  تواصل مع المجتمع في غرف الدردشة المختلفة
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleChatClick}
                >
                  دخول غرف الدردشة
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-secondary/50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Package className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">المخزون</CardTitle>
                <CardDescription>
                  تصفح كتالوج المنتجات والأسعار المتوفرة
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  className="w-full"
                  variant="secondary"
                  onClick={handleInventoryClick}
                >
                  عرض المنتجات
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">المجتمع النشط</CardTitle>
                <CardDescription>
                  انضم إلى مجتمع من المستخدمين الودودين والنشطين
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>متوفر 24/7</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Management Section */}
          {user && (
            <div className="mb-12">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Store className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">إدارة المتجر</CardTitle>
                      <CardDescription>
                        إعدادات متجرك الإلكتروني وإدارة المنتجات
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">إعدادات المتجر</h3>
                    
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
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
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
                    <Button className="w-full" size="lg">
                      حفظ إعدادات المتجر
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!user && (
            <div className="text-center">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>هل تريد الانضمام؟</CardTitle>
                  <CardDescription>
                    سجل حساب جديد أو سجل دخول للبدء
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    تسجيل دخول / إنشاء حساب
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
