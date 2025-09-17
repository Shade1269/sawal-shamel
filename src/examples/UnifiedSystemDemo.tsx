import React, { useState } from 'react';
import { 
  AdaptiveLayout,
  AdaptiveContainer,
  AdaptiveGrid,
  AdaptiveGridItem,
  AdaptiveButton
} from '@/components/layout';
import {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent,
  EnhancedButton as UIButton,
  EnhancedForm,
  EnhancedTable
} from '@/components/enhanced';
import {
  VirtualizedList,
  LazyImage,
  PerformanceMonitor,
  ErrorBoundary
} from '@/components/performance';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { usePerformance } from '@/hooks/usePerformance';
import { useSmartNavigation } from '@/components/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  Activity,
  Navigation,
  Layers,
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Mock data for demonstrations
const generateSystemData = (count: number) => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `نظام رقم ${i + 1}`,
    description: `وصف النظام ${i + 1} - يعمل بتقنيات متقدمة`,
    status: ['نشط', 'معلق', 'قيد التطوير'][Math.floor(Math.random() * 3)],
    performance: Math.floor(Math.random() * 100) + 1
  }));

interface SystemStatus {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export function UnifiedSystemDemo() {
  const device = useDeviceDetection();
  const { metrics, config, isLowPerformanceMode } = usePerformance();
  const navigation = useSmartNavigation();
  
  const [showMonitor, setShowMonitor] = useState(true);
  const [activeSystem, setActiveSystem] = useState('overview');
  const [systemData] = useState(() => generateSystemData(1000));

  // System status checks
  const systemStatuses: SystemStatus[] = [
    {
      name: 'نظام التخطيط التكيفي',
      status: 'success',
      message: 'يعمل بشكل مثالي - تم اكتشاف الجهاز بنجاح'
    },
    {
      name: 'نظام التنقل الذكي', 
      status: 'success',
      message: 'متصل ويعمل - تم تحميل العناصر'
    },
    {
      name: 'المكونات المحسّنة',
      status: 'success', 
      message: 'جاهزة للاستخدام - جميع المتغيرات متاحة'
    },
    {
      name: 'تحسين الأداء',
      status: isLowPerformanceMode ? 'warning' : 'success',
      message: isLowPerformanceMode 
        ? 'تم تفعيل وضع الأداء المنخفض' 
        : 'الأداء ممتاز - جميع المقاييس طبيعية'
    },
    {
      name: 'كشف الأجهزة',
      status: 'success',
      message: `تم اكتشاف: ${device.deviceType} - ${device.screenSize}`
    }
  ];

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const renderSystemItem = (item: typeof systemData[0], index: number) => (
    <AdaptiveContainer 
      key={item.id}
      className="p-4 border rounded-lg hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{item.title}</h4>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="text-right space-y-2">
          <Badge variant={item.status === 'نشط' ? 'default' : 'secondary'}>
            {item.status}
          </Badge>
          <div className="text-xs text-muted-foreground">
            أداء: {item.performance}%
          </div>
        </div>
      </div>
    </AdaptiveContainer>
  );

