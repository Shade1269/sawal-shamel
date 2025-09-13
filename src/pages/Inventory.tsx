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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                نظام إدارة المخازن والمخزون
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                إدارة شاملة للمخازن مع تنبيهات نفاد المخزون والحجوزات التلقائية
              </p>
            </div>
          </div>
        </div>

        {/* تنبيه للتوضيح */}
        <Card className="mb-6 border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent/20">
                  <Store className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">هل تريد إضافة منتجات لمتجرك؟</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    هذه الصفحة لإدارة المخازن الفيزيائية. لإضافة منتجات لمتجرك اذهب إلى إدارة المتجر
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/store-management-firestore')}
                className="flex items-center gap-2 border-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                إدارة المتجر
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-soft">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">لوحة التحكم</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">الموردين</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <Boxes className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">الحركات</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">التنبيهات</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">المرتجعات</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">الحجوزات</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">التقارير</span>
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