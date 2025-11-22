import { motion } from 'framer-motion';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { ShoppingCart, Heart, User, Store, TrendingUp, Package } from 'lucide-react';

interface AffiliateStore {
  id: string;
  store_name: string;
  bio: string;
  logo_url?: string;
  total_sales: number;
  total_orders: number;
}

interface ModernStoreHeaderProps {
  store: AffiliateStore;
  cartItemsCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onOrdersClick?: () => void;
}

export const ModernStoreHeader = ({
  store,
  cartItemsCount,
  onCartClick,
  onAuthClick,
  onOrdersClick
}: ModernStoreHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Store Identity */}
          <motion.div 
            className="flex items-center gap-3 md:gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {store.logo_url ? (
              <div className="relative">
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover ring-2 ring-primary/20 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Store className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            ) : (
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <Store className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
            )}
            
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {store.store_name}
              </h1>
              {store.bio && (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 max-w-xs md:max-w-md">
                  {store.bio}
                </p>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex items-center gap-2 md:gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {onOrdersClick && (
              <UnifiedButton
                variant="ghost"
                size="md"
                onClick={onOrdersClick}
                className="relative hover:bg-accent"
              >
                <Package className="h-5 w-5 md:h-6 md:w-6" />
              </UnifiedButton>
            )}

            <UnifiedButton
              variant="ghost"
              size="md"
              onClick={onAuthClick}
              className="relative hover:bg-accent"
            >
              <User className="h-5 w-5 md:h-6 md:w-6" />
            </UnifiedButton>

            <UnifiedButton
              variant="ghost"
              size="md"
              onClick={onCartClick}
              className="relative hover:bg-accent"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {cartItemsCount > 0 && (
                <UnifiedBadge 
                  variant="error" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                >
                  {cartItemsCount}
                </UnifiedBadge>
              )}
            </UnifiedButton>
          </motion.div>
        </div>
      </div>

      {/* Store Stats Bar */}
      <div className="bg-muted/30 border-t border-border/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-6 md:gap-8 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                <span className="font-bold text-foreground">{store.total_sales}</span> إجمالي المبيعات
              </span>
            </div>
            
            <div className="h-4 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                <span className="font-bold text-foreground">{store.total_orders}</span> طلب منجز
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Bar */}
      <motion.div 
        className="gradient-promo-bar border-t border-primary/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-center">
            <span className="flex items-center gap-1.5">
              <span className="text-primary">✓</span>
              <span className="text-muted-foreground">شحن مجاني للطلبات فوق 200 ريال</span>
            </span>
            <div className="hidden md:block h-3 w-px bg-border" />
            <span className="hidden md:flex items-center gap-1.5">
              <span className="text-primary">✓</span>
              <span className="text-muted-foreground">دفع آمن 100%</span>
            </span>
          </div>
        </div>
      </motion.div>
    </header>
  );
};
