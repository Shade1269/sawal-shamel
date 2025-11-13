import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <Card className="group overflow-hidden border border-border/50 bg-card hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Image Section */}
        <div 
          className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
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
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
              className="shadow-lg"
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className={`shadow-lg ${isInWishlist ? 'bg-destructive text-destructive-foreground' : ''}`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
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
            {product.stock && product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="shadow-lg bg-background border-warning text-warning">
                {product.stock} متبقي
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 flex flex-col p-4 space-y-3">
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
                        ? 'fill-warning text-warning'
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
          <Button 
            onClick={() => onAddToCart(product)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            size="lg"
            disabled={product.stock === 0}
          >
            <Plus className="h-5 w-5 ml-2" />
            أضف للسلة
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
