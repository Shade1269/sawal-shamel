import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataQualityCheck {
  check_name: string;
  status: 'success' | 'warning' | 'info' | 'error';
  details: Record<string, number>;
}

export const DataQualityDashboard: React.FC = () => {
  const [checks, setChecks] = useState<DataQualityCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runQualityChecks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('check_data_quality');

      if (error) throw error;

      setChecks((data || []) as DataQualityCheck[]);
      
      toast({
        title: 'تم فحص جودة البيانات',
        description: `تم إجراء ${data?.length || 0} فحص بنجاح`,
      });
    } catch (error: any) {
      console.error('Error running quality checks:', error);
      toast({
        title: 'خطأ في الفحص',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runQualityChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCheckName = (name: string) => {
    const names: Record<string, string> = {
      order_hub_count: 'عدد الطلبات في Order Hub',
      returns_status: 'حالة المرتجعات',
      refunds_status: 'حالة الاستردادات',
      shipments_status: 'حالة الشحنات',
    };
    return names[name] || name;
  };

  const formatDetailKey = (key: string) => {
    const keys: Record<string, string> = {
      total_orders: 'إجمالي الطلبات',
      ecommerce: 'طلبات التجارة الإلكترونية',
      simple: 'الطلبات البسيطة',
      manual: 'الطلبات اليدوية',
      total_returns: 'إجمالي المرتجعات',
      with_ecommerce_order: 'مرتبطة بطلبات إلكترونية',
      with_simple_order: 'مرتبطة بطلبات بسيطة',
      total_refunds: 'إجمالي الاستردادات',
      total_shipments: 'إجمالي الشحنات',
    };
    return keys[key] || key;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة فحص جودة البيانات</h1>
          <p className="text-muted-foreground mt-2">
            فحص شامل لجودة البيانات والعلاقات في النظام الموحد
          </p>
        </div>
        <Button onClick={runQualityChecks} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث الفحص
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {checks.map((check, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  {formatCheckName(check.check_name)}
                </CardTitle>
                <Badge variant={getStatusColor(check.status)}>
                  {check.status}
                </Badge>
              </div>
              <CardDescription>
                نتائج فحص {formatCheckName(check.check_name)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(check.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <span className="text-sm font-medium">
                      {formatDetailKey(key)}
                    </span>
                    <span className="text-sm font-bold">
                      {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {checks.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Info className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              لا توجد نتائج فحص. اضغط على "تحديث الفحص" لبدء الفحص.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
