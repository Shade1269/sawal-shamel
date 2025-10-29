import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  Trash2,
  Truck,
  User,
} from "lucide-react";

import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Skeleton from "@/ui/Skeleton";
import Badge from "@/ui/Badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useFastAuth } from "@/hooks/useFastAuth";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { VisuallyHidden } from "@/components/app-shell/VisuallyHidden";
import { GeideaPayment } from "@/components/payment/GeideaPayment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PaymentSection = React.lazy(() => import("./checkout/CheckoutPaymentSection"));
const SummaryExtras = React.lazy(() => import("./checkout/CheckoutSummaryExtras"));

const SHIPPING_OPTIONS = [
  {
    id: "standard",
    label: "شحن عادي",
    description: "3-5 أيام عمل",
    cost: 18,
    icon: <Truck className="h-4 w-4" aria-hidden />,
  },
  {
    id: "express",
    label: "شحن سريع",
    description: "1-2 يوم",
    cost: 28,
    icon: <Truck className="h-4 w-4" aria-hidden />,
  },
] as const;

const PAYMENT_METHODS = [
  {
    id: "cod",
    title: "الدفع عند الاستلام",
    description: "سدد المبلغ نقداً عند استلام الطلب",
    icon: <Banknote className="h-4 w-4" aria-hidden />,
  },
  {
    id: "geidea",
    title: "الدفع الإلكتروني - Geidea",
    description: "ادفع بأمان عبر بطاقة الائتمان أو مدى",
    icon: <CreditCard className="h-4 w-4" aria-hidden />,
  },
  {
    id: "card",
    title: "بطاقة بنكية (قريباً)",
    description: "إدخال بيانات البطاقة والدفع الآمن",
    icon: <CreditCard className="h-4 w-4" aria-hidden />,
    disabled: true,
  },
  {
    id: "wallet",
    title: "محفظة رقمية (قريباً)",
    description: "Apple Pay / STC Pay",
    icon: <CheckCircle2 className="h-4 w-4" aria-hidden />,
    disabled: true,
  },
] as const;

const TAX_RATE = 0.15;
const QUANTITY_DEBOUNCE = 320;
const NAME_WARNING_THRESHOLD = 70;

const ensureLocalStorage = () => {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem("storefront:last-slug")) return;
  // the storefront page writes this value; nothing to do if missing yet
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));

