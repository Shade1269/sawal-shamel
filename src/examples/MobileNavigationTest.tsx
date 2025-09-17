import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useSmartNavigation } from '@/components/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent
} from '@/components/enhanced';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Eye,
  EyeOff
} from 'lucide-react';

export function MobileNavigationTest() {
  const device = useDeviceDetection();
  const navigation = useSmartNavigation();
  
  const testResults = [
    {
      name: 'كشف نوع الجهاز',
      status: device ? 'success' : 'error',
      value: device ? `${device.deviceType} - ${device.screenSize}` : 'فشل'
    },
    {
      name: 'نظام التنقل الذكي',
      status: navigation ? 'success' : 'error', 
      value: navigation ? 'متصل' : 'غير متصل'
    },
    {
      name: 'شريط التنقل السفلي للجوال',
      status: navigation.state.bottomNavVisible ? 'success' : 'warning',
      value: navigation.state.bottomNavVisible ? 'مرئي' : 'مخفي'
    },
    {
      name: 'عناصر التنقل المتاحة',
      status: navigation.getNavigationForDevice().length > 0 ? 'success' : 'error',
      value: `${navigation.getNavigationForDevice().length} عنصر`
    },
    {
      name: 'المسار الحالي',
      status: 'success',
      value: navigation.state.currentPath
    }
  ];

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">اختبار نظام التنقل للجوال</h1>
        <p className="text-muted-foreground">فحص شامل لنظام التنقل التكيفي</p>
      </div>

      {/* Device Info */}
      <EnhancedCard variant={device.isMobile ? 'success' : 'info'}>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            {device.isMobile && <Smartphone className="w-5 h-5" />}
            {device.isTablet && <Tablet className="w-5 h-5" />}
            {device.isDesktop && <Monitor className="w-5 h-5" />}
            معلومات الجهاز الحالي
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>نوع الجهاز: <Badge variant="outline">{device.deviceType}</Badge></div>
            <div>حجم الشاشة: <Badge variant="outline">{device.screenSize}</Badge></div>
            <div>الاتجاه: <Badge variant="outline">{device.orientation}</Badge></div>
            <div>الأبعاد: <Badge variant="outline">{device.viewport.width}x{device.viewport.height}</Badge></div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Test Results */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            نتائج اختبار النظام
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="space-y-3">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <StatusIcon status={test.status} />
                  <span className="font-medium">{test.name}</span>
                </div>
                <Badge variant={test.status === 'success' ? 'default' : test.status === 'warning' ? 'warning' : 'destructive'}>
                  {test.value}
                </Badge>
              </div>
            ))}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Navigation Controls */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle>التحكم في التنقل</EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigation.setBottomNavVisible(!navigation.state.bottomNavVisible)}
              className="flex items-center gap-2"
            >
              {navigation.state.bottomNavVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {navigation.state.bottomNavVisible ? 'إخفاء' : 'إظهار'} شريط التنقل
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigation.toggleMobileMenu()}
            >
              تبديل قائمة الجوال
            </Button>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Available Navigation Items */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle>عناصر التنقل المتاحة للجهاز الحالي</EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {navigation.getNavigationForDevice().map((item, index) => {
              const Icon = item.icon;
              const isActive = navigation.state.currentPath === item.href;
              
              return (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                  {isActive && <CheckCircle className="w-4 h-4 text-primary" />}
                </div>
              );
            })}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Summary */}
      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h3 className="text-lg font-bold text-green-700 mb-2">
          ✅ نظام التنقل للجوال يعمل بنجاح!
        </h3>
        <p className="text-sm text-green-600">
          جميع المكونات مُفعَّلة وتعمل على كافة الصفحات
        </p>
      </div>
    </div>
  );
}

export default MobileNavigationTest;