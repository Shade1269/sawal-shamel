import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description?: string;
  price_sar: number;
  image_urls?: string[];
  stock: number;
  category?: string;
  average_rating?: number;
  total_reviews?: number;
  discount_percentage?: number;
  variants?: any[];
}

interface StorefrontProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  variant?: "default" | "compact" | "featured";
}

export const StorefrontProductCard = ({
  product,
  isInWishlist = false,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  variant = "default",
}: StorefrontProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasVariants = product.variants && product.variants.length > 0;
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = (product.discount_percentage ?? 0) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProductClick(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          "group overflow-hidden cursor-pointer transition-all duration-300 bg-white border border-anaqati-border rounded-xl shadow-anaqati hover:shadow-anaqati-hover hover:border-primary/40",
          isOutOfStock && "opacity-60"
        )}
        onClick={() => onProductClick(product)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-anaqati-product-bg rounded-t-xl">
          {/* Image */}
          {product.image_urls && product.image_urls[0] ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
              )}
              <img
                src={product.image_urls[0]}
                alt={product.title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
                  "group-hover:scale-110"
                )}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="bg-anaqati-danger text-white font-bold shadow-lg">
                -{product.discount_percentage}%
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="shadow-lg bg-anaqati-danger">
                نفذت الكمية
              </Badge>
            )}
            {!isOutOfStock && product.stock <= 5 && (
              <Badge className="bg-anaqati-warning text-white shadow-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                {product.stock} متبقي
              </Badge>
            )}
          </div>

          {/* Quick Actions - Show on hover */}
          <div
            className={cn(
              "absolute top-2 left-2 flex flex-col gap-2 transition-all duration-300",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}
          >
            {onToggleWishlist && (
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full shadow-lg backdrop-blur"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isInWishlist && "fill-destructive text-destructive"
                  )}
                />
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-lg backdrop-blur"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Add to Cart - Bottom overlay on hover */}
          {!hasVariants && !isOutOfStock && (
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent transition-all duration-300",
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
              )}
            >
              <Button
                size="sm"
                className="w-full shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                أضف للسلة
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4 space-y-2">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-anaqati-text-secondary uppercase tracking-wide">
              {product.category}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 min-h-[2.5rem] text-anaqati-text group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Description - Only for featured variant */}
          {variant === "featured" && product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Rating */}
          {product.average_rating && product.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3 w-3",
                      star <= Math.round(product.average_rating ?? 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.total_reviews ?? 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-primary">
                {product.price_sar.toFixed(2)} ر.س
              </span>
              {hasDiscount && (
                <span className="text-xs text-anaqati-text-secondary line-through">
                  {(product.price_sar / (1 - (product.discount_percentage ?? 0) / 100)).toFixed(2)} ر.س
                </span>
              )}
            </div>

            {/* Add to Cart Button - Always visible on mobile */}
            {hasVariants ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleQuickView}
                className="md:hidden"
              >
                اختر الخيارات
              </Button>
            ) : (
              !isOutOfStock && (
                <Button
                  size="icon"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="md:hidden h-9 w-9"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )
            )}
          </div>

          {/* Variants indicator */}
          {hasVariants && (
            <div className="flex items-center gap-1 pt-1">
              <Badge variant="secondary" className="text-xs">
                خيارات متعددة
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
