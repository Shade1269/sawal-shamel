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
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit2, 
  Package, 
  Palette,
  Barcode,
  DollarSign,
  AlertCircle,
  Box,
  Tag,
  Star,
  Users,
  Calendar,
  X
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { useCreateProduct, useUpdateProduct, useProducts, useCategories, useBrands } from '@/hooks/useProductManagement';
import { toast } from 'sonner';
import { useUserData } from '@/hooks/useUserData';

export const ProductsManagement: React.FC = () => {
  const { warehouseProducts, productVariants, suppliers, loading: inventoryLoading } = useInventoryManagement();
  const { userShop } = useUserData();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  
  const [productFormData, setProductFormData] = useState({
    title: '',
    description: '',
    price_sar: '',
    stock: '',
    category_id: '',
    brand_id: '',
    sku: '',
    is_active: true
  });

  const [productVariantsForm, setProductVariantsForm] = useState([
    { type: 'size', value: '', stock: 0 }
  ]);

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
    
    if (!userShop?.id) {
      toast.error('يجب أن تكون تاجراً لإضافة منتجات');
      return;
    }

    try {
      const data = {
        title: productFormData.title,
        description: productFormData.description,
        price_sar: parseFloat(productFormData.price_sar) || 0,
        stock: parseInt(productFormData.stock) || 0,
        category_id: productFormData.category_id || null,
        brand_id: productFormData.brand_id || null,
        sku: productFormData.sku || null,
        is_active: productFormData.is_active,
        merchant_id: userShop.id,
        tags: [],
        meta_keywords: [],
        featured: false,
        variants: productVariantsForm.filter(v => v.value.trim() !== '')
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await createProduct.mutateAsync(data);
        toast.success('تم إضافة المنتج بنجاح');
      }
      
      setShowProductDialog(false);
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('حدث خطأ في حفظ المنتج');
    }
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
      title: '',
      description: '',
      price_sar: '',
      stock: '',
      category_id: '',
      brand_id: '',
      sku: '',
      is_active: true
    });
    setProductVariantsForm([{ type: 'size', value: '', stock: 0 }]);
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
      title: product.title || '',
      description: product.description || '',
      price_sar: product.price_sar?.toString() || '',
      stock: product.stock?.toString() || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      sku: product.sku || '',
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

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.supplier_name || 'مورد غير محدد';
  };

  const loading = inventoryLoading || productsLoading;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">إدارة المنتجات والمتغيرات</h2>
            <p className="text-muted-foreground">إضافة وإدارة المنتجات ومتغيراتها في المخزن</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetProductForm}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow transition-all duration-300"
              >
                <Plus className="h-4 w-4 ml-2" />
                منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">اسم المنتج</Label>
                  <Input
                    id="title"
                    value={productFormData.title}
                    onChange={(e) => setProductFormData({...productFormData, title: e.target.value})}
                    required
                    placeholder="اسم المنتج"
                    className="border-border/50 focus:border-primary"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">وصف المنتج</Label>
                  <Textarea
                    id="description"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                    placeholder="وصف تفصيلي للمنتج"
                    rows={3}
                    className="border-border/50 focus:border-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_sar">السعر (ريال سعودي)</Label>
                    <Input
                      id="price_sar"
                      type="number"
                      step="0.01"
                      value={productFormData.price_sar}
                      onChange={(e) => setProductFormData({...productFormData, price_sar: e.target.value})}
                      required
                      placeholder="100.00"
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">الكمية المتاحة</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productFormData.stock}
                      onChange={(e) => setProductFormData({...productFormData, stock: e.target.value})}
                      placeholder="100"
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category_id">الفئة</Label>
                    <Select value={productFormData.category_id} onValueChange={(value) => 
                      setProductFormData({...productFormData, category_id: value === 'none' ? '' : value})
                    }>
                      <SelectTrigger className="border-border/50 focus:border-primary">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover shadow-lg border border-border">
                        <SelectItem value="none">بدون فئة</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="brand_id">العلامة التجارية</Label>
                    <Select value={productFormData.brand_id} onValueChange={(value) => 
                      setProductFormData({...productFormData, brand_id: value === 'none' ? '' : value})
                    }>
                      <SelectTrigger className="border-border/50 focus:border-primary">
                        <SelectValue placeholder="اختر العلامة التجارية" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover shadow-lg border border-border">
                        <SelectItem value="none">بدون علامة تجارية</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                  <Input
                    id="sku"
                    value={productFormData.sku}
                    onChange={(e) => setProductFormData({...productFormData, sku: e.target.value})}
                    placeholder="PROD-001"
                    className="border-border/50 focus:border-primary"
                  />
                </div>

                {/* Product Variants Section */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">تخصيص المنتج (مقاسات، ألوان، إلخ)</h4>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => {
                        setProductVariantsForm([...productVariantsForm, { type: 'size', value: '', stock: 0 }]);
                      }}>
                        + مقاس
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => {
                        setProductVariantsForm([...productVariantsForm, { type: 'color', value: '', stock: 0 }]);
                      }}>
                        + لون
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {productVariantsForm.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                        <Select 
                          value={variant.type} 
                          onValueChange={(value) => {
                            const updated = [...productVariantsForm];
                            updated[index] = { ...updated[index], type: value };
                            setProductVariantsForm(updated);
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-popover shadow-lg border border-border">
                            <SelectItem value="size">مقاس</SelectItem>
                            <SelectItem value="color">لون</SelectItem>
                            <SelectItem value="style">نمط</SelectItem>
                            <SelectItem value="material">مادة</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder={variant.type === 'size' ? 'M, L, XL' : variant.type === 'color' ? 'أحمر, أزرق' : 'القيمة'}
                          value={variant.value}
                          onChange={(e) => {
                            const updated = [...productVariantsForm];
                            updated[index] = { ...updated[index], value: e.target.value };
                            setProductVariantsForm(updated);
                          }}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="العدد"
                          value={variant.stock}
                          onChange={(e) => {
                            const updated = [...productVariantsForm];
                            updated[index] = { ...updated[index], stock: parseInt(e.target.value) || 0 };
                            setProductVariantsForm(updated);
                          }}
                          className="w-20"
                        />
                        {productVariantsForm.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setProductVariantsForm(productVariantsForm.filter((_, i) => i !== index));
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
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
                  <Button 
                    type="submit" 
                    className="bg-gradient-primary hover:opacity-90"
                    disabled={createProduct.isPending || updateProduct.isPending}
                  >
                    {createProduct.isPending || updateProduct.isPending ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'إضافة')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetVariantForm} className="border-accent hover:bg-accent hover:text-accent-foreground">
                <Palette className="h-4 w-4 ml-2" />
                متغير جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingVariant ? 'تعديل المتغير' : 'إضافة متغير جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleVariantSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="warehouse_product_id">المنتج الأساسي</Label>
                  <Select value={variantFormData.warehouse_product_id} onValueChange={(value) => 
                    setVariantFormData({...variantFormData, warehouse_product_id: value})
                  }>
                    <SelectTrigger className="border-border/50 focus:border-primary">
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
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                    <Input
                      id="sku"
                      value={variantFormData.sku}
                      onChange={(e) => setVariantFormData({...variantFormData, sku: e.target.value})}
                      placeholder="PROD-001-L-RED"
                      className="border-border/50 focus:border-primary"
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
                    className="border-border/50 focus:border-primary"
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
                      className="border-border/50 focus:border-primary"
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
                      className="border-border/50 focus:border-primary"
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
                      className="border-border/50 focus:border-primary"
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
                      className="border-border/50 focus:border-primary"
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
                      className="border-border/50 focus:border-primary"
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
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shelf_location">موقع الرف</Label>
                    <Input
                      id="shelf_location"
                      value={variantFormData.shelf_location}
                      onChange={(e) => setVariantFormData({...variantFormData, shelf_location: e.target.value})}
                      placeholder="A-01-001"
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batch_number">رقم الدفعة</Label>
                    <Input
                      id="batch_number"
                      value={variantFormData.batch_number}
                      onChange={(e) => setVariantFormData({...variantFormData, batch_number: e.target.value})}
                      placeholder="BATCH001"
                      className="border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="expiry_date">تاريخ انتهاء الصلاحية</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={variantFormData.expiry_date}
                    onChange={(e) => setVariantFormData({...variantFormData, expiry_date: e.target.value})}
                    className="border-border/50 focus:border-primary"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={variantFormData.is_active}
                    onCheckedChange={(checked) => setVariantFormData({...variantFormData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">متغير نشط</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowVariantDialog(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                    {editingVariant ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-soft">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
            <Package className="h-4 w-4 ml-2" />
            المنتجات الأساسية ({warehouseProducts.length})
          </TabsTrigger>
          <TabsTrigger value="variants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300">
            <Palette className="h-4 w-4 ml-2" />
            المتغيرات ({productVariants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          {warehouseProducts.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
              <CardContent className="text-center py-12">
                <div className="p-4 rounded-full bg-muted mb-4 mx-auto w-fit">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد منتجات</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإضافة أول منتج لمخزنك
                </p>
                <Button onClick={resetProductForm} variant="outline" className="border-primary hover:bg-primary hover:text-primary-foreground">
                  إضافة منتج جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {warehouseProducts.map((product) => {
                const variants = getProductVariants(product.id);
                return (
                  <Card key={product.id} className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-soft hover:shadow-luxury transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
                            <Box className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
                              {product.product_name}
                              <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                                {product.is_active ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditProduct(product)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* معلومات المنتج */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {product.category && (
                          <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30">
                            <Tag className="h-4 w-4 text-accent" />
                            <div>
                              <div className="text-xs text-muted-foreground">الفئة</div>
                              <div className="font-medium">{product.category}</div>
                            </div>
                          </div>
                        )}
                        
                        {product.brand && (
                          <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30">
                            <Star className="h-4 w-4 text-accent" />
                            <div>
                              <div className="text-xs text-muted-foreground">العلامة التجارية</div>
                              <div className="font-medium">{product.brand}</div>
                            </div>
                          </div>
                        )}
                        
                        {product.supplier_id && (
                          <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30">
                            <Users className="h-4 w-4 text-accent" />
                            <div>
                              <div className="text-xs text-muted-foreground">المورد</div>
                              <div className="font-medium">{getSupplierName(product.supplier_id)}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-border/50" />

                      {/* المتغيرات */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Palette className="h-4 w-4 text-accent" />
                          المتغيرات ({variants.length})
                        </h4>
                        
                        {variants.length === 0 ? (
                          <div className="text-center py-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
                            <p className="text-muted-foreground text-sm">لا توجد متغيرات لهذا المنتج</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {variants.slice(0, 3).map((variant) => (
                              <div key={variant.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/30">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10">
                                    <Palette className="h-4 w-4 text-accent" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">{variant.variant_name}</div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="text-xs">المخزون: {variant.available_stock}</span>
                                      <span>السعر: {variant.selling_price ? `${variant.selling_price} ريال` : 'غير محدد'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={variant.available_stock <= variant.reorder_level ? 'destructive' : 'default'} 
                                    className="text-xs"
                                  >
                                    {variant.available_stock <= variant.reorder_level ? 'مخزون منخفض' : 'متوفر'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditVariant(variant)}
                                    className="hover:bg-accent/10 hover:text-accent"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {variants.length > 3 && (
                              <div className="text-center py-2">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                  عرض {variants.length - 3} متغيرات أخرى
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* تواريخ */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/30 pt-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>تم الإنشاء: {new Date(product.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>آخر تحديث: {new Date(product.updated_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          {productVariants.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
              <CardContent className="text-center py-12">
                <div className="p-4 rounded-full bg-muted mb-4 mx-auto w-fit">
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد متغيرات</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإضافة متغيرات للمنتجات الموجودة
                </p>
                <Button onClick={resetVariantForm} variant="outline" className="border-accent hover:bg-accent hover:text-accent-foreground">
                  إضافة متغير جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productVariants.map((variant) => {
                const product = warehouseProducts.find(p => p.id === variant.warehouse_product_id);
                return (
                  <Card key={variant.id} className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-soft hover:shadow-luxury transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10">
                            <Palette className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-foreground mb-1">{variant.variant_name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{product?.product_name}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditVariant(variant)}
                          className="hover:bg-accent/10 hover:text-accent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* المعلومات الأساسية */}
                      <div className="space-y-2">
                        {variant.sku && (
                          <div className="flex items-center gap-2 text-sm">
                            <Barcode className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono">{variant.sku}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">المخزون:</span>
                          </div>
                          <Badge 
                            variant={variant.available_stock <= (variant.reorder_level || 0) ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {variant.available_stock} قطعة
                          </Badge>
                        </div>
                        
                        {variant.selling_price && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">السعر:</span>
                            </div>
                            <span className="font-bold text-primary">{variant.selling_price} ريال</span>
                          </div>
                        )}
                      </div>

                      {variant.available_stock <= (variant.reorder_level || 0) && (
                        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-xs text-destructive font-medium">مخزون منخفض</span>
                        </div>
                      )}
                      
                      {/* الحالة */}
                      <div className="flex justify-between items-center pt-2 border-t border-border/30">
                        <Badge variant={variant.is_active ? 'default' : 'secondary'} className="text-xs">
                          {variant.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {variant.shelf_location || 'موقع غير محدد'}
                        </div>
                      </div>
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