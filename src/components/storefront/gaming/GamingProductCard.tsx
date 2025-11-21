import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, Eye, Star, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import '@/styles/gaming-store.css';

interface Product {
  id: string;
  title: string;
  description?: string;
  price_sar: number;
  image_urls?: string[];
  stock: number;
  category?: string;
  variants?: any[];
  final_price?: number;
  average_rating?: number;
  total_reviews?: number;
  discount_percentage?: number;
}

interface GamingProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  index?: number;
}

export const GamingProductCard = ({
  product,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  isInWishlist,
  index = 0
}: GamingProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    hover: {
      y: -12,
      scale: 1.03,
    }
  } as const;

  const imageVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: 2,
    }
  } as const;

  const glowColors = [
    'rgba(0, 240, 255, 0.3)',
    'rgba(255, 0, 110, 0.3)',
    'rgba(168, 85, 247, 0.3)',
    'rgba(57, 255, 20, 0.3)'
  ];

  const glowColor = glowColors[index % glowColors.length];

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{
        delay: index * 0.05,
        duration: 0.5,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="gaming-product-card h-full"
      style={{
        boxShadow: isHovered
          ? `0 20px 60px ${glowColor}, 0 0 0 1px rgba(0, 240, 255, 0.2)`
          : '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* RGB Border Effect */}
      <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="gaming-rgb-border absolute inset-0" />
      </div>

      {/* Image Section with Gaming Effects */}
      <div
        className="gaming-product-image relative cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        <motion.div
          variants={imageVariants}
          className="w-full h-full"
        >
          <img
            src={product.image_urls?.[0] || '/placeholder.svg'}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Gradient Overlay on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-gaming-bg-dark/90 via-gaming-bg-dark/50 to-transparent"
          style={{ pointerEvents: 'none' }}
        />

        {/* Action Buttons Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20
          }}
          className="absolute inset-0 flex items-center justify-center gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
              className="gaming-btn w-12 h-12 rounded-full bg-gaming-neon-blue/20 backdrop-blur-md border-2 border-gaming-neon-blue hover:bg-gaming-neon-blue/40"
              style={{
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)'
              }}
            >
              <Eye className="h-5 w-5 text-gaming-neon-blue" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className={`gaming-btn w-12 h-12 rounded-full backdrop-blur-md border-2 ${
                isInWishlist
                  ? 'bg-gaming-neon-pink border-gaming-neon-pink'
                  : 'bg-gaming-neon-pink/20 border-gaming-neon-pink hover:bg-gaming-neon-pink/40'
              }`}
              style={{
                boxShadow: '0 0 20px rgba(255, 0, 110, 0.5)'
              }}
            >
              <Heart
                className={`h-5 w-5 ${isInWishlist ? 'fill-current text-white' : 'text-gaming-neon-pink'}`}
              />
            </Button>
          </motion.div>
        </motion.div>

        {/* Discount Badge */}
        {product.discount_percentage && product.discount_percentage > 0 && (
          <div className="gaming-badge gaming-badge-sale">
            <Zap className="inline h-3 w-3 mr-1" />
            {product.discount_percentage}% خصم
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 ? (
          <Badge className="absolute top-4 left-4 bg-gray-900/90 text-white border-2 border-gray-600">
            نفد المخزون
          </Badge>
        ) : product.stock <= 5 && (
          <Badge className="absolute top-4 left-4 bg-gaming-neon-orange/90 text-gaming-bg-dark border-2 border-gaming-neon-orange font-bold">
            <Sparkles className="inline h-3 w-3 mr-1" />
            {product.stock} متبقي
          </Badge>
        )}

        {/* Scan Line Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(0deg, transparent 0%, rgba(0, 240, 255, 0.1) 50%, transparent 100%)',
            backgroundSize: '100% 50px',
          }}
          animate={{
            y: isHovered ? [0, 400, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content Section */}
      <CardContent className="p-5 space-y-4 relative z-10">
        {/* Title */}
        <motion.h3
          className="font-black text-base leading-tight line-clamp-2 cursor-pointer"
          onClick={() => onProductClick(product)}
          style={{
            background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          whileHover={{
            textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
          }}
        >
          {product.title}
        </motion.h3>

        {/* Rating */}
        {product.average_rating && product.average_rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`gaming-star h-4 w-4 ${
                    star <= Math.round(product.average_rating || 0)
                      ? 'fill-current'
                      : 'fill-none'
                  }`}
                  style={{
                    color: 'var(--gaming-neon-orange)',
                    filter: 'drop-shadow(0 0 5px rgba(255, 149, 0, 0.8))'
                  }}
                />
              ))}
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--gaming-neon-blue)' }}
            >
              ({product.total_reviews || 0})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="gaming-price-tag">
            <span className="text-2xl">{(product.final_price || product.price_sar).toFixed(0)}</span>
            <span className="text-sm">ر.س</span>
          </div>

          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="flex items-center gap-2">
              <span
                className="text-sm line-through opacity-60"
                style={{ color: 'var(--gaming-neon-pink)' }}
              >
                {product.price_sar.toFixed(0)} ر.س
              </span>
            </div>
          )}
        </div>

        {/* Category */}
        {product.category && (
          <div className="gaming-category-pill inline-block text-xs">
            {product.category}
          </div>
        )}

        {/* Add to Cart Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => onAddToCart(product)}
            className="gaming-btn w-full h-12 text-sm font-black"
            disabled={product.stock === 0}
            style={{
              background: product.stock === 0
                ? 'rgba(100, 100, 100, 0.5)'
                : 'var(--gaming-gradient-1)',
              border: 'none',
            }}
          >
            <ShoppingCart className="h-5 w-5 ml-2" />
            {product.stock === 0 ? 'نفد المخزون' : 'أضف للسلة'}
            <Sparkles className="h-4 w-4 mr-2" />
          </Button>
        </motion.div>

        {/* Variants Indicator */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--gaming-neon-purple)' }}>
            <Sparkles className="h-3 w-3" />
            <span className="font-bold">متوفر بعدة خيارات</span>
          </div>
        )}

        {/* Holographic Corner Effect */}
        <div
          className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle at bottom right, var(--gaming-neon-blue), transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />
      </CardContent>

      {/* Animated Border Gradient */}
      <motion.div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent, rgba(0, 240, 255, 0.1), transparent)',
          opacity: isHovered ? 1 : 0,
        }}
        animate={{
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 3,
          repeat: isHovered ? Infinity : 0,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
};
