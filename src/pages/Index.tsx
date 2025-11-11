import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Hash, Package, Store, ExternalLink, AlertCircle } from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { HomeHero, HomeFeatureCard, HomeUserHeader } from '@/components/home';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardDescription, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useFastAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { language, toggleLanguage } = useLanguage();
  const { store: affiliateStore, isLoading: affiliateStoreLoading } = useAffiliateStore();

  const currentUser = user;

  const handleClick = (path: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  const handleDashboardClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (profile?.role === 'affiliate' || profile?.role === 'marketer') {
      navigate('/affiliate');
    } else if (profile?.role === 'merchant') {
      navigate('/merchant');
    } else {
      navigate('/');
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
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Decorative Background */}
      <div className="decorative-bg" />
      
      {/* User Header */}
      {currentUser && (
        <HomeUserHeader
          userName={getUserDisplayName()}
          language={language}
          isDarkMode={isDarkMode}
          onLanguageToggle={toggleLanguage}
          onDarkModeToggle={toggleDarkMode}
          onSignOut={handleSignOut}
        />
      )}
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <HomeHero isDarkMode={isDarkMode} />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <HomeFeatureCard
              title="دردشة العملاء"
              description="تواصل مع فريق الدعم والعملاء الآخرين في الوقت الفعلي"
              icon={MessageCircle}
              gradientClass="gradient-ocean"
              buttonText="بدء المحادثة"
              buttonVariant="primary"
              onClick={() => handleClick('/atlantis/chat')}
              badge={{ color: 'success', pulse: true }}
            />

            <HomeFeatureCard
              title="كتالوج المنتجات"
              description="استكشف 152+ منتج فاخر وحصري من متاجرنا المتنوعة"
              icon={Package}
              gradientClass="gradient-sunset"
              buttonText="تصفح المنتجات"
              buttonVariant="luxury"
              onClick={() => handleClick('/products')}
              badge={{ color: 'warning', pulse: true }}
            >
              <div className="mt-4 text-sm text-muted-foreground">
                🔥 منتجات جديدة كل يوم
              </div>
            </HomeFeatureCard>

            {(profile?.role === 'affiliate' || profile?.role === 'marketer') ? (
              <UnifiedCard variant="glass" hover="lift">
                <UnifiedCardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 gradient-purple rounded-3xl flex items-center justify-center mb-6 shadow-soft interactive-scale-110 relative overflow-hidden">
                    <Store className="h-12 w-12 text-white relative z-10" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                  <UnifiedCardTitle className="text-2xl gradient-text premium-text">
                    متجري الإلكتروني
                  </UnifiedCardTitle>
                  <UnifiedCardDescription className="text-lg elegant-text">
                    {affiliateStoreLoading 
                      ? 'جاري التحميل...' 
                      : affiliateStore 
                        ? 'اذهب لمتجرك وشارك منتجاتك مع العملاء'
                        : 'أنشئ متجرك الإلكتروني وابدأ التسويق'}
                  </UnifiedCardDescription>
                </UnifiedCardHeader>
                <UnifiedCardContent className="text-center space-y-3">
                  {affiliateStoreLoading ? (
                    <div className="glass-button p-3 rounded-xl border border-border/20">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
                      <span className="text-sm">جاري التحقق...</span>
                    </div>
                  ) : affiliateStore ? (
                    <>
                      <div className="glass-button-strong border border-success/20 p-3 rounded-xl">
                        <Store className="h-5 w-5 mx-auto mb-2 text-success" />
                        <span className="text-sm font-medium text-success">المتجر نشط ✓</span>
                      </div>
                      <UnifiedButton 
                        variant="premium"
                        size="lg" 
                        className="w-full"
                        onClick={() => window.open(`/${affiliateStore.store_slug}`, '_blank')}
                      >
                        <ExternalLink className="h-5 w-5 ml-2" />
                        اذهب للمتجر
                      </UnifiedButton>
                    </>
                  ) : (
                    <>
                      <div className="glass-button-strong border border-warning/20 p-3 rounded-xl">
                        <AlertCircle className="h-5 w-5 mx-auto mb-2 text-warning" />
                        <span className="text-sm font-medium">المتجر لم ينشأ بعد</span>
                      </div>
                      <UnifiedButton 
                        variant="premium"
                        size="lg" 
                        className="w-full"
                        onClick={() => navigate('/affiliate/store/setup')}
                      >
                        إنشاء متجر
                      </UnifiedButton>
                    </>
                  )}
                </UnifiedCardContent>
              </UnifiedCard>
            ) : (
              <UnifiedCard variant="glass" hover="lift">
                <UnifiedCardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 gradient-forest rounded-3xl flex items-center justify-center mb-6 shadow-soft interactive-scale-110">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <UnifiedCardTitle className="text-2xl gradient-text premium-text">
                    مجتمع أتلانتس
                  </UnifiedCardTitle>
                  <UnifiedCardDescription className="text-lg elegant-text">
                    انضم لـ 25+ مستخدم نشط في منصة التجارة والأفيليت
                  </UnifiedCardDescription>
                </UnifiedCardHeader>
                <UnifiedCardContent className="text-center">
                  <div className="glass-button p-3 rounded-xl">
                    <Hash className="h-5 w-5 mx-auto mb-2" />
                    <span className="text-sm font-medium">تجربة تسوق حصرية 24/7</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="glass-button p-2 rounded-lg">
                      <div className="font-bold text-primary">7</div>
                      <div className="text-muted-foreground">متاجر</div>
                    </div>
                    <div className="glass-button p-2 rounded-lg">
                      <div className="font-bold text-luxury">4</div>
                      <div className="text-muted-foreground">تجار</div>
                    </div>
                  </div>
                </UnifiedCardContent>
              </UnifiedCard>
            )}
          </div>

          {currentUser && (
            <div className="mb-12">
              <UnifiedCard variant="luxury" hover="lift" onClick={handleDashboardClick}>
                <UnifiedCardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mb-6 shadow-glow">
                    <Store className="h-12 w-12 text-white" />
                  </div>
                  <UnifiedCardTitle className="text-3xl font-black gradient-text-hero premium-text">
                    لوحة التحكم التجارية
                  </UnifiedCardTitle>
                  <UnifiedCardDescription className="text-lg mt-3 elegant-text">
                    إدارة شاملة لمتجرك الإلكتروني ومنتجاتك وطلباتك
                  </UnifiedCardDescription>
                </UnifiedCardHeader>
                <UnifiedCardContent className="text-center space-y-4">
                  <UnifiedButton 
                    variant="secondary"
                    size="lg" 
                    className="w-full"
                  >
                    دخول لوحة التحكم
                  </UnifiedButton>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-button p-3 rounded-xl border border-primary/20">
                      <p className="text-sm font-medium text-primary">إدارة المنتجات</p>
                    </div>
                    <div className="glass-button p-3 rounded-xl border border-luxury/20">
                      <p className="text-sm font-medium text-luxury">تتبع المبيعات</p>
                    </div>
                  </div>
                </UnifiedCardContent>
              </UnifiedCard>
            </div>
          )}

          {!currentUser && (
            <div className="text-center">
              <UnifiedCard variant="glass" className="max-w-lg mx-auto" hover="glow">
                <UnifiedCardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <UnifiedCardTitle className="text-2xl font-bold gradient-text premium-text">
                    انضم إلى أتلانتس
                  </UnifiedCardTitle>
                  <UnifiedCardDescription className="text-lg mt-2 elegant-text">
                    سجل حساب جديد واستمتع بتجربة تسوق لا تُنسى
                  </UnifiedCardDescription>
                </UnifiedCardHeader>
                <UnifiedCardContent className="space-y-4">
                  <UnifiedButton 
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    بدء رحلة التسوق
                  </UnifiedButton>
                  <UnifiedButton
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/store/demo-store')}
                  >
                    جرب المتجر التجريبي
                  </UnifiedButton>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="glass-button p-2 rounded-lg border border-primary/15">
                      <p className="font-medium text-primary">تسوق آمن</p>
                    </div>
                    <div className="glass-button p-2 rounded-lg border border-luxury/15">
                      <p className="font-medium text-luxury">شحن مجاني</p>
                    </div>
                  </div>
                </UnifiedCardContent>
              </UnifiedCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
