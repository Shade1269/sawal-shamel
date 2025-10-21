import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Edit, LayoutList, Loader2, Plus, Save, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type StoreCategory, type StoreCategoryBannerProduct } from '@/hooks/useStoreSettings';
import { cn } from '@/lib/utils';

interface CategoryEditDialogProps {
  category?: StoreCategory;
  isNew?: boolean;
  onSave: (category: Partial<StoreCategory>) => void;
  children?: React.ReactNode;
  products?: CategoryProductOption[];
  isLoadingProducts?: boolean;
}

interface CategoryProductOption {
  id: string;
  title: string;
  image_url?: string | null;
  category?: string | null;
}

export const CategoryEditDialog = ({
  category,
  isNew = false,
  onSave,
  children,
  products = [],
  isLoadingProducts = false
}: CategoryEditDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    isActive: category?.isActive ?? true,
    productCount: category?.productCount || category?.bannerProducts?.length || 0
  });
  const [selectedProducts, setSelectedProducts] = useState<StoreCategoryBannerProduct[]>(
    category?.bannerProducts ?? []
  );

  useEffect(() => {
    if (open) {
      setFormData({
        name: category?.name || '',
        isActive: category?.isActive ?? true,
        productCount: category?.productCount || category?.bannerProducts?.length || 0
      });
      setSelectedProducts(category?.bannerProducts ?? []);
    } else {
      setProductPickerOpen(false);
    }
  }, [open, category]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      productCount: prev.productCount || selectedProducts.length
    }));
  }, [selectedProducts]);

  const groupedProducts = useMemo<[string, CategoryProductOption[]][]>(() => {
    if (!products || products.length === 0) return [];

    const groups = new Map<string, CategoryProductOption[]>();

    products.forEach((product) => {
      const groupName = product.category || 'غير مصنف';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(product);
    });

    return Array.from(groups.entries()).map(([groupName, items]) => [
      groupName,
      [...items].sort((a, b) => a.title.localeCompare(b.title, 'ar'))
    ]);
  }, [products]);

  const toggleProductSelection = (product: CategoryProductOption) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          image_url: product.image_url ?? null,
          category: product.category ?? null
        }
      ];
    });
  };

  const removeSelectedProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearSelectedProducts = () => {
    setSelectedProducts([]);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive"
      });
      return;
    }

    const computedProductCount = formData.productCount || selectedProducts.length;

    onSave({
      id: category?.id || Date.now().toString(),
      name: formData.name.trim(),
      isActive: formData.isActive,
      productCount: computedProductCount,
      bannerProducts: selectedProducts
    });

    setOpen(false);
    toast({
      title: "تم الحفظ",
      description: isNew ? "تم إضافة الفئة بنجاح" : "تم تحديث الفئة بنجاح"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            {isNew ? <Plus className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'إضافة فئة جديدة' : 'تعديل الفئة'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">اسم الفئة</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="مثال: أزياء نسائية"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-count">عدد المنتجات</Label>
            <Input
              id="product-count"
              type="number"
              value={formData.productCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  productCount: Number.parseInt(e.target.value, 10) || 0
                }))
              }
              min="0"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-right sm:text-right">
                <Label>موديلات البنر</Label>
                <p className="text-xs text-muted-foreground">
                  اختر المنتجات التي ترغب بعرضها داخل البنر الطولي للفئة.
                </p>
              </div>
              <Sheet open={productPickerOpen} onOpenChange={setProductPickerOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LayoutList className="h-4 w-4 ml-2" />
                    اختيار موديلات البنر
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col">
                  <SheetHeader className="text-right">
                    <SheetTitle>اختيار موديلات البنر</SheetTitle>
                    <SheetDescription>
                      تصفح منتجات متجرك واختر العناصر التي ستظهر في البنر الطولي للفئة.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 py-4 flex flex-col gap-4">
                    {isLoadingProducts ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        جاري تحميل المنتجات...
                      </div>
                    ) : groupedProducts.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>تم اختيار {selectedProducts.length} منتج</span>
                          {selectedProducts.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearSelectedProducts}>
                              مسح الاختيار
                            </Button>
                          )}
                        </div>
                        <ScrollArea className="flex-1 pr-4">
                          <div className="space-y-6">
                            {groupedProducts.map(([groupName, groupProducts]) => (
                              <div key={groupName} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold">{groupName}</h4>
                                  <span className="text-xs text-muted-foreground">
                                    {groupProducts.length} منتج
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {groupProducts.map((product) => {
                                    const isSelected = selectedProducts.some(
                                      (item) => item.id === product.id
                                    );

                                    return (
                                      <div
                                        key={product.id}
                                        className={cn(
                                          'flex items-center gap-3 rounded-lg border p-3 text-right transition-colors cursor-pointer',
                                          isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:border-primary/60'
                                        )}
                                        onClick={() => toggleProductSelection(product)}
                                      >
                                        {product.image_url ? (
                                          <img
                                            src={product.image_url}
                                            alt={product.title}
                                            className="h-12 w-12 rounded-md object-cover"
                                          />
                                        ) : (
                                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{product.title}</p>
                                          {product.category && (
                                            <p className="text-xs text-muted-foreground">
                                              {product.category}
                                            </p>
                                          )}
                                        </div>
                                        <Checkbox checked={isSelected} className="pointer-events-none" />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </>
                    ) : (
                      <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
                        لا توجد منتجات متاحة حالياً للاختيار.
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {selectedProducts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((product) => (
                  <Badge key={product.id} variant="secondary" className="flex items-center gap-1">
                    <span>{product.title}</span>
                    <button
                      type="button"
                      className="rounded-full p-0.5 text-muted-foreground transition hover:text-destructive"
                      onClick={() => removeSelectedProduct(product.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-right">
                لم يتم اختيار أي منتجات بعد، استخدم زر الاختيار لاستعراض منتجات متجرك.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="category-active">فئة نشطة</Label>
            <Switch
              id="category-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            حفظ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};