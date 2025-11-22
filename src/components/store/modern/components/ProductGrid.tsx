import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, Zap, Percent } from 'lucide-react';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { UnifiedCard, UnifiedCardContent } from '@/components/design-system';

interface Product {
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
  rating?: number;
  reviews_count?: number;
  discount_percentage?: number;
}

interface ProductVariant {
  id: string;
  variant_type: string;
  variant_value: string;
  stock: number;
  price_modifier: number;
}

interface ProductGridProps {
  products: Product[];
  wishlist: string[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onToggleWishlist: (productId: string) => void;
}

export const ProductGrid = ({ 
  products, 
  wishlist, 
  onProductClick, 
  onAddToCart, 
  onToggleWishlist 
}: ProductGridProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item}>
          <UnifiedCard variant="glass" className="group overflow-hidden hover:shadow-2xl transition-all duration-500 gradient-bg-card">
            <div className="relative overflow-hidden">
              {/* Product Image */}
              <div 
                className="aspect-square cursor-pointer overflow-hidden gradient-card-muted"
                onClick={() => onProductClick(product)}
              >
                {product.image_urls?.[0] ? (
                  <img
                    src={product.image_urls[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-sm">لا توجد صورة</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-foreground/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <UnifiedButton
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(product);
                    }}
                    className="bg-background/90 hover:bg-background shadow-lg backdrop-blur-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    عرض
                  </UnifiedButton>
                  <UnifiedButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="shadow-lg backdrop-blur-sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    أضف
                  </UnifiedButton>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.discount_percentage && product.discount_percentage > 0 && (
                  <UnifiedBadge variant="error" className="shadow-lg animate-pulse">
                    <Percent className="h-3 w-3 mr-1" />
                    -{product.discount_percentage}%
                  </UnifiedBadge>
                )}
                {product.stock < 5 && product.stock > 0 && (
                  <UnifiedBadge variant="warning" className="bg-orange-100 text-orange-700 border-orange-300">
                    <Zap className="h-3 w-3 mr-1" />
                    كمية محدودة
                  </UnifiedBadge>
                )}
                {product.stock === 0 && (
                  <UnifiedBadge variant="secondary">
                    نفد المخزون
                  </UnifiedBadge>
                )}
              </div>

              {/* Wishlist Button */}
              <UnifiedButton
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                className="absolute top-3 right-3 p-2 h-auto bg-background/80 hover:bg-background shadow-lg backdrop-blur-sm"
              >
                <Heart 
                  className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'} transition-colors`} 
                />
              </UnifiedButton>
            </div>

            <UnifiedCardContent className="p-4 space-y-3">
              {/* Category */}
              <UnifiedBadge variant="outline" className="text-xs">
                {product.category}
              </UnifiedBadge>

              {/* Product Title */}
              <h3 
                className="font-semibold text-lg leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => onProductClick(product)}
              >
                {product.title}
              </h3>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating!) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    ({product.reviews_count} تقييم)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">
                      {product.final_price || product.price_sar} ر.س
                    </span>
                    {product.discount_percentage && product.discount_percentage > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {Math.round(product.price_sar / (1 - product.discount_percentage / 100))} ر.س
                      </span>
                    )}
                  </div>
                  {product.stock > 0 && (
                    <p className="text-xs text-muted-foreground">
                      متوفر {product.stock} قطعة
                    </p>
                  )}
                </div>

                <UnifiedButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  disabled={product.stock === 0}
                  className="shrink-0"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {product.stock === 0 ? 'نفد' : 'أضف'}
                </UnifiedButton>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        </motion.div>
      ))}
    </motion.div>
  );
};