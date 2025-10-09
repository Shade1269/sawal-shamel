import { lazy, Suspense, useMemo, useState } from "react";
import { CalendarDays, Download, Filter, Loader2, RefreshCw, Search, Eye } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useFastAuth } from "@/hooks/useFastAuth";
import { maskPhone, shouldShowFullCustomerData } from "@/lib/privacy";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Skeleton } from "@/ui/Skeleton";
import { useUnifiedOrders } from "@/hooks/useUnifiedOrders";
import { Badge } from "@/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  pending: "بانتظار الدفع",
  confirmed: "مؤكد",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  refunded: "مسترد",
};

const statusVariants: Record<string, string> = {
  pending: "warning",
  confirmed: "info",
  processing: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "muted",
  refunded: "danger",
};

const sourceLabels: Record<string, string> = {
  ecommerce: "متجر إلكتروني",
  simple: "طلب بسيط",
  manual: "يدوي",
};

const UnifiedAdminOrders = () => {
  const { profile } = useFastAuth();
  const showFullData = shouldShowFullCustomerData(profile?.role);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const status = searchParams.get("status") || "";
  const dateRange = searchParams.get("dateRange") || "30d";
  const searchQuery = searchParams.get("search") || "";
  const source = searchParams.get("source") || "";

  // حساب تواريخ الفلترة
  const dateFilter = useMemo(() => {
    const now = new Date();
    if (dateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { dateFrom: today.toISOString() };
    } else if (dateRange === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateFrom: sevenDaysAgo.toISOString() };
    } else if (dateRange === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateFrom: thirtyDaysAgo.toISOString() };
    }
    return {};
  }, [dateRange]);

  const { orders, loading, error, refreshOrders } = useUnifiedOrders({
    status: status || undefined,
    source: source as any,
    searchQuery: searchQuery || undefined,
    ...dateFilter,
  });

  const handleExportCSV = () => {
    const csv = [
      ["رقم الطلب", "العميل", "الهاتف", "المبلغ", "الحالة", "المصدر", "التاريخ"].join(","),
      ...orders.map((order) =>
        [
          order.order_number,
          order.customer_name,
          showFullData ? order.customer_phone : maskPhone(order.customer_phone),
          order.total_amount_sar,
          statusLabels[order.status] || order.status,
          sourceLabels[order.source] || order.source,
          new Date(order.created_at).toLocaleDateString("ar-SA"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-1">عرض وإدارة جميع الطلبات ({orders.length})</p>
          <Badge className="mt-2 bg-green-500 text-white">
            النظام الموحد - order_hub
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={refreshOrders}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                  value={searchQuery}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value) {
                      params.set("search", e.target.value);
                    } else {
                      params.delete("search");
                    }
                    setSearchParams(params);
                  }}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set("status", e.target.value);
                } else {
                  params.delete("status");
                }
                setSearchParams(params);
              }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">بانتظار الدفع</option>
              <option value="confirmed">مؤكد</option>
              <option value="processing">قيد المعالجة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>

            {/* Source Filter */}
            <select
              value={source}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set("source", e.target.value);
                } else {
                  params.delete("source");
                }
                setSearchParams(params);
              }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">جميع المصادر</option>
              <option value="ecommerce">متجر إلكتروني</option>
              <option value="simple">طلب بسيط</option>
              <option value="manual">يدوي</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                params.set("dateRange", e.target.value);
                setSearchParams(params);
              }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="today">اليوم</option>
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-red-500 mb-2">حدث خطأ في تحميل الطلبات</p>
            <p className="text-sm">{error}</p>
            <Button onClick={refreshOrders} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            <p>لا توجد طلبات مطابقة للفلاتر المحددة</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg">#{order.order_number}</span>
                    <Badge variant={statusVariants[order.status] as any}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                    <Badge variant="outline">{sourceLabels[order.source] || order.source}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      العميل: <span className="text-foreground">{order.customer_name}</span>
                    </p>
                    <p>
                      الهاتف:{" "}
                      <span className="text-foreground">
                        {showFullData ? order.customer_phone : maskPhone(order.customer_phone)}
                      </span>
                    </p>
                    <p>
                      المبلغ:{" "}
                      <span className="text-foreground font-semibold">
                        {order.total_amount_sar.toFixed(2)} ر.س
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-left text-sm text-muted-foreground">
                  <p>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedAdminOrders;
