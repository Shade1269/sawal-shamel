import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle, UnifiedCardDescription as CardDescription } from '@/components/design-system';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Loader2, Package, RefreshCw, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { AddInventoryDialog } from '@/components/inventory/AddInventoryDialog';
import { SimpleProductForm } from '@/components/inventory/SimpleProductForm';
import { ReturnInventoryDialog } from '@/components/inventory/ReturnInventoryDialog';
import { InventoryFilters, FilterState } from '@/components/inventory/InventoryFilters';
import { InventoryAlerts } from '@/components/inventory/InventoryAlerts';
import { InventoryStats } from '@/components/inventory/InventoryStats';
import { InventoryReports } from '@/components/inventory/InventoryReports';
import { CycleCountDialog } from '@/components/inventory/CycleCountDialog';
import { ProductVariantDisplay } from '@/components/products/ProductVariantDisplay';

interface WarehouseRow {
  id: string;
  name: string;
  code: string;
}

interface InventoryItemRow {
  id: string;
  sku: string;
  quantity_available: number | null;
  quantity_reserved: number | null;
  quantity_on_order: number | null;
  reorder_level: number | null;
  unit_cost: number | null;
  expiry_date: string | null;
  last_counted_at: string | null;
  location: string | null;
  warehouse_id: string | null;
  product_variant_id: string | null;
}

interface MovementRow {
  id: string;
  movement_number: string;
  movement_type: string;
  quantity: number;
  created_at: string;
  reference_type: string | null;
  reference_id: string | null;
  warehouse_product_id: string | null;
  product_variant_id: string | null;
}

const formatNumber = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(Number(value));
};

