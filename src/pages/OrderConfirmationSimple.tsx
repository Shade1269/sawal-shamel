import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Copy,
  Home,
  Package,
  Receipt,
  Share2,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Badge from "@/ui/Badge";
import Skeleton from "@/ui/Skeleton";
import { supabase } from "@/integrations/supabase/client";
import { VisuallyHidden } from "@/components/app-shell/VisuallyHidden";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface OrderItem {
  id: string;
  product_title: string;
  product_image_url?: string | null;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
}

interface OrderDetails {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: {
    street?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    country?: string;
    notes?: string | null;
  } | null;
  subtotal_sar: number;
  shipping_sar: number;
  tax_sar: number;
  total_sar: number;
  payment_status: string;
  payment_method: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderConfirmationProps {
  navigateOverride?: (path: string) => void;
  supabaseOverride?: typeof supabase;
  orderOverride?: OrderDetails | null;
  errorOverride?: string | null;
  loadingOverride?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));

const statusVariantMap: Record<string, "primary" | "success" | "warning" | "danger" | "muted"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  PROCESSING: "primary",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const statusTextMap: Record<string, string> = {
  PENDING: "قيد المعالجة",
  CONFIRMED: "تم التأكيد",
  PROCESSING: "يتم تجهيز الطلب",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const paymentStatusMap: Record<string, string> = {
  PENDING: "بانتظار السداد",
  PAID: "مدفوع",
  FAILED: "فشل الدفع",
  REFUNDED: "مسترجع",
};

const formatDate = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch (error) {
    return timestamp;
  }
};