  return (
    <ErrorBoundary>
      <AdaptiveLayout>
        <div className="space-y-6">
          {/* Header */}
          <AdaptiveContainer className="text-center space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              النظام الموحد المتكامل
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نظام شامل يجمع بين التخطيط التكيفي، التنقل الذكي، المكونات المحسّنة، وتحسين الأداء
            </p>
            
            {/* Device Info */}
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
              {device.isMobile && <Smartphone className="w-5 h-5 text-primary" />}
              {device.isTablet && <Tablet className="w-5 h-5 text-primary" />}
              {device.isDesktop && <Monitor className="w-5 h-5 text-primary" />}
              <span className="text-sm font-medium">
                {device.deviceType} - {device.screenSize} - {device.orientation}
              </span>
            </div>
          </AdaptiveContainer>

          {/* System Status Overview */}
          <EnhancedCard variant="success">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                حالة الأنظمة
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <AdaptiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
                {systemStatuses.map((system, index) => (
                  <AdaptiveGridItem key={index}>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                      {getStatusIcon(system.status)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{system.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {system.message}
                        </p>
                      </div>
                    </div>
                  </AdaptiveGridItem>
                ))}
              </AdaptiveGrid>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Control Panel */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                لوحة التحكم
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="monitor">مراقب الأداء المباشر</Label>
                <Switch 
                  id="monitor"
                  checked={showMonitor} 
                  onCheckedChange={setShowMonitor} 
                />
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Main System Demos */}
          <Tabs value={activeSystem} onValueChange={setActiveSystem} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {!device.isMobile && "نظرة عامة"}
              </TabsTrigger>
              <TabsTrigger value="adaptive" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                {!device.isMobile && "تكيفي"}
              </TabsTrigger>
              <TabsTrigger value="navigation" className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                {!device.isMobile && "التنقل"}
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {!device.isMobile && "الأداء"}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <AdaptiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
                <AdaptiveGridItem>
                  <EnhancedCard variant="success">
                    <EnhancedCardContent className="text-center p-6">
                      <div className="text-3xl font-bold text-green-600">{metrics.frameRate}</div>
                      <div className="text-sm text-muted-foreground">إطار/ثانية</div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </AdaptiveGridItem>
                
                <AdaptiveGridItem>
                  <EnhancedCard variant="info">
                    <EnhancedCardContent className="text-center p-6">
                      <div className="text-3xl font-bold text-blue-600">{metrics.memoryUsage}%</div>
                      <div className="text-sm text-muted-foreground">استخدام الذاكرة</div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </AdaptiveGridItem>
                
                <AdaptiveGridItem>
                  <EnhancedCard variant="success">
                    <EnhancedCardContent className="text-center p-6">
                      <div className="text-3xl font-bold text-green-600 capitalize">
                        {metrics.networkSpeed}
                      </div>
                      <div className="text-sm text-muted-foreground">سرعة الشبكة</div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </AdaptiveGridItem>
                
                <AdaptiveGridItem>
                  <EnhancedCard variant="warning">
                    <EnhancedCardContent className="text-center p-6">
                      <div className="text-3xl font-bold text-orange-600 capitalize">
                        {config.imageQuality}
                      </div>
                      <div className="text-sm text-muted-foreground">جودة الصور</div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </AdaptiveGridItem>
              </AdaptiveGrid>
            </TabsContent>

            {/* Adaptive Layout Tab */}
            <TabsContent value="adaptive" className="space-y-4">
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>التخطيط التكيفي المتقدم</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>نوع الجهاز: <Badge>{device.deviceType}</Badge></div>
                      <div>حجم الشاشة: <Badge variant="outline">{device.screenSize}</Badge></div>
                      <div>الاتجاه: <Badge variant="secondary">{device.orientation}</Badge></div>
                      <div>اللمس: <Badge variant={device.isMobile || device.isTablet ? "success" : "outline"}>
                        {device.isMobile || device.isTablet ? "مدعوم" : "غير مدعوم"}
                      </Badge></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <AdaptiveButton variant="default" size="default">
                        زر تكيفي أساسي
                      </AdaptiveButton>
                      <AdaptiveButton variant="secondary" size="default">
                        زر تكيفي ثانوي  
                      </AdaptiveButton>
                      <AdaptiveButton variant="outline" size="default">
                        زر تكيفي محدد
                      </AdaptiveButton>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </TabsContent>

            {/* Navigation Tab */}
            <TabsContent value="navigation" className="space-y-4">
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>معلومات التنقل الذكي</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="space-y-3">
                  <div>المسار الحالي: <Badge variant="outline">{navigation.state.currentPath}</Badge></div>
                  <div>قائمة الجوال: <Badge variant={navigation.state.mobileMenuOpen ? "success" : "secondary"}>
                    {navigation.state.mobileMenuOpen ? "مفتوحة" : "مغلقة"}
                  </Badge></div>
                  <div>الصفحات الحديثة: <Badge>{navigation.state.recentPages.length}</Badge></div>
                  <div>الصفحات المفضلة: <Badge>{navigation.state.favoritePages.length}</Badge></div>
                </EnhancedCardContent>
              </EnhancedCard>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>قائمة افتراضية - {systemData.length.toLocaleString()} عنصر</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <VirtualizedList
                    items={systemData}
                    itemHeight={80}
                    containerHeight={300}
                    renderItem={renderSystemItem}
                    className="border rounded-lg"
                  />
                </EnhancedCardContent>
              </EnhancedCard>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LazyImage
                  src="https://picsum.photos/400/300?random=unified1"
                  alt="صورة النظام الموحد 1"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <LazyImage
                  src="https://picsum.photos/400/300?random=unified2"
                  alt="صورة النظام الموحد 2" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <LazyImage
                  src="https://picsum.photos/400/300?random=unified3"
                  alt="صورة النظام الموحد 3"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Performance Monitor */}
          {showMonitor && (
            <PerformanceMonitor showDetailed={true} />
          )}

          {/* Success Message */}
          <AdaptiveContainer className="text-center p-8">
            <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">تم دمج النظام بنجاح! جميع المكونات تعمل في تناغم مثالي</span>
            </div>
          </AdaptiveContainer>
        </div>
      </AdaptiveLayout>
    </ErrorBoundary>
  );
}

export default UnifiedSystemDemo;