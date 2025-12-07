import { useState, useEffect } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, BarChart3 } from 'lucide-react';

interface InventoryItem {
  id: string;
  product_id: string;
  variant_name: string;
  quantity_available: number;
  reserved_quantity: number;
  reorder_level: number;
  max_stock_level: number;
  location: string;
  warehouse_id: string;
  last_counted_at: string;
  cost_per_unit: number;
}

interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference_id: string;
  created_at: string;
  created_by: string;
}

interface AdvancedInventoryManagerProps {
  storeId: string;
}

export const AdvancedInventoryManager = ({ storeId }: AdvancedInventoryManagerProps) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState({
    quantity: 0,
    reason: ''
  });
  const { toast } = useToast();

  const fetchInventoryItems = async () => {
    try {
      // Mock data since inventory management is not fully implemented
      const mockInventory: InventoryItem[] = [];
      setInventoryItems(mockInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "خطأ في تحميل المخزون",
        description: "حدث خطأ أثناء تحميل بيانات المخزون",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    try {
      // Mock data since stock movements are not implemented
      const mockMovements: StockMovement[] = [];
      setStockMovements(mockMovements);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchInventoryItems();
      fetchStockMovements();
    }
  }, [storeId]);

  const handleStockAdjustment = async () => {
    if (!selectedItem || adjustment.quantity === 0) return;

    try {
      toast({
        title: "قريباً",
        description: "ميزة تعديل المخزون ستكون متاحة قريباً",
      });

      setAdjustmentDialogOpen(false);
      setSelectedItem(null);
      setAdjustment({ quantity: 0, reason: '' });
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "خطأ في التعديل",
        description: "حدث خطأ أثناء تعديل المخزون",
        variant: "destructive",
      });
    }
  };

  const _openAdjustmentDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustment({ quantity: 0, reason: '' });
    setAdjustmentDialogOpen(true);
  };
  void _openAdjustmentDialog; // Reserved for future use

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة المخزون المتقدمة</h2>
          <p className="text-muted-foreground">تتبع وإدارة مخزون المنتجات بدقة</p>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">المخزون الحالي</TabsTrigger>
          <TabsTrigger value="movements">حركات المخزون</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {inventoryItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد عناصر في المخزون</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإضافة منتجات لتتبع مخزونها
                </p>
                <Button>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة منتج للمخزون
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Inventory items would be displayed here */}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل حركات المخزون</CardTitle>
              <CardDescription>تتبع جميع عمليات الدخول والخروج والتعديلات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد حركات مخزون</h3>
                <p className="text-muted-foreground">
                  ستبدأ حركات المخزون بالظهور عند إضافة أو تعديل المنتجات
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي العناصر</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">عنصر في المخزون</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">منتجات قاربت النفاد</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">تحتاج إعادة تزويد</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 ريال</div>
                <p className="text-xs text-muted-foreground">قيمة المخزون</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحركات الشهرية</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">حركة هذا الشهر</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تحليلات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">التحليلات ستكون متاحة قريباً</h3>
                <p className="text-muted-foreground">
                  رؤى مفصلة حول أداء المخزون والتوقعات
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل كمية المخزون</DialogTitle>
            <DialogDescription>
              قم بتعديل كمية المنتج في المخزون
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">التغيير في الكمية</Label>
              <Input
                id="quantity"
                type="number"
                value={adjustment.quantity}
                onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                placeholder="أدخل الكمية (+ للزيادة، - للنقصان)"
              />
            </div>
            <div>
              <Label htmlFor="reason">سبب التعديل</Label>
              <Select value={adjustment.reason} onValueChange={(value) => setAdjustment(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر سبب التعديل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restock">إعادة تزويد</SelectItem>
                  <SelectItem value="sold">مباع</SelectItem>
                  <SelectItem value="damaged">تالف</SelectItem>
                  <SelectItem value="lost">مفقود</SelectItem>
                  <SelectItem value="returned">مرتجع</SelectItem>
                  <SelectItem value="inventory_count">جرد مخزون</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleStockAdjustment} className="flex-1">
                تطبيق التعديل
              </Button>
              <Button variant="outline" onClick={() => setAdjustmentDialogOpen(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};