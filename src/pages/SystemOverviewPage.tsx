import { useState } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Rocket, 
  Code2, 
  Layers, 
  Database, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap,
  Navigation,
  Layout,
  ShoppingCart,
  BarChart3,
  Settings,
  Search,
  Activity,
  Target,
  Star,
  Calendar,
  Globe,
  Shield,
  Cpu,
  Palette,
  MousePointer,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFastAuth } from '@/hooks/useFastAuth';

interface SystemPhase {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress: number;
  icon: any;
  color: string;
  features: string[];
  technicalImprovements: string[];
}

const systemPhases: SystemPhase[] = [
  {
    id: 1,
    title: 'نظام التنقل الموحد',
    description: 'إنشاء نظام تنقل ذكي وموحد مع sidebar وbreadcrumbs متطورة',
    status: 'completed',
    progress: 100,
    icon: Navigation,
    color: 'text-green-500',
    features: [
      'Sidebar ذكي مع تصنيف حسب الأدوار',
      'نظام Breadcrumbs تلقائي',
      'تنقل سريع مع Quick Actions',
      'Command Palette للوصول السريع',
      'تخطيط موحد يدعم جميع الأجهزة'
    ],
    technicalImprovements: [
      'React Router v6 مع Nested Routes',
      'shadcn/ui Sidebar Components',
      'Dynamic Navigation Generation',
      'Role-based Route Guards',
      'Responsive Layout System'
    ]
  },
  {
    id: 2,
    title: 'دمج الأنظمة المتشابهة',
    description: 'توحيد الصفحات والمكونات المكررة لتحسين الأداء والصيانة',
    status: 'completed',
    progress: 100,
    icon: Layers,
    color: 'text-blue-500',
    features: [
      'لوحة تحكم موحدة لجميع الأدوار',
      'إدارة منتجات شاملة',
      'نظام طلبات موحد',
      'إزالة التكرار في الكود',
      'مشاركة المكونات بين الأنظمة'
    ],
    technicalImprovements: [
      'Unified Component Architecture',
      'Shared Business Logic Hooks',
      'Consolidated API Calls',
      'Reduced Bundle Size',
      'Improved Code Maintainability'
    ]
  },
  {
    id: 3,
    title: 'لوحة التحكم المتقدمة',
    description: 'إنشاء dashboard ذكي مع widgets تفاعلية وتحليلات شاملة',
    status: 'completed', 
    progress: 100,
    icon: BarChart3,
    color: 'text-accent',
    features: [
      'Smart Widgets مع بيانات فورية',
      'رسوم بيانية تفاعلية متقدمة',
      'نظام إشعارات ذكية',
      'تحليلات مخصصة حسب الدور',
      'تحديث البيانات في الوقت الفعلي'
    ],
    technicalImprovements: [
      'Custom Dashboard Hooks',
      'Real-time Data Management',
      'Advanced Charting with Recharts',
      'Smart Notification System',
      'Performance Optimized Widgets'
    ]
  },
  {
    id: 4,
    title: 'تحسينات تجربة المستخدم',
    description: 'ميزات متقدمة لتحسين الأداء وتجربة المستخدم',
    status: 'completed',
    progress: 100,
    icon: Sparkles,
    color: 'text-warning',
    features: [
      'Performance Optimizer مع مراقبة فورية',
      'Smart Search عبر النظام بالكامل',
      'User Activity Tracker متقدم',
      'Keyboard Shortcuts System',
      'تحسينات الأداء التلقائية'
    ],
    technicalImprovements: [
      'Performance Monitoring System',
      'Advanced Search Algorithm',
      'User Behavior Analytics',
      'Keyboard Navigation System',
      'Automated Performance Optimization'
    ]
  }
];

const overallStats = [
  { label: 'إجمالي المكونات المطورة', value: '47+', icon: Code2, color: 'text-info' },
  { label: 'الصفحات الموحدة', value: '15+', icon: Layout, color: 'text-success' },
  { label: 'التحسينات التقنية', value: '23+', icon: Cpu, color: 'text-accent' },
  { label: 'المميزات الجديدة', value: '32+', icon: Star, color: 'text-warning' }
];

