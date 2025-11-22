import { useMemo } from "react";
import { Trophy, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { PageTitle } from "@/components/app-shell/PageTitle";
import { useAdminLeaderboard } from "@/hooks/useAdminLeaderboard";
import type { LeaderboardTrendPoint } from "@/hooks/useAdminLeaderboard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { UnifiedBadge, UnifiedButton, UnifiedCard } from "@/components/design-system";
import { KpiCard, type KpiCardProps } from "@/components/home/KpiCard";
import { Skeleton } from "@/ui/Skeleton";

const pointsFormatter = new Intl.NumberFormat("ar-SA");
const currencyFormatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

const TrendChart = ({
  trend,
  reducedMotion,
}: {
  trend: LeaderboardTrendPoint[];
  reducedMotion: boolean;
}) => {
  if (!trend.length) {
    return null;
  }

  const maxPoints = Math.max(...trend.map((point) => point.points));
  const maxCommission = Math.max(...trend.map((point) => point.commissions));
  const maxValue = Math.max(maxPoints, maxCommission);
  const denominator = Math.max(trend.length - 1, 1);

  const buildPolyline = (key: "points" | "commissions") =>
    trend
      .map((point, index) => {
        const x = (index / denominator) * 100;
        const y = 100 - (point[key] / maxValue) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

  const labels = trend.map((point) => point.date.slice(-5));

  return (
    <svg
      viewBox="0 0 100 115"
      preserveAspectRatio="none"
      className="h-44 w-full"
      role="img"
      aria-label="اتجاه النقاط والعمولات لأفضل المسوقات"
      data-chart="points-commission"
    >
      <defs>
        <linearGradient id="pointsArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="commissionArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--success)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${buildPolyline("points")} 100,100`}
        fill="url(#pointsArea)"
        className={reducedMotion ? undefined : "transition-opacity duration-500"}
      />
      <polygon
        points={`0,100 ${buildPolyline("commissions")} 100,100`}
        fill="url(#commissionArea)"
        className={reducedMotion ? undefined : "transition-opacity duration-500"}
      />
      <polyline
        points={buildPolyline("points")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.25}
        strokeLinecap="round"
        className={reducedMotion ? undefined : "transition-all duration-500"}
      />
      <polyline
        points={buildPolyline("commissions")}
        fill="none"
        stroke="var(--success)"
        strokeWidth={2.25}
        strokeLinecap="round"
        className={reducedMotion ? undefined : "transition-all duration-500"}
      />
      {labels.map((label, index) => {
        const x = (index / denominator) * 100;
        return (
          <text
            key={`${label}-${index}`}
            x={x}
            y={112}
            textAnchor="middle"
            className="fill-[color:var(--muted-foreground)] text-[10px]"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

const LeaderboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <UnifiedCard
          key={`leaderboard-kpi-${index}`}
          variant="glass"
          padding="md"
          hover="none"
        >
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-8 w-32 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
        </UnifiedCard>
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <UnifiedCard variant="glass" padding="md" hover="none" className="p-5">
        <Skeleton className="h-6 w-36 rounded" />
        <Skeleton className="mt-4 h-44 w-full rounded" />
      </UnifiedCard>
      <UnifiedCard variant="glass" padding="md" hover="none" className="p-5">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="mt-4 h-12 w-full rounded" />
        <Skeleton className="mt-2 h-6 w-24 rounded" />
      </UnifiedCard>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, columnIndex) => (
        <UnifiedCard
          key={`leaderboard-table-${columnIndex}`}
          variant="glass"
          padding="md"
          hover="none"
          className="p-5"
        >
          <Skeleton className="h-6 w-40 rounded" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((__, rowIndex) => (
              <Skeleton key={`row-${columnIndex}-${rowIndex}`} className="h-12 w-full rounded" />
            ))}
          </div>
        </UnifiedCard>
      ))}
    </div>
  </div>
);

const buildDeltaBadge = (value: number) => {
  if (value === 0) {
    return { label: "مستقر", icon: null, variant: "secondary" as const };
  }

  const isPositive = value > 0;
  return {
    label: `${Math.abs(value)}%`,
    icon: isPositive ? ArrowUpRight : ArrowDownRight,
    variant: isPositive ? ("success" as const) : ("error" as const),
  };
};

const AdminLeaderboardPage = () => {
  const { summary, topByPoints, topByCommission, trend, isLoading, refresh } = useAdminLeaderboard();
  const reducedMotion = usePrefersReducedMotion();

  const summaryCards = useMemo(() => {
    const cards: Array<{
      title: string;
      value: string;
      delta: KpiCardProps["delta"];
      footer: string;
      accent: NonNullable<KpiCardProps["accent"]>;
    }> = [
      {
        title: "إجمالي النقاط",
        value: pointsFormatter.format(summary.totalPoints),
        delta:
          summary.pointsChange7d === 0
            ? null
            : {
                value: Math.abs(summary.pointsChange7d),
                trend: summary.pointsChange7d > 0 ? "up" : "down",
                label: "متوسط نمو 7 أيام",
              },
        footer: "متوسط التغير خلال 7 أيام",
        accent: "accent" as const,
      },
      {
        title: "إجمالي العمولات",
        value: currencyFormatter.format(summary.totalCommission),
        delta:
          summary.commissionChange7d === 0
            ? null
            : {
                value: Math.abs(summary.commissionChange7d),
                trend: summary.commissionChange7d > 0 ? "up" : "down",
                label: "تغير العمولات 7 أيام",
              },
        footer: "إجمالي المدفوعات الشهرية",
        accent: "primary" as const,
      },
      {
        title: "المسوّقات النشطات",
        value: pointsFormatter.format(summary.activeAffiliates),
        delta: null,
        footer: "ضمن أعلى لوحة أداء لهذا الشهر",
        accent: "primary" as const,
      },
      {
        title: "متوسط العمولة",
        value: currencyFormatter.format(summary.averageCommission),
        delta: null,
        footer: `أعلى أداء: ${summary.topPerformer.name}`,
        accent: "accent" as const,
      },
    ];

    return cards;
  }, [summary]);

  return (
    <div data-page="admin-leaderboard" className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageTitle
        actions={
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            aria-label="تحديث بيانات لوحة الترتيب"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            <span>تحديث</span>
          </UnifiedButton>
        }
      />
      <p className="text-sm text-muted-foreground">
        تابع نقاط وعمولات المسوّقات الأعلى أداءً مع تحديثات فورية خفيفة.
      </p>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-section="leaderboard-kpis">
            {summaryCards.map((card) => (
              <KpiCard
                key={card.title}
                title={card.title}
                value={card.value}
                delta={card.delta ?? undefined}
                footer={card.footer}
                accent={card.accent}
              />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[2fr_1fr]" data-section="leaderboard-trend">
            <UnifiedCard
              padding="lg"
              variant="glass"
              hover="none"
              className="flex flex-col gap-4 shadow-card"
            >
              <header className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-medium text-[color:var(--glass-fg)]">اتجاه الأداء</h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">نقاط وعمولات لأفضل المسوّقات خلال 14 يوم</p>
                </div>
                <UnifiedBadge variant="outline">آخر تحديث: {summary.topPerformer.name}</UnifiedBadge>
              </header>
              <TrendChart trend={trend} reducedMotion={reducedMotion} />
            </UnifiedCard>

            <UnifiedCard
              padding="lg"
              variant="glass"
              hover="none"
              className="flex flex-col gap-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--accent)]">
                  <Trophy className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-[color:var(--glass-fg)]">المركز الأول</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">{summary.topPerformer.name}</p>
                </div>
              </div>
              <div className="grid gap-2 text-sm text-[color:var(--muted-foreground)]">
                <div className="flex items-center justify-between">
                  <span>النقاط</span>
                  <span className="font-semibold text-[color:var(--glass-fg)]">{pointsFormatter.format(summary.topPerformer.points)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>العمولات</span>
                  <span className="font-semibold text-[color:var(--glass-fg)]">{currencyFormatter.format(summary.topPerformer.commission)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الطلبات المغلقة</span>
                  <span className="font-semibold text-[color:var(--glass-fg)]">{pointsFormatter.format(summary.topPerformer.orders)}</span>
                </div>
              </div>
            </UnifiedCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2" data-section="leaderboard-tables">
            <UnifiedCard
              padding="lg"
              variant="glass"
              hover="none"
              className="shadow-card"
            >
              <header className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-medium text-[color:var(--glass-fg)]">ترتيب النقاط</h3>
                <UnifiedBadge variant="glass">أعلى 8</UnifiedBadge>
              </header>
              <div role="table" aria-label="أفضل المسوّقات بحسب النقاط" className="space-y-2">
                {topByPoints.map((entry) => {
                  const delta = buildDeltaBadge(entry.pointsChange);
                  const DeltaIcon = delta.icon;
                  return (
                    <div
                      key={entry.id}
                      role="row"
                      tabIndex={0}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 px-4 py-3 text-sm text-[color:var(--glass-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus-ring)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] text-xs font-semibold text-[color:var(--accent)]">
                          #{entry.rank}
                        </span>
                        <div className="space-y-1">
                          <p className="font-medium">{entry.name}</p>
                          <span className="text-xs text-[color:var(--muted-foreground)]">{entry.orders} طلب مدفوع</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{pointsFormatter.format(entry.points)}</span>
                        <UnifiedBadge variant={delta.variant} className="inline-flex items-center gap-1 text-xs">
                          {DeltaIcon ? <DeltaIcon className="h-3.5 w-3.5" aria-hidden /> : null}
                          <span>{delta.label}</span>
                        </UnifiedBadge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </UnifiedCard>

            <UnifiedCard
              padding="lg"
              variant="glass"
              hover="none"
              className="shadow-card"
            >
              <header className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-medium text-[color:var(--glass-fg)]">ترتيب العمولات</h3>
                <UnifiedBadge variant="glass">أعلى 8</UnifiedBadge>
              </header>
              <div role="table" aria-label="أفضل المسوّقات بحسب العمولات" className="space-y-2">
                {topByCommission.map((entry, index) => {
                  const delta = buildDeltaBadge(entry.commissionChange);
                  const DeltaIcon = delta.icon;
                  return (
                    <div
                      key={`${entry.id}-commission-${index}`}
                      role="row"
                      tabIndex={0}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 px-4 py-3 text-sm text-[color:var(--glass-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus-ring)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] text-xs font-semibold text-[color:var(--success)]">
                          #{index + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="font-medium">{entry.name}</p>
                          <span className="text-xs text-[color:var(--muted-foreground)]">{entry.orders} طلب مدفوع</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{currencyFormatter.format(entry.commission)}</span>
                        <UnifiedBadge variant={delta.variant} className="inline-flex items-center gap-1 text-xs">
                          {DeltaIcon ? <DeltaIcon className="h-3.5 w-3.5" aria-hidden /> : null}
                          <span>{delta.label}</span>
                        </UnifiedBadge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </UnifiedCard>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboardPage;
