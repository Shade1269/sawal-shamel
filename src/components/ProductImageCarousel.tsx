import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImageCarouselProps {
  images: string[] | null;
  productTitle: string;
  className?: string;
}

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  productTitle,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const validImages = images && images.length > 0 ? images : [];
  const hasMultipleImages = validImages.length > 1;

  const nextImage = useCallback(() => {
    if (validImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    if (validImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !hasMultipleImages) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !hasMultipleImages) return;
    setIsDragging(false);
    
    const deltaX = currentX - startX;
    const threshold = 50; // minimum distance for swipe

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasMultipleImages) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !hasMultipleImages) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging || !hasMultipleImages) return;
    setIsDragging(false);
    
    const deltaX = currentX - startX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }
  };

  if (validImages.length === 0) {
    return (
      <div className={cn("aspect-square bg-muted flex items-center justify-center rounded-lg", className)}>
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div 
      className={cn("relative aspect-square bg-muted overflow-hidden group rounded-lg", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={validImages[currentIndex]}
          alt={`${productTitle} - صورة ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-200"
          style={{
            transform: isDragging ? `translateX(${(currentX - startX) * 0.1}px)` : 'translateX(0)',
            userSelect: 'none'
          }}
          draggable={false}
          loading="lazy"
        />
        
        {/* Navigation Arrows - Only show if multiple images */}
        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {validImages.length}
          </div>
        )}
        
        {/* Dots Indicator */}
        {hasMultipleImages && validImages.length <= 5 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        )}
        
        {/* Swipe Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-3 text-white/70 text-xs bg-black/30 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            👈👉 اسحب للتنقل
          </div>
        )}
      </div>
    </div>
  );
};