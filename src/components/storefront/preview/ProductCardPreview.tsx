import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardPreviewProps {
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  inStock?: boolean;
}

export const ProductCardPreview = ({ 
  title, 
  price, 
  originalPrice,
  rating,
  reviews,
  badge,
  inStock = true
}: ProductCardPreviewProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-2xl"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/20 to-background">
        {/* Placeholder Image */}
        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-luxury/10 to-premium/10 flex items-center justify-center">
          <ShoppingCart className="w-20 h-20 text-primary/30" />
        </div>

        {/* Image Overlay on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-2"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ delay: 0.1 }}
              >
                <Button 
                  size="icon" 
                  className="rounded-full shadow-lg hover-scale"
                  onClick={() => setShowQuickView(true)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ delay: 0.15 }}
              >
                <Button size="icon" className="rounded-full shadow-lg hover-scale bg-gradient-luxury">
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {badge && (
            <Badge className="bg-gradient-luxury shadow-lg">
              {badge}
            </Badge>
          )}
          {!inStock && (
            <Badge variant="destructive" className="shadow-lg">
              نفذ من المخزون
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 left-3 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors"
        >
          <Heart 
            className={cn(
              "w-5 h-5 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        </motion.button>

        {/* Stock Status Bar */}
        {inStock && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center gap-2 text-white text-xs">
              <div className="flex-1 bg-white/30 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-success h-full rounded-full"
                />
              </div>
              <span className="font-medium">متبقي 15 قطعة</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2 justify-end">
          <span className="text-sm text-muted-foreground">({reviews})</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(rating) 
                    ? "fill-luxury text-luxury" 
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-right line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button 
            size="sm" 
            className="hover-scale"
            disabled={!inStock}
          >
            <ShoppingCart className="w-4 h-4 ml-2" />
            أضف للسلة
          </Button>

          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {price} ر.س
            </div>
            {originalPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {originalPrice} ر.س
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
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
          description: "منتج فريد وعالي الجودة مصمم خصيصاً لتلبية احتياجاتك. مصنوع من أفضل المواد مع ضمان الجودة والأصالة."
        }}
      />
    </motion.div>
  );
};
