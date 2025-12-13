import { motion } from 'framer-motion';
import { EnhancedProductCard } from './EnhancedProductCard';
import { Package } from 'lucide-react';

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

interface EnhancedProductGridProps {
  products: Product[];
  wishlist: string[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isLoading?: boolean;
}

// Skeleton Card for Loading State
const ProductSkeleton = () => (
  <div className="bg-card rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[4/5] sm:aspect-square bg-muted" />
    <div className="p-3 sm:p-4 space-y-3">
      <div className="h-3 bg-muted rounded w-1/4" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="flex items-center gap-2">
        <div className="h-5 bg-muted rounded w-16" />
        <div className="h-4 bg-muted rounded w-8" />
      </div>
      <div className="h-10 bg-muted rounded w-full" />
    </div>
  </div>
);

export const EnhancedProductGrid = ({
  products,
  wishlist,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  isLoading = false
}: EnhancedProductGridProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  // Loading State with Skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty State
  if (!products || products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 sm:py-16 md:py-20"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Package className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          لا توجد منتجات
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
          لم يتم العثور على منتجات مطابقة لبحثك. جرّبي تعديل الفلاتر أو البحث بكلمات مختلفة.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <EnhancedProductCard
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            isInWishlist={wishlist.includes(product.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
