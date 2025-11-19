import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/**
 * 📭 Empty State Component
 *
 * يعرض رسالة جذابة عندما لا توجد بيانات
 * بدلاً من رسالة "لا توجد بيانات" العادية
 */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  animate?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  animate = true,
}: EmptyStateProps) {
  const content = (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6">
        {/* الأيقونة */}
        <div className="mb-4 p-4 rounded-full bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* العنوان */}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>

        {/* الوصف */}
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

        {/* زر الإجراء */}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            size="lg"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {content}
    </motion.div>
  );
}

/**
 * 🛒 Empty States محددة مسبقاً
 */

import {
  ShoppingCart,
  Heart,
  Package,
  Search,
  Inbox,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

export const EmptyStates = {
  /**
   * سلة فارغة
   */
  EmptyCart: ({
    onBrowseProducts,
  }: {
    onBrowseProducts: () => void;
  }) => (
    <EmptyState
      icon={ShoppingCart}
      title="السلة فارغة"
      description="لم تضف أي منتجات إلى السلة بعد. ابدأ التسوق الآن واستمتع بأفضل العروض!"
      action={{
        label: '🎁 تصفح المنتجات',
        onClick: onBrowseProducts,
      }}
    />
  ),

  /**
   * المفضلة فارغة
   */
  EmptyWishlist: ({
    onBrowseProducts,
  }: {
    onBrowseProducts: () => void;
  }) => (
    <EmptyState
      icon={Heart}
      title="المفضلة فارغة"
      description="لم تضف أي منتجات إلى المفضلة. احفظ منتجاتك المفضلة لتسهيل الوصول إليها لاحقاً."
      action={{
        label: '❤️ اكتشف منتجات جديدة',
        onClick: onBrowseProducts,
      }}
    />
  ),

  /**
   * لا توجد منتجات
   */
  NoProducts: ({
    onAddProduct,
    canAdd = false,
  }: {
    onAddProduct?: () => void;
    canAdd?: boolean;
  }) => (
    <EmptyState
      icon={Package}
      title="لا توجد منتجات"
      description={
        canAdd
          ? 'لم يتم إضافة أي منتجات بعد. ابدأ بإضافة منتجك الأول الآن!'
          : 'لم يتم إضافة أي منتجات إلى هذا المتجر بعد. تحقق لاحقاً للحصول على عروض جديدة.'
      }
      action={
        canAdd && onAddProduct
          ? {
              label: '➕ إضافة منتج جديد',
              onClick: onAddProduct,
            }
          : undefined
      }
    />
  ),

  /**
   * لا توجد نتائج بحث
   */
  NoSearchResults: ({ searchQuery }: { searchQuery: string }) => (
    <EmptyState
      icon={Search}
      title="لا توجد نتائج"
      description={`لم نعثر على أي منتجات تطابق "${searchQuery}". جرب البحث بكلمات مختلفة أو تصفح الفئات.`}
    />
  ),

  /**
   * لا توجد طلبات
   */
  NoOrders: () => (
    <EmptyState
      icon={ShoppingBag}
      title="لا توجد طلبات"
      description="لم تقم بأي طلبات بعد. ابدأ التسوق الآن واحصل على طلبك الأول!"
    />
  ),

  /**
   * صندوق وارد فارغ
   */
  EmptyInbox: () => (
    <EmptyState
      icon={Inbox}
      title="لا توجد إشعارات"
      description="أنت على اطلاع بكل شيء! لا توجد إشعارات جديدة في الوقت الحالي."
    />
  ),

  /**
   * حدث خطأ
   */
  Error: ({
    onRetry,
    errorMessage,
  }: {
    onRetry: () => void;
    errorMessage?: string;
  }) => (
    <EmptyState
      icon={AlertCircle}
      title="حدث خطأ"
      description={
        errorMessage ||
        'عذراً، حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.'
      }
      action={{
        label: '🔄 إعادة المحاولة',
        onClick: onRetry,
        variant: 'outline',
      }}
    />
  ),
};
