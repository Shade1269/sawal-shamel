import React, { useEffect, useState } from 'react';
import { HeroPreview } from '@/components/storefront/preview/HeroPreview';
import { ProductGridPreview } from '@/components/storefront/preview/ProductGridPreview';
import { ProfilePreview } from '@/components/storefront/preview/ProfilePreview';
import { OrdersPreview } from '@/components/storefront/preview/OrdersPreview';
import { ChatPreview } from '@/components/storefront/preview/ChatPreview';
import { CartPreview } from '@/components/storefront/preview/CartPreview';
import { ProductDetailPreview } from '@/components/storefront/preview/ProductDetailPreview';
import { Button } from '@/components/ui/button';
import { Search, Heart, ShoppingBag, User, Package, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const DesignShowcase = () => {
  const { setThemeId } = useTheme();
  const [activeTab, setActiveTab] = useState<'store' | 'profile' | 'orders' | 'chat' | 'cart' | 'product'>('store');

  // Set anaqti theme on mount
  useEffect(() => {
    setThemeId('anaqti');
  }, [setThemeId]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Clean Header - Enhanced visibility */}
      <header className="sticky top-0 z-40 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Search */}
            <button className="p-2.5 hover:bg-secondary/50 rounded-lg transition-colors">
              <Search className="w-6 h-6 text-foreground/70" />
            </button>

            {/* Logo/Brand */}
            <h1 className="text-3xl font-bold text-foreground cursor-pointer" onClick={() => setActiveTab('store')}>
              أناقتي
            </h1>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "p-2.5 rounded-lg transition-colors",
                  activeTab === 'chat' ? 'bg-blue-100' : 'hover:bg-secondary/50'
                )}
              >
                <MessageCircle className="w-6 h-6 text-foreground/70" />
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={cn(
                  "p-2.5 rounded-lg transition-colors",
                  activeTab === 'orders' ? 'bg-blue-100' : 'hover:bg-secondary/50'
                )}
              >
                <Package className="w-6 h-6 text-foreground/70" />
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "p-2.5 rounded-lg transition-colors",
                  activeTab === 'profile' ? 'bg-blue-100' : 'hover:bg-secondary/50'
                )}
              >
                <User className="w-6 h-6 text-foreground/70" />
              </button>
              <button 
                onClick={() => setActiveTab('cart')}
                className={cn(
                  "p-2.5 rounded-lg transition-colors relative",
                  activeTab === 'cart' ? 'bg-blue-100' : 'hover:bg-secondary/50'
                )}
              >
                <ShoppingBag className="w-6 h-6 text-foreground/70" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  2
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content based on active tab */}
      {activeTab === 'store' && (
        <>
          {/* Hero Section */}
          <HeroPreview />

          {/* Categories Section - Enhanced text visibility */}
          <section className="py-12 bg-background">
            <div className="container mx-auto px-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-3 gap-6">
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
                      <div className="relative aspect-square bg-surface rounded-xl overflow-hidden mb-4 border border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                          <span className="text-5xl opacity-30">
                            {category.image === 'dress' ? '👗' : category.image === 'bag' ? '👜' : '👠'}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-center font-semibold text-foreground text-lg">{category.name}</h3>
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
                <h3 className="text-3xl font-bold text-foreground">حقيبتك</h3>
                <p className="text-foreground/70 text-lg">منتجاتك المحفوظة ستظهر هنا</p>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'profile' && <ProfilePreview />}
      {activeTab === 'orders' && <OrdersPreview />}
      {activeTab === 'chat' && <ChatPreview />}
      {activeTab === 'cart' && <CartPreview />}
      {activeTab === 'product' && <ProductDetailPreview />}
    </div>
  );
};

export default DesignShowcase;
