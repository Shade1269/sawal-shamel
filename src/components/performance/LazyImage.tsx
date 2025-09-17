import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: string;
  blur?: boolean;
  lazy?: boolean;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholder,
  fallback = '/placeholder.svg',
  blur = true,
  lazy = true,
  quality = 75,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const optimizedSrc = useMemo(() => {
    if (!src || isError) return fallback;
    
    // If it's a local image or already optimized, return as-is
    if (src.startsWith('/') || src.includes('w=') || src.includes('q=')) {
      return src;
    }
    
    // For external images, add optimization parameters if supported
    if (src.includes('unsplash.com') || src.includes('images.unsplash.com')) {
      const url = new URL(src);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', 'webp');
      return url.toString();
    }
    
    return src;
  }, [src, width, height, quality, isError, fallback]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Generate placeholder data URL for blur effect
  const placeholderSrc = useMemo(() => {
    if (placeholder) return placeholder;
    
    // Generate a simple SVG placeholder
    const svgPlaceholder = `
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="14">
          جاري التحميل...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml,${encodeURIComponent(svgPlaceholder)}`;
  }, [placeholder, width, height]);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder/Skeleton */}
      {!isInView && (
        <Skeleton 
          className="absolute inset-0 w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* Blur placeholder */}
      {isInView && !isLoaded && blur && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}

      {/* Loading overlay */}
      {isInView && !isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            جاري التحميل...
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <div className="mb-2">⚠️</div>
            <div className="text-sm">فشل تحميل الصورة</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for preloading images
export const useImagePreload = (sources: string[]) => {
  useEffect(() => {
    sources.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [sources]);
};

// Component for critical images that should load immediately
export const CriticalImage: React.FC<LazyImageProps> = (props) => {
  return <LazyImage {...props} lazy={false} />;
};

export default LazyImage;