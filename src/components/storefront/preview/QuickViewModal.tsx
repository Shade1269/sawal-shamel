import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UnifiedButton } from '@/components/design-system';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    description?: string;
    badge?: string;
    inStock?: boolean;
    image?: string;
  };
}

const sizes = [
  { value: 'S', label: 'S', available: true },
  { value: 'M', label: 'M', available: true },
  { value: 'L', label: 'L', available: true },
  { value: 'XL', label: 'XL', available: false }
];

const colors = [
  { value: 'beige', label: 'بيج', hex: '#F5F1EB', available: true },
  { value: 'gray', label: 'رمادي', hex: '#7A6E66', available: true },
  { value: 'brown', label: 'بني', hex: '#9A8374', available: true },
  { value: 'pink', label: 'وردي', hex: '#C4A99A', available: true }
];

export const QuickViewModal = ({ isOpen, onClose, product }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('beige');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-[#F5F1EB] border-2 border-border" dir="rtl">
        <div className="grid md:grid-cols-2 gap-8 p-8 bg-[#F5F1EB]">
          {/* Image Section - Right side */}
          <div className="space-y-4 order-2 md:order-1">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden border border-border">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <span className="text-6xl opacity-30">👗</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 cursor-pointer transition-colors">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={`${product.title} ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info - Left side with beige background */}
          <div className="space-y-6 order-1 md:order-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 text-right">
                {product.title}
              </h2>
              <p className="text-3xl font-bold text-gray-900 text-right">
                {product.price} ر.س
              </p>
            </div>

            {/* Size Selector */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-4 text-right text-gray-900 text-lg">المقاسات</h3>
              <div className="flex gap-3 justify-end flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => size.available && setSelectedSize(size.value)}
                    disabled={!size.available}
                    className={cn(
                      "w-14 h-14 rounded-lg border-2 font-bold text-base transition-all",
                      selectedSize === size.value
                        ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                        : "border-gray-300 bg-white text-gray-900 hover:border-blue-400",
                      !size.available && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-4 text-right text-gray-900 text-lg">اللون</h3>
              <div className="flex gap-3 justify-end flex-wrap">
                {colors.map((color) => (
                  <motion.button
                    key={color.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => color.available && setSelectedColor(color.value)}
                    disabled={!color.available}
                    className={cn(
                      "relative w-12 h-12 rounded-full border-3 transition-all shadow-md",
                      selectedColor === color.value
                        ? "border-blue-500 ring-4 ring-blue-500/30 ring-offset-2"
                        : "border-gray-300 hover:border-blue-400",
                      !color.available && "opacity-30 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: color.hex }}
                  >
                    {!color.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[2px] h-full bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <UnifiedButton 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-7 mt-8 shadow-lg"
            >
              أضف إلى السلة
            </UnifiedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
