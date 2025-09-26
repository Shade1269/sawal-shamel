import { useEffect, useMemo, useRef } from "react";
import { ArrowUpRight, Mail, Phone, ShoppingBag, X } from "lucide-react";

import type { AdminCustomer } from "@/hooks/useAdminCustomers";
import { Button } from "@/ui/Button";

const currency = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
});

type CustomerDetailsDrawerProps = {
  open: boolean;
  customer: AdminCustomer | null;
  reducedMotion: boolean;
  onClose: () => void;
  onViewOrders: (customerId: string) => void;
};

const focusableSelectors = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
];

const CustomerDetailsDrawer = ({ open, customer, reducedMotion, onClose, onViewOrders }: CustomerDetailsDrawerProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const focusableElements = useMemo(() => {
    if (!open || typeof document === "undefined") return [] as HTMLElement[];
    const root = panelRef.current;
    if (!root) return [] as HTMLElement[];
    return Array.from(root.querySelectorAll<HTMLElement>(focusableSelectors.join(",")));
  }, [open, customer]);

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

  if (!open || !customer) {
    return null;
  }

  const handleViewOrders = () => {
    onViewOrders(customer.id);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
      data-drawer="customer-details"
      data-focus-trap="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق بطاقة العميل"
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
          <h2 className="text-lg font-semibold">بيانات العميل</h2>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-full border border-transparent text-[color:var(--muted-foreground)] hover:border-[color:var(--glass-border)] hover:text-[color:var(--glass-fg)]"
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <div className="h-full overflow-y-auto p-5 space-y-6" data-section="customer-details-body">
          <section className="space-y-3" data-section="customer-summary">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--muted-foreground)]">اسم العميل</span>
              <span className="font-semibold">{customer.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--muted-foreground)]">إجمالي الإنفاق</span>
              <span className="text-base font-semibold">{currency.format(customer.totalSpent)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[color:var(--muted-foreground)]">عدد الطلبات</span>
              <span>{customer.lifetimeOrders}</span>
            </div>
            <div className="flex flex-wrap gap-2" data-section="customer-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewOrders}
                className="inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                عرض في الطلبات
              </Button>
            </div>
          </section>

          <section className="space-y-3" data-section="customer-contact">
            <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">بيانات التواصل</h3>
            <div className="grid gap-2">
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 px-3 py-2 text-[color:var(--glass-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]"
              >
                <Phone className="h-4 w-4" aria-hidden />
                {customer.phone}
              </a>
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 px-3 py-2 text-[color:var(--glass-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]"
              >
                <Mail className="h-4 w-4" aria-hidden />
                {customer.email}
              </a>
            </div>
          </section>

          <section className="space-y-3" data-section="customer-last-orders">
            <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">آخر الطلبات</h3>
            <ul className="space-y-2">
              {customer.lastOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">{new Date(order.placedAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium">{currency.format(order.total)}</span>
                    <span className="text-xs text-[color:var(--muted-foreground)]">{order.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3" data-section="customer-metrics">
            <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">مؤشرات مختصرة</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 p-3">
                <p className="text-xs text-[color:var(--muted-foreground)]">آخر نشاط</p>
                <p className="text-base font-semibold">{new Date(customer.lastActiveAt).toLocaleDateString("ar-SA")}</p>
              </div>
              <div className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 p-3">
                <p className="text-xs text-[color:var(--muted-foreground)]">أحدث إنفاق</p>
                <p className="text-base font-semibold">
                  {customer.lastOrderTotal !== null ? currency.format(customer.lastOrderTotal) : "-"}
                </p>
              </div>
            </div>
          </section>

          {customer.notes ? (
            <section className="space-y-2" data-section="customer-notes">
              <h3 className="text-sm font-semibold text-[color:var(--glass-fg)]">ملاحظات</h3>
              <p className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/40 p-3 text-sm text-[color:var(--muted-foreground)]">
                {customer.notes}
              </p>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-2" data-section="customer-cta">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOrders}
              className="inline-flex items-center gap-2"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden />
              فتح في الطلبات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsDrawer;
