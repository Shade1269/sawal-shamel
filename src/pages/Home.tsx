import { useFastAuth } from '@/hooks/useFastAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Users, 
  ShoppingCart, 
  Crown, 
  Star,
  Award,
  TrendingUp,
  Zap,
  Shield,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { isAuthenticated, profile } = useFastAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Store className="h-8 w-8 text-primary" />,
      title: "متاجر مخصصة",
      description: "إنشئ متجرك الإلكتروني الخاص بأحدث الثيمات والتصاميم"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-accent" />,
      title: "عمولات مجزية",
      description: "احصل على عمولات تنافسية تصل إلى 20% من كل عملية بيع"
    },
    {
      icon: <Zap className="h-8 w-8 text-premium" />,
      title: "نظام نقاط متقدم",
      description: "اكسب نقاط مع كل عملية بيع وارتقِ للمستويات العليا"
    },
    {
      icon: <Shield className="h-8 w-8 text-luxury" />,
      title: "أمان موثوق",
      description: "بوابات دفع آمنة ونظام حماية متطور لضمان سلامة المعاملات"
    }
  ];

  const userTypes = [
    {
      type: 'merchant',
      title: 'كن تاجراً',
      description: 'ارفع منتجاتك وابدأ البيع عبر شبكة المسوقين',
      icon: <Award className="h-6 w-6" />,
      color: 'bg-gradient-luxury',
      route: '/auth'
    },
    {
      type: 'affiliate',
      title: 'كن مسوقاً',
      description: 'اختر المنتجات وسوّق واحصل على عمولات مجزية',
      icon: <Star className="h-6 w-6" />,
      color: 'bg-gradient-premium',
      route: '/auth'
    },
    {
      type: 'customer',
      title: 'تسوّق الآن',
      description: 'اكتشف آلاف المنتجات المميزة بأفضل الأسعار',
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-gradient-persian',
      route: '/products'
    }
  ];

  const getDashboardRoute = () => {
    switch (profile?.role) {
      case 'admin': return '/admin';
      case 'merchant': return '/merchant';
      case 'affiliate': return '/affiliate';
      case 'customer': return '/products';
      default: return '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              منصة الأفيليت
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              منصة التسويق بالعمولة الأولى في المملكة العربية السعودية
            </p>
            <div className="text-lg text-muted-foreground mb-12">
              اربط التجار بالمسوقين وحقق أرباحاً استثنائية من خلال نظام عمولات متقدم
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-4"
                  onClick={() => navigate(getDashboardRoute())}
                >
                  {profile?.role === 'admin' && <>
                    <Crown className="ml-2 h-5 w-5" />
                    لوحة الإدارة
                  </>}
                  {profile?.role === 'merchant' && <>
                    <Award className="ml-2 h-5 w-5" />
                    لوحة التاجر
                  </>}
                  {profile?.role === 'affiliate' && <>
                    <Star className="ml-2 h-5 w-5" />
                    متجري
                  </>}
                  {profile?.role === 'customer' && <>
                    <ShoppingCart className="ml-2 h-5 w-5" />
                    تسوّق الآن
                  </>}
                </Button>
                
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {profile?.full_name}
                  </Badge>
                  {profile?.role === 'affiliate' && (
                    <Badge className="bg-gradient-premium text-premium-foreground">
                      {profile.points} نقطة
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-4"
                  onClick={() => navigate('/auth')}
                >
                  ابدأ رحلتك الآن
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4"
                  onClick={() => navigate('/products')}
                >
                  استكشف المنتجات
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              لماذا منصتنا؟
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نقدم حلولاً متكاملة للتجارة الإلكترونية والتسويق بالعمولة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-luxury transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                ابدأ مع الدور المناسب لك
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                اختر الطريقة المثلى للاستفادة من منصتنا
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {userTypes.map((userType, index) => (
                <Card 
                  key={index} 
                  className="group cursor-pointer hover:shadow-persian transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm overflow-hidden"
                  onClick={() => navigate(userType.route)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-full ${userType.color} flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {userType.icon}
                    </div>
                    <CardTitle className="text-xl">{userType.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base">
                      {userType.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 bg-gradient-heritage">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">مسوق نشط</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">تاجر موثوق</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-lg opacity-90">منتج متنوع</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-lg opacity-90">ريال عمولات</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              ابدأ رحلتك اليوم
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              انضم إلى آلاف المسوقين والتجار الذين يحققون أرباحاً استثنائية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-4"
                onClick={() => navigate('/auth')}
              >
                <Gift className="ml-2 h-5 w-5" />
                سجل مجاناً الآن
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4"
                onClick={() => navigate('/about')}
              >
                تعرّف على المنصة
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-gradient-luxury text-luxury-foreground text-lg px-8 py-4"
                onClick={() => navigate('/create-admin')}
              >
                <Crown className="ml-2 h-5 w-5" />
                إنشاء حساب مدير
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;