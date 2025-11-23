import { useMemo, useState } from 'react';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, PackageCheck, PackageX, Truck } from 'lucide-react';
import type { AffiliateRecentOrder } from '../hooks/useAffiliateMetrics';

interface RecentOrdersProps {
  orders: AffiliateRecentOrder[];
  loading?: boolean;
}

const paymentLabels: Record<string, string> = {
  PAID: 'مدفوع',
  PENDING: 'قيد الدفع',
  FAILED: 'فشل',
  CANCELLED: 'ملغي',
  REFUNDED: 'مسترجع',
};

const fulfillmentLabels: Record<string, string> = {
  FULFILLED: 'تم الشحن',
  SHIPPED: 'قيد التوصيل',
  PROCESSING: 'تجهيز الطلب',
  PENDING: 'بانتظار المعالجة',
  CANCELLED: 'ملغي',
};

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('ar-SA', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    case 'PENDING':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const fulfillmentBadgeClass = (status: string) => {
  switch (status) {
    case 'FULFILLED':
    case 'SHIPPED':
      return 'bg-sky-100 text-sky-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const formatDate = (value: string) => {
  try {
    return dateFormatter.format(new Date(value));
  } catch (error) {
    return value;
  }
};

const filterOptions = [
  { key: 'all', label: 'الكل' },
  { key: 'PAID', label: 'مدفوع' },
  { key: 'PENDING', label: 'قيد الدفع' },
  { key: 'FAILED', label: 'فشل' },
] as const;

type FilterKey = (typeof filterOptions)[number]['key'];

export const RecentOrders = ({ orders, loading }: RecentOrdersProps) => {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((order) => order.paymentStatus === filter);
  }, [filter, orders]);

  return (
    <Card className="anaqti-card" dir="rtl">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="anaqti-section-title text-lg">الطلبات الأخيرة</CardTitle>
            <p className="text-sm anaqti-muted">آخر عشرة طلبات مرتبطة بمتجرك مع حالة الدفع والشحن.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.key}
                size="sm"
                variant={filter === option.key ? 'primary' : 'outline'}
                className={
                  filter === option.key
                    ? 'rounded-full bg-primary text-primary-foreground'
                    : 'rounded-full border-border text-foreground'
                }
                onClick={() => setFilter(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl bg-card/70 p-6 text-sm text-muted-foreground">
            لا توجد طلبات مطابقة حالياً. عندما يتم تسجيل طلب جديد سيظهر هنا مباشرة.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const paymentLabel = paymentLabels[order.paymentStatus] ?? order.paymentStatus ?? 'غير محدد';
              const fulfillmentLabel = fulfillmentLabels[order.fulfillmentStatus] ?? order.fulfillmentStatus ?? 'غير محدد';

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card/75 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{order.orderNumber}</p>
                      <p className="text-xs anaqti-muted flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{currencyFormatter.format(order.total)}</p>
                      <p className="text-xs anaqti-muted">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusBadgeClass(order.paymentStatus)}>
                      {order.paymentStatus === 'PAID' ? <PackageCheck className="ml-1 h-3.5 w-3.5" /> : order.paymentStatus === 'FAILED'
                        ? <PackageX className="ml-1 h-3.5 w-3.5" />
                        : <Clock className="ml-1 h-3.5 w-3.5" />}
                      {paymentLabel}
                    </Badge>
                    <Badge className={fulfillmentBadgeClass(order.fulfillmentStatus)}>
                      <Truck className="ml-1 h-3.5 w-3.5" />
                      {fulfillmentLabel}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
