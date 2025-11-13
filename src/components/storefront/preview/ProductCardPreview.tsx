import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardPreviewProps {
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  inStock?: boolean;
  id: number;
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
  id
}: ProductCardPreviewProps) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const productImage = productImages[(id - 1) % productImages.length];

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        onClick={() => setShowQuickView(true)}
        className="group cursor-pointer bg-card rounded-xl overflow-hidden"
      >
        {/* Image - Simple and Clean */}
        <div className="relative aspect-[3/4] bg-surface overflow-hidden">
          <img 
            src={productImage} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Info - Minimal */}
        <div className="p-4 space-y-2 text-center">
          <h3 className="font-medium text-fg text-sm">
            {title}
          </h3>
          <p className="text-lg font-semibold text-fg-muted">
            {price} ر.س
          </p>
        </div>
      </motion.div>

      <QuickViewModal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={{
          title,
          price,
          originalPrice,
          rating,
          reviews,
          badge,
          inStock,
          image: productImage
        }}
      />
    </>
  );
};
