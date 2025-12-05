import { motion } from 'framer-motion';
import { UnifiedCard, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Plus, Heart, Eye, Star } from 'lucide-react';

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

interface ModernProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}

export const ModernProductCard = ({
  product,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  isInWishlist
}: ModernProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <UnifiedCard variant="glass" className="group overflow-hidden h-full flex flex-col hover:shadow-[0_8px_40px_rgba(90,38,71,0.1)] hover:border-primary/20 transition-all duration-300">
        {/* Image Section */}
        <div 
          className="relative aspect-square overflow-hidden bg-secondary/30 cursor-pointer"
          onClick={() => onProductClick(product)}
        >
          <img
            src={product.image_urls?.[0] || '/placeholder.svg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Overlay with Actions */}
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <UnifiedButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
              className="shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <Eye className="h-5 w-5" />
            </UnifiedButton>
            <UnifiedButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className={`shadow-lg ${isInWishlist ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </UnifiedButton>
          </div>

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.discount_percentage && product.discount_percentage > 0 && (
              <UnifiedBadge variant="error" className="shadow-lg font-bold bg-accent text-accent-foreground">
                {product.discount_percentage}% خصم
              </UnifiedBadge>
            )}
            {product.stock === 0 && (
              <UnifiedBadge variant="secondary" className="shadow-lg bg-muted text-muted-foreground">
                نفد المخزون
              </UnifiedBadge>
            )}
            {product.stock && product.stock <= 5 && product.stock > 0 && (
              <UnifiedBadge variant="warning" className="shadow-lg">
                {product.stock} متبقي
              </UnifiedBadge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <UnifiedCardContent className="flex-1 flex flex-col p-4 space-y-3">
          {/* Title */}
          <h3 
            className="font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            {product.title}
          </h3>

          {/* Rating */}
          {product.average_rating && product.average_rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.average_rating || 0)
                        ? 'fill-accent text-accent'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.total_reviews || 0})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-primary">
              {(product.final_price || product.price_sar).toFixed(0)}
            </span>
            <span className="text-sm text-muted-foreground font-medium">ريال</span>
            {product.discount_percentage && product.discount_percentage > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {product.price_sar.toFixed(0)} ريال
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <UnifiedButton 
            onClick={() => onAddToCart(product)}
            variant="primary"
            className="w-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            disabled={product.stock === 0}
          >
            <Plus className="h-5 w-5 ml-2" />
            أضف للسلة
          </UnifiedButton>
        </UnifiedCardContent>
      </UnifiedCard>
    </motion.div>
  );
};
