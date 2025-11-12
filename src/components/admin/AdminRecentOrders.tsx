import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/ui/Skeleton';
import type { RecentOrder } from '@/components/home/AdminRecentOrdersTable';

const AdminRecentOrdersTable = lazy(() => import('@/components/home/AdminRecentOrdersTable'));

interface AdminRecentOrdersProps {
  orders: RecentOrder[];
}

export const AdminRecentOrders: React.FC<AdminRecentOrdersProps> = ({ orders }) => {
  return (
    <section>
      <Suspense
        fallback={
          <div
            className="rounded-[var(--radius-l)] border border-border bg-card/80 p-[var(--spacing-lg)] shadow-soft"
            aria-busy="true"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">آخر 5 طلبات</p>
                <p className="text-xs text-muted-foreground">جاري تحميل أحدث البيانات...</p>
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-muted" />
            </div>
            <div className="mt-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={`order-skeleton-${index}`}
                  className="h-10 w-full rounded-[var(--radius-m)] bg-muted"
                />
              ))}
            </div>
          </div>
        }
      >
        <AdminRecentOrdersTable orders={orders} />
      </Suspense>
    </section>
  );
};
