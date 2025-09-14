import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Hash, Package, LogOut, User, Store, Moon, Sun, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useFastAuth } from '@/hooks/useFastAuth';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated } = useFastAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { language, toggleLanguage, t } = useLanguage();

  const currentUser = user;
  
  const handleChatClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/atlantis/chat');
  };

  const handleInventoryClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/products');
  };

  const handleStoreManagementClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email;
    return 'ضيف';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Damascus decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-persian opacity-12 rounded-full blur-2xl animate-persian-float pointer-events-none"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-luxury opacity-18 rounded-full blur-xl animate-persian-float pointer-events-none" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-persian-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-premium opacity-15 rounded-full blur-2xl animate-damascus-float pointer-events-none" style={{ animationDelay: '3s' }}></div>
        
        {/* Heritage arabesque patterns */}
        <div className="absolute top-0 left-0 w-full h-32 opacity-8 bg-gradient-to-r from-transparent via-persian to-transparent animate-heritage-wave pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 opacity-8 bg-gradient-to-r from-transparent via-primary to-transparent animate-heritage-wave pointer-events-none" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Header with user controls */}
      {currentUser && (
        <div className="border-b bg-gradient-to-r from-card to-card/80 backdrop-blur-md border-persian/20 shadow-persian">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 bg-gradient-to-r from-persian/20 to-primary/20 p-4 rounded-xl border border-persian/30 shadow-soft">
                <User className="h-5 w-5 text-persian animate-persian-float" />
                <span className="text-base font-semibold text-persian">
                  مرحباً، {getUserDisplayName()}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Language Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="gap-2 hover:bg-persian/10 border border-persian/20 text-persian hover:text-persian"
                >
                  <Languages className="h-4 w-4" />
                  {language === 'ar' ? 'EN' : 'AR'}
                </Button>
                
                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="gap-2 hover:bg-persian/10 border border-persian/20 text-persian hover:text-persian"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDarkMode ? 'نهاري' : 'ليلي'}
                </Button>
                
                {/* Logout Button */}
                <Button
                  variant="persian"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2 hover:shadow-persian border border-persian/30"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل خروج
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-persian px-4 py-2 rounded-full text-white text-sm font-medium shadow-glow animate-pulse">
              🚀 منصة حية مع بيانات حقيقية
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-persian bg-clip-text text-transparent mb-4">
            منصة أتلانتس للتجارة الإلكترونية
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            استكشف عالم التسوق الفاخر مع تجربة تجارة إلكترونية لا مثيل لها
          </p>
          
          {/* إحصائيات المنصة المباشرة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary mb-1">25</div>
              <div className="text-sm text-muted-foreground">مستخدم نشط</div>
            </div>
            <div className="bg-gradient-to-br from-luxury/10 to-luxury/5 p-4 rounded-xl border border-luxury/20 backdrop-blur-sm">
              <div className="text-2xl font-bold text-luxury mb-1">7</div>
              <div className="text-sm text-muted-foreground">متجر فعال</div>
            </div>
            <div className="bg-gradient-to-br from-premium/10 to-premium/5 p-4 rounded-xl border border-premium/20 backdrop-blur-sm">
              <div className="text-2xl font-bold text-premium mb-1">152</div>
              <div className="text-sm text-muted-foreground">منتج متنوع</div>
            </div>
            <div className="bg-gradient-to-br from-persian/10 to-persian/5 p-4 rounded-xl border border-persian/20 backdrop-blur-sm">
              <div className="text-2xl font-bold text-persian mb-1">4</div>
              <div className="text-sm text-muted-foreground">تاجر موثوق</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-luxury transition-all duration-500 cursor-pointer border border-border/30 hover:border-primary/50 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow group-hover:scale-110 transition-all duration-500 shadow-soft">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">دردشة العملاء</CardTitle>
                <CardDescription className="text-lg">
                  تواصل مع فريق الدعم والعملاء الآخرين في الوقت الفعلي
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="persian"
                  size="lg" 
                  className="w-full h-12 text-lg font-bold rounded-xl"
                  onClick={handleChatClick}
                >
                  بدء المحادثة
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-luxury transition-all duration-500 cursor-pointer border border-border/30 hover:border-luxury/50 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-luxury rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow group-hover:scale-110 transition-all duration-500 shadow-soft">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">كتالوج المنتجات</CardTitle>
                <CardDescription className="text-lg">
                  استكشف 152+ منتج فاخر وحصري من متاجرنا المتنوعة
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="commerce"
                  size="lg" 
                  className="w-full h-12 text-lg font-bold rounded-xl"
                  onClick={handleInventoryClick}
                >
                  تصفح المنتجات
                </Button>
                <div className="mt-4 text-sm text-muted-foreground">
                  🔥 منتجات جديدة كل يوم
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-luxury transition-all duration-500 border border-border/30 hover:border-premium/50 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-glow group-hover:scale-110 transition-all duration-500 shadow-soft">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent">مجتمع أتلانتس</CardTitle>
                <CardDescription className="text-lg">
                  انضم لـ 25+ مستخدم نشط في منصة التجارة والأفيليت
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-3 text-muted-foreground bg-gradient-to-r from-muted/20 to-muted/10 p-3 rounded-xl border border-border/20">
                  <Hash className="h-5 w-5" />
                  <span className="font-medium">تجربة تسوق حصرية 24/7</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <div className="font-bold text-primary">7</div>
                    <div className="text-muted-foreground">متاجر</div>
                  </div>
                  <div className="bg-luxury/10 p-2 rounded-lg">
                    <div className="font-bold text-luxury">4</div>
                    <div className="text-muted-foreground">تجار</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Management Section */}
          {currentUser && (
            <div className="mb-12">
              <Card className="group hover:shadow-persian transition-all duration-500 cursor-pointer border border-border/30 hover:border-persian/50 bg-gradient-to-br from-card/60 to-card backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gradient-persian rounded-3xl flex items-center justify-center mb-6 group-hover:shadow-persian group-hover:scale-110 transition-all duration-500 shadow-elegant">
                    <Store className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-persian bg-clip-text text-transparent">لوحة التحكم التجارية</CardTitle>
                  <CardDescription className="text-lg mt-3">
                    إدارة شاملة لمتجرك الإلكتروني ومنتجاتك وطلباتك
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <Button 
                    variant="persian"
                    size="lg" 
                    className="w-full h-14 text-xl font-black rounded-2xl"
                    onClick={handleStoreManagementClick}
                  >
                    دخول لوحة التحكم
                  </Button>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gradient-to-r from-primary/15 to-primary/8 p-3 rounded-xl border border-primary/25">
                      <p className="text-sm font-medium text-primary">إدارة المنتجات</p>
                    </div>
                    <div className="bg-gradient-to-r from-luxury/15 to-luxury/8 p-3 rounded-xl border border-luxury/25">
                      <p className="text-sm font-medium text-luxury">تتبع المبيعات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          )}


          {!currentUser && (
            <div className="text-center">
              <Card className="max-w-lg mx-auto border border-border/30 bg-gradient-to-br from-card/60 to-card backdrop-blur-sm shadow-elegant">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-persian rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-persian bg-clip-text text-transparent">انضم إلى أتلانتس</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    سجل حساب جديد واستمتع بتجربة تسوق لا تُنسى
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="persian"
                    size="lg"
                    className="w-full h-12 text-lg font-bold rounded-xl"
                    onClick={() => navigate('/auth')}
                  >
                    بدء رحلة التسوق
                  </Button>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-primary/8 rounded-lg border border-primary/15">
                      <p className="font-medium text-primary">تسوق آمن</p>
                    </div>
                    <div className="text-center p-2 bg-luxury/8 rounded-lg border border-luxury/15">
                      <p className="font-medium text-luxury">شحن مجاني</p>
                    </div>
                  </div>
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
