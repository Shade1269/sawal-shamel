import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Download, Loader2, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageTitle } from "@/components/app-shell/PageTitle";
import { useAdminCustomers, getNextCustomerIndex } from "@/hooks/useAdminCustomers";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { UnifiedButton, UnifiedCard, UnifiedInput } from "@/components/design-system";
import { Skeleton } from "@/ui/Skeleton";

const CustomerDetailsDrawer = lazy(() => import("./components/CustomerDetailsDrawer"));

const datePresets: { value: "all" | "7d" | "30d" | "90d" | "custom"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "7d", label: "آخر 7 أيام" },
  { value: "30d", label: "آخر 30 يوم" },
  { value: "90d", label: "آخر 90 يوم" },
  { value: "custom", label: "مخصص" },
];

const CustomersSkeleton = () => (
  <UnifiedCard
    variant="glass"
    padding="md"
    hover="none"
    data-state="loading"
  >
    <div className="space-y-5 p-6">
      <Skeleton className="h-10 w-full rounded" />
      <div className="flex flex-wrap items-center gap-3">
        {datePresets.map((preset) => (
          <Skeleton key={preset.value} className="h-9 w-28 rounded-full" />
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

const AdminCustomersPage = () => {
  const {
    visibleCustomers,
    total,
    isLoading,
    filters,
    hasMore,
    loadMore,
    setSearchTerm,
    setDateRangePreset,
    setCustomDateRange,
    setSpendRange,
    setSort,
    refresh,
    exportToCsv,
  } = useAdminCustomers();
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [customFrom, setCustomFrom] = useState(filters.dateRange.from ?? "");
  const [customTo, setCustomTo] = useState(filters.dateRange.to ?? "");
  const [minSpend, setMinSpend] = useState(filters.spendRange.min?.toString() ?? "");
  const [maxSpend, setMaxSpend] = useState(filters.spendRange.max?.toString() ?? "");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (filters.dateRange.preset !== "custom") {
      setCustomFrom("");
      setCustomTo("");
    }
  }, [filters.dateRange.preset]);

  const selectedCustomer = useMemo(
    () => visibleCustomers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [visibleCustomers, selectedCustomerId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, setSearchTerm]);

  const applySpendRange = () => {
    const min = minSpend ? Number(minSpend) : null;
    const max = maxSpend ? Number(maxSpend) : null;
    setSpendRange(Number.isFinite(min ?? 0) ? min : null, Number.isFinite(max ?? 0) ? max : null);
  };

  const applyCustomDateRange = () => {
    setCustomDateRange(customFrom || null, customTo || null);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csv = exportToCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customers-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 60);
  };

  const handleRowKeyDown = (index: number, event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? "down" : "up";
      const nextIndex = getNextCustomerIndex(index, direction, visibleCustomers.length);
      if (nextIndex >= 0) {
        rowRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedCustomerId(visibleCustomers[index]?.id ?? null);
    }
  };

  const handleViewOrders = (customerId: string) => {
    navigate(`/admin/orders?customer=${customerId}`, { replace: false });
  };

  const handleLoadMore = () => {
    loadMore();
  };

  return (
    <div data-page="admin-customers" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageTitle
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              aria-label="تحديث بيانات العملاء"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              <span>تحديث</span>
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || isLoading || total === 0}
              aria-label="تصدير العملاء إلى CSV"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
              <span>تصدير CSV</span>
            </UnifiedButton>
          </div>
        }
      />

      {isLoading ? (
        <CustomersSkeleton />
      ) : (
        <UnifiedCard
          variant="glass"
          padding="md"
          hover="none"
          data-section="customers-table"
        >
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <UnifiedInput
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="ابحث عن اسم أو بريد أو رقم جوال"
                  aria-label="بحث في العملاء"
                  className="w-full pr-10"
                  variant="glass"
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" aria-hidden />
              </div>
              <div className="flex flex-wrap items-center gap-3" role="group" aria-label="فلترة العملاء">
                <div className="flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 px-3 py-2 text-xs text-[color:var(--muted-foreground)]">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  <span aria-live="polite">{total} عميل</span>
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
                      className="rounded-full"
                    >
                      {preset.label}
                    </UnifiedButton>
                  );
                })}
              </div>
            </div>

            {filters.dateRange.preset === "custom" ? (
              <div className="flex flex-wrap items-center gap-3" data-custom-range>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-[color:var(--muted-foreground)]">من</span>
                  <UnifiedInput
                    type="date"
                    value={customFrom}
                    onChange={(event) => setCustomFrom(event.target.value)}
                    variant="glass"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-[color:var(--muted-foreground)]">إلى</span>
                  <UnifiedInput
                    type="date"
                    value={customTo}
                    onChange={(event) => setCustomTo(event.target.value)}
                    variant="glass"
                  />
                </label>
                <UnifiedButton
                  size="sm"
                  variant="outline"
                  onClick={applyCustomDateRange}
                >
                  تطبيق
                </UnifiedButton>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3" data-spend-range>
              <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                <span>حد الإنفاق</span>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-[color:var(--muted-foreground)]">أدنى</span>
                <UnifiedInput
                  type="number"
                  inputMode="numeric"
                  value={minSpend}
                  onChange={(event) => setMinSpend(event.target.value)}
                  className="w-32"
                  variant="glass"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-[color:var(--muted-foreground)]">أعلى</span>
                <UnifiedInput
                  type="number"
                  inputMode="numeric"
                  value={maxSpend}
                  onChange={(event) => setMaxSpend(event.target.value)}
                  className="w-32"
                  variant="glass"
                />
              </label>
              <UnifiedButton
                size="sm"
                variant="outline"
                onClick={applySpendRange}
              >
                تطبيق
              </UnifiedButton>
              <UnifiedButton
                size="sm"
                variant={filters.sort === "spend-desc" ? "primary" : "outline"}
                onClick={() => setSort(filters.sort === "spend-desc" ? "spend-asc" : "spend-desc")}
              >
                ترتيب حسب الإنفاق
              </UnifiedButton>
            </div>

            <div className="overflow-x-auto" data-scroll-region>
              <table className="min-w-full divide-y divide-[color:var(--glass-border)] text-sm text-[color:var(--glass-fg)]" role="grid">
                <thead>
                  <tr className="bg-[color:var(--glass-bg)]/60">
                    <th scope="col" className="px-4 py-3 text-right font-medium">العميل</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">جهة الاتصال</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">إجمالي الإنفاق</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">عدد الطلبات</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">آخر طلب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--glass-border)]">
                  {visibleCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      ref={(element) => {
                        rowRefs.current[index] = element;
                      }}
                      className="cursor-pointer bg-[color:var(--glass-bg)]/40 transition-colors hover:bg-[color:var(--glass-bg)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]"
                      tabIndex={0}
                      data-row-index={index}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      onKeyDown={(event) => handleRowKeyDown(index, event)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-xs text-[color:var(--muted-foreground)]">{customer.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-[color:var(--muted-foreground)]">{customer.email}</span>
                          <span className="text-xs text-[color:var(--muted-foreground)]">{customer.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{currency.format(customer.totalSpent)}</td>
                      <td className="px-4 py-3">{customer.lifetimeOrders}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>{customer.lastOrderId ?? "-"}</span>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            {customer.lastOrderTotal !== null ? currency.format(customer.lastOrderTotal) : "-"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-[color:var(--muted-foreground)]">
                        لا توجد نتائج مطابقة للبحث الحالي.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[color:var(--glass-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                عرض {visibleCustomers.length} من {total}
              </p>
              <UnifiedButton
                variant="outline"
                onClick={handleLoadMore}
                disabled={!hasMore}
                size="sm"
              >
                {hasMore ? "تحميل المزيد" : "لا مزيد"}
              </UnifiedButton>
            </div>
          </div>
        </UnifiedCard>
      )}

      <Suspense fallback={null}>
        <CustomerDetailsDrawer
          open={Boolean(selectedCustomer)}
          customer={selectedCustomer}
          onClose={() => setSelectedCustomerId(null)}
          onViewOrders={handleViewOrders}
          reducedMotion={reducedMotion}
        />
      </Suspense>
    </div>
  );
};

export default AdminCustomersPage;
