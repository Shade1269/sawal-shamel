import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingBag, Sparkles } from "lucide-react";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import { usePublicStorefront } from "@/hooks/usePublicStorefront";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Helmet } from "@/components/seo/SafeHelmet";

type PublicStorefrontHookResult = ReturnType<typeof usePublicStorefront>;

type HookOverride = Partial<PublicStorefrontHookResult> & {
  addToCart?: PublicStorefrontHookResult["addToCart"];
  updateQuantity?: PublicStorefrontHookResult["updateQuantity"];
  clearCart?: PublicStorefrontHookResult["clearCart"];
};

export interface PublicStorefrontPageProps {
  slugOverride?: string;
  hookOverride?: HookOverride;
  settingsOverride?: Partial<ReturnType<typeof useStorefrontSettings>["settings"]>;
  navigateOverride?: (path: string) => void;
}

interface DisplayProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  source: any;
}

const ensureImage = (urls?: string[] | null) => {
  if (!urls || urls.length === 0) return "/placeholder.svg";
  return urls[0] ?? "/placeholder.svg";
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
};

const StorefrontHeroFallback: React.FC<{
  title: string;
  description: string;
}> = ({
  title,
  description,
}) => (
  <div
    className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/92 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]"
    data-hero-fallback
  >
    <div className="flex flex-col items-start gap-[var(--spacing-md)]">
      <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] px-3 py-1 text-xs font-medium text-[color:var(--accent)]">
        <Sparkles className="h-4 w-4" aria-hidden />
        متجر مسوّقة
      </span>
      <h1 className="text-3xl font-semibold text-[color:var(--glass-fg)] sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-base text-[color:var(--fg-muted)] sm:text-lg">
        {description}
      </p>
    </div>
  </div>
);

const StorefrontSkeleton: React.FC = () => (
  <div className="grid gap-[var(--spacing-md)] sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-[var(--radius-lg)] border border-dashed border-[color:var(--glass-border)] bg-[color:var(--surface)] p-[var(--spacing-lg)]"
        data-skeleton="product-card"
      >
        <div className="mb-[var(--spacing-md)] h-40 rounded-[var(--radius-md)] bg-[color:var(--surface-2)]" />
        <div className="h-4 w-3/4 rounded-full bg-[color:var(--surface-2)]" />
        <div className="mt-2 h-3 w-1/2 rounded-full bg-[color:var(--surface-2)]" />
        <div className="mt-6 h-10 rounded-[var(--radius-md)] bg-[color:var(--surface-2)]" />
      </div>
    ))}
  </div>
);

