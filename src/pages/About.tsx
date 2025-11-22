import React from 'react';
import { 
  UnifiedButton,
  UnifiedCard,
  UnifiedCardContent,
  UnifiedCardDescription,
  UnifiedCardHeader,
  UnifiedCardTitle
} from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Globe, 
  Award, 
  TrendingUp,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  Home,
  Target,
  Zap,
  Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '@/components/ui/back-button';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Navigation */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <BackButton />
            <Link to="/">
              <UnifiedButton 
                variant="ghost" 
                className="gap-1 sm:gap-2 text-sm sm:text-base"
                size="md"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">العودة إلى الصفحة الرئيسية</span>
                <span className="sm:hidden">الرئيسية</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </UnifiedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <UnifiedBadge variant="info" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm" leadingIcon={<Crown className="w-3 h-3 sm:w-4 sm:h-4" />}>
            منصة التجارة الإلكترونية الرائدة
          </UnifiedBadge>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 sm:mb-6">
            من نحن؟
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            نحن فريق شغوف بتطوير حلول التجارة الإلكترونية المتقدمة، نسعى لتمكين التجار والمسوقين من تحقيق أهدافهم التجارية بأفضل الطرق المبتكرة.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
            <Link to="/auth" className="w-full sm:w-auto">
              <UnifiedButton variant="hero" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}>
                انضم إلينا الآن
              </UnifiedButton>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <UnifiedButton variant="outline" size="lg" className="w-full sm:w-auto">
                استكشف المنتجات
              </UnifiedButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-20 px-3 sm:px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">رؤيتنا ورسالتنا</h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
              نؤمن بقوة التجارة الإلكترونية في تغيير حياة الناس
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <UnifiedCard variant="glass" padding="lg">
              <UnifiedCardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <UnifiedCardTitle className="text-xl sm:text-2xl">رسالتنا</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <UnifiedCardDescription className="text-sm sm:text-base leading-relaxed">
                  تمكين التجار والمسوقين من خلال منصة تجارة إلكترونية شاملة وآمنة، 
                  تسهل عليهم إدارة أعمالهم وتحقيق أقصى استفادة من الفرص التجارية المتاحة.
                </UnifiedCardDescription>
              </UnifiedCardContent>
            </UnifiedCard>

            <UnifiedCard variant="glass" padding="lg">
              <UnifiedCardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-luxury rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <UnifiedCardTitle className="text-xl sm:text-2xl">رؤيتنا</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <UnifiedCardDescription className="text-sm sm:text-base leading-relaxed">
                  أن نكون المنصة الرائدة في الشرق الأوسط للتجارة الإلكترونية والتسويق بالعمولة،
                  وأن نساهم في بناء اقتصاد رقمي مزدهر ومستدام.
                </UnifiedCardDescription>
              </UnifiedCardContent>
            </UnifiedCard>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">قيمنا الأساسية</h2>
            <p className="text-lg text-muted-foreground">
              المبادئ التي نسير عليها في كل ما نقوم به
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UnifiedCard variant="glass" hover="glow" padding="md" className="text-center">
              <UnifiedCardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <UnifiedCardTitle className="text-lg">الثقة والأمان</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <UnifiedCardDescription className="text-sm">
                  نضمن أعلى مستويات الأمان لحماية بيانات عملائنا وشركائنا
                </UnifiedCardDescription>
              </UnifiedCardContent>
            </UnifiedCard>

            <UnifiedCard variant="glass" hover="glow" padding="md" className="text-center">
              <UnifiedCardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-heritage rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <UnifiedCardTitle className="text-lg">الابتكار</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <UnifiedCardDescription className="text-sm">
                  نسعى باستمرار لتطوير حلول مبتكرة تلبي احتياجات السوق المتطورة
                </UnifiedCardDescription>
              </UnifiedCardContent>
            </UnifiedCard>

            <UnifiedCard variant="glass" hover="glow" padding="md" className="text-center">
              <UnifiedCardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-persian rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <UnifiedCardTitle className="text-lg">العمل الجماعي</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <UnifiedCardDescription className="text-sm">
                  نؤمن بقوة التعاون والعمل الجماعي لتحقيق النجاح المشترك
                </UnifiedCardDescription>
              </UnifiedCardContent>
            </UnifiedCard>

            <UnifiedCard variant="glass" hover="glow" padding="md" className="text-center">
              <UnifiedCardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <UnifiedCardTitle className="text-lg">التميز</UnifiedCardTitle>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <UnifiedCardDescription className="text-sm">
                  نسعى للتميز في كل خدمة نقدمها ونلتزم بأعلى معايير الجودة
                </UnifiedCardDescription>
              </UnifiedCardContent>
            </UnifiedCard>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختارنا؟</h2>
            <p className="text-lg text-muted-foreground">
              المميزات التي تجعلنا الخيار الأفضل لأعمالك التجارية
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">منصة شاملة</h3>
                <p className="text-muted-foreground">
                  جميع الأدوات التي تحتاجها لإدارة متجرك الإلكتروني في مكان واحد
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-luxury rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">دعم فني 24/7</h3>
                <p className="text-muted-foreground">
                  فريق دعم متخصص متاح على مدار الساعة لمساعدتك في أي وقت
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">أمان عالي</h3>
                <p className="text-muted-foreground">
                  تشفير متقدم وحماية شاملة لجميع المعاملات والبيانات الحساسة
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-heritage rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">سهولة الاستخدام</h3>
                <p className="text-muted-foreground">
                  واجهة بديهية وسهلة الاستخدام تناسب المبتدئين والمحترفين
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-persian rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">نمو مستمر</h3>
                <p className="text-muted-foreground">
                  أدوات تحليل متقدمة لمساعدتك على فهم عملائك وتنمية أعمالك
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">تكامل شامل</h3>
                <p className="text-muted-foreground">
                  تكامل مع أشهر منصات الدفع وشركات الشحن ومزودي الخدمات
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">أرقامنا تتحدث</h2>
            <p className="text-lg text-muted-foreground">
              إنجازاتنا وثقة عملائنا في أرقام
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl gradient-card-primary">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-lg font-medium mb-1">تاجر نشط</div>
              <div className="text-sm text-muted-foreground">يثقون في منصتنا</div>
            </div>

            <div className="text-center p-6 rounded-2xl gradient-card-accent">
              <div className="text-4xl font-bold text-luxury mb-2">50K+</div>
              <div className="text-lg font-medium mb-1">منتج متاح</div>
              <div className="text-sm text-muted-foreground">في جميع الفئات</div>
            </div>

            <div className="text-center p-6 rounded-2xl gradient-card-accent">
              <div className="text-4xl font-bold text-premium mb-2">99.9%</div>
              <div className="text-lg font-medium mb-1">وقت تشغيل</div>
              <div className="text-sm text-muted-foreground">خدمة موثوقة</div>
            </div>

            <div className="text-center p-6 rounded-2xl gradient-card-secondary">
              <div className="text-4xl font-bold text-heritage mb-2">24/7</div>
              <div className="text-lg font-medium mb-1">دعم فني</div>
              <div className="text-sm text-muted-foreground">في خدمتكم دائماً</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto max-w-4xl text-center">
          <UnifiedCard variant="luxury" padding="xl">
            <UnifiedCardContent>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">
                  ابدأ رحلتك معنا اليوم
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  انضم إلى آلاف التجار والمسوقين الناجحين واجعل حلمك التجاري حقيقة
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/auth">
                    <UnifiedButton variant="hero" size="lg" leftIcon={<Heart className="w-5 h-5" />} rightIcon={<ArrowRight className="w-5 h-5" />}>
                      ابدأ مجاناً الآن
                    </UnifiedButton>
                  </Link>
                  <Link to="/products">
                    <UnifiedButton variant="outline" size="lg">
                      استكشف المنتجات
                    </UnifiedButton>
                  </Link>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        </div>
      </section>
    </div>
  );
};

export default About;