import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoreBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  link_type: 'product' | 'category' | 'external' | 'none';
  position: number;
}

interface StoreBannerDisplayProps {
  banners: StoreBanner[];
  onBannerClick?: (banner: StoreBanner) => void;
}

export const StoreBannerDisplay: React.FC<StoreBannerDisplayProps> = ({
  banners,
  onBannerClick,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handleBannerClick = (banner: StoreBanner) => {
    if (onBannerClick) {
      onBannerClick(banner);
    } else if (banner.link_type === 'external' && banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-2xl overflow-hidden shadow-lg"
      >
        <button
          onClick={() => handleBannerClick(banner)}
          className={`relative w-full group ${
            banner.link_type !== 'none' ? 'cursor-pointer' : 'cursor-default'
          }`}
          disabled={banner.link_type === 'none'}
        >
          <div className="relative w-full h-64 md:h-96">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 gradient-fade-down" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-primary-foreground" dir="rtl">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
              {banner.subtitle && (
                <p className="text-lg md:text-xl opacity-90">{banner.subtitle}</p>
              )}
            </div>
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-2xl overflow-hidden shadow-lg"
      >
        <button
          onClick={() => handleBannerClick(banners[currentIndex])}
          className={`relative w-full group ${
            banners[currentIndex].link_type !== 'none' ? 'cursor-pointer' : 'cursor-default'
          }`}
          disabled={banners[currentIndex].link_type === 'none'}
        >
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-64 md:h-96"
          >
            <img
              src={banners[currentIndex].image_url}
              alt={banners[currentIndex].title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 gradient-fade-down" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-primary-foreground" dir="rtl">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                {banners[currentIndex].title}
              </h2>
              {banners[currentIndex].subtitle && (
                <p className="text-lg md:text-xl opacity-90">
                  {banners[currentIndex].subtitle}
                </p>
              )}
            </div>
          </motion.div>
        </button>

        {banners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-primary-foreground"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-primary-foreground"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary-foreground w-8'
                      : 'bg-primary-foreground/50 hover:bg-primary-foreground/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
