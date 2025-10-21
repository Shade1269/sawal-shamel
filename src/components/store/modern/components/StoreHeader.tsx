import React from 'react';
import { ShoppingCart, Heart, User, Package, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface AffiliateStore {
  id: string;
  store_name: string;
  bio: string;
  store_slug: string;
  logo_url?: string;
  theme: string;
  total_sales: number;
  total_orders: number;
  profile_id: string;
  is_active: boolean;
}

interface StoreHeaderProps {
  store: AffiliateStore;
  cartItemsCount: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  onLoginClick: () => void;
}

export const StoreHeader = ({ store, cartItemsCount, onCartClick, onWishlistClick, onLoginClick }: StoreHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Store Identity */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {store.logo_url && (
              <div className="relative">
                <img
                  src={store.logo_url}
                  alt={`شعار متجر ${store.store_name}`}
                  className="w-14 h-14 rounded-xl object-cover shadow-lg ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
                  loading="lazy"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {store.store_name}
              </h1>
              {store.bio && (
                <p className="text-sm text-muted-foreground max-w-md truncate hover:text-foreground transition-colors">
                  {store.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <motion.span 
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-default"
                  whileHover={{ scale: 1.05 }}
                >
                  <TrendingUp className="h-3 w-3" />
                  {store.total_orders} طلب
                </motion.span>
                <motion.span 
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-default"
                  whileHover={{ scale: 1.05 }}
                >
                  <Package className="h-3 w-3" />
                  متجر متخصص
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Wishlist Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onWishlistClick}
              className="relative hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Heart className="h-4 w-4 mr-2" />
              المفضلة
            </Button>

            {/* Profile/Login Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLoginClick}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              حسابي
            </Button>

            {/* Cart Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCartClick}
              className="relative group hover:shadow-lg hover:border-primary/50 transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              السلة
              {cartItemsCount > 0 && (
                <Badge 
                  variant="destructive"
                  className="absolute -top-2 -left-2 min-w-[20px] h-5 animate-bounce"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Store Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20"
        >
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              متصل الآن
            </div>
            <div className="text-muted-foreground">
              📦 شحن مجاني للطلبات فوق 200 ريال
            </div>
            <div className="text-muted-foreground">
              ⚡ توصيل سريع خلال 24-48 ساعة
            </div>
            <div className="text-muted-foreground">
              🔒 دفع آمن ومضمون
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};