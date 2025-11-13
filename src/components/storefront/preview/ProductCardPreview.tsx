import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface ProductCardPreviewProps {
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  inStock?: boolean;
  id: number;
  onProductClick?: () => void;
  onAddToCart?: () => void;
}

const productImages = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop', // Pink dress
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop', // Beige dress
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', // Blue dress
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop', // Green dress
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop', // Brown bag
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop'  // Beige shoes
];

export const ProductCardPreview = ({
  title,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
  inStock = true,
  id,
  onProductClick,
  onAddToCart
}: ProductCardPreviewProps) => {
  const productImage = productImages[(id - 1) % productImages.length];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group bg-card rounded-xl overflow-hidden"
    >
      {/* Image - Simple and Clean */}
      <div 
        className="relative aspect-[3/4] bg-surface overflow-hidden cursor-pointer"
        onClick={onProductClick}
      >
        <img 
          src={productImage} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info - Minimal with better contrast */}
      <div className="p-5 space-y-3 text-center bg-card">
        <div 
          className="cursor-pointer"
          onClick={onProductClick}
        >
          <h3 className="font-medium text-foreground text-base leading-snug">
            {title}
          </h3>
          <p className="text-xl font-bold text-foreground mt-2">
            {price} ر.س
          </p>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          أضف للسلة
        </button>
      </div>
    </motion.div>
  );
};
