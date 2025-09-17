import React, { useEffect, useState } from 'react';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { BannerPreview } from '@/components/marketing/BannerPreview';
import { motion, AnimatePresence } from 'framer-motion';

interface PromotionalBannerDisplayProps {
  affiliateStoreId?: string;
  bannerType?: 'hero' | 'sidebar' | 'popup' | 'strip';
  position?: 'top' | 'middle' | 'bottom' | 'floating';
  className?: string;
}

export const PromotionalBannerDisplay: React.FC<PromotionalBannerDisplayProps> = ({
  affiliateStoreId,
  bannerType,
  position,
  className = ''
}) => {
  const [visibleBanners, setVisibleBanners] = useState<string[]>([]);
  const { fetchActiveBanners, trackBannerInteraction } = usePromotionalBanners(
    undefined,
    affiliateStoreId
  );
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const loadBanners = async () => {
      const activeBanners = await fetchActiveBanners(bannerType, position);
      setBanners(activeBanners);
      
      // تتبع مشاهدة البانرات
      activeBanners.forEach((banner: any) => {
        trackBannerInteraction(banner.id, 'impression');
      });
    };

    if (affiliateStoreId) {
      loadBanners();
    }
  }, [affiliateStoreId, bannerType, position, fetchActiveBanners, trackBannerInteraction]);

  const handleBannerClick = (bannerId: string, buttonUrl?: string) => {
    trackBannerInteraction(bannerId, 'click');
    if (buttonUrl) {
      window.open(buttonUrl, '_blank');
    }
  };

  const handleBannerClose = (bannerId: string) => {
    trackBannerInteraction(bannerId, 'close');
    setVisibleBanners(prev => prev.filter(id => id !== bannerId));
  };

  const getAnimationVariants = (animationType: string) => {
    switch (animationType) {
      case 'slide':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 100, opacity: 0 }
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 }
        };
      case 'bounce':
        return {
          initial: { y: -50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -50, opacity: 0 },
          transition: { type: 'spring' as const, bounce: 0.4 }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  if (!banners.length) return null;

  return (
    <div className={`promotional-banner-container relative z-10 ${className}`}>
      <AnimatePresence>
        {banners
          .filter(banner => !visibleBanners.includes(banner.id))
          .map((banner) => (
            <motion.div
              key={banner.id}
              {...getAnimationVariants(banner.animation_type)}
              transition={{ duration: 0.3 }}
              className={`banner-wrapper ${getBannerPositionClasses(banner.banner_type, banner.position)}`}
            >
              <BannerPreview
                banner={banner}
                interactive={true}
                onInteraction={(type) => {
                  if (type === 'click') {
                    handleBannerClick(banner.id, banner.button_url);
                  } else if (type === 'close') {
                    handleBannerClose(banner.id);
                  }
                }}
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );

  function getBannerPositionClasses(type: string, position: string) {
    const baseClasses = "banner-wrapper";
    
    if (type === 'popup') {
      return `${baseClasses} fixed inset-0 z-[1000] flex items-center justify-center bg-black/50`;
    }
    
    if (type === 'floating') {
      return `${baseClasses} fixed bottom-4 right-4 z-[100] max-w-sm`;
    }
    
    if (type === 'strip') {
      if (position === 'top') {
        return `${baseClasses} sticky top-0 z-50 w-full`;
      }
      if (position === 'bottom') {
        return `${baseClasses} sticky bottom-0 z-50 w-full`;
      }
    }
    
    return `${baseClasses} w-full`;
  }
};