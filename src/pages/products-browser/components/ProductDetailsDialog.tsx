import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { ProductVariantDisplay } from '@/components/products/ProductVariantDisplay';
import type { Product } from '../hooks/useProductsData';

interface ProductDetailsDialogProps {
  product: Product | null;
  isInMyStore: boolean;
  onClose: () => void;
  onAddToStore: (product: Product) => void;
  onRemoveFromStore: (productId: string) => void;
  showStoreActions: boolean;
}

/**
 * Dialog لعرض تفاصيل المنتج كاملة
 * يعرض جميع معلومات المنتج بما في ذلك الصور، السعر، المتغيرات، والمعلومات الإضافية
 */
export function ProductDetailsDialog({
  product,
  isInMyStore,
  onClose,
  onAddToStore,
  onRemoveFromStore,
  showStoreActions,
}: ProductDetailsDialogProps) {
  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل المنتج</DialogTitle>
        </DialogHeader>
        {product && (
          <div className="space-y-6">
            {/* صور المنتج */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(product.image_urls || []).map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {(!product.image_urls || product.image_urls.length === 0) && (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* معلومات المنتج */}
            <div>
              <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* السعر والعمولة */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">السعر</p>
                <p className="text-2xl font-bold text-primary">{product.price_sar} ر.س</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">العمولة</p>
                <p className="text-2xl font-bold text-green-600">
                  {product.merchants?.default_commission_rate || 10}%
                </p>
              </div>
            </div>

            {/* المتغيرات */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">المتغيرات المتاحة</h4>
                <ProductVariantDisplay variants={product.variants} compact={false} />
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">الفئة:</span>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">المخزون:</span>
                <p className="font-medium">{product.stock}</p>
              </div>
              <div>
                <span className="text-muted-foreground">التاجر:</span>
                <p className="font-medium">{product.merchants?.business_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">عدد المشاهدات:</span>
                <p className="font-medium">{product.view_count || 0}</p>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 pt-4">
              {showStoreActions &&
                (isInMyStore ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onRemoveFromStore(product.id);
                      onClose();
                    }}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    حذف من متجري
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      onAddToStore(product);
                      onClose();
                    }}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة لمتجري
                  </Button>
                ))}
              <Button variant="outline" onClick={onClose} className="flex-1">
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
