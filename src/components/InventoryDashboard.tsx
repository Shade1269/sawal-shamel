import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign,
  Warehouse,
  Clock,
  ShoppingCart,
  Activity
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const InventoryDashboard: React.FC = () => {
  const { loading, getInventoryAnalytics, warehouses, alerts, inventoryItems, movements } = useInventoryManagement();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات المخزون...</p>
        </div>
      </div>
    );
  }

  const analytics = getInventoryAnalytics();
  const recentMovements = movements.slice(0, 5);

  const alertsByPriority = {
    critical: alerts.filter(a => a.priority === 'CRITICAL').length,
    high: alerts.filter(a => a.priority === 'HIGH').length,
    medium: alerts.filter(a => a.priority === 'MEDIUM').length,
    low: alerts.filter(a => a.priority === 'LOW').length
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              في {warehouses.length} مخزن
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{analytics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              يحتاج إعادة طلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نفد من المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{analytics.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              غير متوفر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.totalValue.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              إجمالي القيمة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* التنبيهات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              التنبيهات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                لا توجد تنبيهات نشطة
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{alertsByPriority.critical}</div>
                    <div className="text-sm text-red-600">حرجة</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{alertsByPriority.high}</div>
                    <div className="text-sm text-orange-600">عالية</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {alert.inventory_item?.product?.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {alert.message}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          alert.priority === 'CRITICAL' ? 'destructive' :
                          alert.priority === 'HIGH' ? 'default' :
                          'secondary'
                        }
                      >
                        {alert.priority === 'CRITICAL' ? 'حرج' :
                         alert.priority === 'HIGH' ? 'عالي' :
                         alert.priority === 'MEDIUM' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* آخر الحركات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              آخر حركات المخزون
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMovements.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                لا توجد حركات حديثة
              </div>
            ) : (
              <div className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        movement.movement_type === 'IN' ? 'bg-green-100 text-green-600' :
                        movement.movement_type === 'OUT' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {movement.movement_type === 'IN' ? '+' :
                         movement.movement_type === 'OUT' ? '-' : '↔'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {movement.inventory_item?.product?.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {movement.inventory_item?.warehouse?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {movement.quantity} قطعة
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(movement.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* حالة المخازن */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            حالة المخازن
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => {
              const warehouseItems = inventoryItems.filter(item => item.warehouse_id === warehouse.id);
              const utilizationPercent = warehouse.capacity_limit ? 
                (warehouse.current_utilization / warehouse.capacity_limit) * 100 : 0;

              return (
                <div key={warehouse.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{warehouse.name}</h3>
                    <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                      {warehouse.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {warehouse.location || 'لا يوجد موقع محدد'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>عدد المنتجات:</span>
                      <span>{warehouseItems.length}</span>
                    </div>
                    {warehouse.capacity_limit && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>الاستخدام:</span>
                          <span>{utilizationPercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={utilizationPercent} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};