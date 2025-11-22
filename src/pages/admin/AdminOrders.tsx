import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { PageTitle } from "@/components/app-shell/PageTitle";
import { useAdminOrders, getNextRowIndex } from "@/hooks/useAdminOrders";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useFastAuth } from "@/hooks/useFastAuth";
import { maskPhone, shouldShowFullCustomerData } from "@/lib/privacy";
import { UnifiedButton, UnifiedCard, UnifiedInput } from "@/components/design-system";
import { Skeleton } from "@/ui/Skeleton";

const OrderDetailsDrawer = lazy(() => import("./components/OrderDetailsDrawer"));

const statusLabels: Record<string, string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوع",
  shipped: "تم الشحن",
  refunded: "مسترد",
  cancelled: "ملغي",
};

const statusVariants: Record<string, string> = {
  pending: "warning",
  paid: "success",
  shipped: "primary",
  refunded: "danger",
  cancelled: "muted",
};

const statusFilters: { value: "all" | "pending" | "paid" | "shipped" | "refunded" | "cancelled"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "بانتظار الدفع" },
  { value: "paid", label: "مدفوع" },
  { value: "shipped", label: "تم الشحن" },
  { value: "refunded", label: "مسترد" },
  { value: "cancelled", label: "ملغي" },
];

const datePresets: { value: "today" | "7d" | "30d" | "custom"; label: string }[] = [
  { value: "today", label: "اليوم" },
  { value: "7d", label: "آخر 7 أيام" },
  { value: "30d", label: "آخر 30 يوم" },
  { value: "custom", label: "مخصص" },
];

const OrdersSkeleton = () => (
  <UnifiedCard
    variant="glass"
    data-state="loading"
    className="border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80"
  >
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-10 w-40 rounded" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {statusFilters.map((filter) => (
          <Skeleton key={filter.value} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded" />
        ))}
      </div>
    </div>
  </UnifiedCard>
);

const currency = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
});

