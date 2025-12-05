import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package2, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  quantity_available: number | null;
  quantity_reserved: number | null;
  quantity_on_order: number | null;
  reorder_level: number | null;
  unit_cost: number | null;
  expiry_date: string | null;
  warehouse_id: string | null;
}

interface InventoryStatsProps {
  items: InventoryItem[];
  warehouses: Array<{ id: string; name: string; code: string }>;
}

export function InventoryStats({ items, warehouses }: InventoryStatsProps) {
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalAvailable = items.reduce((sum, item) => sum + (item.quantity_available ?? 0), 0);
    const totalReserved = items.reduce((sum, item) => sum + (item.quantity_reserved ?? 0), 0);
    const totalOnOrder = items.reduce((sum, item) => sum + (item.quantity_on_order ?? 0), 0);
    const totalValue = items.reduce((sum, item) => {
      const quantity = item.quantity_available ?? 0;
      const cost = item.unit_cost ?? 0;
      return sum + (quantity * cost);
    }, 0);

    // حساب العناصر المنخفضة المخزون
    const lowStockItems = items.filter(item => {
      const available = item.quantity_available ?? 0;
      const reorderLevel = item.reorder_level ?? 5;
      return available <= reorderLevel && available > 0;
    }).length;

    // حساب العناصر نافدة المخزون
    const outOfStockItems = items.filter(item => (item.quantity_available ?? 0) === 0).length;

    // حساب العناصر منتهية الصلاحية
    const now = new Date();
    const expiredItems = items.filter(item => {
      if (!item.expiry_date) return false;
      return new Date(item.expiry_date) < now;
    }).length;

    // حساب العناصر التي تنتهي صلاحيتها خلال أسبوعين
    const twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
    const expiringSoonItems = items.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate >= now && expiryDate <= twoWeeksFromNow;
    }).length;

    // إحصائيات المخازن
    const warehouseStats = warehouses.map(warehouse => {
      const warehouseItems = items.filter(item => item.warehouse_id === warehouse.id);
      return {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        itemCount: warehouseItems.length,
        totalQuantity: warehouseItems.reduce((sum, item) => sum + (item.quantity_available ?? 0), 0),
        lowStockCount: warehouseItems.filter(item => {
          const available = item.quantity_available ?? 0;
          const reorderLevel = item.reorder_level ?? 5;
          return available <= reorderLevel && available > 0;
        }).length,
        outOfStockCount: warehouseItems.filter(item => (item.quantity_available ?? 0) === 0).length
      };
    });

    return {
      totalItems,
      totalAvailable,
      totalReserved,
      totalOnOrder,
      totalValue,
      lowStockItems,
      outOfStockItems,
      expiredItems,
      expiringSoonItems,
      warehouseStats,
    };
  }, [items, warehouses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', { 
      style: 'currency', 
      currency: 'SAR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* الإحصائيات العامة */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalItems)}</div>
            <p className="text-xs text-muted-foreground">
              صنف في النظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الكمية المتاحة</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatNumber(stats.totalAvailable)}</div>
            <p className="text-xs text-muted-foreground">
              وحدة متاحة للبيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الكمية المحجوزة</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatNumber(stats.totalReserved)}</div>
            <p className="text-xs text-muted-foreground">
              وحدة محجوزة للطلبات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <Package2 className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة المخزون
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات سريعة */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={stats.outOfStockItems > 0 ? "border-destructive/30 bg-destructive/10" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نفد المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              صنف نفد من المخزون
            </p>
          </CardContent>
        </Card>

        <Card className={stats.lowStockItems > 0 ? "border-warning/30 bg-warning/10" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              صنف بحاجة لإعادة طلب
            </p>
          </CardContent>
        </Card>

        <Card className={stats.expiredItems > 0 ? "border-destructive/30 bg-destructive/10" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">منتهي الصلاحية</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.expiredItems}</div>
            <p className="text-xs text-muted-foreground">
              صنف منتهي الصلاحية
            </p>
          </CardContent>
        </Card>

        <Card className={stats.expiringSoonItems > 0 ? "border-warning/30 bg-warning/10" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ينتهي قريباً</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.expiringSoonItems}</div>
            <p className="text-xs text-muted-foreground">
              صنف ينتهي خلال أسبوعين
            </p>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات المخازن */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات المخازن</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.warehouseStats.map((warehouse) => (
              <div key={warehouse.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">{warehouse.name} ({warehouse.code})</h4>
                  <p className="text-sm text-muted-foreground">
                    {warehouse.itemCount} صنف - {formatNumber(warehouse.totalQuantity)} وحدة
                  </p>
                </div>
                <div className="flex gap-2">
                  {warehouse.outOfStockCount > 0 && (
                    <Badge variant="destructive">
                      نفد: {warehouse.outOfStockCount}
                    </Badge>
                  )}
                  {warehouse.lowStockCount > 0 && (
                    <Badge variant="secondary">
                      منخفض: {warehouse.lowStockCount}
                    </Badge>
                  )}
                  {warehouse.outOfStockCount === 0 && warehouse.lowStockCount === 0 && (
                    <Badge variant="outline" className="text-success border-success">
                      جيد
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}