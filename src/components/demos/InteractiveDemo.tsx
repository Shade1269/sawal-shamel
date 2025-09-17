import React, { useState, useEffect } from 'react';
import { 
  EnhancedContainer,
  EnhancedSection,
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent,
  ResponsiveLayout,
  ResponsiveGrid,
  ResponsiveColumn
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedChart } from '@/components/interactive/EnhancedChart';
import { 
  InteractiveWidget, 
  MetricWidget, 
  ProgressWidget, 
  ActivityWidget 
} from '@/components/interactive/InteractiveWidget';
import { 
  AnimatedCounter, 
  CurrencyCounter, 
  PercentageCounter,
  CompactCounter 
} from '@/components/interactive/AnimatedCounter';
import { 
  LikeButton, 
  StarRating, 
  RippleEffect,
  FloatingFeedback,
  HoverCard
} from '@/components/interactive/MicroInteractions';
import { 
  ProgressiveLoader, 
  FileUploadLoader, 
  NetworkStatusLoader 
} from '@/components/interactive/ProgressiveLoader';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Activity,
  Target,
  Award,
  Zap,
  Heart,
  Star,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Upload,
  Wifi,
  Sparkles
} from 'lucide-react';

// Mock data
const generateChartData = (count: number) => 
  Array.from({ length: count }, (_, i) => ({
    name: `يوم ${i + 1}`,
    value: Math.floor(Math.random() * 1000) + 100,
    trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
  }));