const OrderConfirmationSimple: React.FC<OrderConfirmationProps> = ({
  navigateOverride,
  supabaseOverride,
  orderOverride,
  errorOverride,
  loadingOverride,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const navigate = navigateOverride ?? useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ orderId?: string; slug?: string }>();
  const orderId = searchParams.get("orderId") ?? params.orderId ?? "";
  const storeSlug = searchParams.get("slug") ?? params.slug ?? undefined;

  const overrideProvided = typeof orderOverride !== "undefined";
  const [order, setOrder] = useState<OrderDetails | null>(orderOverride ?? null);
  const [loading, setLoading] = useState<boolean>(
    typeof loadingOverride === "boolean" ? loadingOverride : !overrideProvided,
  );
  const [error, setError] = useState<string | null>(
    typeof errorOverride === "string" ? errorOverride : null,
  );

  const supabaseClient = supabaseOverride ?? supabase;

  useEffect(() => {
    if (overrideProvided) {
      setLoading(typeof loadingOverride === "boolean" ? loadingOverride : false);
      if (typeof orderOverride !== "undefined") {
        setOrder(orderOverride);
      }
      setError(errorOverride ?? null);
      return;
    }

    if (!orderId) {
      setLoading(false);
      setOrder(null);
      setError("لم يتم تحديد الطلب");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabaseClient
          .from("ecommerce_orders")
          .select(
            `id, order_number, customer_name, customer_phone, customer_email, shipping_address, subtotal_sar, shipping_sar, tax_sar, total_sar, payment_status, payment_method, status, created_at, ecommerce_order_items ( id, product_title, product_image_url, quantity, unit_price_sar, total_price_sar )`
          )
          .eq("id", orderId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setOrder(null);
          setError("لم يتم العثور على الطلب");
          return;
        }

        const items = (data as any).ecommerce_order_items ?? [];
        setOrder({
          ...(data as any),
          items,
        });
        setError(null);
      } catch (err) {
        console.error("failed to load order", err);
        setError("حدث خطأ أثناء جلب تفاصيل الطلب");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [orderId, supabaseClient, overrideProvided, orderOverride, errorOverride, loadingOverride]);

  const paymentStatusText = order ? paymentStatusMap[order.payment_status] ?? order.payment_status : "";
  const orderStatusText = order ? statusTextMap[order.status] ?? order.status : "";
  const orderStatusVariant = order ? statusVariantMap[order.status] ?? "muted" : "muted";

  const totals = useMemo(() => {
    if (!order) return null;
    return [
      { label: "المجموع الفرعي", value: formatCurrency(order.subtotal_sar) },
      { label: "الشحن", value: formatCurrency(order.shipping_sar) },
      { label: "الضريبة", value: formatCurrency(order.tax_sar) },
      { label: "الإجمالي", value: formatCurrency(order.total_sar), emphasize: true },
    ];
  }, [order]);

  const copyOrderNumber = () => {
    if (!order) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setError("النسخ غير مدعوم في متصفحك");
      return;
    }

    void navigator.clipboard
      .writeText(order.order_number || order.id)
      .then(() => toast.success("تم نسخ رقم الطلب"))
      .catch(() => setError("تعذر نسخ رقم الطلب"));
  };

  const shareOrder = () => {
    if (!order) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator
        .share({
          title: "تفاصيل الطلب",
          text: `رقم الطلب: ${order.order_number}`,
          url: window?.location?.href,
        })
        .catch(() => {
          /* user cancelled */
        });
    } else {
      copyOrderNumber();
    }
  };

  const goToStore = () => {
    if (storeSlug) {
      navigate(`/${storeSlug}`);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-16">
        <div className="w-full space-y-[var(--spacing-md)]">
          <Skeleton height={48} radius="lg" />
          <Skeleton height={220} radius="lg" />
          <Skeleton height={320} radius="lg" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-[var(--spacing-md)] px-4 text-center">
        <Card className="w-full space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]">
          <Package className="mx-auto h-12 w-12 text-[color:var(--fg-muted)]" aria-hidden />
          <h1 className="text-xl font-semibold text-[color:var(--glass-fg)]">لم يتم العثور على الطلب</h1>
          <p className="text-sm text-[color:var(--fg-muted)]">{error ?? "تحقق من الرابط أو حاول مرة أخرى لاحقاً."}</p>
          <Button variant="solid" onClick={() => navigate("/")}>العودة للصفحة الرئيسية</Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-5xl flex-col gap-[var(--spacing-lg)] px-4 py-10"
      data-reduced-motion={prefersReducedMotion ? "true" : undefined}
    >
      <VisuallyHidden aria-live="polite">
        تم إنشاء الطلب بنجاح. رقم الطلب {order.order_number}. حالة الطلب {orderStatusText}.
      </VisuallyHidden>

      <header className="flex flex-col gap-[var(--spacing-sm)] text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[color:var(--accent)]" aria-hidden />
        <h1 className="text-2xl font-semibold text-[color:var(--glass-fg)]">شكرًا لطلبك!</h1>
        <p className="text-sm text-[color:var(--fg-muted)]">
          تم استلام طلبك بنجاح وسيتم التواصل معك فور التحديث.
        </p>
      </header>

      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-[var(--spacing-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/95 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-strong)]" aria-labelledby="order-receipt-heading">
          <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-sm)]">
            <div>
              <h2 id="order-receipt-heading" className="text-lg font-semibold text-[color:var(--glass-fg)]">
                إيصال الطلب
              </h2>
              <p className="text-xs text-[color:var(--fg-muted)]">رقم الطلب {order.order_number}</p>
            </div>
            <Badge variant={orderStatusVariant} aria-live="polite">
              {orderStatusText}
            </Badge>
          </div>

          <div className="grid gap-[var(--spacing-md)]" aria-label="قائمة المنتجات">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--surface)]/70 p-[var(--spacing-md)]"
              >
                <div className="flex items-center gap-[var(--spacing-md)]">
                  <div className="h-14 w-14 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--glass-border)] bg-[color:var(--surface-2)]">
                    <img
                      src={item.product_image_url || "/placeholder.svg"}
                      alt={item.product_title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[color:var(--glass-fg)]">{item.product_title}</p>
                    <p className="text-xs text-[color:var(--fg-muted)]">الكمية: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[color:var(--accent)]">
                  {formatCurrency(item.total_price_sar)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-[var(--spacing-sm)] border-t border-dashed border-[color:var(--glass-border)] pt-[var(--spacing-md)] text-sm">
            {totals?.map((row) => (
              <div
                key={row.label}
                className={`flex items-center justify-between ${row.emphasize ? "text-base font-semibold text-[color:var(--glass-fg)]" : "text-[color:var(--fg-muted)]"}`}
              >
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-[var(--spacing-sm)]">
            <Button variant="solid" size="sm" leftIcon={<Copy className="h-4 w-4" aria-hidden />} onClick={copyOrderNumber}>
              نسخ رقم الطلب
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Share2 className="h-4 w-4" aria-hidden />} onClick={shareOrder}>
              مشاركة التفاصيل
            </Button>
          </div>
        </Card>

        <Card className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]" aria-label="تفاصيل إضافية عن الطلب">
          <div className="space-y-[var(--spacing-xs)]">
            <h3 className="text-base font-semibold text-[color:var(--glass-fg)]">ملخص سريع</h3>
            <div className="flex items-center gap-[var(--spacing-sm)] text-sm text-[color:var(--fg-muted)]">
              <Receipt className="h-4 w-4" aria-hidden />
              <span>{paymentStatusText} — {order.payment_method === "cod" ? "الدفع عند الاستلام" : order.payment_method}</span>
            </div>
            <div className="flex items-center gap-[var(--spacing-sm)] text-sm text-[color:var(--fg-muted)]">
              <Calendar className="h-4 w-4" aria-hidden />
              <span>تم الإنشاء في {formatDate(order.created_at)}</span>
            </div>
          </div>

          <div className="space-y-[var(--spacing-xs)]">
            <h3 className="text-base font-semibold text-[color:var(--glass-fg)]">عنوان الشحن</h3>
            <p className="text-sm text-[color:var(--fg-muted)]">
              {[order.shipping_address?.street, order.shipping_address?.district, order.shipping_address?.city, order.shipping_address?.postal_code]
                .filter(Boolean)
                .join("، ") || "لم يتم إدخال عنوان"}
            </p>
            {order.shipping_address?.notes ? (
              <p className="text-xs text-[color:var(--fg-muted)]">ملاحظات: {order.shipping_address.notes}</p>
            ) : null}
          </div>

          <div className="space-y-[var(--spacing-sm)]">
            <h3 className="text-base font-semibold text-[color:var(--glass-fg)]">الخطوات التالية</h3>
            <ul className="list-disc space-y-[var(--spacing-xs)] pr-5 text-sm text-[color:var(--fg-muted)]">
              <li>احتفظ برقم الطلب للمراجعة السريعة.</li>
              <li>سنتواصل عبر الجوال لتأكيد موعد التسليم.</li>
              <li>يمكنك الرجوع لهذه الصفحة من لوحة الطلبات في أي وقت.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-[var(--spacing-sm)]">
            <Button variant="solid" size="sm" leftIcon={<ShoppingBag className="h-4 w-4" aria-hidden />} onClick={goToStore}>
              العودة للمتجر
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Home className="h-4 w-4" aria-hidden />} onClick={() => navigate("/")}>
              الرئيسية
            </Button>
          </div>
        </Card>
      </section>

      {error ? (
        <div
          className="rounded-[var(--radius-lg)] border border-[color:var(--danger-border, rgba(220, 38, 38, 0.35))] bg-[color:var(--danger-bg, rgba(248, 113, 113, 0.08))] p-[var(--spacing-md)] text-sm text-[color:var(--danger-fg, #b91c1c)]"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
};

export default OrderConfirmationSimple;
