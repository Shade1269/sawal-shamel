import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import QuickLinks from '@/components/navigation/QuickLinks';
import { AtlantisStatusWidget } from '@/components/AtlantisStatusWidget';
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
      title: 'متجري',
      description: 'إنشاء وإدارة متجر الأفيليت الخاص بك',
      icon: <Store className="h-8 w-8" />,
      route: '/affiliate',
      color: 'bg-gradient-primary'
    },
    {
      title: 'نظام أتلانتس',
      description: 'التحديات والمنافسات والتحالفات',
      icon: <Crown className="h-8 w-8" />,
      route: '/atlantis',
      color: 'bg-gradient-luxury'
    },
    {
      title: 'تصفح المنتجات',
      description: 'اختر منتجات لإضافتها إلى متجرك',
      icon: <Package className="h-8 w-8" />,
      route: '/products-browser',
      color: 'bg-gradient-premium'
    },
    {
      title: 'العمولات',
      description: 'تتبع أرباحك والعمولات المستحقة',
      icon: <DollarSign className="h-8 w-8" />,
      route: '/affiliate',
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
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/" />
              <Button 
                variant="ghost" 
                onClick={goToUserHome}
                className="text-primary hover:bg-primary/10 gap-2"
              >
                <Home className="h-4 w-4" />
                الصفحة الرئيسية
                <ArrowRight className="h-4 w-4" />
              </Button>
              
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
              
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                تسجيل الخروج
              </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-primary text-primary-foreground animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">إجمالي الأرباح</p>
                    <p className="text-2xl font-bold">
                      {profile?.total_earnings || 0} ر.س
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-luxury text-luxury-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">النقاط المكتسبة</p>
                    <p className="text-2xl font-bold">{profile?.points || 0}</p>
                  </div>
                  <Star className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-premium text-premium-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">المستوى الحالي</p>
                    <p className="text-2xl font-bold">{profile?.level || 'برونزي'}</p>
                  </div>
                  <Award className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSections().map((section, index) => (
              <Card 
                key={index}
                className="group cursor-pointer hover:shadow-luxury transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm overflow-hidden hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(section.route)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl ${section.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    {section.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {section.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Features Section */}
        <Separator className="my-12" />
        
        <div>
          <h2 className="text-2xl font-bold mb-6 bg-gradient-luxury bg-clip-text text-transparent">
            ميزات إضافية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-card/60 to-card backdrop-blur-sm animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">أمان متقدم</h3>
                    <p className="text-muted-foreground">حماية شاملة لبياناتك ومعاملاتك</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/60 to-card backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-heritage rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">سرعة فائقة</h3>
                    <p className="text-muted-foreground">معالجة فورية للطلبات والمدفوعات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;