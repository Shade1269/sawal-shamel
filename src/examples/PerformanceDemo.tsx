import React, { useState, useMemo } from 'react';
import {
  VirtualizedList,
  LazyImage,
  PerformanceMonitor,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  ErrorBoundary,
  usePerformance
} from '@/components/performance';
import { 
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent,
  EnhancedButton
} from '@/components/enhanced';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Image as ImageIcon,
  List,
  Loader,
  AlertTriangle,
  Zap,
  Eye
} from 'lucide-react';

// Mock data generators
const generateMockItems = (count: number) => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `عنصر رقم ${i + 1}`,
    description: `وصف العنصر ${i + 1} - محتوى تجريبي للاختبار`,
    price: Math.floor(Math.random() * 1000) + 50,
    category: ['الكترونيات', 'ملابس', 'كتب', 'رياضة'][Math.floor(Math.random() * 4)]
  }));

const generateMockImages = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    src: `https://picsum.photos/400/300?random=${i}`,
    alt: `صورة تجريبية ${i + 1}`,
    caption: `صورة رقم ${i + 1}`
  }));

const TestErrorComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('هذا خطأ تجريبي لاختبار ErrorBoundary');
  }
  return <div className="p-4 bg-green-50 rounded">المكون يعمل بشكل طبيعي</div>;
};

