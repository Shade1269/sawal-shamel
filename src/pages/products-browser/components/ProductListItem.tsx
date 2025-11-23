import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../hooks/useProductsData';

interface ProductListItemProps {
  product: Product;
  isInMyStore: boolean;
  isProcessing: boolean;
  showStoreActions: boolean;
  onAddToStore: (product: Product) => void;
  onRemoveFromStore: (productId: string) => void;
}

/**
 * عنصر منتج (List View)
 * تعرض المنتج في عرض قائمة أفقي مع صورة مصغرة وتفاصيل
 */
export function ProductListItem({
  product,
  isInMyStore,
  isProcessing,
  showStoreActions,
  onAddToStore,
  onRemoveFromStore,
}: ProductListItemProps) {
  return (
    <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* صورة مصغرة */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={
                (Array.isArray(product.images) && product.images[0]?.url) ||
                (Array.isArray(product.image_urls) && product.image_urls[0]) ||
                '/placeholder.svg'
              }
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* تفاصيل المنتج */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {product.merchants?.business_name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  {isInMyStore && (
                    <Badge className="bg-green-100 text-green-800 text-xs">في متجري</Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-primary">{product.price_sar} ريال</div>
                <div className="text-xs text-muted-foreground">
                  العمولة: {product.merchants?.default_commission_rate || 10}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1 ml-4">
                {product.description}
              </p>

              {showStoreActions && (
                <div className="flex gap-2">
                  {isInMyStore ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveFromStore(product.id)}
                      disabled={isProcessing}
                      className="border-red-200 text-red-600 hover:bg-red-50"
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
                      className="bg-gradient-primary"
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
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
