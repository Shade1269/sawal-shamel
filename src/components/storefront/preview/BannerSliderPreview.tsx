import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  buttonText?: string;
}

const sampleBanners: Banner[] = [
  {
    id: 1,
    title: 'مجموعة الصيف الجديدة',
    subtitle: 'اكتشف أحدث صيحات الموضة لصيف 2024',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop',
    buttonText: 'تسوق الآن'
  },
  {
    id: 2,
    title: 'خصم يصل إلى 50%',
    subtitle: 'تخفيضات على جميع المنتجات المختارة',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop',
    buttonText: 'اطلع على العروض'
  },
  {
    id: 3,
    title: 'أحدث الإصدارات',
    subtitle: 'كن أول من يحصل على أحدث التصاميم',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c6d55?w=1200&h=600&fit=crop',
    buttonText: 'اكتشف المزيد'
  }
];

export const BannerSliderPreview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? sampleBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === sampleBanners.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section className="relative w-full bg-background overflow-hidden">
      <div className="container mx-auto px-0">
        <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0"
            >
              {/* Banner Image */}
              <div className="relative w-full h-full">
                <img
                  src={sampleBanners[currentIndex].image}
                  alt={sampleBanners[currentIndex].title}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 gradient-banner-overlay" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-end justify-start p-8 md:p-16">
                  <div className="max-w-2xl space-y-4 text-right" dir="rtl">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-6xl font-bold text-foreground"
                    >
                      {sampleBanners[currentIndex].title}
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg md:text-2xl text-foreground/80"
                    >
                      {sampleBanners[currentIndex].subtitle}
                    </motion.p>
                    
                    {sampleBanners[currentIndex].buttonText && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-lg transition-all hover:scale-105"
                      >
                        {sampleBanners[currentIndex].buttonText}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm text-foreground shadow-lg hover:scale-110 transition-all flex items-center justify-center z-10"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm text-foreground shadow-lg hover:scale-110 transition-all flex items-center justify-center z-10"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {sampleBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`transition-all rounded-full ${
                  index === currentIndex
                    ? 'bg-primary w-10 h-3'
                    : 'bg-foreground/30 hover:bg-foreground/50 w-3 h-3'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
