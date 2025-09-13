import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const InventoryReports: React.FC = () => {
  const { 
    inventoryItems, 
    movements, 
    alerts, 
    suppliers,
    warehouseProducts,
    productVariants,
    loading 
  } = useInventoryManagement();

  const [reportType, setReportType] = useState('stock_summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // حسابات التقارير
  const getStockSummaryReport = () => {
    const totalProducts = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => 
      sum + (item.quantity_available * (item.unit_cost || 0)), 0
    );
    const lowStockItems = inventoryItems.filter(item => 
      item.quantity_available <= item.reorder_level && item.reorder_level > 0
    );
    const outOfStockItems = inventoryItems.filter(item => 
      item.quantity_available === 0
    );

    return {
      totalProducts,
      totalValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems
    };
  };

  const getMovementReport = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const recentMovements = movements.filter(movement => 
      new Date(movement.created_at) >= lastMonth
    );

    const inboundMovements = recentMovements.filter(m => m.movement_type === 'IN');
    const outboundMovements = recentMovements.filter(m => m.movement_type === 'OUT');
    const adjustmentMovements = recentMovements.filter(m => m.movement_type === 'ADJUSTMENT');

    const totalInbound = inboundMovements.reduce((sum, m) => sum + m.quantity, 0);
    const totalOutbound = outboundMovements.reduce((sum, m) => sum + m.quantity, 0);
    const totalAdjustments = adjustmentMovements.reduce((sum, m) => sum + m.quantity, 0);

    return {
      totalMovements: recentMovements.length,
      inboundCount: inboundMovements.length,
      outboundCount: outboundMovements.length,
      adjustmentCount: adjustmentMovements.length,
      totalInbound,
      totalOutbound,
      totalAdjustments,
      recentMovements: recentMovements.slice(0, 10)
    };
  };

  const getAlertsReport = () => {
    const criticalAlerts = alerts.filter(a => a.priority === 'CRITICAL');
    const highAlerts = alerts.filter(a => a.priority === 'HIGH');
    const mediumAlerts = alerts.filter(a => a.priority === 'MEDIUM');
    const lowAlerts = alerts.filter(a => a.priority === 'LOW');

    return {
      totalAlerts: alerts.length,
      criticalCount: criticalAlerts.length,
      highCount: highAlerts.length,
      mediumCount: mediumAlerts.length,
      lowCount: lowAlerts.length,
      alertsByType: {
        'LOW_STOCK': alerts.filter(a => a.alert_type === 'LOW_STOCK').length,
        'OUT_OF_STOCK': alerts.filter(a => a.alert_type === 'OUT_OF_STOCK').length,
        'OVERSTOCK': alerts.filter(a => a.alert_type === 'OVERSTOCK').length,
        'EXPIRING_SOON': alerts.filter(a => a.alert_type === 'EXPIRING_SOON').length
      }
    };
  };

  const getSuppliersReport = () => {
    return suppliers.map(supplier => {
      const supplierProducts = warehouseProducts.filter(p => p.supplier_id === supplier.id);
      const supplierVariants = productVariants.filter(v => 
        supplierProducts.some(p => p.id === v.warehouse_product_id)
      );
      
      const totalValue = supplierVariants.reduce((sum, variant) => 
        sum + ((variant.available_stock || 0) * (variant.cost_price || 0)), 0
      );

      return {
        ...supplier,
        productCount: supplierProducts.length,
        variantCount: supplierVariants.length,
        totalValue
      };
    });
  };

  const handleExportReport = () => {
    // TODO: Implement actual export functionality
    alert('سيتم إضافة وظيفة التصدير قريباً');
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل التقارير...</p>
      </div>
    );
  }

  const stockReport = getStockSummaryReport();
  const movementReport = getMovementReport();
  const alertsReport = getAlertsReport();
  const suppliersReport = getSuppliersReport();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          تقارير المخزون
        </h1>
        
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* فلاتر التقارير */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التقرير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report_type">نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_summary">ملخص المخزون</SelectItem>
                  <SelectItem value="movements">تقرير الحركات</SelectItem>
                  <SelectItem value="alerts">تقرير التنبيهات</SelectItem>
                  <SelectItem value="suppliers">تقرير الموردين</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date_from">من تاريخ</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="date_to">إلى تاريخ</Label>
              <Input
                id="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تقرير ملخص المخزون */}
      {reportType === 'stock_summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stockReport.totalProducts}</div>
                    <div className="text-sm text-muted-foreground">إجمالي المنتجات</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stockReport.totalValue.toFixed(0)} ر.س</div>
                    <div className="text-sm text-muted-foreground">قيمة المخزون</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stockReport.lowStockCount}</div>
                    <div className="text-sm text-muted-foreground">مخزون منخفض</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stockReport.outOfStockCount}</div>
                    <div className="text-sm text-muted-foreground">نفد المخزون</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* المنتجات منخفضة المخزون */}
          {stockReport.lowStockItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>منتجات بحاجة لإعادة طلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stockReport.lowStockItems.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.product?.title || item.sku}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.sku} • المتاح: {item.quantity_available}
                        </div>
                      </div>
                      <Badge variant="destructive">
                        نقطة الطلب: {item.reorder_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* تقرير الحركات */}
      {reportType === 'movements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{movementReport.totalMovements}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الحركات</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{movementReport.totalInbound}</div>
                    <div className="text-sm text-muted-foreground">وارد</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{movementReport.totalOutbound}</div>
                    <div className="text-sm text-muted-foreground">صادر</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{movementReport.totalAdjustments}</div>
                    <div className="text-sm text-muted-foreground">تعديلات</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* تقرير التنبيهات */}
      {reportType === 'alerts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{alertsReport.criticalCount}</div>
                    <div className="text-sm text-muted-foreground">تنبيهات حرجة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{alertsReport.highCount}</div>
                    <div className="text-sm text-muted-foreground">تنبيهات عالية</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{alertsReport.mediumCount}</div>
                    <div className="text-sm text-muted-foreground">تنبيهات متوسطة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{alertsReport.lowCount}</div>
                    <div className="text-sm text-muted-foreground">تنبيهات منخفضة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* تقرير الموردين */}
      {reportType === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle>تقرير الموردين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suppliersReport.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{supplier.supplier_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {supplier.productCount} منتج • {supplier.variantCount} متغير
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{supplier.totalValue.toFixed(0)} ر.س</div>
                    <div className="text-sm text-muted-foreground">إجمالي القيمة</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};