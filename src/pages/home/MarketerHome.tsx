import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Share2, TicketPercent, ExternalLink, Trophy, ShoppingCart, LineChart } from 'lucide-react';
import { KpiCard } from '@/components/home/KpiCard';
import type { KpiCardProps } from '@/components/home/KpiCard';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { Skeleton } from '@/ui/Skeleton';
import { Button } from '@/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MiniChart = lazy(() => import('@/components/home/MiniChart'));

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ar-EG');

export interface MarketerHomeProps {
  statisticsOverride?: Record<string, unknown> | null;
  storeSlugOverride?: string | null;
  nameOverride?: string | null;
}

const MarketerHome: React.FC<MarketerHomeProps> = ({ statisticsOverride, storeSlugOverride, nameOverride }) => {
  const { profile } = useFastAuth();
  const contextData = useUserDataContext();
  const userStatistics = (statisticsOverride ?? (contextData?.userStatistics as Record<string, unknown> | null) ?? {}) as Record<string, any>;
  const userShop = (contextData?.userShop ?? null) as { slug?: string | null; store_slug?: string | null } | null;
  const storeSlug = storeSlugOverride ?? userShop?.store_slug ?? userShop?.slug ?? 'my-boutique';
  // Use full URL with domain for sharing
  const publicStoreUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/store/${storeSlug}` 
    : `/store/${storeSlug}`;

  const totalSales = typeof userStatistics?.affiliateSalesTotal === 'number' ? userStatistics.affiliateSalesTotal : 148_500;
  const monthlyCommission =
    typeof userStatistics?.affiliateCommissionMonth === 'number' ? userStatistics.affiliateCommissionMonth : 12_400;
  const leaderboardRank = typeof userStatistics?.leaderboardRank === 'number' ? userStatistics.leaderboardRank : 3;
  const leaderboardOutOf = typeof userStatistics?.leaderboardTotal === 'number' ? userStatistics.leaderboardTotal : 28;
  const conversionRate = typeof userStatistics?.conversionRate === 'number' ? userStatistics.conversionRate : 4.7;
  const averageOrder = typeof userStatistics?.averageAffiliateOrder === 'number' ? userStatistics.averageAffiliateOrder : 890;

  const metrics = React.useMemo((): KpiCardProps[] => [
    {
      title: 'مبيعات المتجر الإجمالية',
      value: currencyFormatter.format(totalSales),
      icon: ShoppingCart,
      delta: { value: userStatistics?.storeGrowth ?? 9.2, trend: 'up', label: 'خلال 7 أيام' },
      footer: 'يشمل جميع القنوات المرتبطة',
      accent: 'success',
    },
    {
      title: 'عمولات هذا الشهر',
      value: currencyFormatter.format(monthlyCommission),
      icon: LineChart,
      delta: { value: userStatistics?.commissionGrowth ?? 6.4, trend: 'up', label: 'مقارنة بالشهر الماضي' },
      footer: 'يتم تحديثها يومياً بعد التسويات',
      accent: 'accent',
    },
    {
      title: 'ترتيبك في لوحة الشرف',
      value: `#${leaderboardRank} من ${numberFormatter.format(leaderboardOutOf)}`,
      icon: Trophy,
      delta: { value: userStatistics?.leaderboardDelta ?? 1.0, trend: 'up', label: 'تحسن خلال الأسبوع' },
      footer: 'حافظ على معدل تحويل مرتفع للصعود',
      accent: 'warning',
    },
  ], [leaderboardOutOf, leaderboardRank, monthlyCommission, totalSales, userStatistics]);

  const chartData = React.useMemo(() => {
    if (Array.isArray(userStatistics?.dailyAffiliateRevenue)) {
      return userStatistics.dailyAffiliateRevenue as number[];
    }
    return [12_800, 11_400, 14_200, 17_600, 16_400, 19_800, 22_100];
  }, [userStatistics]);

  const quickActions = React.useMemo(
    () => [
      {
        id: 'share-store',
        label: 'زر مشاركة المتجر',
        description: 'انسخ رابط المتجر أو شاركه مباشرة مع عملائك',
        icon: Share2,
        action: () => {
          if (typeof navigator !== 'undefined') {
            if (navigator.share) {
              navigator
                .share({
                  title: 'متجري في منصة أناقتي',
                  text: 'اكتشف تشكيلتي المختارة من الأزياء عبر منصة أناقتي.',
                  url: publicStoreUrl,
                })
                .catch(() => {
                  navigator.clipboard?.writeText(publicStoreUrl).catch(() => undefined);
                  toast.success('تم نسخ رابط المتجر');
                });
              return;
            }

            if (navigator.clipboard?.writeText) {
              void navigator.clipboard.writeText(publicStoreUrl);
              toast.success('تم نسخ رابط المتجر');
              return;
            }
          }
        },
      },
      {
        id: 'create-coupon',
        label: 'كوّن كوبون',
        description: 'أنشئ رمز خصم مخصص لحملة هذا الأسبوع',
        icon: TicketPercent,
        to: '/affiliate/store/settings?tab=coupons',
      },
      {
        id: 'open-public-store',
        label: 'اذهب لمتجري العام',
        description: 'استعرض واجهة المتجر كما يراها العملاء',
        icon: ExternalLink,
        action: () => {
          window.open(`/store/${storeSlug}`, '_blank');
        },
      },
    ],
    [publicStoreUrl]
  );

  const quickActionLinkClass =
    'flex items-center justify-between gap-[var(--spacing-md)] rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong,var(--surface-2))] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-right text-[color:var(--glass-fg)] transition-colors hover:bg-[color:var(--glass-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]';

  const performanceHighlights = React.useMemo(
    () => [
      {
        label: 'معدل التحويل',
        value: `${conversionRate.toFixed(1)}%`,
      },
      {
        label: 'متوسط الطلب',
        value: currencyFormatter.format(averageOrder),
      },
      {
        label: 'جلسات هذا الأسبوع',
        value: numberFormatter.format(userStatistics?.sessionsThisWeek ?? 2_430),
      },
    ],
    [averageOrder, conversionRate, userStatistics]
  );

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <section className="grid gap-[var(--spacing-lg)] md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <KpiCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex h-full flex-col justify-between rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/88 p-[var(--spacing-lg)] shadow-[var(--shadow-glass-soft)] backdrop-blur-xl">
          <header className="mb-[var(--spacing-md)]">
            <h2 className="text-lg font-semibold text-[color:var(--glass-fg)]">أداءك هذا الأسبوع</h2>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              {(nameOverride ?? profile?.full_name)?.split(' ')[0] ?? 'مرحبا'}, هذه لمحة سريعة عن حملاتك النشطة.
            </p>
          </header>
          <ul className="grid gap-[var(--spacing-md)] sm:grid-cols-3">
            {performanceHighlights.map((item) => (
              <li
                key={item.label}
                className="rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] p-[var(--spacing-md)] text-sm text-[color:var(--glass-fg)]"
              >
                <p className="text-xs text-[color:var(--muted-foreground)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
              </li>
            ))}
          </ul>
          <div className="mt-[var(--spacing-lg)] rounded-[var(--radius-m)] border border-dashed border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 p-[var(--spacing-md)] text-xs text-[color:var(--muted-foreground)]">
            نصيحة: شارك رابطك بعد تحديث المحتوى – العملاء الذين يشاهدون قصة جديدة ينفقون 18٪ أكثر.
          </div>
        </div>

        <div className="flex h-full flex-col gap-[var(--spacing-md)] rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/88 p-[var(--spacing-lg)] shadow-[var(--shadow-glass-soft)] backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-[color:var(--glass-fg)]">روابط سريعة</h2>
          <nav aria-label="روابط عمليات المسوق" className="flex flex-col gap-[var(--spacing-sm)]">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const content = (
                <span className="flex flex-1 flex-col text-right">
                  <span className="text-sm font-medium text-[color:var(--glass-fg)]">{action.label}</span>
                  <span className="text-xs text-[color:var(--muted-foreground)]">{action.description}</span>
                </span>
              );

              return action.to ? (
                <Link key={action.id} to={action.to} className={cn(quickActionLinkClass, 'w-full')}>
                  <Icon className="h-5 w-5 text-[color:var(--accent)]" aria-hidden />
                  {content}
                </Link>
              ) : (
                <Button
                  key={action.id}
                  type="button"
                  variant="ghost"
                  onClick={action.action}
                  className="flex items-center justify-between gap-[var(--spacing-md)] rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-right text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]"
                >
                  <Icon className="h-5 w-5 text-[color:var(--accent)]" aria-hidden />
                  {content}
                </Button>
              );
            })}
          </nav>
        </div>
      </section>

      <section>
        <Suspense
          fallback={
            <div
              className="rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-[var(--spacing-lg)] shadow-[var(--shadow-glass-soft)]"
              aria-busy="true"
            >
              <p className="text-sm font-medium text-[color:var(--glass-fg)]">إيراداتك اليومية</p>
              <p className="text-xs text-[color:var(--muted-foreground)]">جاري تجهيز الرسم البياني...</p>
              <Skeleton className="mt-[var(--spacing-md)] h-32 w-full rounded-[var(--radius-m)] bg-[color:var(--glass-bg-strong, var(--surface-2))]" />
            </div>
          }
        >
          <MiniChart
            title="إيراداتك اليومية"
            data={chartData}
            labels={['س', 'أ', 'ث', 'ر', 'خ', 'ج', 'س']}
            trend={chartData[chartData.length - 1] >= chartData[0] ? 'up' : 'down'}
            accent="accent"
          />
        </Suspense>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-[var(--spacing-md)] text-xs text-[color:var(--muted-foreground)]">
        <span>
          رابط متجرك العام: <a className="underline decoration-dotted cursor-pointer" onClick={() => window.open(`/store/${storeSlug}`, '_blank')}>{publicStoreUrl}</a>
        </span>
        <span>سيتم ترحيل العمولات المؤكدة في يوم 3 من الشهر القادم.</span>
      </footer>
    </div>
  );
};

export default MarketerHome;
