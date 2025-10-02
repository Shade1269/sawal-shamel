import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  isNew?: boolean;
  isOnSale?: boolean;
  isOutOfStock?: boolean;
  rating?: number;
  currency?: string;
}

interface DamascusProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onSelect?: (productId: string) => void;
  index?: number;
}

export const DamascusProductCard: React.FC<DamascusProductCardProps> = ({
  product,
  onAddToCart,
  onSelect,
  index = 0,
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && !product.isOutOfStock) {
      onAddToCart(product.id);
      
      // GA4 Analytics - add_to_cart event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'add_to_cart', {
          currency: product.currency || 'SAR',
          value: product.price,
          items: [{
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            quantity: 1,
            index: index,
          }]
        });
      }
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product.id);
      
      // GA4 Analytics - select_item event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'select_item', {
          items: [{
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            index: index,
          }]
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: product.currency || 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <article
      className={`damascus-card group relative flex flex-col bg-[rgb(var(--damascus-panel))] border border-[rgb(var(--damascus-gold))]/30 rounded-[var(--damascus-radius)] overflow-hidden shadow-[var(--damascus-shadow)] transition-all duration-300 hover:border-[rgb(var(--damascus-gold))]/60 hover:shadow-[var(--damascus-shadow-hover)] ${product.isOutOfStock ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`${product.title} - ${formatPrice(product.price)}`}
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2" dir="rtl">
        {product.isNew && (
          <Badge className="bg-[rgb(var(--damascus-gold))] text-[rgb(var(--damascus-bg))] font-bold border-0 shadow-[var(--damascus-gold-glow)]">
            جديد
          </Badge>
        )}
        {product.isOnSale && discountPercentage > 0 && (
          <Badge className="bg-red-600 text-white font-bold border-0">
            خصم {discountPercentage}%
          </Badge>
        )}
        {product.isOutOfStock && (
          <Badge variant="destructive" className="border-0">
            نفد المخزون
          </Badge>
        )}
      </div>

      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[rgb(var(--damascus-bg))]">
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
            <span className="text-white text-lg font-bold">غير متوفر</span>
          </div>
        )}
        
        <img
          src={product.imageUrl || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width={400}
          height={500}
          decoding="async"
        />
        
        {/* Decorative Corner */}
        <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-40">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[rgb(var(--damascus-gold))]">
            <path
              d="M 0 0 L 100 0 L 100 20 Q 50 20 20 50 Q 20 100 0 100 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3" dir="rtl">
        {/* Title */}
        <h3 className="text-[rgb(var(--damascus-text))] font-semibold text-base line-clamp-2 min-h-[3rem] leading-snug">
          {product.title}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < product.rating! ? 'fill-[rgb(var(--damascus-gold))] text-[rgb(var(--damascus-gold))]' : 'text-[rgb(var(--damascus-muted))]'}
              />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-[rgb(var(--damascus-gold))] font-bold text-xl">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[rgb(var(--damascus-muted))] text-sm line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={product.isOutOfStock}
          className="w-full bg-transparent border-2 border-[rgb(var(--damascus-gold))]/50 text-[rgb(var(--damascus-gold))] hover:bg-[rgb(var(--damascus-gold))]/10 hover:border-[rgb(var(--damascus-gold))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg font-semibold gap-2"
          aria-label={`إضافة ${product.title} إلى السلة`}
        >
          <ShoppingCart size={18} />
          <span>{product.isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}</span>
        </Button>
      </div>
    </article>
  );
};

// Skeleton loader for loading state
export const DamascusProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[rgb(var(--damascus-panel))] border border-[rgb(var(--damascus-gold))]/20 rounded-[var(--damascus-radius)] overflow-hidden animate-pulse">
      <div className="w-full aspect-[4/5] bg-[rgb(var(--damascus-bg))]" />
      <div className="p-4 flex flex-col gap-3" dir="rtl">
        <div className="h-6 bg-[rgb(var(--damascus-bg))] rounded w-3/4" />
        <div className="h-6 bg-[rgb(var(--damascus-bg))] rounded w-1/2" />
        <div className="h-6 bg-[rgb(var(--damascus-bg))] rounded w-2/3 mt-auto" />
        <div className="h-10 bg-[rgb(var(--damascus-bg))] rounded" />
      </div>
    </div>
  );
};