interface CheckoutPageProps {
  hookOverride?: Partial<ReturnType<typeof useShoppingCart>> & {
    cart?: ReturnType<typeof useShoppingCart>["cart"];
    loading?: boolean;
  };
  fastAuthOverride?: Partial<ReturnType<typeof useFastAuth>>;
  navigateOverride?: (path: string) => void;
  supabaseOverride?: typeof supabase;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  hookOverride,
  fastAuthOverride,
  navigateOverride,
  supabaseOverride,
}) => {
  ensureLocalStorage();

  const prefersReducedMotion = usePrefersReducedMotion();
  const navigateHook = useNavigate();
  const navigate = navigateOverride ?? navigateHook;
  const auth = useFastAuth();
  const cartHook = useShoppingCart();

  const profile = fastAuthOverride?.profile ?? auth.profile;
  const cart = hookOverride?.cart ?? cartHook.cart;
  const cartLoading = hookOverride?.loading ?? cartHook.loading;
  const updateQuantity = hookOverride?.updateQuantity ?? cartHook.updateQuantity;
  const removeFromCart = hookOverride?.removeFromCart ?? cartHook.removeFromCart;
  const clearCart = hookOverride?.clearCart ?? cartHook.clearCart;

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    postalCode: "",
    country: "المملكة العربية السعودية",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0].id);
  const [shippingMethod, setShippingMethod] = useState<(typeof SHIPPING_OPTIONS)[number]["id"]>(
    SHIPPING_OPTIONS[0].id,
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showGeideaPayment, setShowGeideaPayment] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const quantityState = useState<Record<string, number>>({});
  const [quantities, setQuantities] = quantityState;
  const quantityTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const swipeStarts = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!cart?.items?.length) return;
    setQuantities((prev) => {
      const next = { ...prev };
      for (const item of cart.items) {
        next[item.id] = item.quantity;
      }
      return next;
    });
  }, [cart?.items, setQuantities]);

  useEffect(() => {
    if (!profile) return;
    setCustomerInfo((prev) => ({
      ...prev,
      name: prev.name || profile.full_name || "",
      email: prev.email || profile.email || "",
    }));
  }, [profile]);

  const shippingCost = useMemo(() => {
    const option = SHIPPING_OPTIONS.find((opt) => opt.id === shippingMethod) ?? SHIPPING_OPTIONS[0];
    return option.cost;
  }, [shippingMethod]);

  const computedItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.map((item) => {
      const quantity = quantities[item.id] ?? item.quantity;
      return {
        ...item,
        quantity,
        total: quantity * item.unit_price_sar,
      };
    });
  }, [cart?.items, quantities]);

  const subtotal = useMemo(
    () => computedItems.reduce((acc, item) => acc + item.total, 0),
    [computedItems],
  );
  const taxAmount = useMemo(() => (subtotal + shippingCost) * TAX_RATE, [shippingCost, subtotal]);
  const grandTotal = subtotal + shippingCost + taxAmount;

  const totalsAnnouncement = `المجموع الكلي المحدث هو ${formatCurrency(grandTotal)} شامل الرسوم.`;

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!customerInfo.name.trim()) errors.name = "الاسم مطلوب";
    if (!customerInfo.phone.trim()) errors.phone = "رقم الهاتف مطلوب";
    if (customerInfo.phone && customerInfo.phone.trim().length < 9)
      errors.phone = "يرجى إدخال رقم هاتف صحيح";
    if (!customerInfo.street.trim()) errors.street = "العنوان مطلوب";
    if (!customerInfo.city.trim()) errors.city = "المدينة مطلوبة";
    if (!paymentMethod) errors.paymentMethod = "يرجى اختيار طريقة الدفع";
    return errors;
  }, [customerInfo, paymentMethod]);

  const isFormValid = Object.keys(validationErrors).length === 0;
  const hasItems = computedItems.length > 0;

  const supabaseClient = supabaseOverride ?? supabase;

  const handleQuantityChange = (itemId: string, nextQuantity: number) => {
    if (nextQuantity < 0) return;
    setQuantities((prev) => ({ ...prev, [itemId]: nextQuantity }));

    if (quantityTimers.current[itemId]) {
      clearTimeout(quantityTimers.current[itemId]);
    }

    quantityTimers.current[itemId] = setTimeout(async () => {
      try {
        await updateQuantity(itemId, nextQuantity);
      } catch (error) {
        console.error("failed to update quantity", error);
        setErrorMessage("تعذر تحديث كمية المنتج، يرجى المحاولة مرة أخرى.");
      }
    }, QUANTITY_DEBOUNCE);
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error("failed to remove item", error);
      setErrorMessage("تعذر حذف المنتج حالياً، حاول مجدداً.");
    }
  };

  const handleTouchStart = (itemId: string, clientX: number) => {
    swipeStarts.current[itemId] = clientX;
  };

  const handleTouchEnd = (itemId: string, clientX: number) => {
    const start = swipeStarts.current[itemId];
    if (typeof start !== "number") return;
    const delta = clientX - start;
    if (delta < -80) {
      void handleRemove(itemId);
    }
    delete swipeStarts.current[itemId];
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const lastStoreSlug =
    typeof window !== "undefined"
      ? window.localStorage.getItem("storefront:last-slug") ?? undefined
      : undefined;

  const emptyStateHref = lastStoreSlug ? `/${lastStoreSlug}` : "/";

  const handlePlaceOrder = async () => {
    setTouched({
      name: true,
      phone: true,
      street: true,
      city: true,
      paymentMethod: true,
    });
    setErrorMessage(null);

    if (!hasItems || !isFormValid) {
      setErrorMessage("يرجى إكمال الحقول المطلوبة قبل المتابعة.");
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryItem = cart?.items?.[0];
      if (!primaryItem) {
        throw new Error("no cart items");
      }

      const shopId = primaryItem.shop_id;
      const affiliateStoreId = cart?.affiliate_store_id ?? null;
      if (!shopId) {
        throw new Error("missing shop identifier");
      }

      // استخدام Edge Function الموحد
      const { data, error } = await supabaseClient.functions.invoke('create-ecommerce-order', {
        body: {
          cart_id: cart?.id || null,
          shop_id: shopId,
          affiliate_store_id: affiliateStoreId,
          buyer_session_id: null,
          customer: {
            name: customerInfo.name,
            email: customerInfo.email || null,
            phone: customerInfo.phone,
            address: {
              street: customerInfo.street,
              city: customerInfo.city,
              district: customerInfo.district,
              postalCode: customerInfo.postalCode,
              notes: notes,
            }
          },
          shipping: {
            cost_sar: shippingCost,
            notes: notes || null,
          },
          payment_method: paymentMethod || 'CASH_ON_DELIVERY',
        }
      });

      if (error) throw error;
      if (!data?.success || !data?.order_id) throw new Error("missing order response");

      const orderId = data.order_id;

      // إذا كانت طريقة الدفع Geidea، افتح نافذة الدفع
      if (paymentMethod === 'geidea') {
        setCurrentOrderId(orderId);
        setShowGeideaPayment(true);
        setIsSubmitting(false);
        return;
      }

      // للطرق الأخرى، امسح العربة وانتقل للتأكيد
      await clearCart();

      if (!prefersReducedMotion) {
        void import("./OrderConfirmationSimple");
      }

      navigate(`/order/confirmation?orderId=${orderId}`);
    } catch (error) {
      console.error("failed to place order", error);
      setErrorMessage("حدث خطأ أثناء معالجة الطلب. حاول مجدداً خلال لحظات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-16">
        <div className="flex w-full flex-col gap-6" aria-busy>
          <Skeleton height={28} />
          <Skeleton height={320} radius="lg" />
          <Skeleton height={260} radius="lg" />
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
        <Card
          className="w-full max-w-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]"
          data-checkout-empty
        >
          <div className="space-y-[var(--spacing-md)]">
            <div className="flex flex-col items-center gap-[var(--spacing-sm)]">
              <Trash2 className="h-10 w-10 text-[color:var(--fg-muted)]" aria-hidden />
              <h1 className="text-2xl font-semibold text-[color:var(--glass-fg)]">
                العربة فارغة حالياً
              </h1>
              <p className="max-w-md text-[color:var(--fg-muted)]">
                احفظت منتجاتك السابقة. يمكنك العودة للمتجر العام ومتابعة التصفح متى شئت.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-[var(--spacing-sm)]">
              <Button
                variant="solid"
                onClick={() => navigate(emptyStateHref)}
                data-testid="checkout-empty-cta"
              >
                عودة للمتجر
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")}>
                الصفحة الرئيسية
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const nameTooLong = customerInfo.name.length > NAME_WARNING_THRESHOLD;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-[var(--spacing-lg)] px-4 py-10">
      <header className="flex flex-col gap-[var(--spacing-md)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-[var(--spacing-sm)]">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" aria-hidden />}
            onClick={() => window.history.back()}
          >
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[color:var(--glass-fg)]">إتمام الشراء</h1>
            <p className="text-sm text-[color:var(--fg-muted)]">
              راجع منتجاتك، أدخل بياناتك، واختر طريقة الدفع المفضلة.
            </p>
          </div>
        </div>
        <Badge variant="glass" data-checkout-items-count>
          {computedItems.length} منتج
        </Badge>
      </header>

      <VisuallyHidden aria-live="polite">{totalsAnnouncement}</VisuallyHidden>
      {errorMessage ? (
        <div
          className="rounded-[var(--radius-lg)] border border-[color:var(--danger-border, rgba(220, 38, 38, 0.35))] bg-[color:var(--danger-bg, rgba(248, 113, 113, 0.08))] p-[var(--spacing-md)] text-sm text-[color:var(--danger-fg, #b91c1c)]"
          role="alert"
          aria-live="assertive"
          data-testid="checkout-error"
        >
          {errorMessage}
          <button
            type="button"
            className="ml-[var(--spacing-sm)] underline"
            onClick={() => setErrorMessage(null)}
          >
            إخفاء
          </button>
        </div>
      ) : null}

      <main className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-[var(--spacing-lg)]" aria-label="تفاصيل العميل والدفع">
          <Card className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]">
            <header className="flex items-center gap-[var(--spacing-sm)]">
              <User className="h-5 w-5 text-[color:var(--accent)]" aria-hidden />
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--glass-fg)]">بيانات العميل</h2>
                <p className="text-sm text-[color:var(--fg-muted)]">
                  تأكد من صحة بيانات التواصل والشحن.
                </p>
              </div>
            </header>

            <div className="grid gap-[var(--spacing-md)] sm:grid-cols-2" data-section="customer-fields">
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-name">الاسم الكامل *</Label>
                <Input
                  id="checkout-name"
                  value={customerInfo.name}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, name: event.target.value }))
                  }
                  onBlur={() => markTouched("name")}
                  aria-invalid={touched.name && !!validationErrors.name}
                  aria-describedby="checkout-name-hint"
                />
                <div className="min-h-[1.25rem] text-xs text-[color:var(--danger-fg, #b91c1c)]">
                  {touched.name && validationErrors.name}
                </div>
                {nameTooLong ? (
                  <p id="checkout-name-hint" className="text-xs text-[color:var(--warning-fg,#b45309)]">
                    الاسم طويل جداً؛ تأكد من ظهوره بشكل صحيح على الشحن.
                  </p>
                ) : (
                  <span id="checkout-name-hint" className="sr-only">
                    الحقل يقبل الاسم الكامل.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-phone">رقم الجوال *</Label>
                <Input
                  id="checkout-phone"
                  inputMode="tel"
                  value={customerInfo.phone}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  onBlur={() => markTouched("phone")}
                  aria-invalid={touched.phone && !!validationErrors.phone}
                />
                <div className="min-h-[1.25rem] text-xs text-[color:var(--danger-fg, #b91c1c)]">
                  {touched.phone && validationErrors.phone}
                </div>
              </div>
            </div>

            <div className="grid gap-[var(--spacing-md)] sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-email">البريد الإلكتروني</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                <div className="min-h-[1.25rem] text-xs text-[color:var(--fg-muted)]">
                  سنرسل لك تأكيد الطلب على البريد عند توفره.
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-district">الحي</Label>
                <Input
                  id="checkout-district"
                  value={customerInfo.district}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, district: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="checkout-street">العنوان *</Label>
              <Input
                id="checkout-street"
                value={customerInfo.street}
                onChange={(event) =>
                  setCustomerInfo((prev) => ({ ...prev, street: event.target.value }))
                }
                onBlur={() => markTouched("street")}
                aria-invalid={touched.street && !!validationErrors.street}
              />
              <div className="min-h-[1.25rem] text-xs text-[color:var(--danger-fg, #b91c1c)]">
                {touched.street && validationErrors.street}
              </div>
            </div>

            <div className="grid gap-[var(--spacing-md)] sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-city">المدينة *</Label>
                <Input
                  id="checkout-city"
                  value={customerInfo.city}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, city: event.target.value }))
                  }
                  onBlur={() => markTouched("city")}
                  aria-invalid={touched.city && !!validationErrors.city}
                />
                <div className="min-h-[1.25rem] text-xs text-[color:var(--danger-fg, #b91c1c)]">
                  {touched.city && validationErrors.city}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-postal">الرمز البريدي</Label>
                <Input
                  id="checkout-postal"
                  inputMode="numeric"
                  value={customerInfo.postalCode}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, postalCode: event.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-country">الدولة</Label>
                <Input
                  id="checkout-country"
                  value={customerInfo.country}
                  onChange={(event) =>
                    setCustomerInfo((prev) => ({ ...prev, country: event.target.value }))
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]">
            <header className="flex items-center gap-[var(--spacing-sm)]">
              <MapPin className="h-5 w-5 text-[color:var(--accent)]" aria-hidden />
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--glass-fg)]">اختيار الشحن</h2>
                <p className="text-sm text-[color:var(--fg-muted)]">حدد سرعة الشحن المناسبة لك.</p>
              </div>
            </header>

            <div className="grid gap-[var(--spacing-sm)]" role="radiogroup" aria-label="خيارات الشحن">
              {SHIPPING_OPTIONS.map((option) => {
                const selected = shippingMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setShippingMethod(option.id)}
                    data-selected={selected ? "true" : undefined}
                    className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/75 px-[var(--spacing-lg)] py-[var(--spacing-md)] text-start transition-colors data-[selected=true]:border-[color:var(--accent)] data-[selected=true]:bg-[color:var(--accent)]/10"
                  >
                    <div className="flex items-center gap-[var(--spacing-md)]">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--surface-2)] text-[color:var(--accent)]">
                        {option.icon}
                      </span>
                      <div>
                        <p className="font-medium text-[color:var(--glass-fg)]">{option.label}</p>
                        <p className="text-xs text-[color:var(--fg-muted)]">{option.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[color:var(--accent)]">
                      {formatCurrency(option.cost)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]">
            <header className="flex items-center gap-[var(--spacing-sm)]">
              <CreditCard className="h-5 w-5 text-[color:var(--accent)]" aria-hidden />
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--glass-fg)]">طرق الدفع</h2>
                <p className="text-sm text-[color:var(--fg-muted)]">اختر طريقة الدفع المفضلة لديك.</p>
              </div>
            </header>

            <Suspense
              fallback={
                <div
                  className="space-y-[var(--spacing-sm)]"
                  data-component="checkout-payment-options"
                  data-loading="true"
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} height={76} radius="lg" />
                  ))}
                </div>
              }
            >
              <PaymentSection
                paymentMethods={PAYMENT_METHODS}
                selectedMethod={paymentMethod}
                onSelect={(method) => {
                  setPaymentMethod(method);
                  markTouched("paymentMethod");
                }}
              />
            </Suspense>
            <div className="min-h-[1.25rem] text-xs text-[color:var(--danger-fg, #b91c1c)]">
              {touched.paymentMethod && validationErrors.paymentMethod}
            </div>
          </Card>

          <Card className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]">
            <header>
              <h2 className="text-lg font-semibold text-[color:var(--glass-fg)]">ملاحظات إضافية</h2>
              <p className="text-sm text-[color:var(--fg-muted)]">أخبرنا بأي تفاصيل إضافية للطلب.</p>
            </header>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              aria-label="ملاحظات الطلب"
            />
          </Card>
        </section>

        <aside
          className="space-y-[var(--spacing-lg)]"
          aria-label="ملخص الطلب"
        >
          <Card className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/95 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-strong)]" data-testid="checkout-summary">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[color:var(--glass-fg)]">ملخص المنتجات</h2>
              <Badge variant="muted">{computedItems.reduce((sum, item) => sum + item.quantity, 0)} عنصر</Badge>
            </header>

            <div className="space-y-[var(--spacing-sm)]" aria-live="polite">
              {computedItems.map((item) => {
                const lowStock = typeof (item as any).available_stock === "number" && (item as any).available_stock < item.quantity;
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--surface)]/70 p-[var(--spacing-md)]"
                    data-cart-item
                    onTouchStart={(event) => handleTouchStart(item.id, event.touches[0]?.clientX ?? 0)}
                    onTouchEnd={(event) => handleTouchEnd(item.id, event.changedTouches[0]?.clientX ?? 0)}
                  >
                    <div className="flex items-center gap-[var(--spacing-md)]">
                      <div className="h-16 w-16 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--glass-border)] bg-[color:var(--surface-2)]">
                        <img
                          src={item.product_image_url || "/placeholder.svg"}
                          alt={item.product_title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 space-y-[var(--spacing-xs)]">
                        <p className="text-sm font-medium text-[color:var(--glass-fg)]">{item.product_title}</p>
                        <p className="text-xs text-[color:var(--fg-muted)]">{formatCurrency(item.unit_price_sar)}</p>
                        {lowStock ? (
                          <p className="text-xs text-[color:var(--warning-fg,#b45309)]">
                            الكمية المطلوبة تتجاوز المخزون المتاح ({(item as any).available_stock}).
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end gap-[var(--spacing-xs)]">
                        <div className="flex items-center gap-[var(--spacing-xs)]" role="group" aria-label="تحديث الكمية">
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            aria-label={`تقليل كمية ${item.product_title}`}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" aria-hidden />
                          </Button>
                          <span className="min-w-[2rem] text-center text-sm font-medium" aria-live="polite">
                            {item.quantity}
                          </span>
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            aria-label={`زيادة كمية ${item.product_title}`}
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                        <span className="text-sm font-semibold text-[color:var(--accent)]">
                          {formatCurrency(item.total)}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-[color:var(--fg-muted)] underline"
                          onClick={() => void handleRemove(item.id)}
                          data-action="remove-item"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 right-2 hidden items-center text-xs text-[color:var(--fg-muted)] group-active:flex">
                      اسحب لحذف
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-[var(--spacing-xs)] border-t border-dashed border-[color:var(--glass-border)] pt-[var(--spacing-md)] text-sm">
              <div className="flex items-center justify-between text-[color:var(--fg-muted)]">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[color:var(--fg-muted)]">
                <span>الشحن</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex items-center justify-between text-[color:var(--fg-muted)]">
                <span>ضريبة القيمة المضافة (15٪)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[color:var(--glass-border)] pt-[var(--spacing-sm)] text-base font-semibold text-[color:var(--glass-fg)]">
                <span>الإجمالي</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="solid"
              size="lg"
              fullWidth
              onClick={handlePlaceOrder}
              loading={isSubmitting}
              disabled={isSubmitting || !isFormValid}
              loadingText="جارٍ إنشاء الطلب"
              data-testid="checkout-submit"
            >
              ادفع الآن
            </Button>
            <p className="text-center text-xs text-[color:var(--fg-muted)]">
              عند المتابعة أنت توافق على شروط الخدمة وسياسة الخصوصية.
            </p>
          </Card>

          <Suspense fallback={<Skeleton height={160} radius="lg" />}>
            <SummaryExtras affiliateStoreId={cart?.affiliate_store_id ?? undefined} />
          </Suspense>
        </aside>
      </main>

      {/* Geidea Payment Dialog */}
      <Dialog open={showGeideaPayment} onOpenChange={setShowGeideaPayment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إتمام الدفع</DialogTitle>
          </DialogHeader>
          {currentOrderId && (
            <GeideaPayment
              amount={grandTotal}
              orderId={currentOrderId}
              customerName={customerInfo.name}
              customerEmail={customerInfo.email}
              customerPhone={customerInfo.phone}
              onSuccess={async () => {
                setShowGeideaPayment(false);
                await clearCart();
                navigate(`/order/confirmation?orderId=${currentOrderId}`);
              }}
              onError={(error) => {
                console.error('Payment error:', error);
                setErrorMessage(`فشل الدفع: ${error}`);
                setShowGeideaPayment(false);
              }}
              onCancel={() => {
                setShowGeideaPayment(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
