import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, CheckCircle, Plus, Check, Eye } from 'lucide-react';
import { ProductVariantDisplay } from '@/components/products/ProductVariantDisplay';
import type { Product } from '../hooks/useProductsData';

interface ProductCardProps {
  product: Product;
  isInMyStore: boolean;
  isProcessing: boolean;
  showStoreActions: boolean;
  onAddToStore: (product: Product) => void;
  onRemoveFromStore: (productId: string) => void;
  onViewDetails: (product: Product) => void;
}

/**
 * بطاقة منتج (Grid View)
 * تعرض المنتج في عرض شبكي مع صورة، تفاصيل، وأزرار إجراءات
 */
export function ProductCard({
  product,
  isInMyStore,
  isProcessing,
  showStoreActions,
  onAddToStore,
  onRemoveFromStore,
  onViewDetails,
}: ProductCardProps) {
  return (
    <Card className="bg-white border border-anaqati-border rounded-xl shadow-anaqati hover:shadow-anaqati-hover transition-all duration-300 group overflow-hidden">
      {/* صورة المنتج */}
      <div className="relative aspect-square overflow-hidden bg-anaqati-product-bg rounded-t-xl">
        <img
          src={
            (Array.isArray(product.images) && product.images[0]?.url) ||
            (Array.isArray(product.image_urls) && product.image_urls[0]) ||
            '/placeholder.svg'
          }
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* شارة التاجر */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            <Store className="h-3 w-3 ml-1" />
            {product.merchants?.business_name}
          </Badge>
        </div>

        {/* حالة المنتج في متجري */}
        {isInMyStore && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 ml-1" />
              في متجري
            </Badge>
          </div>
        )}

        {/* تنبيه المخزون */}
        {product.stock <= 10 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm">
              باقي {product.stock}
            </Badge>
          </div>
        )}
      </div>

      {/* تفاصيل المنتج */}
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold mb-1 line-clamp-1 text-anaqati-text">{product.title}</h3>
            <p className="text-sm text-anaqati-text-secondary line-clamp-2">{product.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-primary">{product.price_sar} ريال</div>
              <div className="text-xs text-anaqati-text-secondary">
                العمولة: {product.merchants?.default_commission_rate || 10}%
              </div>
            </div>
            <Badge variant="outline" className="text-xs border-anaqati-border">
              {product.category}
            </Badge>
          </div>

          {/* عرض المتغيرات */}
          {product.variants && product.variants.length > 0 && (
            <div className="pt-2 border-t">
              <ProductVariantDisplay variants={product.variants} compact={true} />
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-2 pt-2">
            {showStoreActions && (
              <>
                {isInMyStore ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveFromStore(product.id)}
                    disabled={isProcessing}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                    ) : (
                      <>
                        <Check className="h-3 w-3 ml-1" />
                        حذف من متجري
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onAddToStore(product)}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-primary"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    ) : (
                      <>
                        <Plus className="h-3 w-3 ml-1" />
                        إضافة لمتجري
                      </>
                    )}
                  </Button>
                )}
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => onViewDetails(product)}>
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
