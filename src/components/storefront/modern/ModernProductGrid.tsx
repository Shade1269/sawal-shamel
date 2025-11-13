import { motion } from 'framer-motion';
import { ModernProductCard } from './ModernProductCard';

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

interface ModernProductGridProps {
  products: Product[];
  wishlist: string[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
}

export const ModernProductGrid = ({
  products,
  wishlist,
  onAddToCart,
  onProductClick,
  onToggleWishlist
}: ModernProductGridProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">لا توجد منتجات متاحة</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ModernProductCard
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
