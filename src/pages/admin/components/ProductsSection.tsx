import React, { useState } from 'react';
import { UnifiedButton } from "@/components/design-system";
import { UnifiedInput } from "@/components/design-system";
import { Label } from "@/components/ui/label";
import { UnifiedBadge } from "@/components/design-system";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Props للـ ProductsSection Component
 * يحتوي على جميع البيانات والوظائف المطلوبة لإدارة المنتجات
 */
interface ProductsSectionProps {
  products: any[];
  categories: string[];
  loading: boolean;
  onRefresh: () => void;
  onAddProduct: (productData: any, images: File[], variants: any[]) => Promise<void>;
  onUpdateProduct: (productId: string, updates: any) => Promise<void>;
  onDeleteProduct: (product: any) => Promise<void>;
  onToggleVisibility: (product: any) => Promise<void>;
  onAddCategory: (category: string) => void;
}

/**
 * قسم إدارة المنتجات
 * يشمل: قائمة المنتجات، إضافة منتج، تعديل منتج، حذف منتج
 */
export function ProductsSection({
  products,
  categories,
  loading,
  onRefresh,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleVisibility,
  onAddCategory
}: ProductsSectionProps) {
  const { toast } = useToast();

  // حالات محلية للنماذج
  const [newCategory, setNewCategory] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price_sar: '',
    category: '',
    stock: '',
    commission_rate: ''
  });

  const [productVariants, setProductVariants] = useState([
    { size: '', color: '', stock: 0 }
  ]);

  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // معالج رفع الصور
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = productImages.length + newFiles.length;

    if (totalImages > 10) {
      toast({
        title: "حد الصور",
        description: "يمكن رفع حتى 10 صور فقط للمنتج الواحد",
        variant: "destructive"
      });
      return;
    }

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

    setProductImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // إزالة صورة
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // إضافة تركيبة (variant)
  const addVariant = () => {
    setProductVariants([...productVariants, { size: '', color: '', stock: 0 }]);
  };

  // تحديث تركيبة
  const updateVariant = (index: number, field: string, value: string | number) => {
    const updated = [...productVariants];
    updated[index] = { ...updated[index], [field]: value };
    setProductVariants(updated);
  };

  // حذف تركيبة
  const removeVariant = (index: number) => {
    if (productVariants.length > 1) {
      setProductVariants(productVariants.filter((_, i) => i !== index));
    }
  };

  // معالج إضافة منتج جديد
  const handleAddProduct = async () => {
    if (!newProduct.title.trim() || !newProduct.price_sar) {
      toast({ title: "مطلوب", description: "اسم المنتج والسعر مطلوبان", variant: "destructive" });
      return;
    }

    try {
      setAddingProduct(true);

      const productData = {
        title: newProduct.title.trim(),
        description: newProduct.description.trim() || null,
        price_sar: parseFloat(newProduct.price_sar),
        category: newProduct.category.trim() || null,
        stock: parseInt(newProduct.stock) || 0,
        commission_rate: parseFloat(newProduct.commission_rate) || 10,
        is_active: true
      };

      await onAddProduct(productData, productImages, productVariants);

      // إغلاق النافذة وتنظيف الحقول
      setShowAddProduct(false);
      setNewProduct({ title: '', description: '', price_sar: '', category: '', stock: '', commission_rate: '' });
      setProductVariants([{ size: '', color: '', stock: 0 }]);
      setProductImages([]);
      setImagePreviewUrls([]);

      onRefresh();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setAddingProduct(false);
    }
  };

  // معالج إضافة صنف جديد
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({ title: "مطلوب", description: "اسم الصنف مطلوب", variant: "destructive" });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({ title: "موجود", description: "هذا الصنف موجود بالفعل", variant: "destructive" });
      return;
    }

    onAddCategory(newCategory.trim());
    setNewCategory('');
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl gradient-icon-wrapper flex items-center justify-center shadow-lg shadow-primary/25 ring-2 ring-primary/20">
          <Package className="h-6 w-6 text-white drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-3xl font-black admin-card">إدارة المنتجات</h2>
          <p className="text-lg text-muted-foreground/80 font-medium mt-1">إدارة شاملة للمنتجات والمخزون</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إضافة منتج وصنف */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">إضافة منتج أو صنف</h3>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="اسم الصنف الجديد"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={handleAddCategory} disabled={loading}>
                إضافة صنف
              </Button>
            </div>

            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة منتج جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="اسم المنتج *"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  />
                  <Textarea
                    placeholder="وصف المنتج"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="السعر الأساسي بالريال *"
                      value={newProduct.price_sar}
                      onChange={(e) => setNewProduct({...newProduct, price_sar: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="المخزون الأساسي"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    />
                  </div>

                  {/* قسم التركيبات (المقاسات والألوان) */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">تخصيص المنتج (مقاسات وألوان)</h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addVariant}
                      >
                        + إضافة تركيبة جديدة
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto bg-muted/10 p-4 rounded-lg">
                      {productVariants.map((variant, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-center p-4 bg-background border rounded-lg shadow-sm">
                          <div className="col-span-4">
                            <Label className="text-xs text-muted-foreground mb-1 block">المقاس</Label>
                            <Select
                              value={variant.size}
                              onValueChange={(value) => updateVariant(index, 'size', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="اختر المقاس" />
                              </SelectTrigger>
                              <SelectContent className="z-50 bg-background border shadow-md">
                                <SelectItem value="XS">XS</SelectItem>
                                <SelectItem value="S">S</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="XL">XL</SelectItem>
                                <SelectItem value="XXL">XXL</SelectItem>
                                <SelectItem value="XXXL">XXXL</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-4">
                            <Label className="text-xs text-muted-foreground mb-1 block">اللون</Label>
                            <Select
                              value={variant.color}
                              onValueChange={(value) => updateVariant(index, 'color', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="اختر اللون" />
                              </SelectTrigger>
                              <SelectContent className="z-50 bg-background border shadow-md">
                                <SelectItem value="أحمر">أحمر</SelectItem>
                                <SelectItem value="أزرق">أزرق</SelectItem>
                                <SelectItem value="أخضر">أخضر</SelectItem>
                                <SelectItem value="أصفر">أصفر</SelectItem>
                                <SelectItem value="أسود">أسود</SelectItem>
                                <SelectItem value="أبيض">أبيض</SelectItem>
                                <SelectItem value="رمادي">رمادي</SelectItem>
                                <SelectItem value="بني">بني</SelectItem>
                                <SelectItem value="بنفسجي">بنفسجي</SelectItem>
                                <SelectItem value="برتقالي">برتقالي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-3">
                            <Label className="text-xs text-muted-foreground mb-1 block">العدد المتوفر</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                              className="h-9"
                              min="0"
                            />
                          </div>

                          {productVariants.length > 1 && (
                            <div className="col-span-1 flex justify-center">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeVariant(index)}
                                className="text-destructive hover:text-destructive h-9 w-9 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}

                      {productVariants.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          لا توجد تركيبات حالياً - اضغط "إضافة تركيبة جديدة" لإضافة مقاس ولون
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                      💡 <strong>نصيحة:</strong> كل صف يمثل تركيبة من مقاس ولون مع عددها المتوفر (مثال: أحمر + لارج = 5 قطع)
                    </div>
                  </div>

                  {/* قسم صور المنتج */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">صور المنتج (حتى 10 صور)</h4>
                      <Badge variant="outline">{productImages.length}/10</Badge>
                    </div>

                    <div className="space-y-4">
                      {/* منطقة رفع الصور */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                          ${productImages.length >= 10 ? 'border-muted bg-muted/20 cursor-not-allowed' : 'border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer'}
                        `}
                        onClick={() => {
                          if (productImages.length < 10) {
                            document.getElementById('product-images-input')?.click();
                          }
                        }}
                      >
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {productImages.length >= 10
                            ? 'تم الوصول للحد الأقصى من الصور'
                            : 'اضغط لرفع الصور أو اسحب الصور هنا'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {productImages.length >= 10 ? '' : 'PNG, JPG, WebP حتى 5MB لكل صورة'}
                        </p>
                        <input
                          id="product-images-input"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          disabled={productImages.length >= 10}
                        />
                      </div>

                      {/* معاينة الصور */}
                      {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-5 gap-3">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </Button>
                              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصنف" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="نسبة العمولة %"
                      value={newProduct.commission_rate}
                      onChange={(e) => setNewProduct({...newProduct, commission_rate: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct} disabled={addingProduct}>
                      إضافة المنتج
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* قائمة المنتجات */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">قائمة المنتجات</h3>
            <Badge variant="outline">{products.length}</Badge>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {products.map((product) => (
              <div key={product.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{product.title}</h4>
                      <Badge
                        variant={product.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.is_active ? "ظاهر" : "مخفي"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-primary">{product.price_sar} ريال</span>
                      <span>المخزون: {product.stock}</span>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleVisibility(product)}
                      disabled={loading}
                      className={!product.is_active ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-lg" : undefined}
                    >
                      {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProduct(product)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد منتجات حالياً
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نافذة تعديل المنتج */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <Input
                placeholder="اسم المنتج *"
                value={editingProduct.title}
                onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
              />
              <Textarea
                placeholder="وصف المنتج"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="السعر بالريال *"
                  value={editingProduct.price_sar}
                  onChange={(e) => setEditingProduct({...editingProduct, price_sar: parseFloat(e.target.value)})}
                />
                <Input
                  type="number"
                  placeholder="المخزون"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select value={editingProduct.category || ''} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصنف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="نسبة العمولة %"
                  value={editingProduct.commission_rate}
                  onChange={(e) => setEditingProduct({...editingProduct, commission_rate: parseFloat(e.target.value)})}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      await onUpdateProduct(editingProduct.id, {
                        title: editingProduct.title,
                        description: editingProduct.description,
                        price_sar: Number(editingProduct.price_sar) || 0,
                        stock: Number(editingProduct.stock) || 0,
                        category: editingProduct.category || null,
                        commission_rate: Number(editingProduct.commission_rate) || 0,
                      });
                      setEditingProduct(null);
                      onRefresh();
                    } catch (error) {
                      console.error('Error updating product:', error);
                    }
                  }}
                  disabled={loading}
                >
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