export function PerformanceDemo() {
  const [showMonitor, setShowMonitor] = useState(true);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [triggerError, setTriggerError] = useState(false);
  const [listSize, setListSize] = useState(10000);
  const { 
    metrics, 
    config, 
    isLowPerformanceMode,
    shouldReduceAnimations 
  } = usePerformance();

  // Generate mock data
  const mockItems = useMemo(() => generateMockItems(listSize), [listSize]);
  const mockImages = useMemo(() => generateMockImages(12), []);

  const renderListItem = (item: typeof mockItems[0], index: number) => (
    <div className="p-4 border-b hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          <Badge variant="outline" className="mt-2">{item.category}</Badge>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold">{item.price} ريال</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">نظام تحسين الأداء المتقدم</h1>
        <p className="text-muted-foreground">
          مجموعة شاملة من أدوات تحسين الأداء ومراقبة النظام
        </p>
      </div>

      {/* Performance Status */}
      <EnhancedCard variant={isLowPerformanceMode ? "warning" : "success"}>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            حالة الأداء الحالية
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.frameRate}</div>
              <div className="text-sm text-muted-foreground">FPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
              <div className="text-sm text-muted-foreground">استخدام الذاكرة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold capitalize">{metrics.networkSpeed}</div>
              <div className="text-sm text-muted-foreground">سرعة الشبكة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{config.imageQuality}</div>
              <div className="text-sm text-muted-foreground">جودة الصور</div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Controls */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle>إعدادات العرض التوضيحي</EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="monitor">إظهار مراقب الأداء</Label>
            <Switch 
              id="monitor"
              checked={showMonitor} 
              onCheckedChange={setShowMonitor} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="skeletons">إظهار حالات التحميل</Label>
            <Switch 
              id="skeletons"
              checked={showSkeletons} 
              onCheckedChange={setShowSkeletons} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="error">تفعيل خطأ تجريبي</Label>
            <Switch 
              id="error"
              checked={triggerError} 
              onCheckedChange={setTriggerError} 
            />
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Performance Demos */}
      <Tabs defaultValue="virtualized" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="virtualized">
            <List className="w-4 h-4 mr-2" />
            قوائم افتراضية
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="w-4 h-4 mr-2" />
            صور محسّنة
          </TabsTrigger>
          <TabsTrigger value="skeletons">
            <Loader className="w-4 h-4 mr-2" />
            حالات التحميل
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="w-4 h-4 mr-2" />
            معالجة الأخطاء
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Zap className="w-4 h-4 mr-2" />
            التحسينات
          </TabsTrigger>
        </TabsList>

        {/* Virtualized Lists */}
        <TabsContent value="virtualized" className="space-y-4">
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>قائمة افتراضية - {listSize.toLocaleString()} عنصر</EnhancedCardTitle>
              <div className="flex gap-2">
                <EnhancedButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => setListSize(1000)}
                >
                  1K
                </EnhancedButton>
                <EnhancedButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => setListSize(10000)}
                >
                  10K
                </EnhancedButton>
                <EnhancedButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => setListSize(100000)}
                >
                  100K
                </EnhancedButton>
              </div>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <VirtualizedList
                items={mockItems}
                itemHeight={100}
                containerHeight={400}
                renderItem={renderListItem}
                className="border rounded-lg"
              />
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        {/* Optimized Images */}
        <TabsContent value="images" className="space-y-4">
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>معرض صور محسّن مع التحميل البطيء</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="grid grid-cols-3 gap-4">
                {mockImages.map((image, index) => (
                  <LazyImage
                    key={index}
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-48 object-cover rounded-lg"
                    priority={index < 6}
                  />
                ))}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>صور مفردة محسّنة</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">صورة عادية</h4>
                  <LazyImage
                    src="https://picsum.photos/400/300?random=single1"
                    alt="صورة تجريبية"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">صورة مع placeholder مضبب</h4>
                  <LazyImage
                    src="https://picsum.photos/400/300?random=single2"
                    alt="صورة تجريبية"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        {/* Skeleton Loaders */}
        <TabsContent value="skeletons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle>حالات تحميل البطاقات</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {showSkeletons ? (
                  <div className="space-y-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <h3 className="font-medium">بطاقة محملة {i + 1}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          محتوى البطاقة بعد التحميل
                        </p>
                        <Badge className="mt-2">جاهز</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle>حالة تحميل الجداول</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {showSkeletons ? (
                  <TableSkeleton rows={5} columns={3} />
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-4 p-2 font-medium border-b">
                      <div className="flex-1">الاسم</div>
                      <div className="flex-1">الفئة</div>
                      <div className="flex-1">السعر</div>
                    </div>
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex gap-4 p-2">
                        <div className="flex-1">منتج {i + 1}</div>
                        <div className="flex-1">فئة {i + 1}</div>
                        <div className="flex-1">{(i + 1) * 100} ريال</div>
                      </div>
                    ))}
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>حالة تحميل لوحة التحكم</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              {showSkeletons ? (
                <DashboardSkeleton />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لوحة التحكم محملة بالكامل</p>
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        {/* Error Boundaries */}
        <TabsContent value="errors" className="space-y-4">
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle>معالجة الأخطاء مع Error Boundary</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <ErrorBoundary 
                showDetails={true}
                onError={(error, errorInfo) => {
                  console.log('Error caught by boundary:', error, errorInfo);
                }}
              >
                <TestErrorComponent shouldError={triggerError} />
              </ErrorBoundary>
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        {/* Optimizations */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCard variant={isLowPerformanceMode ? "warning" : "success"}>
              <EnhancedCardHeader>
                <EnhancedCardTitle>التحسينات التلقائية</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>تقليل الحركات</span>
                  <Badge variant={shouldReduceAnimations ? "destructive" : "secondary"}>
                    {shouldReduceAnimations ? "مفعل" : "معطل"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>جودة الصور</span>
                  <Badge variant="outline">{config.imageQuality}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>التمرير الافتراضي</span>
                  <Badge variant={config.enableVirtualScrolling ? "destructive" : "secondary"}>
                    {config.enableVirtualScrolling ? "مفعل" : "معطل"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>التحميل المسبق</span>
                  <Badge variant={config.enablePrefetching ? "secondary" : "destructive"}>
                    {config.enablePrefetching ? "مفعل" : "معطل"}
                  </Badge>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle>نصائح التحسين</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-2 text-sm">
                <ul className="space-y-2">
                  <li>• استخدم VirtualizedList للقوائم الطويلة</li>
                  <li>• فعّل التحميل البطيء للصور</li>
                  <li>• استخدم Skeleton loaders أثناء التحميل</li>
                  <li>• لف المكونات بـ ErrorBoundary</li>
                  <li>• راقب الأداء باستمرار</li>
                </ul>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Monitor */}
      {showMonitor && (
        <PerformanceMonitor 
          showDetails={true}
        />
      )}
    </div>
  );
}

export default PerformanceDemo;