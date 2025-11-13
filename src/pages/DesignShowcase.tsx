import { HeroPreview } from '@/components/storefront/preview/HeroPreview';
import { ProductGridPreview } from '@/components/storefront/preview/ProductGridPreview';
import { FloatingCartPreview } from '@/components/storefront/preview/FloatingCartPreview';
import { FiltersPreview } from '@/components/storefront/preview/FiltersPreview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DesignShowcase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/')} variant="outline" size="sm">
                <ArrowRight className="ml-2 w-4 h-4" />
                العودة للرئيسية
              </Button>
              <Badge className="bg-gradient-luxury">
                <Sparkles className="ml-2 w-3 h-3" />
                معاينة التصميم
              </Badge>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-l from-primary via-luxury to-premium bg-clip-text text-transparent">
              عرض تصميم المتجر
            </h1>
          </div>
        </div>
      </header>

      {/* Intro Section */}
      <section className="py-12 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-l from-primary via-luxury to-premium bg-clip-text text-transparent">
                التصميم الجديد
              </span>
              <br />
              <span className="text-foreground">لمتجر المسوقة</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              هذا عرض تفاعلي للتصميم المقترح. جرب جميع المكونات وشاهد التأثيرات الحية
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <FeatureBadge text="تصميم فاخر عصري" />
              <FeatureBadge text="تأثيرات سلسة" />
              <FeatureBadge text="تجربة مستخدم محسّنة" />
              <FeatureBadge text="دعم RTL كامل" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Section Preview */}
      <section className="relative">
        <SectionLabel title="Hero Section - القسم الرئيسي" />
        <HeroPreview />
      </section>

      {/* Product Grid Preview */}
      <section className="relative">
        <SectionLabel title="Product Grid - شبكة المنتجات" />
        <ProductGridPreview />
      </section>

      {/* Filters Demo */}
      <section className="relative py-16 bg-secondary/20">
        <SectionLabel title="Filters - الفلاتر المتقدمة" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-3xl font-bold">نظام الفلترة الذكي</h3>
            <p className="text-muted-foreground">
              اضغط على الزر في الأسفل لتجربة نظام الفلاتر المتقدم
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <FeatureCard
                icon="🔍"
                title="بحث متقدم"
                description="فلترة حسب السعر، الفئة، التقييم، والمزيد"
              />
              <FeatureCard
                icon="⚡"
                title="نتائج فورية"
                description="تحديث النتائج تلقائياً عند تغيير الفلاتر"
              />
              <FeatureCard
                icon="📱"
                title="تصميم متجاوب"
                description="تجربة مثالية على جميع الأجهزة"
              />
            </div>
          </div>
        </div>
        <FiltersPreview />
      </section>

      {/* Floating Cart Demo */}
      <section className="relative py-16">
        <SectionLabel title="Floating Cart - السلة العائمة" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-3xl font-bold">سلة التسوق الذكية</h3>
            <p className="text-muted-foreground">
              اضغط على أيقونة السلة في الأسفل لتجربة السلة العائمة
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <FeatureCard
                icon="🛒"
                title="وصول سريع"
                description="عرض وتعديل السلة دون مغادرة الصفحة"
              />
              <FeatureCard
                icon="📊"
                title="شحن مجاني"
                description="مؤشر تقدم للوصول للشحن المجاني"
              />
              <FeatureCard
                icon="✨"
                title="تأثيرات سلسة"
                description="حركات وتأثيرات جذابة واحترافية"
              />
            </div>
          </div>
        </div>
        <FloatingCartPreview />
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              ✨ المميزات الرئيسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureItem text="تصميم فاخر مع تدرجات لونية احترافية" />
              <FeatureItem text="تأثيرات Hover متقدمة على بطاقات المنتجات" />
              <FeatureItem text="Quick View للمنتجات بدون مغادرة الصفحة" />
              <FeatureItem text="نظام فلترة متقدم مع نتائج فورية" />
              <FeatureItem text="سلة تسوق عائمة ذكية" />
              <FeatureItem text="مؤشر تقدم للشحن المجاني" />
              <FeatureItem text="تصميم متجاوب 100% (موبايل، تابلت، ديسكتوب)" />
              <FeatureItem text="دعم كامل للغة العربية RTL" />
              <FeatureItem text="Skeleton Loaders للتحميل السريع" />
              <FeatureItem text="Infinite Scroll للمنتجات" />
              <FeatureItem text="شارات وعلامات ديناميكية (جديد، خصم، الأكثر مبيعاً)" />
              <FeatureItem text="تقييمات ومراجعات المنتجات" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-luxury/10 to-premium/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-4xl font-bold">
              هل أنتِ مستعدة للتطبيق؟
            </h2>
            <p className="text-xl text-muted-foreground">
              اختاري خطة التطوير المناسبة وابدئي في تحسين متجرك الآن
            </p>
            <div className="flex gap-4 justify-center flex-wrap pt-4">
              <Button size="lg" className="text-lg px-8 bg-gradient-luxury hover-scale">
                <Sparkles className="ml-2" />
                نفذي التصميم الكامل
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate('/')}>
                <ArrowRight className="ml-2" />
                العودة للرئيسية
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const SectionLabel = ({ title }: { title: string }) => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
    <Badge className="bg-gradient-luxury text-lg px-6 py-2 shadow-lg">
      {title}
    </Badge>
  </div>
);

const FeatureBadge = ({ text }: { text: string }) => (
  <Badge variant="secondary" className="text-sm px-4 py-2">
    <CheckCircle2 className="ml-2 w-4 h-4 text-success" />
    {text}
  </Badge>
);

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h4 className="font-semibold text-lg mb-2 text-right">{title}</h4>
    <p className="text-sm text-muted-foreground text-right">{description}</p>
  </motion.div>
);

const FeatureItem = ({ text }: { text: string }) => (
  <motion.div
    whileHover={{ x: -4 }}
    className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
  >
    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
    <span className="text-right">{text}</span>
  </motion.div>
);

export default DesignShowcase;
