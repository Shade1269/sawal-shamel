import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 💀 Skeleton لبطاقة المنتج
 *
 * يعرض بديل متحرك أثناء تحميل بيانات المنتج
 * يحسن تجربة المستخدم بشكل كبير
 */

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* صورة المنتج */}
      <Skeleton className="aspect-square w-full" />

      {/* محتوى البطاقة */}
      <CardContent className="space-y-3 p-4">
        {/* عنوان المنتج */}
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        {/* الوصف */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* السعر والتقييم */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* الأزرار */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 🎯 Skeleton مبسط لبطاقة المنتج
 *
 * نسخة أصغر للاستخدام في القوائم المدمجة
 */

export function ProductCardSkeletonCompact() {
  return (
    <Card className="overflow-hidden">
      {/* صورة المنتج */}
      <Skeleton className="aspect-square w-full" />

      {/* محتوى البطاقة */}
      <CardContent className="space-y-2 p-3">
        {/* عنوان المنتج */}
        <Skeleton className="h-4 w-3/4" />

        {/* السعر */}
        <Skeleton className="h-5 w-16" />

        {/* الزر */}
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}
