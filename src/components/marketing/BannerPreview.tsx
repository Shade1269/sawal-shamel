import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface BannerPreviewProps {
  banner: any;
  interactive?: boolean;
  onInteraction?: (type: 'impression' | 'click' | 'close') => void;
}

export const BannerPreview: React.FC<BannerPreviewProps> = ({
  banner,
  interactive = false,
  onInteraction
}) => {
  const getAnimationVariants = () => {
    switch (banner.animation_type) {
      case 'slide':
        return {
          initial: { x: banner.position === 'top' ? 0 : -100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: banner.position === 'top' ? 0 : -100, opacity: 0 }
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
          exit: { y: -50, opacity: 0 }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const handleClick = () => {
    if (interactive && onInteraction) {
      onInteraction('click');
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactive && onInteraction) {
      onInteraction('close');
    }
  };

  const renderHeroBanner = () => (
    <motion.div
      className="relative w-full min-h-[300px] rounded-lg overflow-hidden cursor-pointer"
      style={{ 
        backgroundColor: banner.background_color,
        color: banner.text_color 
      }}
      onClick={handleClick}
      variants={getAnimationVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {banner.image_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${banner.image_url})` }}
        />
      )}
      
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">
            {banner.title_ar || banner.title}
          </h2>
          {(banner.description_ar || banner.description) && (
            <p className="text-lg opacity-90 mb-6">
              {banner.description_ar || banner.description}
            </p>
          )}
          {(banner.button_text_ar || banner.button_text) && banner.button_url && (
            <Button 
              size="lg"
              style={{ backgroundColor: banner.button_color }}
              className="hover:opacity-90"
            >
              {banner.button_text_ar || banner.button_text}
              <ExternalLink className="w-4 h-4 mr-2" />
            </Button>
          )}
        </div>
      </div>

      {banner.show_close_button && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
    </motion.div>
  );

  const renderStripBanner = () => (
    <motion.div
      className="w-full py-3 px-6 flex items-center justify-between cursor-pointer"
      style={{ 
        backgroundColor: banner.background_color,
        color: banner.text_color 
      }}
      onClick={handleClick}
      variants={getAnimationVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <div>
          <span className="font-semibold">
            {banner.title_ar || banner.title}
          </span>
          {(banner.description_ar || banner.description) && (
            <span className="ml-2 opacity-80">
              {banner.description_ar || banner.description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {(banner.button_text_ar || banner.button_text) && banner.button_url && (
          <Button 
            size="sm" 
            variant="secondary"
            style={{ backgroundColor: banner.button_color }}
          >
            {banner.button_text_ar || banner.button_text}
          </Button>
        )}
        
        {banner.show_close_button && (
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );

  const renderSidebarBanner = () => (
    <motion.div
      className="w-64 rounded-lg overflow-hidden cursor-pointer"
      variants={getAnimationVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="relative"
        style={{ 
          backgroundColor: banner.background_color,
          color: banner.text_color,
          borderColor: banner.button_color
        }}
        onClick={handleClick}
      >
        {banner.image_url && (
          <div 
            className="h-32 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${banner.image_url})` }}
          />
        )}
        
        <div className="p-4">
          <h3 className="font-semibold mb-2">
            {banner.title_ar || banner.title}
          </h3>
          {(banner.description_ar || banner.description) && (
            <p className="text-sm opacity-80 mb-3">
              {banner.description_ar || banner.description}
            </p>
          )}
          {(banner.button_text_ar || banner.button_text) && banner.button_url && (
            <Button 
              size="sm" 
              className="w-full"
              style={{ backgroundColor: banner.button_color }}
            >
              {banner.button_text_ar || banner.button_text}
            </Button>
          )}
        </div>

        {banner.show_close_button && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </Card>
    </motion.div>
  );

  const renderPopupBanner = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        className="relative max-w-md w-full rounded-lg overflow-hidden"
        style={{ 
          backgroundColor: banner.background_color,
          color: banner.text_color 
        }}
        variants={getAnimationVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        onClick={handleClick}
      >
        {banner.image_url && (
          <div 
            className="h-48 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${banner.image_url})` }}
          />
        )}
        
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-3">
            {banner.title_ar || banner.title}
          </h3>
          {(banner.description_ar || banner.description) && (
            <p className="opacity-80 mb-4">
              {banner.description_ar || banner.description}
            </p>
          )}
          {(banner.button_text_ar || banner.button_text) && banner.button_url && (
            <Button 
              size="lg"
              className="w-full"
              style={{ backgroundColor: banner.button_color }}
            >
              {banner.button_text_ar || banner.button_text}
            </Button>
          )}
        </div>

        {banner.show_close_button && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </motion.div>
    </div>
  );

  const renderBanner = () => {
    switch (banner.banner_type) {
      case 'hero':
        return renderHeroBanner();
      case 'strip':
        return renderStripBanner();
      case 'sidebar':
        return renderSidebarBanner();
      case 'popup':
        return renderPopupBanner();
      default:
        return renderHeroBanner();
    }
  };

  return (
    <div className="space-y-4">
      {/* معلومات البانر */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {banner.banner_type === 'hero' && 'البانر الرئيسي'}
            {banner.banner_type === 'strip' && 'الشريط الإعلاني'}
            {banner.banner_type === 'sidebar' && 'الشريط الجانبي'}
            {banner.banner_type === 'popup' && 'النافذة المنبثقة'}
          </Badge>
          <Badge variant="secondary">
            {banner.position === 'top' && 'أعلى'}
            {banner.position === 'middle' && 'وسط'}
            {banner.position === 'bottom' && 'أسفل'}
            {banner.position === 'floating' && 'عائم'}
          </Badge>
          <Badge>
            أولوية {banner.priority}
          </Badge>
        </div>
      </div>

      {/* معاينة البانر */}
      <div className="bg-muted/20 p-6 rounded-lg">
        <div className="flex items-center justify-center min-h-[200px]">
          {renderBanner()}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="text-sm text-muted-foreground text-center">
        معاينة البانر - {banner.animation_type === 'fade' && 'حركة التلاشي'}
        {banner.animation_type === 'slide' && 'حركة الانزلاق'}
        {banner.animation_type === 'scale' && 'حركة التكبير'}
        {banner.animation_type === 'bounce' && 'حركة الارتداد'}
      </div>
    </div>
  );
};