const StorefrontProductsGrid: React.FC<{
  products: DisplayProduct[];
  onAddToCart: (product: DisplayProduct) => void;
}> = ({ products, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-[var(--spacing-xl)] text-center text-[color:var(--fg-muted)]">
        لم يتم إضافة منتجات بعد. عُد لاحقًا لاكتشاف إصدارات جديدة.
      </div>
    );
  }

  return (
    <div className="grid gap-[var(--spacing-md)] sm:grid-cols-2 lg:grid-cols-3" data-section="products-grid">
      {products.map((product) => (
        <Card
          key={product.id}
          className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 shadow-[var(--shadow-glass-soft)] backdrop-blur-xl"
          data-product-id={product.id}
        >
          <figure className="relative h-48 w-full overflow-hidden border-b border-[color:var(--glass-border)]">
            <img
              src={product.imageUrl}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </figure>
          <div className="flex flex-1 flex-col gap-[var(--spacing-sm)] p-[var(--spacing-lg)]">
            <div>
              <h3 className="text-lg font-semibold text-[color:var(--glass-fg)]">{product.title}</h3>
              <p className="mt-1 text-sm text-[color:var(--fg-muted)] line-clamp-2">{product.description}</p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-[var(--spacing-md)]">
              <span className="text-base font-medium text-[color:var(--accent)]">{formatCurrency(product.price)}</span>
              <Button
                type="button"
                variant="solid"
                onClick={() => onAddToCart(product)}
                data-action="add-to-cart"
              >
                أضف للسلة
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const useHeroComponent = (enableAnimation: boolean) => {
  if (!enableAnimation) {
    return null;
  }
  return null; // Hero components removed
};

const StorefrontHeader: React.FC<{
  storeName: string;
  marketerName: string;
  logoUrl?: string;
  totalItems: number;
  totalAmount: number;
  onCheckout: () => void;
}> = ({ storeName, marketerName, logoUrl, totalItems, totalAmount, onCheckout }) => {
  return (
    <header
      className="sticky top-0 z-20 border-b border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 backdrop-blur-xl"
      data-section="storefront-header"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-[var(--spacing-md)] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-[var(--spacing-md)]">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`شعار ${storeName}`}
              loading="lazy"
              className="h-12 w-12 flex-none rounded-full border border-[color:var(--glass-border)] object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] text-lg font-semibold text-[color:var(--accent)]">
              {storeName.slice(0, 2)}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm text-[color:var(--fg-muted)]">متجر {marketerName}</p>
            <h2 className="text-xl font-semibold text-[color:var(--glass-fg)]">{storeName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-[var(--spacing-sm)]">
          <span className="hidden text-sm text-[color:var(--fg-muted)] sm:block">
            {totalItems > 0 ? `${totalItems} عنصر - ${formatCurrency(totalAmount)}` : "سلتك فارغة"}
          </span>
          <Button
            type="button"
            variant="solid"
            leftIcon={<ShoppingBag aria-hidden className="h-4 w-4" />}
            onClick={onCheckout}
            data-action="go-to-checkout"
            aria-label="الانتقال إلى إتمام الطلب"
          >
            <span>{totalItems > 0 ? `الذهاب للسلة (${totalItems})` : "إتمام الطلب"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

const PublicStorefrontPage: React.FC<PublicStorefrontPageProps> = ({
  slugOverride,
  hookOverride,
  settingsOverride,
  navigateOverride,
}) => {
  const params = useParams<{ slug?: string; storeId?: string }>();
  const slug = slugOverride ?? params.slug ?? params.storeId ?? "";

  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    try {
      window.localStorage.setItem("storefront:last-slug", slug);
    } catch (error) {
      console.warn("Unable to persist storefront slug", error);
    }
  }, [slug]);
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();

  const hookSlug = hookOverride ? "" : slug;
  const hookResult = usePublicStorefront({ storeSlug: hookSlug });
  const mergedHook = useMemo(() => ({
    ...hookResult,
    ...hookOverride,
  }), [hookResult, hookOverride]);

  const {
    store,
    products,
    storeLoading = false,
    productsLoading = false,
    addToCart: hookAddToCart,
    totalItems = 0,
    totalAmount = 0,
  } = mergedHook;

  const { settings } = useStorefrontSettings(slug, {
    initialSettings: settingsOverride,
  });

  const displayProducts: DisplayProduct[] = useMemo(() => {
    return (products ?? []).map((product: any, index: number) => {
      const sourceProduct = product.products ?? product;
      const id = product.product_id ?? sourceProduct?.id ?? `product-${index}`;
      return {
        id,
        title: sourceProduct?.title ?? product.title ?? `منتج رقم ${index + 1}`,
        description:
          sourceProduct?.description ?? product.description ?? "منتج مختار بعناية من مسوّقة أطلق متجرها حديثًا.",
        price: Number(sourceProduct?.price_sar ?? product.price ?? 0),
        imageUrl: ensureImage(sourceProduct?.image_urls ?? product.image_urls ?? []),
        source: {
          product_id: product.product_id ?? sourceProduct?.id ?? id,
        },
      } satisfies DisplayProduct;
    });
  }, [products]);

  const storeName = settings.storeName || store?.store_name || "متجر المسوّقة";
  const marketerName = store?.store_name || "مسوّقة مبدعة"; 
  const shortDescription = settings.shortDescription || store?.bio || "تسوق مجموعة مختارة بعناية من المنتجات مع تجربة دفع سلسة ومتكاملة.";
  const logoUrl = settings.logoUrl || store?.logo_url || undefined;
  const heroEnabled = settings.useThemeHero ?? true;

  const HeroComponent = useHeroComponent(heroEnabled && !prefersReducedMotion);

  const handleAddToCart = (product: DisplayProduct) => {
    hookAddToCart?.({ product_id: product.source.product_id });
  };

  const handleCheckout = () => {
    const target = navigateOverride ?? navigate;
    target("/checkout");
  };

  const handleScrollToProducts = () => {
    if (typeof document === "undefined") return;
    const section = document.getElementById("storefront-products");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isLoading = storeLoading || productsLoading;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)]"
      data-storefront-root
    >
      <Helmet>
        <title>{`${storeName} | متجر ${marketerName}`}</title>
        <meta name="description" content={shortDescription?.slice(0, 155) || 'تسوق منتجات مختارة بعناية.'} />
        <link rel="canonical" href={(typeof window !== 'undefined' && slug) ? `${window.location.origin}/${slug}` : 'https://atlantiss.tech'} />
      </Helmet>
      <a
        href="#storefront-content"
        className="skip-to-content fixed top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] px-4 py-2 text-sm text-[color:var(--glass-fg)] shadow-[var(--shadow-glass-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus-ring)]"
      >
        تخط إلى المنتجات
      </a>

      <StorefrontHeader
        storeName={storeName}
        marketerName={marketerName}
        logoUrl={logoUrl}
        totalItems={totalItems}
        totalAmount={totalAmount}
        onCheckout={handleCheckout}
      />

      <main id="storefront-content" className="mx-auto flex w-full max-w-6xl flex-col gap-[var(--spacing-xl)] px-4 py-10 sm:px-6">
        <section aria-labelledby="storefront-hero" className="space-y-[var(--spacing-md)]">
          <h1 id="storefront-hero" className="sr-only">
            {storeName}
          </h1>
          {HeroComponent ? (
            <Suspense fallback={<StorefrontHeroFallback title={storeName} description={shortDescription} />}>
              <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]">
                <HeroComponent />
              </div>
            </Suspense>
          ) : (
            <StorefrontHeroFallback title={storeName} description={shortDescription} />
          )}
          <div className="flex flex-wrap gap-[var(--spacing-sm)] pt-[var(--spacing-md)]">
            <Button size="lg" variant="glass" onClick={handleScrollToProducts} data-testid="hero-cta">
              تسوق الآن
            </Button>
          </div>
        </section>

        <section
          id="storefront-products"
          aria-labelledby="storefront-products-heading"
          className="space-y-[var(--spacing-lg)]"
        >
          <div className="flex flex-col gap-[var(--spacing-sm)] sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="storefront-products-heading" className="text-2xl font-semibold text-[color:var(--glass-fg)]">
                المنتجات المتاحة
              </h2>
              <p className="text-sm text-[color:var(--fg-muted)]">اختر منتجاتك المفضلة وواصل إلى الدفع مباشرة.</p>
            </div>
            <Link
              to="/checkout"
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] px-4 py-2 text-sm font-medium text-[color:var(--glass-fg)] shadow-[var(--shadow-glass-soft)] transition",
                "hover:bg-[color:var(--glass-bg-strong, var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus-ring)]"
              )}
            >
              تابع إلى الدفع
            </Link>
          </div>

          {isLoading ? (
            <StorefrontSkeleton />
          ) : (
            <StorefrontProductsGrid products={displayProducts} onAddToCart={handleAddToCart} />
          )}
        </section>
      </main>

      <footer className="mt-16 border-t border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-[var(--spacing-sm)] px-4 py-8 text-sm text-[color:var(--fg-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} متجر {storeName} — تجربة زجاجية مدعومة بتوكنز الثيم.</span>
          <span>متصل بالدفعات عبر /checkout و /order/confirmation.</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicStorefrontPage;
