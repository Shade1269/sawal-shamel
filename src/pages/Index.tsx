import React from 'react';
import { 
  EnhancedButton, 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardDescription, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  AnimatedCounter,
  Button
} from '@/components/ui/index';
import { MessageCircle, Users, Hash, Package, LogOut, User, Store, Moon, Sun, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useFastAuth } from '@/hooks/useFastAuth';
import { useTheme } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { Button as ThemeButton } from '@/ui/Button';
import { Card as ThemeCard } from '@/ui/Card';
import { Input as ThemeInput } from '@/ui/Input';
import { Badge as ThemeBadge } from '@/ui/Badge';
import { Hero3D as DefaultHero3D } from '@/themes/default/Hero3D';
import { Hero3D as LuxuryHero3D } from '@/themes/luxury/Hero3D';
import { Hero3D as DamascusHero3D } from '@/themes/damascus/Hero3D';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated } = useFastAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { language, toggleLanguage, t } = useLanguage();
  const { themeId } = useTheme('default');

  const heroMap = {
    default: DefaultHero3D,
    luxury: LuxuryHero3D,
    damascus: DamascusHero3D,
  } as const;

  const ActiveHero3D = heroMap[themeId as keyof typeof heroMap] ?? DefaultHero3D;

  const currentUser = user;
  
  const handleChatClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/atlantis/chat');
  };

  const handleInventoryClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/products');
  };

  const handleStoreManagementClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // Use smart navigation to go to appropriate dashboard based on user role
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (profile?.role === 'affiliate') {
      navigate('/merchant');
    } else if (profile?.role === 'merchant') {
      navigate('/merchant');
    } else {
      navigate('/old-dashboard'); // For other users, use the legacy dashboard
    }
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
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">نظام الثيمات</h2>
              <p className="text-sm text-muted-foreground">
                جرّب العناصر الأساسية لكل ثيم ولاحظ تأثير تغيير الألوان والهوية البصرية.
              </p>
            </div>
            <ThemeSwitcher />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <ThemeCard>
              <h3 className="text-base font-semibold mb-3 text-foreground">الأزرار</h3>
              <div className="flex flex-wrap gap-3">
                <ThemeButton size="sm">إجراء سريع</ThemeButton>
                <ThemeButton variant="outline">إجراء ثانوي</ThemeButton>
                <ThemeButton variant="ghost">إجراء خفي</ThemeButton>
              </div>
            </ThemeCard>
            <ThemeCard>
              <h3 className="text-base font-semibold mb-3 text-foreground">حقول الإدخال</h3>
              <ThemeInput placeholder="أدخل بريدك الإلكتروني" />
              <ThemeInput placeholder="تنبيه للتحقق" invalid className="mt-3" />
            </ThemeCard>
            <ThemeCard>
              <h3 className="text-base font-semibold mb-3 text-foreground">الشارات</h3>
              <div className="flex flex-wrap gap-2">
                <ThemeBadge>أساسي</ThemeBadge>
                <ThemeBadge variant="success">نجاح</ThemeBadge>
                <ThemeBadge variant="warning">تحذير</ThemeBadge>
                <ThemeBadge variant="danger">خطر</ThemeBadge>
                <ThemeBadge variant="muted">هادئ</ThemeBadge>
              </div>
            </ThemeCard>
          </div>
        </div>
        <div className="mb-16">
          <ActiveHero3D />
        </div>
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
            <EnhancedCard variant="glass" size="sm" hover="glow">
              <EnhancedCardContent className="text-center">
                <AnimatedCounter to={25} variant="primary" size="lg" className="mb-1" />
                <div className="text-sm text-muted-foreground">مستخدم نشط</div>
              </EnhancedCardContent>
            </EnhancedCard>
            <EnhancedCard variant="luxury" size="sm" hover="glow">
              <EnhancedCardContent className="text-center">
                <AnimatedCounter to={7} variant="luxury" size="lg" className="mb-1" />
                <div className="text-sm text-white/80">متجر فعال</div>
              </EnhancedCardContent>
            </EnhancedCard>
            <EnhancedCard variant="premium" size="sm" hover="glow">
              <EnhancedCardContent className="text-center">
                <AnimatedCounter to={152} variant="luxury" size="lg" className="mb-1" />
                <div className="text-sm text-white/80">منتج متنوع</div>
              </EnhancedCardContent>
            </EnhancedCard>
            <EnhancedCard variant="persian" size="sm" hover="glow">
              <EnhancedCardContent className="text-center">
                <AnimatedCounter to={4} variant="persian" size="lg" className="mb-1" />
                <div className="text-sm text-white/80">تاجر موثوق</div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>

        <ResponsiveLayout variant="glass" maxWidth="2xl" centerContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <EnhancedCard variant="glass" hover="lift" clickable onClick={handleChatClick}>
              <EnhancedCardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-glow">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <EnhancedCardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">دردشة العملاء</EnhancedCardTitle>
                <EnhancedCardDescription className="text-lg">
                  تواصل مع فريق الدعم والعملاء الآخرين في الوقت الفعلي
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="text-center">
                <EnhancedButton 
                  variant="persian"
                  size="lg" 
                  className="w-full h-12 text-lg font-bold rounded-xl"
                  animation="glow"
                >
                  بدء المحادثة
                </EnhancedButton>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="glass" hover="lift" clickable onClick={handleInventoryClick}>
              <EnhancedCardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-luxury rounded-2xl flex items-center justify-center mb-6 shadow-glow">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <EnhancedCardTitle className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">كتالوج المنتجات</EnhancedCardTitle>
                <EnhancedCardDescription className="text-lg">
                  استكشف 152+ منتج فاخر وحصري من متاجرنا المتنوعة
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="text-center">
                <EnhancedButton 
                  variant="luxury"
                  size="lg" 
                  className="w-full h-12 text-lg font-bold rounded-xl"
                  animation="glow"
                >
                  تصفح المنتجات
                </EnhancedButton>
                <div className="mt-4 text-sm text-muted-foreground">
                  🔥 منتجات جديدة كل يوم
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="glass" hover="lift">
              <EnhancedCardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-premium rounded-2xl flex items-center justify-center mb-6 shadow-glow">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <EnhancedCardTitle className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent">مجتمع أتلانتس</EnhancedCardTitle>
                <EnhancedCardDescription className="text-lg">
                  انضم لـ 25+ مستخدم نشط في منصة التجارة والأفيليت
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="text-center">
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
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Store Management Section */}
          {currentUser && (
            <div className="mb-12">
              <EnhancedCard variant="persian" hover="luxury" clickable onClick={handleStoreManagementClick}>
                <EnhancedCardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 bg-gradient-persian rounded-3xl flex items-center justify-center mb-6 shadow-persian">
                    <Store className="h-12 w-12 text-white" />
                  </div>
                  <EnhancedCardTitle className="text-3xl font-black text-white">لوحة التحكم التجارية</EnhancedCardTitle>
                  <EnhancedCardDescription className="text-lg mt-3 text-white/80">
                    إدارة شاملة لمتجرك الإلكتروني ومنتجاتك وطلباتك
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent className="text-center space-y-4">
                  <EnhancedButton 
                    variant="glass"
                    size="lg" 
                    className="w-full h-14 text-xl font-black rounded-2xl"
                    animation="glow"
                  >
                    دخول لوحة التحكم
                  </EnhancedButton>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gradient-to-r from-primary/15 to-primary/8 p-3 rounded-xl border border-primary/25">
                      <p className="text-sm font-medium text-primary">إدارة المنتجات</p>
                    </div>
                    <div className="bg-gradient-to-r from-luxury/15 to-luxury/8 p-3 rounded-xl border border-luxury/25">
                      <p className="text-sm font-medium text-luxury">تتبع المبيعات</p>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
              
            </div>
          )}


          {!currentUser && (
            <div className="text-center">
              <EnhancedCard variant="glass" className="max-w-lg mx-auto" hover="glow">
                <EnhancedCardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-persian rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <EnhancedCardTitle className="text-2xl font-bold bg-gradient-persian bg-clip-text text-transparent">انضم إلى أتلانتس</EnhancedCardTitle>
                  <EnhancedCardDescription className="text-lg mt-2">
                    سجل حساب جديد واستمتع بتجربة تسوق لا تُنسى
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent className="space-y-4">
                  <EnhancedButton 
                    variant="persian"
                    size="lg"
                    className="w-full h-12 text-lg font-bold rounded-xl"
                    animation="glow"
                    onClick={() => navigate('/login')}
                  >
                    بدء رحلة التسوق
                  </EnhancedButton>
                  <EnhancedButton 
                    variant="outline"
                    size="lg"
                    className="w-full h-12 text-lg font-bold rounded-xl"
                    onClick={() => navigate('/s/demo-store')}
                  >
                    جرب المتجر التجريبي
                  </EnhancedButton>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-primary/8 rounded-lg border border-primary/15">
                      <p className="font-medium text-primary">تسوق آمن</p>
                    </div>
                    <div className="text-center p-2 bg-luxury/8 rounded-lg border border-luxury/15">
                      <p className="font-medium text-luxury">شحن مجاني</p>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          )}
        </ResponsiveLayout>
      </div>
    </div>
  );
};

export default Index;
