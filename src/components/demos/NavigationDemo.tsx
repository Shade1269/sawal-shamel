import React, { useState } from 'react';
import { 
  EnhancedContainer,
  EnhancedSection,
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent,
  Kbd
} from '@/components/ui';
import { EnhancedTabs, type TabItem } from '@/components/navigation/EnhancedTabs';
import { SmartSearch } from '@/components/navigation/SmartSearch';
import { QuickCommandPalette } from '@/components/navigation/QuickCommandPalette';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Settings, 
  Users, 
  Package, 
  BarChart3, 
  ShoppingCart,
  Command,
  Keyboard,
  Palette,
  Star,
  Heart,
  Zap
} from 'lucide-react';

const NavigationDemo: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced Tabs Demo
  const demoTabs: TabItem[] = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: BarChart3,
      badge: '5',
      content: (
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">نظرة عامة على النظام</h3>
          <p className="text-muted-foreground">
            هنا يمكنك رؤية إحصائيات شاملة عن أداء نظامك والبيانات المهمة.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/10">
              <div className="text-2xl font-bold text-primary">150</div>
              <div className="text-sm text-muted-foreground">إجمالي المستخدمين</div>
            </div>
            <div className="p-4 rounded-lg bg-success/10">
              <div className="text-2xl font-bold text-success">89%</div>
              <div className="text-sm text-muted-foreground">معدل الرضا</div>
            </div>
            <div className="p-4 rounded-lg bg-warning/10">
              <div className="text-2xl font-bold text-warning">12</div>
              <div className="text-sm text-muted-foreground">مهام معلقة</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'users',
      label: 'المستخدمون',
      icon: Users,
      badge: 'جديد',
      closeable: true,
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">إدارة المستخدمين</h3>
          <p className="text-muted-foreground">
            يمكنك من هنا إدارة جميع حسابات المستخدمين ومراقبة نشاطاتهم.
          </p>
        </div>
      )
    },
    {
      id: 'products',
      label: 'المنتجات',
      icon: Package,
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">إدارة المنتجات</h3>
          <p className="text-muted-foreground">
            إضافة وتعديل وحذف المنتجات في متجرك الإلكتروني.
          </p>
        </div>
      )
    },
    {
      id: 'orders',
      label: 'الطلبات',
      icon: ShoppingCart,
      badge: '8',
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">إدارة الطلبات</h3>
          <p className="text-muted-foreground">
            متابعة ومعالجة طلبات العملاء والشحنات.
          </p>
        </div>
      )
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">إعدادات النظام</h3>
          <p className="text-muted-foreground">
            تخصيص وإعدادات النظام العامة والمتقدمة.
          </p>
        </div>
      )
    }
  ];

  const shortcutsData = [
    {
      category: "التنقل العام",
      shortcuts: [
        { keys: ["Cmd", "K"], description: "فتح لوحة الأوامر" },
        { keys: ["Cmd", "/"], description: "عرض المساعدة" },
        { keys: ["Esc"], description: "العودة للخلف" }
      ]
    },
    {
      category: "لوحة الإدارة",
      shortcuts: [
        { keys: ["Cmd", "Shift", "A"], description: "لوحة الإدارة" },
        { keys: ["Cmd", "Shift", "U"], description: "إدارة المستخدمين" },
        { keys: ["Cmd", "Shift", "T"], description: "التحليلات" }
      ]
    },
    {
      category: "التنقل السريع",
      shortcuts: [
        { keys: ["Cmd", "1"], description: "الصفحة الرئيسية" },
        { keys: ["Cmd", "2"], description: "الصفحة الثانية" },
        { keys: ["Cmd", "3"], description: "الصفحة الثالثة" }
      ]
    }
  ];

  return (
    <EnhancedContainer size="xl" className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <EnhancedSection variant="glass" size="sm" animation="fade">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Command className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="text-3xl font-bold bg-gradient-luxury bg-clip-text text-transparent">
                Enhanced Navigation System v2.2
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نظام تنقل متقدم مع اختصارات لوحة المفاتيح وبحث ذكي وتبويبات محسنة
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge variant="luxury" className="gap-1">
                <Keyboard className="h-3 w-3" />
                اختصارات ذكية
              </Badge>
              <Badge variant="premium" className="gap-1">
                <Search className="h-3 w-3" />
                بحث متقدم
              </Badge>
              <Badge variant="success" className="gap-1">
                <Zap className="h-3 w-3" />
                أداء عالي
              </Badge>
            </div>
          </div>
        </EnhancedSection>

        {/* Command Palette Demo */}
        <EnhancedCard variant="persian" hover="glow" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Command className="h-5 w-5" />
              Quick Command Palette - لوحة الأوامر السريعة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-6 text-white">
              <p>
                لوحة أوامر سريعة تدعم البحث الذكي والاختصارات المخصصة حسب دور المستخدم.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Button 
                  variant="outline"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  فتح لوحة الأوامر
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <span>أو اضغط</span>
                  <Kbd variant="outline" className="text-white border-white/30">Cmd</Kbd>
                  <span>+</span>
                  <Kbd variant="outline" className="text-white border-white/30">K</Kbd>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">الميزات:</h4>
                  <ul className="text-sm space-y-1 text-white/80">
                    <li>• بحث فوري في جميع الأوامر</li>
                    <li>• اختصارات مخصصة حسب الدور</li>
                    <li>• تجميع الأوامر حسب الفئة</li>
                    <li>• دعم البحث باللغة العربية</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">الاختصارات الأساسية:</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Kbd size="sm" className="bg-white/20 text-white border-white/30">Cmd+A</Kbd>
                      <span>لوحة الإدارة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Kbd size="sm" className="bg-white/20 text-white border-white/30">Cmd+U</Kbd>
                      <span>إدارة المستخدمين</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Kbd size="sm" className="bg-white/20 text-white border-white/30">Cmd+T</Kbd>
                      <span>التحليلات</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Smart Search Demo */}
        <EnhancedCard variant="glass" hover="lift" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Smart Search - البحث الذكي
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-6">
              <p className="text-muted-foreground">
                نظام بحث ذكي مع تصفية متقدمة وعرض للبحثات الأخيرة والاقتراحات.
              </p>
              
              <div className="max-w-md">
                <SmartSearch 
                  placeholder="جرب البحث عن 'مستخدم' أو 'منتج'..."
                  showRecentSearches={true}
                  showSuggestions={true}
                  showFilters={true}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">البحث السريع</h4>
                  <p className="text-xs text-muted-foreground">
                    بحث فوري مع عرض النتائج أثناء الكتابة
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">التصفية الذكية</h4>
                  <p className="text-xs text-muted-foreground">
                    فلترة النتائج حسب النوع والفئة
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">البحثات الأخيرة</h4>
                  <p className="text-xs text-muted-foreground">
                    حفظ وعرض البحثات السابقة
                  </p>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Enhanced Tabs Demo */}
        <EnhancedCard variant="luxury" hover="persian" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Palette className="h-5 w-5" />
              Enhanced Tabs - التبويبات المطورة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-6">
              <p className="text-white/90">
                نظام تبويبات متقدم مع دعم الإغلاق والتمرير والشارات التفاعلية.
              </p>
              
              {/* Luxury Tabs */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold">تبويبات فاخرة:</h4>
                <EnhancedTabs
                  variant="luxury"
                  size="md"
                  tabs={demoTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onTabClose={(tabId) => console.log('إغلاق تبويب:', tabId)}
                  scrollable={true}
                  showAddButton={true}
                  onTabAdd={() => console.log('إضافة تبويب جديد')}
                />
              </div>
              
              {/* Glass Tabs */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold">تبويبات زجاجية:</h4>
                <EnhancedTabs
                  variant="glass"
                  size="sm"
                  tabs={demoTabs.slice(0, 3)}
                  scrollable={false}
                />
              </div>
              
              {/* Filled Tabs */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold">تبويبات مملوءة:</h4>
                <EnhancedTabs
                  variant="filled"
                  size="lg"
                  tabs={[
                    { id: '1', label: 'المفضلة', icon: Star, badge: '3' },
                    { id: '2', label: 'الأحدث', icon: Heart, badge: 'جديد' },
                    { id: '3', label: 'الشائعة', icon: Zap }
                  ]}
                />
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Keyboard Shortcuts Reference */}
        <EnhancedCard variant="outline" hover="glow" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-accent" />
              مرجع اختصارات لوحة المفاتيح
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortcutsData.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h4 className="font-semibold text-sm text-accent">
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <Kbd key={keyIndex} size="sm">
                              {key}
                            </Kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Command Palette */}
      <QuickCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </EnhancedContainer>
  );
};

export default NavigationDemo;