const InteractiveDemo: React.FC = () => {
  const [chartData] = useState(generateChartData(7));
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(4);
  const [showFeedback, setShowFeedback] = useState(false);
  const [countersStarted, setCountersStarted] = useState(false);

  // Loading states
  const [loadingSteps, setLoadingSteps] = useState([
    { id: 'step1', label: 'تحميل البيانات', description: 'جاري تحميل بيانات المشروع', status: 'loading' as 'loading' | 'pending' | 'success' | 'error', progress: 0 },
    { id: 'step2', label: 'معالجة التحليلات', description: 'تحليل البيانات وإنشاء التقارير', status: 'pending' as 'loading' | 'pending' | 'success' | 'error' },
    { id: 'step3', label: 'إنشاء المخرجات', description: 'تحضير النتائج النهائية', status: 'pending' as 'loading' | 'pending' | 'success' | 'error' }
  ]);

  const [uploadFiles] = useState([
    { name: 'document.pdf', size: 2048000, progress: 85, status: 'uploading' as const },
    { name: 'image.jpg', size: 1024000, progress: 100, status: 'success' as const },
    { name: 'video.mp4', size: 10240000, progress: 45, status: 'uploading' as const }
  ]);

  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingSteps(prev => prev.map((step, index) => {
        if (step.status === 'loading') {
          const newProgress = Math.min((step.progress || 0) + 10, 100);
          if (newProgress === 100) {
            return { ...step, progress: 100, status: 'success' };
          }
          return { ...step, progress: newProgress };
        }
        
        if (index > 0 && prev[index - 1].status === 'success' && step.status === 'pending') {
          return { ...step, status: 'loading', progress: 0 };
        }
        
        return step;
      }));
    }, 500);

    const counterTimer = setTimeout(() => setCountersStarted(true), 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(counterTimer);
    };
  }, []);

  const handleLike = (isLiked: boolean) => {
    setLiked(isLiked);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const activities = [
    { label: 'المبيعات اليوم', value: '1,250 ر.س', time: 'منذ ساعة' },
    { label: 'زوار جدد', value: '89', time: 'منذ 30 دقيقة' },
    { label: 'طلبات معلقة', value: '12', time: 'منذ 15 دقيقة' }
  ];

  return (
    <ResponsiveLayout variant="glass" maxWidth="2xl" centerContent>
      <div className="space-y-12 py-8">
        {/* Header */}
        <EnhancedSection variant="persian" size="sm" animation="fade">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-white animate-persian-glow" />
              <h1 className="text-3xl font-bold text-white">
                Interactive Components v3.1
              </h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              مكونات تفاعلية متقدمة مع رسوم متحركة وتأثيرات بصرية محسنة
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge variant="glass" className="gap-1 text-white border-white/30">
                <Activity className="h-3 w-3" />
                تفاعلي كلياً
              </Badge>
              <Badge variant="glass" className="gap-1 text-white border-white/30">
                <Zap className="h-3 w-3" />
                أداء عالي
              </Badge>
              <Badge variant="glass" className="gap-1 text-white border-white/30">
                <Star className="h-3 w-3" />
                تجربة متميزة
              </Badge>
            </div>
          </div>
        </EnhancedSection>

        {/* Enhanced Charts */}
        <EnhancedCard variant="glass" hover="lift">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Enhanced Charts - الرسوم البيانية المطورة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 2 }} gap={{ mobile: 4, tablet: 6, desktop: 8 }}>
              <ResponsiveColumn>
                <EnhancedChart
                  data={chartData}
                  type="line"
                  title="المبيعات الأسبوعية"
                  description="تطور المبيعات خلال الأسبوع الماضي"
                  variant="glass"
                  size="md"
                  showTooltip={true}
                  showGrid={true}
                  interactive={true}
                  refreshable={true}
                  downloadable={true}
                />
              </ResponsiveColumn>

              <ResponsiveColumn>
                <EnhancedChart
                  data={chartData.slice(0, 5)}
                  type="pie"
                  title="توزيع المنتجات"
                  description="نسب المبيعات حسب الفئة"
                  variant="luxury"
                  size="md"
                  colors={['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#f59e0b', '#ef4444']}
                />
              </ResponsiveColumn>
            </ResponsiveGrid>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Interactive Widgets */}
        <EnhancedCard variant="outline" hover="glow">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Interactive Widgets - الأدوات التفاعلية
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap={{ mobile: 4, tablet: 6, desktop: 8 }}>
              <ResponsiveColumn>
                <MetricWidget
                  title="إجمالي المبيعات"
                  value="125,750"
                  label="ر.س"
                  change={12.5}
                  trend="up"
                  icon={DollarSign}
                  variant="luxury"
                  onClick={() => console.log('Sales clicked')}
                />
              </ResponsiveColumn>

              <ResponsiveColumn>
                <MetricWidget
                  title="عدد العملاء"
                  value="2,847"
                  label="عميل"
                  change={-3.2}
                  trend="down"
                  icon={Users}
                  variant="persian"
                />
              </ResponsiveColumn>

              <ResponsiveColumn>
                <ProgressWidget
                  title="هدف الشهر"
                  current={75}
                  target={100}
                  progressLabel="التقدم"
                  variant="glass"
                  badges={[{ label: '75%', variant: 'secondary' }]}
                />
              </ResponsiveColumn>

              <ResponsiveColumn>
                <ActivityWidget
                  title="النشاط الأخير"
                  description="آخر العمليات"
                  activities={activities}
                  variant="gradient"
                />
              </ResponsiveColumn>
            </ResponsiveGrid>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Animated Counters */}
        <EnhancedCard variant="persian" hover="persian">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5" />
              Animated Counters - العدادات المتحركة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap={{ mobile: 4, tablet: 6, desktop: 8 }}>
              <ResponsiveColumn>
                <div className="text-center space-y-2">
                  <div className="text-white/80 text-sm">المبيعات الإجمالية</div>
                  <CurrencyCounter
                    from={0}
                    to={125750}
                    duration={2000}
                    variant="luxury"
                    size="lg"
                    trigger={countersStarted}
                  />
                </div>
              </ResponsiveColumn>

              <ResponsiveColumn>
                <div className="text-center space-y-2">
                  <div className="text-white/80 text-sm">معدل النمو</div>
                  <PercentageCounter
                    from={0}
                    to={23.5}
                    duration={1500}
                    variant="persian"
                    size="lg"
                    trigger={countersStarted}
                  />
                </div>
              </ResponsiveColumn>

              <ResponsiveColumn>
                <div className="text-center space-y-2">
                  <div className="text-white/80 text-sm">عدد الزوار</div>
                  <CompactCounter
                    from={0}
                    to={1250000}
                    duration={2500}
                    variant="gradient"
                    size="lg"
                    trigger={countersStarted}
                  />
                </div>
              </ResponsiveColumn>

              <ResponsiveColumn>
                <div className="text-center space-y-2">
                  <div className="text-white/80 text-sm">الطلبات المكتملة</div>
                  <AnimatedCounter
                    from={0}
                    to={847}
                    duration={1800}
                    variant="luxury"
                    size="lg"
                    suffix=" طلب"
                    trigger={countersStarted}
                  />
                </div>
              </ResponsiveColumn>
            </ResponsiveGrid>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Micro Interactions */}
        <EnhancedCard variant="glass" hover="lift">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Micro Interactions - التفاعلات المصغرة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-4">
                  <h4 className="font-semibold">زر الإعجاب</h4>
                  <div className="relative">
                    <LikeButton
                      liked={liked}
                      count={142}
                      onToggle={handleLike}
                      size="lg"
                      showCount={true}
                    />
                    <FloatingFeedback
                      text={liked ? "تم الإعجاب!" : "تم إلغاء الإعجاب"}
                      show={showFeedback}
                      variant="success"
                      position="top"
                    />
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h4 className="font-semibold">تقييم النجوم</h4>
                  <StarRating
                    rating={rating}
                    maxRating={5}
                    onChange={setRating}
                    size="lg"
                    color="text-yellow-500"
                  />
                  <div className="text-sm text-muted-foreground">
                    التقييم: {rating}/5
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h4 className="font-semibold">تأثير الموجة</h4>
                  <RippleEffect className="inline-block">
                    <Button variant="luxury" size="lg">
                      اضغط هنا
                    </Button>
                  </RippleEffect>
                </div>
              </div>

              <div className="flex justify-center">
                <HoverCard
                  hoverContent={
                    <div className="space-y-2">
                      <h4 className="font-semibold">معلومات إضافية</h4>
                      <p className="text-sm">هذا مثال على المحتوى الذي يظهر عند التمرير</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">معلومة 1</Badge>
                        <Badge variant="secondary">معلومة 2</Badge>
                      </div>
                    </div>
                  }
                >
                  <Button variant="outline">
                    مرر الفأرة هنا
                  </Button>
                </HoverCard>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Progressive Loaders */}
        <EnhancedCard variant="filled" hover="lift">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Progressive Loaders - أشرطة التحميل المتقدمة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="font-semibold">تحميل المهام المتعددة</h4>
                <ProgressiveLoader
                  steps={loadingSteps}
                  overall={{
                    progress: loadingSteps.reduce((sum, step) => sum + (step.progress || 0), 0) / 3,
                    label: 'معالجة البيانات',
                    eta: '30 ثانية متبقية'
                  }}
                  variant="glass"
                  showETA={true}
                  showDetails={true}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">رفع الملفات</h4>
                <FileUploadLoader
                  files={uploadFiles}
                  onRetry={(fileName) => console.log('Retry:', fileName)}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">حالة الشبكة</h4>
                <NetworkStatusLoader
                  status="connected"
                  speed="45 Mbps"
                  ping={12}
                />
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </ResponsiveLayout>
  );
};

export default InteractiveDemo;