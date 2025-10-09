import React from 'react';
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';
import { ABTestProvider, DefaultABTests } from '@/components/testing/ABTestProvider';
import { GMVChart, OrdersDashboard, PerformanceOverview } from '@/components/analytics';
import { useSEO } from '@/hooks/useSEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MonitoringPage: React.FC = () => {
  // SEO optimization for monitoring page
  useSEO({
    title: 'مراقبة النظام | منصة التسويق الذكية',
    description: 'لوحة تحكم شاملة لمراقبة الأداء والأخطاء وتحليل البيانات واختبارات A/B',
    keywords: 'مراقبة النظام, تتبع الأخطاء, تحليل الأداء, اختبارات A/B'
  });

  return (
    <div className="min-h-screen bg-background">
      <ABTestProvider tests={DefaultABTests}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">مراقبة النظام</h1>
              <p className="text-muted-foreground mt-1">
                لوحة تحكم شاملة لمراقبة الأداء والتحليلات
              </p>
            </div>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="analytics">التحليلات والأداء</TabsTrigger>
              <TabsTrigger value="monitoring">المراقبة والأخطاء</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <PerformanceOverview />
              <GMVChart />
              <OrdersDashboard />
            </TabsContent>

            <TabsContent value="monitoring">
              <MonitoringDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </ABTestProvider>
    </div>
  );
};

export default MonitoringPage;