const technicalArchitecture = [
  {
    layer: 'طبقة الواجهة',
    technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    description: 'واجهة مستخدم حديثة ومتجاوبة',
    icon: Palette,
    color: 'bg-info'
  },
  {
    layer: 'طبقة المكونات',
    technologies: ['shadcn/ui', 'Radix UI', 'Lucide Icons', 'React Hook Form'],
    description: 'مكونات قابلة لإعادة الاستخدام ومتسقة',
    icon: Layout,
    color: 'bg-success'
  },
  {
    layer: 'طبقة إدارة الحالة',
    technologies: ['React Query', 'Context API', 'Custom Hooks', 'Zustand'],
    description: 'إدارة ذكية للبيانات والحالة',
    icon: Database,
    color: 'bg-accent'
  },
  {
    layer: 'طبقة الخدمات',
    technologies: ['Supabase', 'REST APIs', 'Real-time Subscriptions', 'Authentication'],
    description: 'خدمات backend متكاملة',
    icon: Globe,
    color: 'bg-warning'
  }
];

export default function SystemOverviewPage() {
  const [selectedPhase, setSelectedPhase] = useState(1);
  const { profile } = useFastAuth();

  const completedPhases = systemPhases.filter(phase => phase.status === 'completed').length;
  const overallProgress = (completedPhases / systemPhases.length) * 100;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-4 rounded-xl gradient-icon-wrapper">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text-accent">
              نظرة شاملة على النظام
            </h1>
            <p className="text-lg text-muted-foreground">
              مراحل التطوير والتحسينات التقنية المكتملة
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <UnifiedBadge variant="success" className="flex items-center gap-2 px-4 py-2">
            <CheckCircle2 className="h-4 w-4" />
            جميع المراحل مكتملة
          </UnifiedBadge>
          <UnifiedBadge variant="default" className="px-3 py-1">
            النسخة 4.0 - الإصدار النهائي
          </UnifiedBadge>
          <UnifiedBadge variant="info" className="px-3 py-1">
            {profile?.role === 'admin' ? 'مدير النظام' :
             profile?.role === 'affiliate' || profile?.role === 'merchant' || profile?.role === 'marketer' ? 'مسوق' : 'مستخدم'}
          </UnifiedBadge>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <UnifiedCard variant="glass-strong" className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-success-overlay" />
          <UnifiedCardHeader className="text-center">
            <UnifiedCardTitle className="text-2xl">التقدم الإجمالي</UnifiedCardTitle>
            <UnifiedCardDescription>مراحل تطوير النظام المكتملة</UnifiedCardDescription>
          </UnifiedCardHeader>
          <UnifiedCardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-6xl font-bold text-green-500">
                {Math.round(overallProgress)}%
              </div>
            </div>
            <Progress value={overallProgress} className="h-4" />
            <div className="text-center text-sm text-muted-foreground">
              {completedPhases} من {systemPhases.length} مراحل مكتملة
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {overallStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <UnifiedCard variant="elegant" hover="lift" className="text-center">
              <UnifiedCardContent className="p-6">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </UnifiedCardContent>
            </UnifiedCard>
          </motion.div>
        ))}
      </motion.div>

      {/* System Phases */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Tabs value={selectedPhase.toString()} onValueChange={(value) => setSelectedPhase(parseInt(value))} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">مراحل تطوير النظام</h2>
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
              {systemPhases.map((phase) => (
                <TabsTrigger 
                  key={phase.id} 
                  value={phase.id.toString()}
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <phase.icon className={`h-5 w-5 ${phase.color}`} />
                  <span className="text-xs">المرحلة {phase.id}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {systemPhases.map((phase) => (
            <TabsContent key={phase.id} value={phase.id.toString()} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <UnifiedCard variant="glass-strong" className="relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-5 ${phase.color.replace('text-', 'bg-')}`} />
                  <UnifiedCardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br from-${phase.color.split('-')[1]}-500/20 to-${phase.color.split('-')[1]}-600/20`}>
                        <phase.icon className={`h-8 w-8 ${phase.color}`} />
                      </div>
                      <div className="flex-1">
                        <UnifiedCardTitle className="text-xl">{phase.title}</UnifiedCardTitle>
                        <UnifiedCardDescription className="text-base">{phase.description}</UnifiedCardDescription>
                      </div>
                      <div className="text-center">
                        <UnifiedBadge 
                          variant={phase.status === 'completed' ? 'success' : 'info'}
                          className="mb-2"
                        >
                          {phase.status === 'completed' ? 'مكتمل' : 'قيد التطوير'}
                        </UnifiedBadge>
                        <div className="text-2xl font-bold">{phase.progress}%</div>
                      </div>
                    </div>
                  </UnifiedCardHeader>
                  <UnifiedCardContent className="space-y-6">
                    <Progress value={phase.progress} className="h-2" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4 text-warning" />
                          المميزات الرئيسية
                        </h4>
                        <ul className="space-y-2">
                          {phase.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-blue-500" />
                          التحسينات التقنية
                        </h4>
                        <ul className="space-y-2">
                          {phase.technicalImprovements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                {improvement}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </UnifiedCardContent>
                </UnifiedCard>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Technical Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <UnifiedCard variant="elegant" hover="lift">
          <UnifiedCardHeader>
            <UnifiedCardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              الهيكل التقني للنظام
            </UnifiedCardTitle>
            <UnifiedCardDescription>
              طبقات النظام والتقنيات المستخدمة في كل طبقة
            </UnifiedCardDescription>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {technicalArchitecture.map((layer, index) => (
                <motion.div
                  key={layer.layer}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="relative"
                >
                  <UnifiedCard variant="flat" hover="lift" className="h-full">
                    <UnifiedCardHeader className="text-center">
                      <div className={`mx-auto p-3 rounded-xl ${layer.color} w-fit mb-2`}>
                        <layer.icon className="h-6 w-6 text-white" />
                      </div>
                      <UnifiedCardTitle className="text-base">{layer.layer}</UnifiedCardTitle>
                      <UnifiedCardDescription className="text-xs">
                        {layer.description}
                      </UnifiedCardDescription>
                    </UnifiedCardHeader>
                    <UnifiedCardContent>
                      <div className="space-y-2">
                        {layer.technologies.map((tech, techIndex) => (
                          <UnifiedBadge 
                            key={techIndex} 
                            variant="outline" 
                            className="text-xs mx-1 mb-1"
                          >
                            {tech}
                          </UnifiedBadge>
                        ))}
                      </div>
                    </UnifiedCardContent>
                  </UnifiedCard>
                </motion.div>
              ))}
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      </motion.div>

      {/* Final Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <UnifiedCard variant="elegant" hover="lift" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-muted" />
          <UnifiedCardHeader className="text-center">
            <UnifiedCardTitle className="text-2xl flex items-center justify-center gap-2">
              <Trophy className="h-7 w-7 text-warning" />
              إنجازات المشروع
            </UnifiedCardTitle>
            <UnifiedCardDescription>
              ملخص شامل للإنجازات والتحسينات المطبقة
            </UnifiedCardDescription>
          </UnifiedCardHeader>
          <UnifiedCardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-success">100%</div>
                <div className="text-sm text-muted-foreground">معدل إتمام المراحل</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-info">4/4</div>
                <div className="text-sm text-muted-foreground">مراحل مكتملة</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-accent">47+</div>
                <div className="text-sm text-muted-foreground">مكون جديد</div>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <p className="text-muted-foreground mb-4">
                تم تطوير نظام شامل ومتطور يوفر تجربة مستخدم استثنائية مع أداء محسّن وميزات متقدمة
              </p>
              <div className="flex items-center justify-center gap-2">
                <UnifiedBadge variant="success" className="flex items-center gap-1">
                  <Rocket className="h-3 w-3" />
                  جاهز للإنتاج
                </UnifiedBadge>
                <UnifiedBadge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date().toLocaleDateString('ar')}
                </UnifiedBadge>
              </div>
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      </motion.div>
    </div>
  );
}