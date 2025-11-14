import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Star, ShoppingCart, Heart, Share2, Package, CheckCircle } from 'lucide-react';
import { ProductImageCarousel } from '@/features/commerce/components/ProductImageCarousel';
import { ProductVariantSelector } from '@/components/products/ProductVariantSelector';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  image_urls: string[];
  stock: number;
  category: string;
  variants?: any[];
  final_price?: number;
  average_rating?: number;
  total_reviews?: number;
  discount_percentage?: number;
}

interface ModernProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  selectedVariant: any;
  onVariantChange: (variantId: string | null) => void;
  variantError: string | null;
  storeId?: string;
  customerId?: string | null;
}

export const ModernProductModal = ({
  product,
  open,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  selectedVariant,
  onVariantChange,
  variantError,
  storeId,
  customerId
}: ModernProductModalProps) => {
  if (!product) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 bg-background border-border">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-muted p-6 md:p-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Badges */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              {product.discount_percentage && product.discount_percentage > 0 && (
                <Badge variant="destructive" className="shadow-lg font-bold">
                  {product.discount_percentage}% خصم
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary" className="shadow-lg">
                  نفد المخزون
                </Badge>
              )}
            </div>

            <ProductImageCarousel images={product.image_urls} productTitle={product.title} variants={product.variants} />
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader>
              <div className="space-y-3">
                <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {product.title}
                </DialogTitle>

                {/* Rating */}
                {product.average_rating && product.average_rating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(product.average_rating || 0)
                              ? 'fill-warning text-warning'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.total_reviews || 0} تقييم)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    {(product.final_price || product.price_sar).toFixed(0)}
                  </span>
                  <span className="text-lg text-muted-foreground">ريال</span>
                  {product.discount_percentage && product.discount_percentage > 0 && (
                    <span className="text-lg text-muted-foreground line-through">
                      {product.price_sar.toFixed(0)} ريال
                    </span>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <Tabs defaultValue="description" dir="rtl">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">الوصف</TabsTrigger>
                <TabsTrigger value="details">التفاصيل</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4 mt-4">
                <p className="text-muted-foreground leading-relaxed text-right">
                  {product.description}
                </p>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-3 mt-4" dir="rtl">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">الفئة:</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    {product.stock > 0 ? `متوفر: ${product.stock} قطعة` : 'نفد المخزون'}
                  </span>
                </div>
              </TabsContent>
            </Tabs>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-right">اختر المواصفات:</h4>
                <ProductVariantSelector
                  variants={product.variants}
                  onVariantChange={(variant) => onVariantChange(variant?.id || null)}
                />
                {variantError && (
                  <p className="text-sm text-destructive text-right">{variantError}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Button
                onClick={onAddToCart}
                disabled={product.stock === 0}
                className="w-full h-12 text-lg bg-primary hover:bg-primary/90 shadow-lg"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 ml-2" />
                {product.stock === 0 ? 'نفد المخزون' : 'أضف للسلة'}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => onToggleWishlist(product.id)}
                  className={`h-12 ${isInWishlist ? 'bg-destructive/10 text-destructive border-destructive' : ''}`}
                >
                  <Heart className={`h-5 w-5 ml-2 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'مضاف للمفضلة' : 'أضف للمفضلة'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-12"
                >
                  <Share2 className="h-5 w-5 ml-2" />
                  مشاركة
                </Button>
              </div>
            </div>

            {/* Reviews */}
            {customerId && (
              <div className="pt-6 border-t border-border">
                <ReviewsSection
                  productId={product.id}
                  currentUserId={customerId}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