const AdminOrdersPage = () => {
  const { profile } = useFastAuth();
  const showFullData = shouldShowFullCustomerData(profile?.role);
  const {
    visibleOrders,
    total,
    isLoading,
    filters,
    hasMore,
    loadMore,
    setSearchTerm,
    setStatusFilter,
    setDateRangePreset,
    setCustomDateRange,
    setCustomerId,
    refresh,
    exportToCsv,
  } = useAdminOrders();
  const reducedMotion = usePrefersReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [customFrom, setCustomFrom] = useState(filters.dateRange.from ?? "");
  const [customTo, setCustomTo] = useState(filters.dateRange.to ?? "");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    const customerParam = searchParams.get("customer");
    if (customerParam) {
      setCustomerId(customerParam);
    }
  }, [searchParams, setCustomerId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchValue);
      const nextParams = new URLSearchParams(searchParams);
      if (searchValue) {
        nextParams.set("query", searchValue);
      } else {
        nextParams.delete("query");
      }
      setSearchParams(nextParams, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setSearchParams, setSearchTerm]);

  useEffect(() => {
    if (filters.dateRange.preset !== "custom") {
      setCustomFrom("");
      setCustomTo("");
    }
  }, [filters.dateRange.preset]);

  const selectedOrder = useMemo(
    () => visibleOrders.find((order) => order.id === selectedOrderId) ?? null,
    [visibleOrders, selectedOrderId]
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csv = exportToCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 60);
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const handleRowKeyDown = (index: number, event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? "down" : "up";
      const nextIndex = getNextRowIndex(index, direction, visibleOrders.length);
      if (nextIndex >= 0) {
        rowRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedOrderId(visibleOrders[index]?.id ?? null);
    }
  };

  const applyCustomRange = () => {
    setCustomDateRange(customFrom || null, customTo || null);
  };

  return (
    <div data-page="admin-orders" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageTitle
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              aria-label="تحديث الطلبات"
              className="inline-flex items-center gap-2 border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)]/90"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              <span>تحديث</span>
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || isLoading || total === 0}
              aria-label="تصدير الطلبات إلى CSV"
              className="inline-flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
              <span>تصدير CSV</span>
            </UnifiedButton>
          </div>
        }
      />

      {isLoading ? (
        <OrdersSkeleton />
      ) : (
        <UnifiedCard
          variant="glass"
          data-section="orders-table"
          className="border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/88"
        >
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <UnifiedInput
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="ابحث عن رقم الطلب أو العميل أو رقم الجوال"
                  aria-label="بحث في الطلبات"
                  className="w-full border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 pr-10 text-[color:var(--glass-fg)]"
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" aria-hidden />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 px-3 py-2 text-xs text-[color:var(--muted-foreground)]">
                <Filter className="h-4 w-4" aria-hidden />
                <span aria-live="polite">{total} طلب</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="تصنيف الطلبات حسب الحالة">
              {statusFilters.map((filter, index) => {
                const isActive = filters.status === filter.value;
                return (
                  <UnifiedButton
                    key={filter.value}
                    variant={isActive ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                    aria-pressed={isActive}
                    data-index={index}
                    className="rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)]/90"
                  >
                    {filter.label}
                  </UnifiedButton>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3" role="group" aria-label="فلترة حسب التاريخ">
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 px-3 py-2 text-xs text-[color:var(--muted-foreground)]">
                <CalendarDays className="h-4 w-4" aria-hidden />
                <span>نطاق التاريخ</span>
              </div>
              {datePresets.map((preset) => {
                const isActive = filters.dateRange.preset === preset.value;
                return (
                  <UnifiedButton
                    key={preset.value}
                    variant={isActive ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setDateRangePreset(preset.value)}
                    aria-pressed={isActive}
                    className="rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)]/90"
                  >
                    {preset.label}
                  </UnifiedButton>
                );
              })}
              {filters.dateRange.preset === "custom" ? (
                <div className="flex flex-wrap items-center gap-2 text-sm" data-custom-range>
                  <label className="flex items-center gap-2">
                    <span className="text-[color:var(--muted-foreground)]">من</span>
                    <UnifiedInput
                      type="date"
                      value={customFrom}
                      onChange={(event) => setCustomFrom(event.target.value)}
                      className="border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 text-[color:var(--glass-fg)]"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-[color:var(--muted-foreground)]">إلى</span>
                    <UnifiedInput
                      type="date"
                      value={customTo}
                      onChange={(event) => setCustomTo(event.target.value)}
                      className="border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 text-[color:var(--glass-fg)]"
                    />
                  </label>
                  <UnifiedButton
                    size="sm"
                    variant="outline"
                    onClick={applyCustomRange}
                    className="border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)]/90"
                  >
                    تطبيق
                  </UnifiedButton>
                </div>
              ) : null}
            </div>

            <div className="overflow-x-auto" data-scroll-region>
              <table className="min-w-full divide-y divide-[color:var(--glass-border)] text-sm text-[color:var(--glass-fg)]" role="grid">
                <thead>
                  <tr className="bg-[color:var(--glass-bg)]/60">
                    <th scope="col" className="px-4 py-3 text-right font-medium">رقم الطلب</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">العميل</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">الحالة</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">الإجمالي</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--glass-border)]">
                  {visibleOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      ref={(element) => {
                        rowRefs.current[index] = element;
                      }}
                      className="cursor-pointer bg-[color:var(--glass-bg)]/40 transition-colors hover:bg-[color:var(--glass-bg)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]"
                      tabIndex={0}
                      data-row-index={index}
                      onClick={() => setSelectedOrderId(order.id)}
                      onKeyDown={(event) => handleRowKeyDown(index, event)}
                    >
                      <td className="px-4 py-3 font-medium">{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>{order.customerName}</span>
                          <span className="text-xs text-[color:var(--muted-foreground)]">{showFullData ? order.customerPhone : maskPhone(order.customerPhone)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                          data-variant={statusVariants[order.status] ?? "muted"}
                        >
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{currency.format(order.total)}</td>
                      <td className="px-4 py-3 text-[color:var(--muted-foreground)]">
                        {new Date(order.placedAt).toLocaleString("ar-SA", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                  {visibleOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-[color:var(--muted-foreground)]">
                        لا توجد طلبات مطابقة للبحث الحالي.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[color:var(--glass-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                عرض {visibleOrders.length} من {total}
              </p>
              <UnifiedButton
                variant="outline"
                onClick={handleLoadMore}
                disabled={!hasMore}
                size="sm"
                className="border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)]/90"
              >
                {hasMore ? "تحميل المزيد" : "لا مزيد"}
              </UnifiedButton>
            </div>
          </div>
        </UnifiedCard>
      )}

      <Suspense fallback={null}>
        <OrderDetailsDrawer
          open={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          reducedMotion={reducedMotion}
        />
      </Suspense>
    </div>
  );
};

export default AdminOrdersPage;
