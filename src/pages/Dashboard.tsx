import { 
  EnhancedButton,
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardDescription,
  EnhancedCardHeader,
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  InteractiveWidget,
  AnimatedCounter
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import QuickLinks from '@/components/navigation/QuickLinks';
import { AtlantisStatusWidget } from '@/features/chat/components/AtlantisStatusWidget';
import { 
  Crown, 
  Store, 
  Users, 
  ShoppingCart, 
  Award,
  Star,
  TrendingUp,
  Package,
  BarChart3,
  Settings,
  Plus,
  Eye,
  DollarSign,
  Target,
  Zap,
  Shield,
  Home,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { BackButton } from '@/components/ui/back-button';

const Dashboard = () => {
  const { profile } = useFastAuth();
  const { goToUserHome } = useSmartNavigation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'legendary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'admin': return <Crown className="h-5 w-5" />;
      case 'merchant': return <Store className="h-5 w-5" />;
      case 'affiliate': return <Star className="h-5 w-5" />;
      case 'customer': return <ShoppingCart className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getRoleName = () => {
    switch (profile?.role) {
      case 'admin': return 'مدير النظام';
      case 'merchant': return 'تاجر';
      case 'affiliate': return 'مسوق بالعمولة';
      case 'customer': return 'عميل';
      default: return 'مستخدم';
    }
  };

  // Admin sections
  const adminSections = [
    {
      title: 'إدارة المستخدمين',
      description: 'عرض وإدارة جميع المستخدمين في النظام',
      icon: <Users className="h-8 w-8" />,
      route: '/admin/users',
      color: 'bg-gradient-primary'
    },
    {
      title: 'نظام أتلانتس',
      description: 'نظام التحفيز والمنافسة للمسوقين',
      icon: <Crown className="h-8 w-8" />,
      route: '/atlantis',
      color: 'bg-gradient-luxury'
    },
    {
      title: 'إدارة المنتجات',
      description: 'مراجعة وإدارة جميع المنتجات',
      icon: <Package className="h-8 w-8" />,
      route: '/products',
      color: 'bg-gradient-premium'
    },
    {
      title: 'نظام التسويق',
      description: 'إدارة الحملات التسويقية ووسائل التواصل',
      icon: <Target className="h-8 w-8" />,
      route: '/admin/marketing',
      color: 'bg-gradient-persian'
    }
  ];

  // Merchant sections
  const merchantSections = [
    {
      title: 'إدارة المنتجات',
      description: 'إضافة وتعديل منتجاتك',
      icon: <Package className="h-8 w-8" />,
      route: '/merchant',
      color: 'bg-gradient-primary'
    },
    {
      title: 'الطلبات',
      description: 'متابعة طلبات العملاء وحالتها',
      icon: <ShoppingCart className="h-8 w-8" />,
      route: '/merchant',
      color: 'bg-gradient-luxury'
    },
    {
      title: 'تقارير المبيعات',
      description: 'إحصائيات مفصلة عن أدائك',
      icon: <TrendingUp className="h-8 w-8" />,
      route: '/merchant',
      color: 'bg-gradient-premium'
    },
    {
      title: 'إعدادات المتجر',
      description: 'تخصيص متجرك وإعداداته',
      icon: <Settings className="h-8 w-8" />,
      route: '/merchant',
      color: 'bg-gradient-heritage'
    },
    {
      title: 'التسويق والترويج',
      description: 'أدوات التسويق والحملات الترويجية',
      icon: <Target className="h-8 w-8" />,
      route: '/admin/marketing',
      color: 'bg-gradient-persian'
    }
  ];

  // Affiliate sections
  const affiliateSections = [
    {
      title: 'دليل أتلانتس',
      description: 'تعلم كيفية استخدام نظام التحفيز والمنافسة',
      icon: <Crown className="h-8 w-8" />,
      route: '/atlantis-guide',
      color: 'bg-gradient-primary'
    },
    {
      title: 'نظام أتلانتس',
      description: 'التحديات والمنافسات والتحالفات',
      icon: <Star className="h-8 w-8" />,
      route: '/atlantis',
      color: 'bg-gradient-luxury'
    },
    {
      title: 'متجري',
      description: 'إنشاء وإدارة متجر الأفيليت الخاص بك',
      icon: <Store className="h-8 w-8" />,
      route: '/affiliate',
      color: 'bg-gradient-premium'
    },
    {
      title: 'تصفح المنتجات',
      description: 'اختر منتجات لإضافتها إلى متجرك',
      icon: <Package className="h-8 w-8" />,
      route: '/products-browser',
      color: 'bg-gradient-heritage'
    },
    {
      title: 'حملات التسويق',
      description: 'إنشاء حملات تسويقية فعالة',
      icon: <Target className="h-8 w-8" />,
      route: '/admin/marketing',
      color: 'bg-gradient-persian'
    }
  ];

  // Customer sections  
  const customerSections = [
    {
      title: 'تسوّق الآن',
      description: 'استكشف آلاف المنتجات المميزة',
      icon: <ShoppingCart className="h-8 w-8" />,
      route: '/products',
      color: 'bg-gradient-primary'
    },
    {
      title: 'طلباتي',
      description: 'تتبع حالة طلباتك وسجل المشتريات',
      icon: <Package className="h-8 w-8" />,
      route: '/profile',
      color: 'bg-gradient-luxury'
    },
    {
      title: 'الملف الشخصي',
      description: 'إدارة بياناتك الشخصية والعناوين',
      icon: <Settings className="h-8 w-8" />,
      route: '/profile',
      color: 'bg-gradient-premium'
    }
  ];

  const getSections = () => {
    switch (profile?.role) {
      case 'admin': return adminSections;
      case 'merchant': return merchantSections;
      case 'affiliate': return affiliateSections;
      case 'customer': return customerSections;
      default: return customerSections;
    }
  };

  const getWelcomeMessage = () => {
    switch (profile?.role) {
      case 'admin': return 'مرحباً بك في لوحة الإدارة';
      case 'merchant': return 'مرحباً بك في لوحة التاجر';
      case 'affiliate': return 'مرحباً بك في لوحة المسوق';
      case 'customer': return 'مرحباً بك في منصة التسوق';
      default: return 'مرحباً بك';
    }
  };

  return (
    <ResponsiveLayout variant="glass" maxWidth="2xl" centerContent>
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/" />
              <EnhancedButton 
                variant="ghost" 
                onClick={goToUserHome}
                className="text-primary hover:bg-primary/10 gap-2"
              >
                <Home className="h-4 w-4" />
                الصفحة الرئيسية
                <ArrowRight className="h-4 w-4" />
              </EnhancedButton>
              
              <div className="flex items-center gap-3">
                {getRoleIcon()}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {getWelcomeMessage()}
                  </h1>
                  <p className="text-muted-foreground">
                    {profile?.full_name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {getRoleName()}
                </Badge>
                {(profile?.role === 'affiliate' || profile?.role === 'admin') && (
                  <Badge className={getLevelColor(profile?.level || 'bronze')}>
                    {profile?.level}
                  </Badge>
                )}
                {(profile?.role === 'affiliate' || profile?.role === 'admin') && (
                  <Badge variant="secondary">
                    {profile?.points} نقطة
                  </Badge>
                )}
              </div>
              
              <EnhancedButton 
                variant="outline" 
                onClick={handleSignOut}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                تسجيل الخروج
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Atlantis Widget for Affiliates/Admins */}
        {(profile?.role === 'affiliate' || profile?.role === 'admin') && (
          <div className="mb-8">
            <AtlantisStatusWidget />
          </div>
        )}

        {/* Stats Cards */}
        {profile?.role !== 'customer' && (
          <ResponsiveGrid columns={{ mobile: 1, tablet: 3 }} gap={{ mobile: 4, tablet: 6 }} className="mb-8">
            <InteractiveWidget
              title="إجمالي الأرباح"
              description="ر.س"
              variant="luxury"
              metric={{
                value: profile?.total_earnings || 0,
                label: "ر.س",
                icon: DollarSign
              }}
            />

            <InteractiveWidget
              title="النقاط المكتسبة"
              description="نقطة"
              variant="persian"
              metric={{
                value: profile?.points || 0,
                label: "نقطة",
                icon: Star
              }}
            />

            <InteractiveWidget
              title="المستوى الحالي"
              description="مستوى"
              variant="glass"
              metric={{
                value: profile?.level || 'برونزي',
                label: "مستوى",
                icon: Award
              }}
            />
          </ResponsiveGrid>
        )}

        <Separator className="my-8" />

        {/* Quick Navigation */}
        <QuickLinks />

        <Separator className="my-8" />

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            الإجراءات السريعة
          </h2>
          
          <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap={{ mobile: 4, tablet: 6 }}>
            {getSections().map((section, index) => (
              <EnhancedCard 
                key={index}
                variant="glass"
                hover="lift"
                clickable
                className="overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(section.route)}
              >
                <EnhancedCardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl ${section.color} flex items-center justify-center text-white mb-4 shadow-glow`}>
                    {section.icon}
                  </div>
                  <EnhancedCardTitle className="text-xl">
                    {section.title}
                  </EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <EnhancedCardDescription className="text-base">
                    {section.description}
                  </EnhancedCardDescription>
                </EnhancedCardContent>
              </EnhancedCard>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Additional Features Section */}
        <Separator className="my-12" />
        
        <div>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-luxury bg-clip-text text-transparent">
            ميزات إضافية
          </h2>
          
          <ResponsiveGrid columns={{ mobile: 1, tablet: 2 }} gap={{ mobile: 4, tablet: 6 }}>
            <EnhancedCard variant="glass" className="animate-fade-in">
              <EnhancedCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">أمان متقدم</h3>
                    <p className="text-muted-foreground">حماية شاملة لبياناتك ومعاملاتك</p>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="glass" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <EnhancedCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-heritage rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">سرعة فائقة</h3>
                    <p className="text-muted-foreground">معالجة فورية للطلبات والمدفوعات</p>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </ResponsiveGrid>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;