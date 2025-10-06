import { useEffect, useMemo, useRef } from "react";
import { Copy, ExternalLink, MapPin, Phone, X } from "lucide-react";

import type { AdminOrder } from "@/hooks/useAdminOrders";
import { useFastAuth } from "@/hooks/useFastAuth";
import { maskPhone, maskEmail, shouldShowFullCustomerData } from "@/lib/privacy";
import { Button } from "@/ui/Button";

const currency = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
});

type OrderDetailsDrawerProps = {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
  reducedMotion: boolean;
};

const focusableSelectors = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
];

const copyToClipboard = async (value: string) => {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch (error) {
    console.warn("clipboard copy failed", error);
    return false;
  }
};

const buildConfirmationLink = (orderId: string) => `${window.location.origin}/order/confirmation?id=${orderId}`;

const OrderDetailsDrawer = ({ open, order, onClose, reducedMotion }: OrderDetailsDrawerProps) => {
  const { profile } = useFastAuth();
  const showFullData = shouldShowFullCustomerData(profile?.role);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const focusableElements = useMemo(() => {
    if (!open || typeof document === "undefined") return [] as HTMLElement[];
    const root = panelRef.current;
    if (!root) return [] as HTMLElement[];
    return Array.from(root.querySelectorAll<HTMLElement>(focusableSelectors.join(",")));
  }, [open, order]);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus({ preventScroll: true });

    const keyListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (active === first) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, [open, onClose, focusableElements]);

  if (!open || !order) {
    return null;
  }

  const confirmationLink = typeof window !== "undefined" ? buildConfirmationLink(order.confirmationId) : "";

  const handleCopyOrderId = () => {
    void copyToClipboard(order.id);
  };

  const handleCopyConfirmation = () => {
    if (!confirmationLink) return;
    void copyToClipboard(confirmationLink);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
      data-drawer="order-details"
      data-focus-trap="true"
    >
      <button
        type="button"
        aria-label="إغلاق تفاصيل الطلب"
        onClick={onClose}
        className="absolute inset-0 bg-[color:var(--glass-backdrop)]"
        data-close-on-esc="true"
      />
      <div
        ref={panelRef}
        className={`relative h-full w-full max-w-md border-l border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/95 text-[color:var(--glass-fg)] backdrop-blur-xl ${
          reducedMotion ? "" : "transition-transform duration-300 ease-out"
        }`}
        style={{ transform: "translateX(0%)" }}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--glass-border)] px-4 py-3">
          <h2 className="text-lg font-semibold">تفاصيل الطلب</h2>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
        size="sm"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-full border border-transparent text-[color:var(--muted-foreground)] hover:border-[color:var(--glass-border)] hover:text-[color:var(--glass-fg)]"
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <div className="h-full overflow-y-auto p-5 space-y-6" data-section="order-details-body">
          <section className="space-y-3" data-section="order-summary">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--muted-foreground)]">رقم الطلب</span>
              <span className="font-semibold">{order.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--muted-foreground)]">الحالة</span>
              <span className="rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 px-3 py-1 text-xs">
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--muted-foreground)]">المجموع</span>
              <span className="text-base font-semibold">{currency.format(order.total)}</span>
            </div>
            <div className="flex flex-wrap gap-2" data-section="order-actions">
              <Button variant="outline" size="sm" onClick={handleCopyOrderId} className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4" aria-hidden />
                انسخ رقم الطلب
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyConfirmation}
                disabled={!confirmationLink}
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                انسخ رابط التأكيد
              </Button>
            </div>
          </section>

          <section className="space-y-3" data-section="order-customer">
            <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">العميل</h3>
            <div className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{order.customerName}</span>
                <Button variant="ghost" size="sm" aria-label="اتصال بالعميل" className="text-[color:var(--muted-foreground)] hover:text-[color:var(--glass-fg)]">
                  <Phone className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <p className="text-xs text-[color:var(--muted-foreground)]">{showFullData ? order.customerEmail : maskEmail(order.customerEmail)}</p>
              <p className="text-xs text-[color:var(--muted-foreground)]">{showFullData ? order.customerPhone : maskPhone(order.customerPhone)}</p>
            </div>
          </section>

          <section className="space-y-3" data-section="order-address">
            <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">عنوان الشحن</h3>
            <div className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[color:var(--muted-foreground)]" aria-hidden />
                <span>{order.shippingAddress.line1}</span>
              </div>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {order.shippingAddress.city}، {order.shippingAddress.region}
              </p>
              {order.shippingAddress.notes ? (
                <p className="text-xs text-[color:var(--muted-foreground)]">{order.shippingAddress.notes}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-3" data-section="order-items">
            <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">العناصر</h3>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">عدد {item.quantity}</p>
                  </div>
                  <span className="text-sm">{currency.format(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3" data-section="order-payments">
            <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">المدفوعات</h3>
            <ul className="space-y-2">
              {order.payments.map((payment) => (
                <li
                  key={payment.id}
                  className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span>{payment.method}</span>
                    <span>{currency.format(payment.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
                    <span>{payment.status}</span>
                    <span>{new Date(payment.paidAt).toLocaleString("ar-SA")}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {order.notes ? (
            <section className="space-y-2" data-section="order-notes">
              <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">ملاحظات</h3>
              <p className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 p-3 text-sm text-[color:var(--muted-foreground)]">
                {order.notes}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsDrawer;
