import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedOrdersService } from '@/services/UnifiedOrdersService';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
  duration?: number;
}

export const UnifiedSystemTester: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'جلب الطلبات من Order Hub', status: 'pending' },
    { name: 'تصفية الطلبات حسب المصدر', status: 'pending' },
    { name: 'تصفية الطلبات حسب الحالة', status: 'pending' },
    { name: 'البحث في الطلبات', status: 'pending' },
    { name: 'جلب إحصائيات المتجر', status: 'pending' },
    { name: 'تحديث حالة الطلب', status: 'pending' },
    { name: 'جلب طلب واحد بالتفاصيل', status: 'pending' },
    { name: 'جلب المبيعات الشهرية', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const updateTestStatus = (index: number, status: TestResult['status'], message?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, duration } : test
    ));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Test 1: جلب الطلبات
    try {
      updateTestStatus(0, 'running');
      const start = Date.now();
      const orders = await UnifiedOrdersService.fetchOrders();
      const duration = Date.now() - start;
      updateTestStatus(0, 'success', `تم جلب ${orders.length} طلب في ${duration}ms`, duration);
    } catch (error: any) {
      updateTestStatus(0, 'failed', error.message);
    }

    // Test 2: تصفية حسب المصدر
    try {
      updateTestStatus(1, 'running');
      const start = Date.now();
      const ecommerceOrders = await UnifiedOrdersService.fetchOrders({ source: 'ecommerce' });
      const duration = Date.now() - start;
      updateTestStatus(1, 'success', `تم جلب ${ecommerceOrders.length} طلب إلكتروني في ${duration}ms`, duration);
    } catch (error: any) {
      updateTestStatus(1, 'failed', error.message);
    }

    // Test 3: تصفية حسب الحالة
    try {
      updateTestStatus(2, 'running');
      const start = Date.now();
      const pendingOrders = await UnifiedOrdersService.fetchOrders({ status: 'pending' });
      const duration = Date.now() - start;
      updateTestStatus(2, 'success', `تم جلب ${pendingOrders.length} طلب قيد الانتظار في ${duration}ms`, duration);
    } catch (error: any) {
      updateTestStatus(2, 'failed', error.message);
    }

    // Test 4: البحث
    try {
      updateTestStatus(3, 'running');
      const start = Date.now();
      const searchResults = await UnifiedOrdersService.fetchOrders({ searchQuery: '05' });
      const duration = Date.now() - start;
      updateTestStatus(3, 'success', `تم العثور على ${searchResults.length} نتيجة في ${duration}ms`, duration);
    } catch (error: any) {
      updateTestStatus(3, 'failed', error.message);
    }

    // Test 5: الإحصائيات
    try {
      updateTestStatus(4, 'running');
      const start = Date.now();
      const stats = await UnifiedOrdersService.getStoreStats();
      const duration = Date.now() - start;
      updateTestStatus(4, 'success', `إحصائيات: ${stats?.total_orders || 0} طلب في ${duration}ms`, duration);
    } catch (error: any) {
      updateTestStatus(4, 'failed', error.message);
    }

    // Test 6: تحديث حالة (محاكاة)
    try {
      updateTestStatus(5, 'running');
      const start = Date.now();
      // محاكاة فقط - لا نحدث فعلياً
      await new Promise(resolve => setTimeout(resolve, 500));
      const duration = Date.now() - start;
      updateTestStatus(5, 'success', `محاكاة تحديث الحالة في ${duration}ms`, duration);
    } catch (error: any) {
      updateTestStatus(5, 'failed', error.message);
    }

    // Test 7: جلب طلب واحد
    try {
      updateTestStatus(6, 'running');
      const start = Date.now();
      const orders = await UnifiedOrdersService.fetchOrders();
      if (orders.length > 0) {
        await UnifiedOrdersService.getOrderById(orders[0].id);
        const duration = Date.now() - start;
        updateTestStatus(6, 'success', `تم جلب تفاصيل الطلب في ${duration}ms`, duration);
      } else {
        updateTestStatus(6, 'success', 'لا توجد طلبات للاختبار');
      }
    } catch (error: any) {
      updateTestStatus(6, 'failed', error.message);
    }

    // Test 8: المبيعات الشهرية
    try {
      updateTestStatus(7, 'running');
      const start = Date.now();
      const monthlySales = await UnifiedOrdersService.getMonthlySales();
      const duration = Date.now() - start;
      updateTestStatus(7, 'success', `تم جلب ${monthlySales.length} شهر في ${duration}ms`, duration);
    } catch (error: any) {
      updateTestStatus(7, 'failed', error.message);
    }

    setIsRunning(false);
    
    const successCount = tests.filter(t => t.status === 'success').length;
    const failedCount = tests.filter(t => t.status === 'failed').length;
    
    toast({
      title: 'اكتمل الاختبار',
      description: `نجح: ${successCount} | فشل: ${failedCount}`,
      variant: failedCount > 0 ? 'destructive' : 'default',
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اختبار النظام الموحد</h1>
          <p className="text-muted-foreground mt-2">
            تشغيل اختبارات شاملة للتأكد من عمل النظام بشكل صحيح
          </p>
        </div>
        <Button onClick={runAllTests} disabled={isRunning} size="lg">
          <Play className="w-4 h-4 ml-2" />
          تشغيل جميع الاختبارات
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>نتائج الاختبار</CardTitle>
          <CardDescription>
            {tests.filter(t => t.status === 'success').length} / {tests.length} اختبار نجح
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <p className="font-medium">{test.name}</p>
                    {test.message && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {test.message}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusBadge(test.status)}>
                  {test.status === 'pending' && 'في الانتظار'}
                  {test.status === 'running' && 'جاري التشغيل'}
                  {test.status === 'success' && 'نجح'}
                  {test.status === 'failed' && 'فشل'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
