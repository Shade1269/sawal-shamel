
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 💀 Skeleton لصفحة تفاصيل المنتج
 *
 * يعرض بديل متحرك أثناء تحميل تفاصيل المنتج
 */

export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* صور المنتج */}
        <div className="space-y-4">
          {/* الصورة الرئيسية */}
          <Skeleton className="aspect-square w-full rounded-lg" />

          {/* الصور المصغرة */}
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="flex-shrink-0 w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>

        {/* تفاصيل المنتج */}
        <div className="space-y-6">
          {/* العنوان والفئة */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* السعر والتقييم */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* الوصف */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* الفاصل */}
          <Skeleton className="h-px w-full" />

          {/* المتغيرات */}
          <div className="space-y-4">
            {/* متغير 1 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* متغير 2 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* الفاصل */}
          <Skeleton className="h-px w-full" />

          {/* الكمية */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
