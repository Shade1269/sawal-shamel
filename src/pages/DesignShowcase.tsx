import React, { useEffect } from 'react';
import { HeroPreview } from '@/components/storefront/preview/HeroPreview';
import { ProductGridPreview } from '@/components/storefront/preview/ProductGridPreview';
import { Button } from '@/components/ui/button';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

const DesignShowcase = () => {
  const { setThemeId } = useTheme();

  // Set anaqti theme on mount
  useEffect(() => {
    setThemeId('anaqti');
  }, [setThemeId]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Clean Header - كما في التصميم المرجعي */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Search */}
            <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-fg-muted" />
            </button>

            {/* Logo/Brand */}
            <h1 className="text-2xl font-bold text-fg">أناقتي</h1>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                <Heart className="w-5 h-5 text-fg-muted" />
              </button>
              <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                <ShoppingBag className="w-5 h-5 text-fg-muted" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroPreview />

      {/* Categories Section - كما في المرجع */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'الملابس', image: 'dress' },
                { name: 'الحقائب', image: 'bag' },
                { name: 'الأحذية', image: 'shoes' }
              ].map((category, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square bg-surface rounded-xl overflow-hidden mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                      <span className="text-4xl opacity-30">
                        {category.image === 'dress' ? '👗' : category.image === 'bag' ? '👜' : '👠'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-center font-medium text-fg">{category.name}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductGridPreview />

      {/* Footer Info */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h3 className="text-2xl font-bold text-fg">حقيبتك</h3>
            <p className="text-fg-muted">منتجاتك المحفوظة ستظهر هنا</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignShowcase;
