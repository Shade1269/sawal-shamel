import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Award, 
  Users, 
  TrendingUp,
  Target,
  Globe,
  Heart,
  Crown,
  Star,
  Gift,
  Zap,
  CheckCircle,
  Home,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "أمان وثقة",
      description: "منصة آمنة مع حماية متطورة للبيانات والمعاملات"
    },
    {
      icon: <Award className="h-8 w-8 text-accent" />,
      title: "جودة عالية",
      description: "منتجات مختارة بعناية من أفضل التجار"
    },
    {
      icon: <Users className="h-8 w-8 text-premium" />,
      title: "مجتمع نشط",
      description: "آلاف المسوقين والتجار الناشطين يومياً"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-luxury" />,
      title: "نمو مستمر",
      description: "نمو سريع ومستدام في الأرباح والعمولات"
    }
  ];

  const stats = [
    { number: "10,000+", label: "مسوق نشط", icon: <Users className="h-6 w-6" /> },
    { number: "5,000+", label: "تاجر موثوق", icon: <Award className="h-6 w-6" /> },
    { number: "500,000+", label: "منتج متنوع", icon: <Gift className="h-6 w-6" /> },
    { number: "50M+", label: "ريال عمولات", icon: <TrendingUp className="h-6 w-6" /> }
  ];

  const advantages = [
    "عمولات تنافسية تصل إلى 25%",
    "دفع سريع وموثوق للعمولات",
    "أدوات تسويق متطورة",
    "دعم فني متاح 24/7",
    "تدريب مجاني للمسوقين الجدد",
    "نظام نقاط ومكافآت حصري"
  ];

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Back to Home Button */}
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-primary hover:bg-primary/10 gap-2"
          >
            <Home className="h-4 w-4" />
            العودة إلى الصفحة الرئيسية
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center space-y-6">
          <Badge className="bg-gradient-primary text-primary-foreground px-6 py-2 text-lg">
            <Crown className="ml-2 h-5 w-5" />
            منصة الأفيليت الرائدة
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            من نحن؟
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            منصة الأفيليت هي المنصة الرائدة في المملكة العربية السعودية للتسويق بالعمولة، 
            نربط بين التجار والمسوقين لتحقيق أرباح استثنائية للجميع.
          </p>
        </div>

        {/* Mission */}
        <section className="text-center space-y-8">
          <div className="bg-gradient-luxury/10 rounded-2xl p-8 backdrop-blur-sm border border-luxury/20">
            <Target className="h-16 w-16 text-luxury mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">رسالتنا</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نسعى لتمكين التجار والمسوقين من تحقيق أقصى إمكاناتهم التجارية من خلال منصة متطورة، 
              آمنة، وسهلة الاستخدام تضمن النجاح والربحية للجميع.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-premium bg-clip-text text-transparent">
              لماذا نحن الخيار الأمثل؟
            </h2>
            <p className="text-lg text-muted-foreground">
              نقدم مزايا فريدة تجعلنا الخيار الأول للمسوقين والتجار
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-heritage rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">أرقامنا تتحدث</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="flex justify-center mb-2 text-white/80">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Advantages */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              مزايا الانضمام إلينا
            </h2>
            <p className="text-lg text-muted-foreground">
              استفد من مزايا حصرية تضمن نجاحك وتميزك
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card/50 rounded-lg backdrop-blur-sm border border-border/50">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-foreground">{advantage}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Vision */}
        <section className="text-center space-y-8">
          <div className="bg-gradient-persian/10 rounded-2xl p-8 backdrop-blur-sm border border-persian/20">
            <Globe className="h-16 w-16 text-persian mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">رؤيتنا للمستقبل</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نطمح لأن نكون المنصة الأولى عربياً للتسويق بالعمولة، ونسعى للتوسع 
              في الأسواق العربية والعالمية، مع الحفاظ على أعلى معايير الجودة والثقة.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-luxury bg-clip-text text-transparent">
              قيمنا الأساسية
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>الثقة والأمان</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  نضع الثقة والأمان في مقدمة أولوياتنا لضمان بيئة آمنة لجميع المستخدمين
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Heart className="h-12 w-12 text-luxury mx-auto mb-4" />
                <CardTitle>الشفافية</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  نلتزم بالشفافية الكاملة في جميع المعاملات والعمولات والسياسات
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>الابتكار</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  نسعى دائماً لتطوير حلول مبتكرة لتحسين تجربة المستخدمين وزيادة أرباحهم
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ابدأ رحلتك معنا اليوم
          </h2>
          <p className="text-lg text-muted-foreground">
            انضم إلى عائلة منصة الأفيليت وحقق أرباحاً استثنائية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-4"
              onClick={() => navigate('/auth')}
            >
              <Star className="ml-2 h-5 w-5" />
              انضم إلينا الآن
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4"
              onClick={() => navigate('/products')}
            >
              تصفح المنتجات
            </Button>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default AboutPage;