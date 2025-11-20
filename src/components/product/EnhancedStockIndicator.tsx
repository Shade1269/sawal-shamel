import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 📊 مؤشر المخزون المحسّن
 *
 * يعرض حالة المخزون بشكل مرئي جذاب
 * يخلق urgency عند انخفاض المخزون
 */

interface EnhancedStockIndicatorProps {
  stock: number;
  totalStock?: number;
  viewCount?: number;
  showProgress?: boolean;
  className?: string;
}

type StockStatus = 'out-of-stock' | 'low' | 'medium' | 'high';

export function EnhancedStockIndicator({
  stock,
  totalStock = 100, // افتراضياً 100 قطعة
  viewCount,
  showProgress = true,
  className = '',
}: EnhancedStockIndicatorProps) {
  /**
   * تحديد حالة المخزون
   */
  const getStockStatus = (): StockStatus => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low';
    if (stock < 30) return 'medium';
    return 'high';
  };

  const status = getStockStatus();

  /**
   * حساب نسبة المخزون
   */
  const stockPercentage = Math.min((stock / totalStock) * 100, 100);

  /**
   * تكوينات كل حالة
   */
  const statusConfig = {
    'out-of-stock': {
      icon: XCircle,
      label: 'غير متوفر',
      labelEn: 'Out of Stock',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      progressColor: 'bg-red-500',
      message: 'سيتوفر قريباً',
    },
    'low': {
      icon: AlertTriangle,
      label: 'الكمية محدودة جداً',
      labelEn: 'Very Limited Stock',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      progressColor: 'bg-orange-500',
      message: '⏰ أطلب الآن قبل نفاد المخزون!',
      urgent: true,
    },
    'medium': {
      icon: Package,
      label: 'كمية محدودة',
      labelEn: 'Limited Stock',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      progressColor: 'bg-yellow-500',
      message: 'الكمية محدودة',
    },
    'high': {
      icon: CheckCircle,
      label: 'متوفر',
      labelEn: 'In Stock',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      progressColor: 'bg-green-500',
      message: 'جاهز للشحن الفوري',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', config.color)} />
          <span className={cn('font-semibold', config.color)}>
            {config.label}
          </span>
        </div>

        {status !== 'out-of-stock' && (
          <Badge variant="secondary" className="text-xs">
            {stock} {stock === 1 ? 'قطعة' : 'قطع'}
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && status !== 'out-of-stock' && (
        <div className="mb-3">
          <Progress
            value={stockPercentage}
            className="h-2 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {stockPercentage.toFixed(0)}% متوفر
          </p>
        </div>
      )}

      {/* Message */}
      <div className="space-y-2">
        <p
          className={cn(
            'text-sm font-medium',
            status === 'low' && 'animate-pulse',
            config.color
          )}
        >
          {config.message}
        </p>

        {/* View Count (urgency indicator) */}
        {viewCount !== undefined && viewCount > 5 && status !== 'out-of-stock' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-xs"
          >
            <TrendingUp className="h-3 w-3 text-orange-500" />
            <span className="text-orange-500 font-medium">
              🔥 {viewCount} شخص يشاهدون الآن
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * 🎯 نسخة مدمجة من مؤشر المخزون
 *
 * للاستخدام في بطاقات المنتجات
 */

interface CompactStockIndicatorProps {
  stock: number;
  className?: string;
}

export function CompactStockIndicator({ stock, className = '' }: CompactStockIndicatorProps) {
  const getStatusBadge = () => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className={cn('text-xs', className)}>
          <XCircle className="h-3 w-3 mr-1" />
          غير متوفر
        </Badge>
      );
    }

    if (stock < 10) {
      return (
        <Badge variant="outline" className={cn('text-xs border-orange-500 text-orange-500', className)}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          {stock} فقط
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className={cn('text-xs', className)}>
        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
        متوفر ({stock})
      </Badge>
    );
  };

  return getStatusBadge();
}
