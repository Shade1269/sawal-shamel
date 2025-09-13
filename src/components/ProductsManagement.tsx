import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit2, 
  Package, 
  Palette,
  Barcode,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const ProductsManagement: React.FC = () => {
  const { warehouseProducts, productVariants, suppliers, loading } = useInventoryManagement();

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  
  const [productFormData, setProductFormData] = useState({
    product_name: '',
    product_description: '',
    category: '',
    brand: '',
    supplier_id: '',
    sku_prefix: '',
    is_active: true
  });

  const [variantFormData, setVariantFormData] = useState({
    warehouse_product_id: '',
    variant_name: '',
    sku: '',
    barcode: '',
    cost_price: '',
    selling_price: '',
    available_stock: '',
    reserved_stock: '',
    reorder_level: '',
    max_stock_level: '',
    shelf_location: '',
    batch_number: '',
    expiry_date: '',
    is_active: true
  });

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...productFormData,
      supplier_id: productFormData.supplier_id || null
    };

    // TODO: Implement actual create/update product functionality
    console.log('Product data:', data);
    
    setShowProductDialog(false);
    resetProductForm();
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...variantFormData,
      cost_price: variantFormData.cost_price ? parseFloat(variantFormData.cost_price) : null,
      selling_price: variantFormData.selling_price ? parseFloat(variantFormData.selling_price) : null,
      available_stock: parseInt(variantFormData.available_stock) || 0,
      reserved_stock: parseInt(variantFormData.reserved_stock) || 0,
      reorder_level: parseInt(variantFormData.reorder_level) || 0,
      max_stock_level: variantFormData.max_stock_level ? parseInt(variantFormData.max_stock_level) : null
    };

    // TODO: Implement actual create/update variant functionality
    console.log('Variant data:', data);
    
    setShowVariantDialog(false);
    resetVariantForm();
  };

  const resetProductForm = () => {
    setProductFormData({
      product_name: '',
      product_description: '',
      category: '',
      brand: '',
      supplier_id: '',
      sku_prefix: '',
      is_active: true
    });
    setEditingProduct(null);
  };

  const resetVariantForm = () => {
    setVariantFormData({
      warehouse_product_id: '',
      variant_name: '',
      sku: '',
      barcode: '',
      cost_price: '',
      selling_price: '',
      available_stock: '',
      reserved_stock: '',
      reorder_level: '',
      max_stock_level: '',
      shelf_location: '',
      batch_number: '',
      expiry_date: '',
      is_active: true
    });
    setEditingVariant(null);
  };

  const startEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductFormData({
      product_name: product.product_name || '',
      product_description: product.product_description || '',
      category: product.category || '',
      brand: product.brand || '',
      supplier_id: product.supplier_id || '',
      sku_prefix: product.sku_prefix || '',
      is_active: product.is_active
    });
    setShowProductDialog(true);
  };

  const startEditVariant = (variant: any) => {
    setEditingVariant(variant);
    setVariantFormData({
      warehouse_product_id: variant.warehouse_product_id || '',
      variant_name: variant.variant_name || '',
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      cost_price: variant.cost_price?.toString() || '',
      selling_price: variant.selling_price?.toString() || '',
      available_stock: variant.available_stock?.toString() || '',
      reserved_stock: variant.reserved_stock?.toString() || '',
      reorder_level: variant.reorder_level?.toString() || '',
      max_stock_level: variant.max_stock_level?.toString() || '',
      shelf_location: variant.shelf_location || '',
      batch_number: variant.batch_number || '',
      expiry_date: variant.expiry_date || '',
      is_active: variant.is_active
    });
    setShowVariantDialog(true);
  };

  const getProductVariants = (productId: string) => {
    return productVariants.filter(variant => variant.warehouse_product_id === productId);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          إدارة المنتجات والمتغيرات
        </h1>
        
        <div className="flex gap-2">
          <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetProductForm}>
                <Plus className="h-4 w-4 ml-2" />
                منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="product_name">اسم المنتج</Label>
                  <Input
                    id="product_name"
                    value={productFormData.product_name}
                    onChange={(e) => setProductFormData({...productFormData, product_name: e.target.value})}
                    required
                    placeholder="اسم المنتج"
                  />
                </div>
                
                <div>
                  <Label htmlFor="product_description">وصف المنتج</Label>
                  <Textarea
                    id="product_description"
                    value={productFormData.product_description}
                    onChange={(e) => setProductFormData({...productFormData, product_description: e.target.value})}
                    placeholder="وصف تفصيلي للمنتج"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">الفئة</Label>
                    <Input
                      id="category"
                      value={productFormData.category}
                      onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                      placeholder="إلكترونيات"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="brand">العلامة التجارية</Label>
                    <Input
                      id="brand"
                      value={productFormData.brand}
                      onChange={(e) => setProductFormData({...productFormData, brand: e.target.value})}
                      placeholder="سامسونج"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier_id">المورد</Label>
                    <Select value={productFormData.supplier_id} onValueChange={(value) => 
                      setProductFormData({...productFormData, supplier_id: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون مورد</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplier_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="sku_prefix">بادئة رمز المنتج</Label>
                    <Input
                      id="sku_prefix"
                      value={productFormData.sku_prefix}
                      onChange={(e) => setProductFormData({...productFormData, sku_prefix: e.target.value})}
                      placeholder="PROD"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={productFormData.is_active}
                    onCheckedChange={(checked) => setProductFormData({...productFormData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">منتج نشط</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetVariantForm}>
                <Palette className="h-4 w-4 ml-2" />
                متغير جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVariant ? 'تعديل المتغير' : 'إضافة متغير جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleVariantSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="warehouse_product_id">المنتج الأساسي</Label>
                  <Select value={variantFormData.warehouse_product_id} onValueChange={(value) => 
                    setVariantFormData({...variantFormData, warehouse_product_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouseProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.product_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="variant_name">اسم المتغير</Label>
                    <Input
                      id="variant_name"
                      value={variantFormData.variant_name}
                      onChange={(e) => setVariantFormData({...variantFormData, variant_name: e.target.value})}
                      required
                      placeholder="مقاس كبير - لون أحمر"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                    <Input
                      id="sku"
                      value={variantFormData.sku}
                      onChange={(e) => setVariantFormData({...variantFormData, sku: e.target.value})}
                      placeholder="PROD-001-L-RED"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="barcode">الباركود</Label>
                  <Input
                    id="barcode"
                    value={variantFormData.barcode}
                    onChange={(e) => setVariantFormData({...variantFormData, barcode: e.target.value})}
                    placeholder="1234567890123"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost_price">سعر التكلفة</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      value={variantFormData.cost_price}
                      onChange={(e) => setVariantFormData({...variantFormData, cost_price: e.target.value})}
                      placeholder="50.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="selling_price">سعر البيع</Label>
                    <Input
                      id="selling_price"
                      type="number"
                      step="0.01"
                      value={variantFormData.selling_price}
                      onChange={(e) => setVariantFormData({...variantFormData, selling_price: e.target.value})}
                      placeholder="100.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="available_stock">المخزون المتاح</Label>
                    <Input
                      id="available_stock"
                      type="number"
                      value={variantFormData.available_stock}
                      onChange={(e) => setVariantFormData({...variantFormData, available_stock: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reserved_stock">المخزون المحجوز</Label>
                    <Input
                      id="reserved_stock"
                      type="number"
                      value={variantFormData.reserved_stock}
                      onChange={(e) => setVariantFormData({...variantFormData, reserved_stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reorder_level">نقطة إعادة الطلب</Label>
                    <Input
                      id="reorder_level"
                      type="number"
                      value={variantFormData.reorder_level}
                      onChange={(e) => setVariantFormData({...variantFormData, reorder_level: e.target.value})}
                      placeholder="10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max_stock_level">الحد الأقصى للمخزون</Label>
                    <Input
                      id="max_stock_level"
                      type="number"
                      value={variantFormData.max_stock_level}
                      onChange={(e) => setVariantFormData({...variantFormData, max_stock_level: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shelf_location">موقع الرف</Label>
                    <Input
                      id="shelf_location"
                      value={variantFormData.shelf_location}
                      onChange={(e) => setVariantFormData({...variantFormData, shelf_location: e.target.value})}
                      placeholder="A-01-001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch_number">رقم الدفعة</Label>
                    <Input
                      id="batch_number"
                      value={variantFormData.batch_number}
                      onChange={(e) => setVariantFormData({...variantFormData, batch_number: e.target.value})}
                      placeholder="BATCH-001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expiry_date">تاريخ الانتهاء</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={variantFormData.expiry_date}
                      onChange={(e) => setVariantFormData({...variantFormData, expiry_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="variant_is_active"
                    checked={variantFormData.is_active}
                    onCheckedChange={(checked) => setVariantFormData({...variantFormData, is_active: checked})}
                  />
                  <Label htmlFor="variant_is_active">متغير نشط</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowVariantDialog(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingVariant ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">المنتجات ({warehouseProducts.length})</TabsTrigger>
          <TabsTrigger value="variants">المتغيرات ({productVariants.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          {warehouseProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد منتجات مضافة</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإضافة منتجات للمخزن
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {warehouseProducts.map((product) => {
                const variants = getProductVariants(product.id);
                const supplier = suppliers.find(s => s.id === product.supplier_id);
                
                return (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {product.product_name}
                              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {product.category} • {product.brand}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditProduct(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {product.product_description && (
                          <p className="text-sm text-muted-foreground">
                            {product.product_description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {supplier && (
                              <span>المورد: {supplier.supplier_name}</span>
                            )}
                          </div>
                          <Badge variant="outline">
                            {variants.length} متغير
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="variants" className="space-y-4">
          {productVariants.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد متغيرات مضافة</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإضافة متغيرات للمنتجات
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {productVariants.map((variant) => {
                const product = warehouseProducts.find(p => p.id === variant.warehouse_product_id);
                const stockLevel = variant.available_stock || 0;
                const reorderLevel = variant.reorder_level || 0;
                const isLowStock = stockLevel <= reorderLevel && reorderLevel > 0;
                
                return (
                  <Card key={variant.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isLowStock ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'
                          }`}>
                            <Palette className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {variant.variant_name}
                              <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                                {variant.is_active ? 'نشط' : 'غير نشط'}
                              </Badge>
                              {isLowStock && (
                                <Badge variant="destructive">
                                  <AlertCircle className="h-3 w-3 ml-1" />
                                  مخزون منخفض
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {product?.product_name} • SKU: {variant.sku}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditVariant(variant)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{stockLevel}</div>
                          <div className="text-sm text-blue-600">متوفر</div>
                        </div>
                        
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">{variant.reserved_stock || 0}</div>
                          <div className="text-sm text-orange-600">محجوز</div>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {variant.cost_price ? `${variant.cost_price} ر.س` : '-'}
                          </div>
                          <div className="text-sm text-green-600">التكلفة</div>
                        </div>
                        
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {variant.selling_price ? `${variant.selling_price} ر.س` : '-'}
                          </div>
                          <div className="text-sm text-purple-600">البيع</div>
                        </div>
                      </div>
                      
                      {variant.shelf_location && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          الموقع: {variant.shelf_location}
                          {variant.batch_number && ` • الدفعة: ${variant.batch_number}`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};