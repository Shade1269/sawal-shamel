import React, { useState, useEffect } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  MessageSquare,
  Wifi,
  Shield,
  CreditCard,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IntegrationStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  lastChecked: Date;
  icon: React.ReactNode;
  details?: string;
}

export const IntegrationHealthChecker: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkSupabaseConnection = async (): Promise<IntegrationStatus> => {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1).maybeSingle();
      
      if (error) {
        return {
          name: 'Supabase Database',
          status: 'error',
          message: 'فشل في الاتصال بقاعدة البيانات',
          lastChecked: new Date(),
          icon: <Database className="h-4 w-4" />,
          details: error.message
        };
      }

      return {
        name: 'Supabase Database', 
        status: 'healthy',
        message: 'متصل بنجاح',
        lastChecked: new Date(),
        icon: <Database className="h-4 w-4" />
      };
    } catch (error: any) {
      return {
        name: 'Supabase Database',
        status: 'error', 
        message: 'خطأ في الاتصال',
        lastChecked: new Date(),
        icon: <Database className="h-4 w-4" />,
        details: error.message
      };
    }
  };

  const checkAuthSystem = async (): Promise<IntegrationStatus> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      return {
        name: 'Authentication System',
        status: 'healthy',
        message: session.session ? 'مسجل دخول' : 'النظام يعمل بشكل طبيعي',
        lastChecked: new Date(),
        icon: <Shield className="h-4 w-4" />
      };
    } catch (error: any) {
      return {
        name: 'Authentication System',
        status: 'error',
        message: 'خطأ في نظام المصادقة', 
        lastChecked: new Date(),
        icon: <Shield className="h-4 w-4" />,
        details: error.message
      };
    }
  };

  const checkInternalInventory = async (): Promise<IntegrationStatus> => {
    try {
      const { data: warehouse, error } = await supabase
        .from('warehouses')
        .select('id, code')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return {
          name: 'Internal Inventory',
          status: 'error',
          message: 'خطأ في الاتصال بجداول المستودعات',
          lastChecked: new Date(),
          icon: <Package className="h-4 w-4" />,
          details: error.message
        };
      }

      if (!warehouse) {
        return {
          name: 'Internal Inventory',
          status: 'warning',
          message: 'لم يتم إنشاء أي مستودع بعد. استخدم DEFAULT_WAREHOUSE_CODE لإنشاء مستودع افتراضي.',
          lastChecked: new Date(),
          icon: <Package className="h-4 w-4" />
        };
      }

      return {
        name: 'Internal Inventory',
        status: 'healthy',
        message: `المستودع الافتراضي (${warehouse.code}) جاهز`,
        lastChecked: new Date(),
        icon: <Package className="h-4 w-4" />
      };
    } catch (error: any) {
      return {
        name: 'Internal Inventory',
        status: 'error',
        message: 'خطأ أثناء فحص نظام المخزون الداخلي',
        lastChecked: new Date(),
        icon: <Package className="h-4 w-4" />,
        details: error.message
      };
    }
  };

  const checkSMSService = async (): Promise<IntegrationStatus> => {
    try {
      // فحص وجود جدول customer_otp_sessions
      const { error } = await supabase
        .from('customer_otp_sessions')
        .select('count')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return {
          name: 'SMS Service',
          status: 'error',
          message: 'خطأ في نظام SMS',
          lastChecked: new Date(),
          icon: <MessageSquare className="h-4 w-4" />,
          details: error.message
        };
      }

      return {
        name: 'SMS Service',
        status: 'warning',
        message: 'جاهز (وضع التطوير)',
        lastChecked: new Date(),
        icon: <MessageSquare className="h-4 w-4" />
      };
    } catch (error: any) {
      return {
        name: 'SMS Service',
        status: 'error',
        message: 'خطأ في فحص SMS',
        lastChecked: new Date(),
        icon: <MessageSquare className="h-4 w-4" />,
        details: error.message
      };
    }
  };

  const checkPaymentSystems = async (): Promise<IntegrationStatus> => {
    try {
      // فحص وجود جداول الدفع
      const { error } = await supabase
        .from('ecommerce_payment_transactions')
        .select('count')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return {
          name: 'Payment Systems',
          status: 'error',
          message: 'خطأ في أنظمة الدفع',
          lastChecked: new Date(),
          icon: <CreditCard className="h-4 w-4" />,
          details: error.message
        };
      }

      return {
        name: 'Payment Systems',
        status: 'healthy',
        message: 'الأنظمة جاهزة',
        lastChecked: new Date(),
        icon: <CreditCard className="h-4 w-4" />
      };
    } catch (error: any) {
      return {
        name: 'Payment Systems',
        status: 'error',
        message: 'خطأ في فحص أنظمة الدفع',
        lastChecked: new Date(),
        icon: <CreditCard className="h-4 w-4" />,
        details: error.message
      };
    }
  };

  const runHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      const checks = await Promise.all([
        checkSupabaseConnection(),
        checkAuthSystem(),
        checkInternalInventory(),
        checkSMSService(),
        checkPaymentSystems()
      ]);

      setIntegrations(checks);

      const errorCount = checks.filter(c => c.status === 'error').length;
      const warningCount = checks.filter(c => c.status === 'warning').length;

      if (errorCount > 0) {
        toast({
          title: "مشاكل مكتشفة",
          description: `${errorCount} خطأ و ${warningCount} تحذير تم اكتشافهم`,
          variant: "destructive"
        });
      } else if (warningCount > 0) {
        toast({
          title: "تحذيرات مكتشفة",
          description: `${warningCount} تحذير تم اكتشافه`,
          variant: "default"
        });
      } else {
        toast({
          title: "جميع الأنظمة تعمل بشكل طبيعي",
          description: "لا توجد مشاكل مكتشفة"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في فحص الأنظمة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-info animate-spin" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <UnifiedBadge variant="success" className="bg-success/10 text-success hover:bg-success/10">سليم</UnifiedBadge>;
      case 'warning':
        return <UnifiedBadge variant="warning" className="border-warning text-warning">تحذير</UnifiedBadge>;
      case 'error':
        return <UnifiedBadge variant="error">خطأ</UnifiedBadge>;
      case 'checking':
        return <UnifiedBadge variant="secondary">جاري الفحص...</UnifiedBadge>;
    }
  };

  return (
    <UnifiedCard className="w-full max-w-4xl mx-auto" variant="premium">
      <UnifiedCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <UnifiedCardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              فحص صحة التكاملات
            </UnifiedCardTitle>
            <UnifiedCardDescription>
              فحص شامل لحالة جميع الأنظمة والتكاملات الخارجية
            </UnifiedCardDescription>
          </div>
          <UnifiedButton
            onClick={runHealthCheck}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="gap-2"
            leftIcon={<RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />}
          >
            إعادة فحص
          </UnifiedButton>
        </div>
      </UnifiedCardHeader>
      
      <UnifiedCardContent className="space-y-4">
        {integrations.map((integration, index) => (
          <div key={integration.name}>
            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {integration.icon}
                  {getStatusIcon(integration.status)}
                </div>
                <div>
                  <h4 className="font-semibold">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground">{integration.message}</p>
                  {integration.details && (
                    <p className="text-xs text-destructive mt-1">{integration.details}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">
                  آخر فحص: {integration.lastChecked.toLocaleTimeString('ar')}
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </div>
            
            {index < integrations.length - 1 && <Separator className="my-2" />}
          </div>
        ))}

        {integrations.length === 0 && !isChecking && (
          <div className="text-center py-8 text-muted-foreground">
            <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لم يتم فحص أي تكاملات بعد</p>
            <UnifiedButton onClick={runHealthCheck} className="mt-4">
              بدء الفحص
            </UnifiedButton>
          </div>
        )}

        {isChecking && integrations.length === 0 && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري فحص التكاملات...</p>
          </div>
        )}
      </UnifiedCardContent>
    </UnifiedCard>
  );
};

export default IntegrationHealthChecker;