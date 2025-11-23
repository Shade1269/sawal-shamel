import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface StoreAlertsProps {
  hasStore: boolean;
}

/**
 * مكون لعرض التنبيهات المتعلقة بحالة المتجر
 * يعرض تنبيه إذا لم يتم إنشاء المتجر، أو رسالة ترحيب إذا كان موجوداً
 */
export function StoreAlerts({ hasStore }: StoreAlertsProps) {
  if (!hasStore) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                لم يتم إنشاء متجرك بعد
              </p>
              <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-300 mt-1">
                يمكنك تصفح المنتجات، لكن لإضافتها لمتجرك يجب إنشاء المتجر أولاً من لوحة المسوق
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base">
              مرحباً بك في مخزن المنتجات
            </p>
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-300 mt-1">
              يمكنك الآن تصفح المنتجات والضغط على "إضافة لمتجري" لإضافتها إلى متجرك الخاص
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
