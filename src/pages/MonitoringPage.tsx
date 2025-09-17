import React from 'react';
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';
import { ABTestProvider, DefaultABTests } from '@/components/testing/ABTestProvider';
import { useSEO } from '@/hooks/useSEO';

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
        <div className="container mx-auto p-6">
          <MonitoringDashboard />
        </div>
      </ABTestProvider>
    </div>
  );
};

export default MonitoringPage;