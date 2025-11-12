import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, Heart, ShoppingCart, Percent, Package, Plus } from "lucide-react";
import { motion } from "framer-motion";

export interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  image_urls: string[];
  stock: number;
  category: string;
  variants?: any[];
  commission_amount?: number;
  final_price?: number;
  average_rating?: number;
  total_reviews?: number;
  discount_percentage?: number;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductCard = ({
  product,
  index,
  onQuickView,
  onToggleWishlist,
  onAddToCart,
  isWishlisted
}: ProductCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.1,
        type: "spring",
        stiffness: 300
      }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card rounded-2xl">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden gradient-bg-muted">
          {product.image_urls && product.image_urls.length > 0 ? (
            <img
              src={product.image_urls[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 md:h-20 w-16 md:w-20 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <Badge className="absolute top-2 md:top-3 right-2 md:right-3 bg-danger hover:bg-danger text-white animate-pulse shadow-lg">
              <Percent className="h-3 w-3 mr-1" />
              {product.discount_percentage}%
            </Badge>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 gradient-overlay opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onQuickView(product)}
              className="backdrop-blur-md hover:scale-110 transition-transform shadow-lg rounded-xl"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onToggleWishlist(product.id)}
              className="backdrop-blur-md hover:scale-110 transition-transform shadow-lg rounded-xl"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-danger text-danger' : ''}`} />
            </Button>
            <Button 
              size="sm"
              onClick={() => onAddToCart(product)}
              className="backdrop-blur-md hover:scale-110 transition-transform shadow-lg rounded-xl"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-6 py-2 font-bold">
                نفد المخزون
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 md:p-5 space-y-3 md:space-y-4">
          {/* Product Info */}
          <div className="space-y-1.5 md:space-y-2">
            <h3 className="font-bold text-base md:text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Rating */}
          {product.average_rating && product.average_rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
                      star <= Math.round(product.average_rating || 0)
                        ? 'fill-warning text-warning'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm text-muted-foreground">
                ({product.total_reviews || 0})
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  {(product.final_price || product.price_sar).toFixed(0)}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">ريال</span>
              </div>
              {product.discount_percentage && product.discount_percentage > 0 && (
                <span className="text-xs md:text-sm text-muted-foreground line-through">
                  {product.price_sar.toFixed(0)} ریال
                </span>
              )}
            </div>
            
            {product.stock && product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="text-xs border-warning text-warning">
                {product.stock} متبقي
              </Badge>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <Button 
            onClick={() => onAddToCart(product)}
            className="w-full group/btn gradient-btn-primary transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl font-semibold"
            size="lg"
            disabled={product.stock === 0}
          >
            <Plus className="h-4 w-4 mr-2 group-hover/btn:scale-125 transition-transform" />
            {product.variants && product.variants.length > 0 ? 'عرض الخيارات' : 'إضافة للسلة'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
