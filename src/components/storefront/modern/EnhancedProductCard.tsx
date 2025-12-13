import { motion } from 'framer-motion';
import { UnifiedCard, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Heart, Eye, Star, ShoppingBag } from 'lucide-react';

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

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}

export const EnhancedProductCard = ({
  product,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  isInWishlist
}: EnhancedProductCardProps) => {
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock && product.stock <= 5 && product.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <UnifiedCard 
        variant="glass" 
        className="group overflow-hidden h-full flex flex-col hover:shadow-[0_12px_40px_rgba(90,38,71,0.12)] hover:border-primary/30 transition-all duration-300 bg-card"
      >
        {/* Image Section */}
        <div 
          className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-secondary/20 cursor-pointer"
          onClick={() => onProductClick(product)}
        >
          <motion.img
            src={product.image_urls?.[0] || '/placeholder.svg'}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Quick Actions Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent flex items-end justify-center pb-4 gap-2"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <UnifiedButton
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductClick(product);
                }}
                className="shadow-lg bg-background/95 backdrop-blur-sm text-foreground hover:bg-background h-10 w-10 p-0"
              >
                <Eye className="h-4 w-4" />
              </UnifiedButton>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <UnifiedButton
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                className={`shadow-lg backdrop-blur-sm h-10 w-10 p-0 ${
                  isInWishlist 
                    ? 'bg-destructive/90 text-destructive-foreground hover:bg-destructive' 
                    : 'bg-background/95 text-foreground hover:bg-background'
                }`}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </UnifiedButton>
            </motion.div>
          </motion.div>

          {/* Wishlist Button - Always visible on mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`sm:hidden absolute top-3 left-3 p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors ${
              isInWishlist 
                ? 'bg-destructive/90 text-destructive-foreground' 
                : 'bg-background/80 text-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <UnifiedBadge 
                  variant="error" 
                  className="shadow-lg font-bold bg-accent text-accent-foreground text-xs px-2"
                >
                  {product.discount_percentage}%−
                </UnifiedBadge>
              </motion.div>
            )}
            {isOutOfStock && (
              <UnifiedBadge variant="secondary" className="shadow-lg bg-muted text-muted-foreground text-xs">
                نفد
              </UnifiedBadge>
            )}
            {isLowStock && (
              <UnifiedBadge variant="warning" className="shadow-lg text-xs">
                {product.stock} فقط
              </UnifiedBadge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <UnifiedCardContent className="flex-1 flex flex-col p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Category Tag */}
          {product.category && (
            <span className="text-xs text-primary/80 font-medium">
              {product.category}
            </span>
          )}
          
          {/* Title */}
          <h3 
            className="font-bold text-sm sm:text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            {product.title}
          </h3>

          {/* Rating */}
          {product.average_rating && product.average_rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                      star <= Math.round(product.average_rating || 0)
                        ? 'fill-accent text-accent'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.total_reviews || 0})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            <span className="text-lg sm:text-xl font-bold text-primary">
              {(product.final_price || product.price_sar).toFixed(0)}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">ر.س</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through mr-1">
                {product.price_sar.toFixed(0)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <UnifiedButton 
            onClick={() => onAddToCart(product)}
            variant="primary"
            className="w-full shadow-md hover:shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm"
            size="md"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? (
              'نفد المخزون'
            ) : (
              <>
                <ShoppingBag className="h-4 w-4 ml-1.5" />
                <span className="hidden sm:inline">أضف للسلة</span>
                <span className="sm:hidden">أضف</span>
              </>
            )}
          </UnifiedButton>
        </UnifiedCardContent>
      </UnifiedCard>
    </motion.div>
  );
};
