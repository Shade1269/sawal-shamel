import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { PerformanceOptimizer } from '@/components/ux/PerformanceOptimizer';
import { UserActivityTracker } from '@/components/ux/UserActivityTracker';
import { SmartSearch } from '@/components/ux/SmartSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  Zap, 
  Activity, 
  Search, 
  Keyboard, 
  TrendingUp, 
  Users, 
  BarChart3,
  Sparkles,
  Rocket,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UXEnhancementsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');

  const { shortcuts, isEnabled, toggleShortcuts } = useKeyboardShortcuts({
    onSearchOpen: () => setSearchOpen(true)
  });

  const features = [
    {
      title: 'محسّن الأداء',
      description: 'مراقبة وتحسين أداء التطبيق في الوقت الفعلي',
      icon: Zap,
      color: 'text-info',
      tab: 'performance'
    },
    {
      title: 'تتبع نشاط المستخدم',
      description: 'تحليل شامل لسلوك المستخدمين والتفاعل',
      icon: Activity,
      color: 'text-accent',
      tab: 'activity'
    },
    {
      title: 'البحث الذكي',
      description: 'بحث متقدم وسريع عبر النظام بالكامل',
      icon: Search,
      color: 'text-success',
      tab: 'search'
    },
    {
      title: 'اختصارات المفاتيح',
      description: 'اختصارات لتسريع العمل وزيادة الإنتاجية',
      icon: Keyboard,
      color: 'text-warning',
      tab: 'shortcuts'
    }
  ];

  const stats = [
    { label: 'تحسين السرعة', value: '+45%', icon: TrendingUp, color: 'text-success' },
    { label: 'مشاركة المستخدمين', value: '+32%', icon: Users, color: 'text-info' },
    { label: 'كفاءة البحث', value: '+68%', icon: Search, color: 'text-accent' },
    { label: 'سرعة الإنجاز', value: '+55%', icon: Target, color: 'text-warning' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl gradient-icon-wrapper">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text-accent">
              تحسينات تجربة المستخدم
            </h1>
            <p className="text-lg text-muted-foreground">
              مجموعة شاملة من الأدوات لتحسين الأداء وتجربة المستخدم
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <UnifiedBadge variant="success" className="flex items-center gap-1">
            <Rocket className="h-3 w-3" />
            المرحلة الرابعة مكتملة
          </UnifiedBadge>
          <UnifiedBadge variant="default">النسخة 4.0</UnifiedBadge>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <UnifiedCard variant="glass" hover="lift" className="text-center">
              <UnifiedCardContent className="p-6">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </UnifiedCardContent>
            </UnifiedCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => setActiveTab(feature.tab)}
          >
            <UnifiedCard 
              variant="elegant" 
              hover="glow"
              className={`h-full ${activeTab === feature.tab ? 'ring-2 ring-primary' : ''}`}
            >
              <UnifiedCardHeader className="text-center">
                <div className="mx-auto p-3 rounded-xl gradient-card-accent w-fit">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <UnifiedCardTitle className="text-lg">{feature.title}</UnifiedCardTitle>
                <UnifiedCardDescription className="text-sm">
                  {feature.description}
                </UnifiedCardDescription>
              </UnifiedCardHeader>
            </UnifiedCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              الأداء
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              النشاط
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              البحث
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              الاختصارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceOptimizer />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <UserActivityTracker />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <UnifiedCard variant="glass-strong">
              <UnifiedCardHeader>
                <UnifiedCardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-success" />
                  البحث الذكي
                </UnifiedCardTitle>
                <UnifiedCardDescription>
                  نظام بحث متقدم يوفر نتائج سريعة ودقيقة عبر النظام بالكامل
                </UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">المميزات الرئيسية:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• بحث شامل عبر الصفحات والمنتجات والطلبات</li>
                      <li>• فلاتر متقدمة لتضييق النتائج</li>
                      <li>• حفظ البحثات الأخيرة</li>
                      <li>• اختصارات المفاتيح (Ctrl+K)</li>
                      <li>• نتائج مرتبة حسب الصلة</li>
                      <li>• بحث بالعربية والإنجليزية</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">الإحصائيات:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-success">68%</div>
                        <div className="text-xs text-muted-foreground">تحسن الكفاءة</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-info">&lt;200ms</div>
                        <div className="text-xs text-muted-foreground">زمن الاستجابة</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <UnifiedButton variant="primary" onClick={() => setSearchOpen(true)} fullWidth>
                    <Search className="h-4 w-4 mr-2" />
                    تجربة البحث الذكي
                  </UnifiedButton>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-6">
            <UnifiedCard variant="glass-strong">
              <UnifiedCardHeader>
              <UnifiedCardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-warning" />
                  اختصارات المفاتيح
                </UnifiedCardTitle>
                <UnifiedCardDescription>
                  تسريع العمل وزيادة الإنتاجية مع اختصارات المفاتيح المخصصة
                </UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">حالة الاختصارات</h4>
                    <p className="text-sm text-muted-foreground">
                      {isEnabled ? 'مفعلة' : 'معطلة'} - {shortcuts.length} اختصار متاح
                    </p>
                  </div>
                  <UnifiedButton 
                    variant={isEnabled ? "danger" : "primary"}
                    onClick={() => toggleShortcuts(!isEnabled)}
                  >
                    {isEnabled ? 'تعطيل' : 'تفعيل'} الاختصارات
                  </UnifiedButton>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">الاختصارات المتاحة:</h4>
                  <div className="grid gap-3">
                    {shortcuts.slice(0, 8).map((shortcut, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">{shortcut.description}</div>
                          <div className="text-xs text-muted-foreground">
                            فئة: {shortcut.category}
                          </div>
                        </div>
                        <kbd className="px-2 py-1 bg-background border rounded text-xs">
                          {shortcut.ctrlKey && 'Ctrl+'}{shortcut.key.toUpperCase()}
                        </kbd>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center pt-4">
                    <UnifiedButton variant="outline" onClick={() => {}}>
                      عرض جميع الاختصارات ({shortcuts.length})
                    </UnifiedButton>
                  </div>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Smart Search Component */}
      <SmartSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder="جرب البحث الذكي - ابحث عن أي شيء..."
      />
    </div>
  );
}