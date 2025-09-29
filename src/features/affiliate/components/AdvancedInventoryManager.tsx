import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus, BarChart3 } from 'lucide-react';

interface InventoryItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  cost_price: number;
  last_updated: string;
  product: {
    title: string;
    image_urls: string[];
  };
  variant: {
    variant_name: string;
    variant_value: string;
  } | null;
}

interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  created_at: string;
  created_by: string;
}

interface AdvancedInventoryManagerProps {
  storeId: string;
}

export const AdvancedInventoryManager = ({ storeId }: AdvancedInventoryManagerProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [movementQuantity, setMovementQuantity] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      const { data: storeProducts } = await supabase
        .from('affiliate_products')
        .select('product_id')
        .eq('affiliate_store_id', storeId);

      if (!storeProducts?.length) {
        setInventory([]);
        setLoading(false);
        return;
      }

      const productIds = storeProducts.map(sp => sp.product_id);

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          product:products(title, image_urls),
          variant:product_variants(variant_name, variant_value)
        `)
        .in('product_id', productIds);

      if (error) throw error;

      setInventory(data || []);
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

  const fetchStockMovements = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setStockMovements(data || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchInventory();
    }
  }, [storeId]);

  const handleStockMovement = async () => {
    if (!selectedItem || !movementQuantity || !movementReason) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const quantity = parseInt(movementQuantity);
      let newStock = selectedItem.current_stock;

      if (movementType === 'in') {
        newStock += quantity;
      } else if (movementType === 'out') {
        newStock -= quantity;
      } else {
        newStock = quantity;
      }

      if (newStock < 0) {
        toast({
          title: "مخزون غير كافي",
          description: "لا يمكن أن يكون المخزون أقل من صفر",
          variant: "destructive",
        });
        return;
      }

      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          current_stock: newStock,
          available_stock: newStock - selectedItem.reserved_stock,
          last_updated: new Date().toISOString()
        })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      // Record movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          inventory_item_id: selectedItem.id,
          type: movementType,
          quantity: movementType === 'adjustment' ? newStock : quantity,
          reason: movementReason,
          previous_stock: selectedItem.current_stock,
          new_stock: newStock
        }]);

      if (movementError) throw movementError;

      toast({
        title: "تم التحديث",
        description: "تم تحديث المخزون بنجاح",
      });

      setDialogOpen(false);
      setMovementQuantity('');
      setMovementReason('');
      fetchInventory();
      if (selectedItem) {
        fetchStockMovements(selectedItem.id);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث المخزون",
        variant: "destructive",
      });
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => 
      item.available_stock <= item.min_stock_level && item.min_stock_level > 0
    );
  };

  const getOutOfStockItems = () => {
    return inventory.filter(item => item.available_stock <= 0);
  };

  const getOverstockItems = () => {
    return inventory.filter(item => 
      item.current_stock > item.max_stock_level && item.max_stock_level > 0
    );
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => 
      total + (item.current_stock * item.cost_price), 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();
  const overstockItems = getOverstockItems();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة المخزون المتقدمة</h2>
          <p className="text-muted-foreground">متابعة وإدارة مخزون منتجاتك بدقة</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              قيمة المخزون: {getTotalInventoryValue().toFixed(2)} ر.س
            </p>
          </CardContent>        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              يحتاج إعادة تخزين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نفذ المخزون</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              غير متوفر حالياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون زائد</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overstockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              فوق الحد الأقصى
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">جميع المنتجات</TabsTrigger>
          <TabsTrigger value="low">مخزون منخفض</TabsTrigger>
          <TabsTrigger value="out">نفذ المخزون</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {inventory.map((item) => (
              <Card key={item.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      {item.product.image_urls?.[0] && (
                        <img
                          src={item.product.image_urls[0]}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.title}</h3>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            {item.variant.variant_name}: {item.variant.variant_value}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm">
                          <div>
                            <span className="font-medium">المتوفر: </span>
                            <Badge variant={item.available_stock > item.min_stock_level ? "default" : "destructive"}>
                              {item.available_stock}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">المحجوز: </span>
                            <Badge variant="secondary">{item.reserved_stock}</Badge>
                          </div>
                          <div>
                            <span className="font-medium">الإجمالي: </span>
                            <Badge variant="outline">{item.current_stock}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              fetchStockMovements(item.id);
                            }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>تفاصيل المخزون - {item.product.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>المخزون الحالي</Label>
                                <p className="text-2xl font-bold">{item.current_stock}</p>
                              </div>
                              <div>
                                <Label>المتوفر للبيع</Label>
                                <p className="text-2xl font-bold text-green-600">{item.available_stock}</p>
                              </div>
                              <div>
                                <Label>الحد الأدنى</Label>
                                <p className="font-medium">{item.min_stock_level || 'غير محدد'}</p>
                              </div>
                              <div>
                                <Label>الحد الأقصى</Label>
                                <p className="font-medium">{item.max_stock_level || 'غير محدد'}</p>
                              </div>
                            </div>
                            
                            {stockMovements.length > 0 && (
                              <div>
                                <Label>آخر حركات المخزون</Label>
                                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                                  {stockMovements.map((movement) => (
                                    <div key={movement.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                      <div>
                                        <span className="font-medium">
                                          {movement.type === 'in' ? 'إضافة' : movement.type === 'out' ? 'سحب' : 'تعديل'}
                                        </span>
                                        <span className="ml-2">{movement.quantity}</span>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(movement.created_at).toLocaleDateString('ar')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            تحديث المخزون
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تحديث المخزون</DialogTitle>
                            <DialogDescription>
                              {selectedItem?.product.title}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>نوع الحركة</Label>
                              <Select value={movementType} onValueChange={(value: 'in' | 'out' | 'adjustment') => setMovementType(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in">إضافة للمخزون</SelectItem>
                                  <SelectItem value="out">سحب من المخزون</SelectItem>
                                  <SelectItem value="adjustment">تعديل المخزون</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>الكمية</Label>
                              <Input
                                type="number"
                                value={movementQuantity}
                                onChange={(e) => setMovementQuantity(e.target.value)}
                                placeholder="أدخل الكمية"
                              />
                            </div>
                            <div>
                              <Label>السبب</Label>
                              <Input
                                value={movementReason}
                                onChange={(e) => setMovementReason(e.target.value)}
                                placeholder="سبب التحديث"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleStockMovement} className="flex-1">
                                تأكيد التحديث
                              </Button>
                              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          {lowStockItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد منتجات بمخزون منخفض</h3>
                <p className="text-muted-foreground">جميع منتجاتك لديها مخزون كافي</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {lowStockItems.map((item) => (
                <Card key={item.id} className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          متوفر: {item.available_stock} / الحد الأدنى: {item.min_stock_level}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        مخزون منخفض
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="out" className="space-y-4">
          {outOfStockItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد منتجات نفذ مخزونها</h3>
                <p className="text-muted-foreground">جميع منتجاتك متوفرة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {outOfStockItems.map((item) => (
                <Card key={item.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          المخزون الحالي: {item.current_stock}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        نفذ المخزون
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold">قيمة المخزون الإجمالية</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {getTotalInventoryValue().toLocaleString()} ر.س
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold">معدل دوران المخزون</h3>
                  <p className="text-2xl font-bold text-blue-600">2.3x</p>
                  <p className="text-sm text-muted-foreground">شهرياً</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold">الأداء العام</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(((inventory.length - outOfStockItems.length) / inventory.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">متوفر</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};