const InventoryOverviewPage = () => {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [items, setItems] = useState<InventoryItemRow[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<{[key: string]: string}>({});
  const [fullProducts, setFullProducts] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFiltersChange = (filters: FilterState) => {
    let filtered = [...items];

    // تصفية البحث
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.sku?.toLowerCase().includes(searchTerm) ||
        products[item.product_variant_id || '']?.toLowerCase().includes(searchTerm)
      );
    }

    // تصفية المخزن
    if (filters.warehouse !== 'all') {
      filtered = filtered.filter(item => item.warehouse_id === filters.warehouse);
    }

    // تصفية الحالة
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => {
        const available = item.quantity_available || 0;
        const reserved = item.quantity_reserved || 0;
        
        switch (filters.status) {
          case 'available':
            return available > 0;
          case 'reserved':
            return reserved > 0;
          case 'out_of_stock':
            return available === 0;
          default:
            return true;
        }
      });
    }

    // تصفية المخزون المنخفض
    if (filters.lowStock) {
      filtered = filtered.filter(item => {
        const available = item.quantity_available || 0;
        const reorderLevel = 5; // يمكن جعل هذا قابل للتخصيص
        return available <= reorderLevel && available > 0;
      });
    }

    // تصفية منتهي الصلاحية
    if (filters.expired) {
      const now = new Date();
      filtered = filtered.filter(item => {
        if (!item.expiry_date) return false;
        return new Date(item.expiry_date) < now;
      });
    }

    setFilteredItems(filtered);
  };

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const totals = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.available += Number(item.quantity_available ?? 0);
        acc.reserved += Number(item.quantity_reserved ?? 0);
        return acc;
      },
      { available: 0, reserved: 0 }
    );
  }, [filteredItems]);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      // أولاً الحصول على معرف المستخدم الحالي والتاجر
      const { data: { user } } = await supabase.auth.getUser();
      let userMerchantId = null;
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
          
        if (profile) {
          const { data: merchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
          userMerchantId = merchant?.id;
        }
      }

      const [warehousesResult, itemsResult, movementsResult, productsResult] = await Promise.all([
        supabase
          .from('warehouses')
          .select('id, name, code')
          .order('name', { ascending: true }),
        supabase
          .from('inventory_items')
          .select(`
            id,
            sku,
            quantity_available,
            quantity_reserved,
            quantity_on_order,
            warehouse_id,
            product_variant_id,
            reorder_level,
            unit_cost,
            location,
            expiry_date,
            last_counted_at
          `)
          .limit(200),
        supabase
          .from('inventory_movements')
          .select(
            `id, movement_number, movement_type, quantity, created_at, reference_type, reference_id, warehouse_product_id, product_variant_id`
          )
          .order('created_at', { ascending: false })
          .limit(50),
        userMerchantId ? supabase
          .from('products')
          .select('id, title, sku, price_sar, stock, is_active, created_at')
          .eq('merchant_id', userMerchantId)
          .order('created_at', { ascending: false })
          .limit(100) : Promise.resolve({ data: [], error: null })
      ]);

      if (warehousesResult.error) {
        throw warehousesResult.error;
      }
      if (itemsResult.error) {
        throw itemsResult.error;
      }
      if (movementsResult.error) {
        throw movementsResult.error;
      }

      // إنشاء خريطة المنتجات للوصول السريع
      const productsMap: {[key: string]: string} = {};
      if (productsResult.data) {
        productsResult.data.forEach(product => {
          productsMap[product.id] = product.title || 'منتج غير معروف';
        });
        setFullProducts(productsResult.data);
      }

      setWarehouses(warehousesResult.data ?? []);
      setItems(itemsResult.data ?? []);
      setMovements(movementsResult.data ?? []);
      setProducts(productsMap);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Failed to load inventory snapshot:', err);
      setError(err?.message ?? 'تعذر تحميل بيانات المخزون');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <CardTitle className="text-2xl">نظام المخزون المتكامل</CardTitle>
          </div>
          <CardDescription>
            إدارة شاملة للمخزون مع التتبع التلقائي، التنبيهات الذكية، والتقارير التفصيلية
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <InventoryFilters 
        warehouses={warehouses}
        onFiltersChange={handleFiltersChange}
      />

      {/* Stats */}
      <InventoryStats 
        items={items}
        warehouses={warehouses}
      />

      {/* Alerts */}
      <InventoryAlerts refreshTrigger={refreshTrigger} />

      {/* إضافة منتج جديد */}
      <SimpleProductForm 
        warehouseId={warehouses[0]?.id}
        onSuccess={loadInventory}
      />

      {/* قائمة المنتجات المحفوظة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            قائمة المنتجات المحفوظة
          </CardTitle>
          <CardDescription>
            عرض جميع المنتجات التي تم إضافتها مؤخراً
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>رمز المنتج (SKU)</TableHead>
                  <TableHead>المتغيرات</TableHead>
                  <TableHead className="text-center">السعر</TableHead>
                  <TableHead className="text-center">المخزون</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fullProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                      لا توجد منتجات محفوظة بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  fullProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku || '-'}</TableCell>
                      <TableCell>
                        {product.variants && product.variants.length > 0 ? (
                          <ProductVariantDisplay 
                            variants={product.variants}
                            compact={true}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{product.price_sar ? `${product.price_sar} ر.س` : '-'}</TableCell>
                      <TableCell className="text-center">{product.stock || 0}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={product.is_active ? "secondary" : "outline"}>
                          {product.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString('ar-SA') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Main Inventory Management */}
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-lg">إدارة المخزون الحالي</CardTitle>
          <CardDescription>
            عرض وإدارة جميع أصناف المخزون مع إمكانية الإضافة والاسترجاع والجرد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <AddInventoryDialog
              warehouses={warehouses}
              onSuccess={loadInventory}
            />
            <ReturnInventoryDialog
              inventoryItems={filteredItems.map(item => ({
                id: item.id,
                sku: item.sku,
                quantity_available: item.quantity_available || 0,
                warehouse_id: item.warehouse_id || '',
                location: undefined
              }))}
              warehouses={warehouses}
              onSuccess={loadInventory}
            />
            <CycleCountDialog
              inventoryItems={filteredItems.map(item => ({
                id: item.id,
                sku: item.sku,
                quantity_available: item.quantity_available || 0,
                warehouse_id: item.warehouse_id || '',
                location: item.location || undefined,
                last_counted_at: item.last_counted_at || undefined
              }))}
              warehouses={warehouses}
              onSuccess={loadInventory}
            />
            <Button onClick={loadInventory} disabled={loading} variant="outline" className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              تحديث البيانات
            </Button>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">عدد الأصناف</p>
              <p className="text-2xl font-bold">{filteredItems.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">الكمية المتاحة</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatNumber(filteredItems.reduce((sum, item) => sum + (item.quantity_available ?? 0), 0))}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">الكمية المحجوزة</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatNumber(filteredItems.reduce((sum, item) => sum + (item.quantity_reserved ?? 0), 0))}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">آخر تحديث</p>
              <p className="text-2xl font-bold">
                {loading ? 'جاري التحديث...' : new Date().toLocaleTimeString('ar-SA')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">تفاصيل الأصناف</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>المستودع</TableHead>
                    <TableHead className="text-center">المتاح</TableHead>
                    <TableHead className="text-center">محجوز</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                        لا توجد عناصر مطابقة حالياً
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const warehouse = item.warehouse_id ? warehouses.find(w => w.id === item.warehouse_id) : null;
                      // استخدام SKU كاسم المنتج إذا لم يكن متوفراً في قاعدة البيانات
                      const title = item.sku || 'صنف غير معرف';
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{title}</span>
                              <span className="text-xs text-muted-foreground">رمز المنتج: {item.sku}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell className="text-sm">
                            {warehouse ? `${warehouse.name} (${warehouse.code})` : 'غير محدد'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={Number(item.quantity_available ?? 0) > 0 ? 'secondary' : 'outline'}>
                              {formatNumber(item.quantity_available)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={Number(item.quantity_reserved ?? 0) > 0 ? 'outline' : 'secondary'}>
                              {formatNumber(item.quantity_reserved)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      <InventoryReports refreshTrigger={refreshTrigger} />

      {/* Recent Movements */}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أحدث الحركات المخزنية</CardTitle>
          <CardDescription>ملخص آخر 50 حركة ناتجة عن الحجز، التحويل أو التسوية.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الحركة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead>المرجع</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      لا توجد حركات مسجلة بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-mono text-sm">{movement.movement_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {movement.movement_type === 'OUT' ? (
                            <ArrowUpCircle className="h-4 w-4 text-rose-500" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
                          )}
                          <span className="text-sm">
                            {movement.movement_type === 'OUT' ? 'خروج' : 'دخول'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {formatNumber(movement.quantity)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.reference_type === 'ORDER' && movement.reference_id
                          ? `طلب ${movement.reference_id}`
                          : movement.reference_type || 'غير محدد'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.created_at
                          ? new Date(movement.created_at).toLocaleString('ar-SA')
                          : 'غير محدد'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryOverviewPage;
