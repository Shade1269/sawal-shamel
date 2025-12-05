import React from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Progress } from '@/components/ui/progress';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { InventorySetupCard } from './InventorySetupCard';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Warehouse, 
  Activity 
} from 'lucide-react';

export function InventoryDashboard() {
  const { 
    warehouses, 
    inventoryItems, 
    alerts, 
    movements, 
    loading, 
    getInventoryAnalytics 
  } = useInventoryManagement();

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  // إذا لم توجد بيانات، اعرض كارت الإعداد
  if (warehouses.length === 0 && inventoryItems.length === 0) {
    return <InventorySetupCard />;
  }

  const analytics = getInventoryAnalytics();

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">لوحة المخزون</h1>
          <p className="text-muted-foreground text-sm sm:text-base">إدارة وتتبع المخزون</p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <UnifiedCard variant="default" padding="none">
          <UnifiedCardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">إجمالي المنتجات</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{analytics.totalItems}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="default" padding="none">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                <p className="text-2xl font-bold text-warning">{analytics.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="default" padding="none">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نفد المخزون</p>
                <p className="text-2xl font-bold text-destructive">{analytics.outOfStockItems}</p>
              </div>
              <Package className="h-8 w-8 text-destructive" />
            </div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="default" padding="none">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                <p className="text-2xl font-bold text-success">{analytics.totalValue.toFixed(0)} ريال</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="default" padding="none">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المخازن النشطة</p>
                <p className="text-2xl font-bold text-info">{warehouses.filter(w => w.is_active).length}</p>
              </div>
              <Warehouse className="h-8 w-8 text-info" />
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* التنبيهات */}
        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader>
            <UnifiedCardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              التنبيهات الحديثة
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="space-y-2">
              {alerts.length > 0 ? alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.title || alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.alert_type}</p>
                  </div>
                  <UnifiedBadge variant={alert.priority === 'high' ? 'error' : 'default'}>
                    {alert.priority}
                  </UnifiedBadge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد تنبيهات</p>
              )}
            </div>
          </UnifiedCardContent>
        </UnifiedCard>

        {/* آخر الحركات */}
        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader>
            <UnifiedCardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              آخر الحركات
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="space-y-2">
              {movements.length > 0 ? movements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      movement.movement_type === 'IN' ? 'bg-success/10 text-success' :
                      movement.movement_type === 'OUT' ? 'bg-destructive/10 text-destructive' :
                      'bg-info/10 text-info'
                    }`}>
                      {movement.movement_type === 'IN' ? '+' :
                       movement.movement_type === 'OUT' ? '-' : '↔'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{movement.movement_type}</p>
                      <p className="text-xs text-muted-foreground">
                        الكمية: {movement.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{movement.quantity}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد حركات</p>
              )}
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      {/* حالة المخازن */}
      <UnifiedCard variant="default" padding="md">
        <UnifiedCardHeader>
          <UnifiedCardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            حالة المخازن
          </UnifiedCardTitle>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((warehouse) => {
              const warehouseItems = inventoryItems.filter(item => item.warehouse_id === warehouse.id);

              return (
                <div key={warehouse.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{warehouse.name}</h3>
                    <UnifiedBadge variant={warehouse.is_active ? 'default' : 'secondary'}>
                      {warehouse.is_active ? 'نشط' : 'غير نشط'}
                    </UnifiedBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{warehouse.address || warehouse.city}</p>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span>عدد المنتجات:</span>
                      <span>{warehouseItems.length}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">السعة:</span>
                      <p className="text-lg font-bold">{warehouse.storage_capacity || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
}