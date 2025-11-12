import React, { useEffect } from 'react';
import { DamascusProductCard, DamascusProductCardSkeleton } from './DamascusProductCard';

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

interface DamascusProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (productId: string) => void;
  onProductSelect?: (productId: string) => void;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    desktop?: number;
  };
}

export const DamascusProductGrid: React.FC<DamascusProductGridProps> = ({
  products,
  isLoading = false,
  onAddToCart,
  onProductSelect,
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  gap = {
    mobile: 24,
    desktop: 32,
  },
}) => {
  // GA4 Analytics - view_item_list event
  useEffect(() => {
    if (products.length > 0 && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_item_list', {
        items: products.map((product, index) => ({
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          index: index,
        }))
      });
    }
  }, [products]);

  const gridClass = `
    grid
    grid-cols-${columns.mobile}
    md:grid-cols-${columns.tablet}
    lg:grid-cols-${columns.desktop}
    gap-6
    md:gap-8
  `;

  if (isLoading) {
    return (
      <div 
        className={gridClass}
        role="status" 
        aria-label="جاري تحميل المنتجات"
      >
        {[...Array(8)].map((_, i) => (
          <DamascusProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        dir="rtl"
      >
        <div className="text-6xl mb-4 opacity-40">📦</div>
        <h3 className="text-[rgb(var(--damascus-text))] text-xl font-semibold mb-2">
          لا توجد منتجات
        </h3>
        <p className="text-[rgb(var(--damascus-muted))]">
          لم يتم العثور على أي منتجات في هذا القسم
        </p>
      </div>
    );
  }

  return (
    <div 
      className={gridClass}
      role="list"
      aria-label="قائمة المنتجات"
    >
      {products.map((product, index) => (
        <DamascusProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onSelect={onProductSelect}
          index={index}
        />
      ))}
    </div>
  );
};

// Container with Damascus theme styling
export const DamascusProductGridContainer: React.FC<{
  children: React.ReactNode;
  title?: string;
  description?: string;
}> = ({ children, title, description }) => {
  return (
    <div 
      className="w-full bg-[rgb(var(--damascus-bg))] min-h-screen py-8 px-4 md:px-8"
      dir="rtl"
      data-theme="damascene"
    >
      <div className="max-w-7xl mx-auto">
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && (
              <h1 className="text-[rgb(var(--damascus-text))] text-3xl md:text-4xl font-bold mb-3 relative inline-block">
                {title}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[rgb(var(--damascus-gold))] to-transparent opacity-80" />
              </h1>
            )}
            {description && (
              <p className="text-[rgb(var(--damascus-muted))] text-lg mt-4 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
