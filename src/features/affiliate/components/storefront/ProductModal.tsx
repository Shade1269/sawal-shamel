import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImageCarousel } from "@/features/commerce/components/ProductImageCarousel";
import { ProductVariantSelector } from "@/components/products/ProductVariantSelector";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Star, Package, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";

export interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  image_urls: string[];
  stock: number;
  category: string;
  variants?: ProductVariant[];
  commission_amount?: number;
  final_price?: number;
  average_rating?: number;
  total_reviews?: number;
  discount_percentage?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size?: string | null;
  color?: string | null;
  available_stock: number;
  current_stock: number;
  selling_price?: number;
  variant_name?: string;
  is_active: boolean;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
}

export const ProductModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  wishlist
}: ProductModalProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  if (!product) return null;

  const handleAddToCart = () => {
    // التحقق من المتغيرات إذا كانت موجودة
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setVariantError("الرجاء اختيار الخيارات المطلوبة");
      return;
    }

    onAddToCart(product, selectedVariant || undefined);
    setVariantError(null);
    onClose();
  };

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setVariantError(null);
  };

  const isInWishlist = wishlist.includes(product.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">تفاصيل المنتج</TabsTrigger>
            <TabsTrigger value="reviews">
              المراجعات ({product.total_reviews || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <ProductImageCarousel 
                      images={product.image_urls} 
                      productTitle={product.title} 
                    />
                  ) : (
                    <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                      <Package className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-3">{product.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

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
                    <span className="text-lg font-medium">{product.average_rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({product.total_reviews} تقييم)
                    </span>
                  </div>
                )}
                
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-primary">
                      {(product.final_price || product.price_sar).toFixed(0)} ريال
                    </span>
                    {product.discount_percentage && product.discount_percentage > 0 && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">
                          {product.price_sar.toFixed(0)} ريال
                        </span>
                        <Badge className="gradient-danger">
                          خصم {product.discount_percentage}%
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  {product.stock && product.stock <= 5 && product.stock > 0 && (
                    <Badge variant="outline" className="border-warning text-warning">
                      تبقى {product.stock} فقط في المخزون!
                    </Badge>
                  )}
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-3">
                    <ProductVariantSelector
                      variants={product.variants}
                      onVariantChange={handleVariantChange}
                    />
                    {variantError && (
                      <p className="text-sm text-destructive">{variantError}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 h-12 text-lg gradient-btn-primary"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.stock === 0 ? 'نفد من المخزون' : 'إضافة للسلة'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onToggleWishlist(product.id)}
                    className="h-12"
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                </div>

                {/* Product Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">التصنيف</p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">المخزون</p>
                    <p className="font-medium">
                      {product.stock > 0 ? `${product.stock} متوفر` : 'غير متوفر'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection productId={product.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
