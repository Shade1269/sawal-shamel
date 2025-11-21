import { ProductCardSkeleton, ProductCardSkeletonCompact } from './ProductCardSkeleton';

/**
 * 🎨 شبكة Skeletons للمنتجات
 *
 * يعرض شبكة من هياكل المنتجات أثناء التحميل
 * يتكيف مع الشاشات المختلفة
 */

interface ProductGridSkeletonProps {
  count?: number;
  compact?: boolean;
  className?: string;
}

export function ProductGridSkeleton({
  count = 8,
  compact = false,
  className = '',
}: ProductGridSkeletonProps) {
  const SkeletonComponent = compact ? ProductCardSkeletonCompact : ProductCardSkeleton;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}
