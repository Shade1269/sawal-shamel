import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  LogIn,
  Package,
  Menu,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import '@/styles/gaming-store.css';

interface GamingStoreHeaderProps {
  storeName: string;
  storeSlug?: string;
  cartCount?: number;
  wishlistCount?: number;
  isAuthenticated?: boolean;
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onOrdersClick?: () => void;
  onAuthClick?: () => void;
}

export const GamingStoreHeader = ({
  storeName,
  storeSlug,
  cartCount = 0,
  wishlistCount = 0,
  isAuthenticated = false,
  onSearchClick,
  onCartClick,
  onOrdersClick,
  onAuthClick,
}: GamingStoreHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="gaming-header sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--gaming-gradient-1)',
                  boxShadow: 'var(--gaming-glow-blue)',
                }}
              >
                <Zap className="h-6 w-6 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid var(--gaming-neon-blue)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            <div>
              <h1 className="gaming-header-logo text-xl md:text-2xl">
                {storeName}
              </h1>
              <motion.div
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--gaming-neon-purple)' }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles className="h-3 w-3" />
                <span className="font-bold">متجر إلكتروني</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-3"
          >
            {/* Search Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchClick}
                className="relative gaming-interactive hover:bg-gaming-neon-blue/20"
              >
                <Search className="h-5 w-5" style={{ color: 'var(--gaming-neon-blue)' }} />
              </Button>
            </motion.div>

            {/* Wishlist Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="relative gaming-interactive hover:bg-gaming-neon-pink/20"
              >
                <Heart className="h-5 w-5" style={{ color: 'var(--gaming-neon-pink)' }} />
                {wishlistCount > 0 && (
                  <span className="gaming-cart-badge">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Orders Button */}
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOrdersClick}
                  className="relative gaming-interactive hover:bg-gaming-neon-purple/20"
                >
                  <Package className="h-5 w-5" style={{ color: 'var(--gaming-neon-purple)' }} />
                </Button>
              </motion.div>
            )}

            {/* Cart Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCartClick}
                className="relative gaming-interactive hover:bg-gaming-neon-green/20"
              >
                <ShoppingCart className="h-5 w-5" style={{ color: 'var(--gaming-neon-green)' }} />
                {cartCount > 0 && (
                  <motion.span
                    className="gaming-cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Button>
            </motion.div>

            {/* Auth Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onAuthClick}
                className="gaming-btn h-10"
                style={{
                  background: isAuthenticated
                    ? 'var(--gaming-gradient-3)'
                    : 'var(--gaming-gradient-1)',
                }}
              >
                {isAuthenticated ? (
                  <>
                    <User className="h-4 w-4 ml-2" />
                    حسابي
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="gaming-interactive"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" style={{ color: 'var(--gaming-neon-pink)' }} />
              ) : (
                <Menu className="h-6 w-6" style={{ color: 'var(--gaming-neon-blue)' }} />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-3 border-t border-gaming-neon-blue/30">
            <Button
              variant="ghost"
              onClick={onSearchClick}
              className="w-full justify-start gaming-interactive hover:bg-gaming-neon-blue/20"
            >
              <Search className="h-5 w-5 ml-2" style={{ color: 'var(--gaming-neon-blue)' }} />
              بحث
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gaming-interactive hover:bg-gaming-neon-pink/20"
            >
              <Heart className="h-5 w-5 ml-2" style={{ color: 'var(--gaming-neon-pink)' }} />
              المفضلة
              {wishlistCount > 0 && (
                <span className="mr-auto gaming-cart-badge relative top-0 right-0">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={onOrdersClick}
                className="w-full justify-start gaming-interactive hover:bg-gaming-neon-purple/20"
              >
                <Package className="h-5 w-5 ml-2" style={{ color: 'var(--gaming-neon-purple)' }} />
                طلباتي
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={onCartClick}
              className="w-full justify-start gaming-interactive hover:bg-gaming-neon-green/20"
            >
              <ShoppingCart className="h-5 w-5 ml-2" style={{ color: 'var(--gaming-neon-green)' }} />
              السلة
              {cartCount > 0 && (
                <span className="mr-auto gaming-cart-badge relative top-0 right-0">
                  {cartCount}
                </span>
              )}
            </Button>

            <Button
              onClick={onAuthClick}
              className="gaming-btn w-full"
              style={{
                background: isAuthenticated
                  ? 'var(--gaming-gradient-3)'
                  : 'var(--gaming-gradient-1)',
              }}
            >
              {isAuthenticated ? (
                <>
                  <User className="h-4 w-4 ml-2" />
                  حسابي
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Animated Bottom Border */}
      <motion.div
        className="h-0.5"
        style={{
          background: 'var(--gaming-gradient-1)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </header>
  );
};
