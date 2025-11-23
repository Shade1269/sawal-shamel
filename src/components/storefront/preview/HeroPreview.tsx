import { UnifiedButton } from '@/components/design-system';
import { motion } from 'framer-motion';

export const HeroPreview = () => {
  return (
    <section className="relative bg-surface py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text Content - Left side in RTL */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8 text-right order-2 lg:order-1"
            >
              <h1 className="text-6xl font-bold text-foreground leading-tight">
                أحدث التشكيلات
              </h1>
              
              <UnifiedButton 
                variant="primary"
                className="px-10 py-6 text-lg font-semibold"
              >
                تسوق الآن
              </UnifiedButton>
            </motion.div>

            {/* Image - Right side in RTL */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-1 lg:order-2"
            >
              <div className="relative aspect-[3/4] max-w-md mx-auto lg:mr-0 bg-surface-2 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop" 
                  alt="أحدث التشكيلات" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
