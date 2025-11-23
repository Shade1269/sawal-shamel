import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { AlertTriangle, Clock, TrendingDown, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'expired' | 'expiring_soon' | 'out_of_stock';
  sku: string;
  warehouse_name: string;
  current_quantity: number;
  reorder_level?: number;
  expiry_date?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface InventoryAlertsProps {
  refreshTrigger?: number;
}

export function InventoryAlerts({ refreshTrigger }: InventoryAlertsProps) {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          sku,
          quantity_available,
          quantity_reserved,
          reorder_level,
          expiry_date,
          warehouses (
            name
          )
        `)
        .not('quantity_available', 'is', null);

      if (error) throw error;

      const generatedAlerts: InventoryAlert[] = [];
      const now = new Date();
      const twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));

      items?.forEach((item: any) => {
        const available = item.quantity_available || 0;
        const reorderLevel = item.reorder_level || 5;
        const warehouseName = item.warehouses?.name || 'مخزن غير محدد';

        // تنبيه نفاد المخزون
        if (available === 0) {
          generatedAlerts.push({
            id: `out_of_stock_${item.id}`,
            type: 'out_of_stock',
            sku: item.sku,
            warehouse_name: warehouseName,
            current_quantity: available,
            message: `نفد المخزون من ${item.sku}`,
            severity: 'critical',
          });
        }
        // تنبيه انخفاض المخزون
        else if (available <= reorderLevel) {
          generatedAlerts.push({
            id: `low_stock_${item.id}`,
            type: 'low_stock',
            sku: item.sku,
            warehouse_name: warehouseName,
            current_quantity: available,
            reorder_level: reorderLevel,
            message: `مخزون منخفض: ${item.sku} (${available} متبقي)`,
            severity: available <= reorderLevel / 2 ? 'high' : 'medium',
          });
        }

        // تنبيه انتهاء الصلاحية
        if (item.expiry_date) {
          const expiryDate = new Date(item.expiry_date);
          
          if (expiryDate < now) {
            generatedAlerts.push({
              id: `expired_${item.id}`,
              type: 'expired',
              sku: item.sku,
              warehouse_name: warehouseName,
              current_quantity: available,
              expiry_date: item.expiry_date,
              message: `منتهي الصلاحية: ${item.sku}`,
              severity: 'critical',
            });
          } else if (expiryDate < twoWeeksFromNow) {
            generatedAlerts.push({
              id: `expiring_soon_${item.id}`,
              type: 'expiring_soon',
              sku: item.sku,
              warehouse_name: warehouseName,
              current_quantity: available,
              expiry_date: item.expiry_date,
              message: `ينتهي قريباً: ${item.sku} (${Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} يوم)`,
              severity: 'medium',
            });
          }
        }
      });

      // ترتيب التنبيهات حسب الأولوية
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      generatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error loading inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [refreshTrigger]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expiring_soon':
        return <Clock className="h-4 w-4" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    
    const labels = {
      critical: 'حرج',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض'
    };

    return (
      <Badge variant={variants[severity as keyof typeof variants] as any}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            تنبيهات المخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">جاري تحميل التنبيهات...</p>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Bell className="h-5 w-5" />
            تنبيهات المخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">لا توجد تنبيهات حالياً. جميع المنتجات في حالة جيدة! ✅</p>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const otherAlerts = alerts.filter(a => a.severity !== 'critical');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          تنبيهات المخزون ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* التنبيهات الحرجة */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-600">تنبيهات حرجة ({criticalAlerts.length})</h4>
            {criticalAlerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.severity) as any}>
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <AlertTitle className="flex items-center gap-2">
                    {alert.message}
                    {getSeverityBadge(alert.severity)}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  <div className="flex justify-between items-center">
                    <span>المخزن: {alert.warehouse_name}</span>
                    <span>الكمية: {alert.current_quantity}</span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* التنبيهات الأخرى */}
        {otherAlerts.length > 0 && (
          <div className="space-y-2">
            {criticalAlerts.length > 0 && <h4 className="font-semibold">تنبيهات أخرى ({otherAlerts.length})</h4>}
            {otherAlerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.severity) as any}>
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <AlertTitle className="flex items-center gap-2">
                    {alert.message}
                    {getSeverityBadge(alert.severity)}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  <div className="flex justify-between items-center">
                    <span>المخزن: {alert.warehouse_name}</span>
                    <span>الكمية: {alert.current_quantity}</span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            {otherAlerts.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                ... و {otherAlerts.length - 5} تنبيهات أخرى
              </p>
            )}
          </div>
        )}

        <Button variant="outline" size="sm" onClick={loadAlerts} className="w-full">
          تحديث التنبيهات
        </Button>
      </CardContent>
    </Card>
  );
}