import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuickViewModal } from './QuickViewModal';
import dressBeige from '@/assets/products/dress-beige.jpg';
import dressBlue from '@/assets/products/dress-blue.jpg';
import dressGreen from '@/assets/products/dress-green.jpg';
import dressPink from '@/assets/products/dress-pink.jpg';
import bagBrown from '@/assets/products/bag-brown.jpg';
import shoesBeige from '@/assets/products/shoes-beige.jpg';

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

const productImages = [dressPink, dressBeige, dressBlue, dressGreen, bagBrown, shoesBeige];

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
