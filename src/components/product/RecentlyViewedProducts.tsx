import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

/**
 * 👁️ مكون عرض المنتجات المشاهدة مؤخراً
 *
 * يعرض carousel أفقي للمنتجات التي شاهدها المستخدم مؤخراً
 * مع إمكانية التمرير والحذف
 */

export function RecentlyViewedProducts() {
  const { viewedProducts, removeProduct, clearAll, count } = useRecentlyViewed();
  const { t, direction } = useLanguage();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // لا تعرض القسم إذا لم يكن هناك منتجات
  if (count === 0) return null;

  /**
   * التنقل لصفحة المنتج
   */
  const handleProductClick = (product: any) => {
    if (product.store_slug) {
      navigate(`/${product.store_slug}/product/${product.id}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  /**
   * التمرير للأمام/للخلف
   */
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  /**
   * تحديث حالة الأسهم عند التمرير
   */
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="my-8">
      <Card className="bg-card text-card-foreground border-border">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">
                {direction === 'rtl' ? 'شاهدت مؤخراً' : 'Recently Viewed'}
              </h2>
              <span className="text-sm text-muted-foreground">({count})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground hover:text-foreground"
            >
              {direction === 'rtl' ? 'مسح الكل' : 'Clear All'}
            </Button>
          </div>

          {/* Products Carousel */}
          <div className="relative">
            {/* Left Arrow */}
            {showLeftArrow && (
              <Button
                variant="outline"
                size="icon"
                className={`absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm`}
                onClick={() => scroll(direction === 'rtl' ? 'right' : 'left')}
              >
                {direction === 'rtl' ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Right Arrow */}
            {showRightArrow && (
              <Button
                variant="outline"
                size="icon"
                className={`absolute ${direction === 'rtl' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm`}
                onClick={() => scroll(direction === 'rtl' ? 'left' : 'right')}
              >
                {direction === 'rtl' ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {viewedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-48 group relative"
                >
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProduct(product.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Product Card */}
                  <div
                    onClick={() => handleProductClick(product)}
                    className="cursor-pointer"
                  >
                    {/* Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                      <img
                        src={product.image_url || '/placeholder-product.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm font-bold text-primary">
                        {product.price} {direction === 'rtl' ? 'ريال' : 'SAR'}
                      </p>
                      {product.category && (
                        <p className="text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
