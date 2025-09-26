import { useMemo } from "react";
import { TrendingDown, TrendingUp, RefreshCw } from "lucide-react";

import { PageTitle } from "@/components/app-shell/PageTitle";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";

const currencyFormatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ar-SA", {
  maximumFractionDigits: 0,
});

const formatMetricValue = (value: number, unit: "currency" | "count") => {
  if (unit === "currency") {
    return currencyFormatter.format(value);
  }
  return numberFormatter.format(value);
};

interface MetricCardProps {
  label: string;
  value: string;
  change: number;
  changeDirection: "up" | "down" | "flat";
}

const MetricCard = ({ label, value, change, changeDirection }: MetricCardProps) => {
  const isPositive = changeDirection === "up";
  const isNeutral = changeDirection === "flat";
  const changeLabel = isNeutral ? "ثابت" : `${Math.abs(change)}%`;

  return (
    <Card
      padding="lg"
      shadow
      variant="glass"
      className="flex flex-col justify-between gap-3 border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/92 text-[color:var(--glass-fg)]"
      data-widget="metric"
    >
      <div className="space-y-1">
        <p className="text-sm text-[color:var(--muted-foreground)]">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Badge
          variant={isNeutral ? "muted" : isPositive ? "success" : "danger"}
          className="inline-flex items-center gap-1"
        >
          {isNeutral ? null : isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" aria-hidden />
          )}
          <span>{changeLabel}</span>
        </Badge>
        <span className="text-[color:var(--muted-foreground)]">خلال آخر 7 أيام</span>
      </div>
    </Card>
  );
};

interface RankedListProps {
  title: string;
  items: { id: string; name: string; value: string; trend: number }[];
}

const RankedList = ({ title, items }: RankedListProps) => {
  return (
    <Card
      padding="lg"
      shadow
      variant="glass"
      className="flex flex-col gap-4 border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90"
    >
      <header className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[color:var(--glass-fg)]">{title}</h3>
        <Badge variant="glass">أفضل 5</Badge>
      </header>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-m)] border border-transparent bg-[color:var(--glass-bg)]/40 px-3 py-2 text-sm text-[color:var(--glass-fg)]"
            aria-label={`${index + 1}. ${item.name} بقيمة ${item.value}`}
          >
            <span className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--accent-bg, var(--surface-2))] text-xs font-semibold text-[color:var(--accent-fg, var(--glass-fg))]">
                {index + 1}
              </span>
              <span>{item.name}</span>
            </span>
            <span className="text-[color:var(--muted-foreground)]">{item.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

interface TrendChartProps {
  points: { date: string; orders: number }[];
  reducedMotion: boolean;
}

const TrendChart = ({ points, reducedMotion }: TrendChartProps) => {
  if (points.length === 0) {
    return null;
  }

  const values = points.map((point) => point.orders);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const denominator = Math.max(points.length - 1, 1);
  const chartPoints = points.map((point, index) => {
    const x = (index / denominator) * 100;
    const y = 100 - ((point.orders - minValue) / range) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const gradientId = "orders-trend-gradient";

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-40 w-full"
      role="img"
      aria-label="اتجاه الطلبات خلال 14 يوم"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.65" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={chartPoints.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
        className={reducedMotion ? undefined : "transition-all duration-500"}
      />
      <polygon
        points={`0,100 ${chartPoints.join(" ")} 100,100`}
        fill={`url(#${gradientId})`}
        className={reducedMotion ? undefined : "transition-all duration-500"}
      />
    </svg>
  );
};

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          variant="glass"
          className="border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80"
        >
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </Card>
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card variant="glass" className="border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-5">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="mt-4 h-40 w-full rounded" />
      </Card>
      <Card variant="glass" className="border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-5">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded" />
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const AdminAnalyticsPage = () => {
  const { metrics, topProducts, topAffiliates, trend, isLoading, refresh } = useAdminAnalytics();
  const reducedMotion = usePrefersReducedMotion();
  const peakOrders = trend.length > 0 ? Math.max(...trend.map((point) => point.orders)) : 0;

  const metricCards = useMemo(
    () =>
      metrics.map((metric) => ({
        id: metric.id,
        label: metric.label,
        value: formatMetricValue(metric.value, metric.unit),
        change: metric.change,
        changeDirection: metric.changeDirection,
      })),
    [metrics]
  );

  const topProductsFormatted = useMemo(
    () =>
      topProducts.map((item) => ({
        id: item.id,
        name: item.name,
        value: currencyFormatter.format(item.value),
        trend: item.trend,
      })),
    [topProducts]
  );

  const topAffiliatesFormatted = useMemo(
    () =>
      topAffiliates.map((item) => ({
        id: item.id,
        name: item.name,
        value: currencyFormatter.format(item.value),
        trend: item.trend,
      })),
    [topAffiliates]
  );

  return (
    <div
      data-page="admin-analytics"
      className="space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageTitle
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            aria-label="تحديث بيانات التحليلات"
            className="inline-flex items-center gap-2 border-[color:var(--glass-border-strong, var(--glass-border))] bg-[color:var(--glass-bg)]/70 text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)]/90"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            <span>تحديث</span>
          </Button>
        }
      />

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-section="metrics-grid">
            {metricCards.map((metric) => (
              <MetricCard key={metric.id} {...metric} />
            ))}
          </section>

          <section
            className="grid gap-4 lg:grid-cols-[2fr_1fr]"
            data-section="trend-and-products"
          >
            <Card
              padding="lg"
              shadow
              variant="glass"
              className="flex flex-col gap-4 border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/92"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-[color:var(--glass-fg)]">تدفق الطلبات</h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">آخر 14 يوم</p>
                </div>
                <Badge variant="outline">ذروة: {numberFormatter.format(peakOrders)}</Badge>
              </header>
              <TrendChart points={trend} reducedMotion={reducedMotion} />
            </Card>

            <RankedList title="أفضل المنتجات أداءً" items={topProductsFormatted} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2" data-section="top-affiliates">
            <RankedList title="أفضل المسوقات" items={topAffiliatesFormatted} />
            <Card
              padding="lg"
              shadow
              variant="glass"
              className="flex flex-col justify-between gap-4 border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/88"
            >
              <div>
                <h3 className="text-base font-medium text-[color:var(--glass-fg)]">نصائح سريعة</h3>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  راقب أداء حملات المسوقات وفعّل الحوافز الدورية للحفاظ على زخم المبيعات.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">نمو 12%</Badge>
                <Badge variant="primary">34 حملة نشطة</Badge>
                <Badge variant="outline">مراجعة أسبوعية</Badge>
              </div>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
