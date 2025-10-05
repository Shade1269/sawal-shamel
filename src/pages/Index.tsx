import React, { Suspense } from 'react';
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
import {
  MessageCircle,
  Users,
  Hash,
  Package,
  LogOut,
  User,
  Store,
  Moon,
  Sun,
  Languages,
  TrendingUp,
  CreditCard,
  LineChart,
  ArrowUpRight,
  ShoppingBag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useFastAuth } from '@/hooks/useFastAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button as ThemeButton } from '@/ui/Button';
import { Card as ThemeCard } from '@/ui/Card';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserDataContext } from '@/contexts/UserDataContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated, loading } = useFastAuth();
  const { userShop, userStatistics } = useUserDataContext();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { language, toggleLanguage } = useLanguage();
  const { themeId } = useTheme('default');

  // Remove forced redirect - allow anonymous users to access homepage

  const currentUser = user;
  const role = profile?.role;
  const storeSlug = userShop?.slug;
  const storeLink = storeSlug ? `/${storeSlug}` : '/atlantis';

  const formatNumber = (value?: number, fallback = '0') =>
    typeof value === 'number' ? value.toLocaleString('ar-EG') : fallback;

  const formatCurrency = (value?: number, fallback = '‎45٬200 ر.س') => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(value);
    }
    return fallback;
  };

  const adminMetrics = React.useMemo(
    () => [
      {
        label: 'الطلبات النشطة',
        value: formatNumber(userStatistics?.pendingOrders, '128'),
        hint: '+12% هذا الأسبوع',
        icon: ShoppingBag,
        target: '/admin/orders',
      },
      {
        label: 'إيرادات اليوم',
        value: formatCurrency(userStatistics?.revenueToday, '‎45٬200 ر.س'),
        hint: 'متوسط 1.8k لكل ساعة',
        icon: CreditCard,
        target: '/admin/analytics',
      },
      {
        label: 'الشركاء النشطون',
        value: formatNumber(userStatistics?.activeAffiliates, '36'),
        hint: '+5 مسوقين جدد',
        icon: Users,
        target: '/admin/dashboard',
      },
    ],
    [userStatistics]
  );

  const affiliateSummary = React.useMemo(
    () => ({
      conversions: formatNumber(userStatistics?.conversionsToday, '18'),
      revenue: formatCurrency(userStatistics?.commissionToday, '‎2٬450 ر.س'),
      clickRate: `${formatNumber(userStatistics?.clickRate, '3.4')}%`,
    }),
    [userStatistics]
  );

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
    // Use smart navigation to go to appropriate dashboard based on user role
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (profile?.role === 'affiliate' || profile?.role === 'merchant' || profile?.role === 'marketer') {
      navigate('/affiliate');
    } else {
      navigate('/');
    }
  };

  const handleNavigate = (path: string) => () => navigate(path);
  const handleStorefrontNavigate = () => navigate(storeLink);

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
                    onClick={() => navigate('/auth')}
                  >
                    بدء رحلة التسوق
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline"
                    size="lg"
                    className="w-full h-12 text-lg font-bold rounded-xl"
                    onClick={() => navigate('/store/demo-store')}
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
