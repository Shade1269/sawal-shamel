import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * 🖼️ معرض صور محسّن مع Zoom و Lightbox
 *
 * يوفر تجربة عرض صور احترافية مع:
 * - عرض صورة رئيسية كبيرة
 * - صور مصغرة للتنقل
 * - Lightbox بملء الشاشة
 * - Zoom على الصورة
 * - التنقل بالأسهم
 */

interface EnhancedImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function EnhancedImageGallery({
  images = [],
  productName,
  className = '',
}: EnhancedImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // إذا لم تكن هناك صور، عرض placeholder
  const displayImages = images.length > 0 ? images : ['/placeholder-product.png'];
  const currentImage = displayImages[currentIndex];

  /**
   * التنقل للصورة التالية
   */
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    setIsZoomed(false);
  };

  /**
   * التنقل للصورة السابقة
   */
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    setIsZoomed(false);
  };

  /**
   * التنقل لصورة معينة
   */
  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  /**
   * فتح Lightbox
   */
  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  /**
   * إغلاق Lightbox
   */
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
  };

  return (
    <>
      {/* معرض الصور الرئيسي */}
      <div className={cn('space-y-4', className)}>
        {/* الصورة الرئيسية */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={currentImage}
              alt={`${productName} - صورة ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* أزرار التحكم - تظهر عند Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
            {/* زر Zoom / Lightbox */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={openLightbox}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* أسهم التنقل */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* مؤشر عدد الصور */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* الصور المصغرة */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                  index === currentIndex
                    ? 'border-primary scale-105'
                    : 'border-transparent hover:border-border'
                )}
              >
                <img
                  src={image}
                  alt={`${productName} - مصغرة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* زر الإغلاق */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* الصورة */}
            <div
              className={cn(
                'relative max-w-full max-h-full transition-transform duration-300 cursor-zoom-in',
                isZoomed && 'scale-150 cursor-zoom-out'
              )}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={currentImage}
                alt={`${productName} - صورة ${currentIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>

            {/* أسهم التنقل */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* مؤشر الصور السفلي */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                    )}
                  />
                ))}
              </div>
            )}

            {/* زر Zoom */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 left-4 gap-2"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <ZoomIn className="h-4 w-4" />
              {isZoomed ? 'تصغير' : 'تكبير'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
