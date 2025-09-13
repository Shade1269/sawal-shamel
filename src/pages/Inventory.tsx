import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryDashboard } from '@/components/InventoryDashboard';
import { WarehouseManagement } from '@/components/WarehouseManagement';
import { StockAlertsPanel } from '@/components/StockAlertsPanel';
import { InventoryReservations } from '@/components/InventoryReservations';
import { SuppliersManagement } from '@/components/SuppliersManagement';
import { ProductsManagement } from '@/components/ProductsManagement';
import { InventoryMovements } from '@/components/InventoryMovements';
import { ReturnsManagement } from '@/components/ReturnsManagement';
import { InventoryReports } from '@/components/InventoryReports';
import { 
  Package, 
  Warehouse, 
  AlertTriangle, 
  Lock,
  BarChart3,
  Activity,
  Store,
  ArrowLeft,
  Users,
  Boxes,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Inventory: React.FC = () => {
  const navigate = useNavigate();

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

        {/* تنبيه للتوضيح */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">هل تريد إضافة منتجات لمتجرك؟</h3>
                  <p className="text-sm text-blue-700">
                    هذه الصفحة لإدارة المخازن الفيزيائية. لإضافة منتجات لمتجرك اذهب إلى إدارة المتجر
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/store-management-firestore')}
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <ArrowLeft className="h-4 w-4" />
                إدارة المتجر
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">لوحة التحكم</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">الموردين</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1">
              <Boxes className="h-4 w-4" />
              <span className="hidden sm:inline">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">الحركات</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">التنبيهات</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">المرتجعات</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">الحجوزات</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">التقارير</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <InventoryDashboard />
          </TabsContent>

          <TabsContent value="suppliers" className="mt-6">
            <SuppliersManagement />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="movements" className="mt-6">
            <InventoryMovements />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <StockAlertsPanel />
          </TabsContent>

          <TabsContent value="returns" className="mt-6">
            <ReturnsManagement />
          </TabsContent>

          <TabsContent value="reservations" className="mt-6">
            <InventoryReservations />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <InventoryReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;