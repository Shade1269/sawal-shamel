import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShoppingCart, Minus, Plus, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  };
}

export const QuickViewModal = ({ isOpen, onClose, product }: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [1, 2, 3, 4]; // Placeholder images

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0" dir="rtl">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Images Section */}
          <div className="relative bg-gradient-to-br from-secondary/20 to-background p-8">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square bg-gradient-to-br from-primary/10 to-luxury/10 rounded-2xl mb-4 flex items-center justify-center overflow-hidden"
            >
              <ShoppingCart className="w-32 h-32 text-primary/30" />
              
              {/* Badges */}
              {product.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-luxury shadow-lg">
                  {product.badge}
                </Badge>
              )}

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-4 left-4 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isLiked ? "fill-red-500 text-red-500" : "text-foreground"
                  )}
                />
              </motion.button>
            </motion.div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "aspect-square bg-gradient-to-br from-primary/5 to-luxury/5 rounded-lg flex items-center justify-center border-2 transition-colors",
                    selectedImage === idx ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <ShoppingCart className="w-8 h-8 text-primary/30" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-right mb-2">
                {product.title}
              </DialogTitle>
            </DialogHeader>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-muted-foreground">({product.reviews} تقييم)</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < Math.floor(product.rating)
                        ? "fill-luxury text-luxury"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-lg">{product.rating}</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">{product.price} ر.س</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {product.originalPrice} ر.س
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      وفّر {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-success flex items-center gap-2">
                <Truck className="w-4 h-4" />
                شحن مجاني للطلبات فوق 500 ر.س
              </p>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-border">
              <h4 className="font-semibold mb-3 text-right">الوصف</h4>
              <p className="text-muted-foreground text-right leading-relaxed">
                {product.description || "منتج فريد وعالي الجودة مصمم خصيصاً لتلبية احتياجاتك. مصنوع من أفضل المواد مع ضمان الجودة والأصالة."}
              </p>
            </div>

            {/* Features */}
            <div className="mb-6 pb-6 border-b border-border space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium">ضمان الجودة</div>
                  <div className="text-xs text-muted-foreground">ضمان لمدة عام كامل</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium">توصيل سريع</div>
                  <div className="text-xs text-muted-foreground">من 2-5 أيام عمل</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-luxury/10 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-luxury" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium">سياسة إرجاع مرنة</div>
                  <div className="text-xs text-muted-foreground">إرجاع خلال 14 يوم</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-right">الكمية</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-background rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-background rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {product.inStock && (
                  <span className="text-sm text-success">متوفر في المخزون</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full text-lg bg-gradient-luxury hover-scale"
                disabled={!product.inStock}
              >
                <ShoppingCart className="ml-2" />
                أضف إلى السلة - {product.price * quantity} ر.س
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="hover-scale">
                  اشتر الآن
                </Button>
                <Button variant="outline" size="lg" className="hover-scale">
                  <Share2 className="ml-2 w-4 h-4" />
                  مشاركة
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>دفع آمن</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  <span>شحن مضمون</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" />
                  <span>إرجاع مجاني</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
