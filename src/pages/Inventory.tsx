import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryDashboard } from '@/components/InventoryDashboard';
import { WarehouseManagement } from '@/components/WarehouseManagement';
import { StockAlertsPanel } from '@/components/StockAlertsPanel';
import { InventoryReservations } from '@/components/InventoryReservations';
import { 
  Package, 
  Warehouse, 
  AlertTriangle, 
  Lock,
  BarChart3,
  Activity
} from 'lucide-react';

const Inventory: React.FC = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8" />
            نظام إدارة المخازن والمخزون
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة شاملة للمخازن مع تنبيهات نفاد المخزون والحجوزات التلقائية
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              المخازن
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              التنبيهات
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              الحجوزات
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <InventoryDashboard />
          </TabsContent>

          <TabsContent value="warehouses" className="mt-6">
            <WarehouseManagement />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <StockAlertsPanel />
          </TabsContent>

          <TabsContent value="reservations" className="mt-6">
            <InventoryReservations />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">تقارير المخزون</h3>
              <p className="text-muted-foreground">
                ستكون متاحة قريباً - تقارير تفصيلية عن حركة المخزون والأداء
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;