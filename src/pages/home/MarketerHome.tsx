import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Share2, TicketPercent, ExternalLink, Trophy, ShoppingCart, LineChart } from 'lucide-react';
import { KpiCard } from '@/components/home/KpiCard';
import type { KpiCardProps } from '@/components/home/KpiCard';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { Skeleton } from '@/ui/Skeleton';
import { Button } from '@/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';

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
  const { isDarkMode } = useDarkMode();
  const userStatistics = (statisticsOverride ?? (contextData?.userStatistics as Record<string, unknown> | null) ?? {}) as Record<string, any>;
  const userShop = (contextData?.userShop ?? null) as { slug?: string | null; store_slug?: string | null } | null;
  const storeSlug = storeSlugOverride ?? userShop?.store_slug ?? userShop?.slug ?? 'my-boutique';
  // Use full URL with domain for sharing
  const publicStoreUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${storeSlug}` 
    : `/${storeSlug}`;

  const { store } = useAffiliateStore();

  const { data: monthlyCommissionValue } = useQuery({
    queryKey: ['affiliate-monthly-commission', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const start = new Date();
      start.setDate(1); start.setHours(0,0,0,0);
      const end = new Date(start); end.setMonth(start.getMonth() + 1);

      const { data, error } = await supabase
        .from('commissions')
        .select('amount_sar, confirmed_at, affiliate_id, status')
        .eq('affiliate_id', profile.id)
        .eq('status', 'CONFIRMED')
        .gte('confirmed_at', start.toISOString())
        .lt('confirmed_at', end.toISOString());

      if (error) return 0;
      return (data || []).reduce((sum, row: any) => sum + Number(row.amount_sar || 0), 0);
    },
    enabled: !!profile?.id,
  });

  const totalSales = typeof store?.total_sales === 'number' ? Number(store.total_sales) : 0;
  const monthlyCommission = typeof monthlyCommissionValue === 'number' ? monthlyCommissionValue : 0;
  const leaderboardRank = typeof userStatistics?.leaderboardRank === 'number' ? userStatistics.leaderboardRank : 0;
  const leaderboardOutOf = typeof userStatistics?.leaderboardTotal === 'number' ? userStatistics.leaderboardTotal : 0;
  const conversionRate = typeof userStatistics?.conversionRate === 'number' ? userStatistics.conversionRate : 0;
  const averageOrder = typeof userStatistics?.averageAffiliateOrder === 'number' ? userStatistics.averageAffiliateOrder : 0;

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
          window.open(`/${storeSlug}`, '_blank');
        },
      },
    ],
    [publicStoreUrl]
  );

  const quickActionLinkClass = `flex items-center justify-between gap-[var(--spacing-md)] rounded-[var(--radius-m)] border px-[var(--spacing-md)] py-[var(--spacing-sm)] text-right transition-all duration-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 ${
    isDarkMode 
      ? 'border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong,var(--surface-2))] text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)] focus-visible:ring-offset-[color:var(--glass-bg)]'
      : 'border-slate-200/50 bg-slate-50/80 text-slate-800 hover:bg-slate-100 focus-visible:ring-offset-white'
  }`;

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
          <div key={metric.title} className={`group rounded-[var(--radius-l)] p-[1px] transition-all duration-500 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[color:var(--glass-bg)]/70 to-[color:var(--glass-bg-strong,var(--surface-2))]/60 shadow-[var(--shadow-glass-soft)]'
              : 'bg-gradient-to-br from-slate-100/70 to-slate-200/60 shadow-lg'
          }`}>
            <div className={`rounded-[inherit] p-[var(--spacing-md)] transition-transform duration-200 group-hover:-translate-y-0.5 ${
              isDarkMode 
                ? 'bg-[color:var(--glass-bg)]/90'
                : 'bg-white/90'
            }`}>
              <KpiCard {...metric} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={`flex h-full flex-col justify-between rounded-[var(--radius-l)] border p-[var(--spacing-lg)] backdrop-blur-xl transition-colors duration-500 ${
          isDarkMode 
            ? 'border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/88 shadow-[var(--shadow-glass-soft)]'
            : 'border-slate-200/50 bg-white/90 shadow-lg'
        }`}>
          <header className="mb-[var(--spacing-md)]">
            <h2 className={`heading-ar text-xl font-extrabold tracking-tight transition-colors duration-500 ${
              isDarkMode ? 'text-[color:var(--glass-fg)]' : 'text-slate-800'
            }`}>أداءك هذا الأسبوع</h2>
            <p className={`elegant-text text-sm transition-colors duration-500 ${
              isDarkMode ? 'text-[color:var(--muted-foreground)]' : 'text-slate-600'
            }`}>
              {(nameOverride ?? profile?.full_name)?.split(' ')[0] ?? 'مرحبا'}, هذه لمحة سريعة عن حملاتك النشطة.
            </p>
          </header>
          <ul className="grid gap-[var(--spacing-md)] sm:grid-cols-3">
            {performanceHighlights.map((item) => (
              <li
                key={item.label}
                className={`rounded-[var(--radius-m)] border p-[var(--spacing-md)] text-sm transition-all duration-500 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg)]/80'
                    : 'border-slate-200/50 bg-white/80 text-slate-800 hover:bg-slate-50/80 shadow-sm hover:shadow-md'
                }`}
              >
                <p className={`text-xs transition-colors duration-500 ${
                  isDarkMode ? 'text-[color:var(--muted-foreground)]' : 'text-slate-500'
                }`}>{item.label}</p>
                <p className="mt-2 text-lg font-semibold premium-text">{item.value}</p>
              </li>
            ))}
          </ul>
          <div className={`mt-[var(--spacing-lg)] rounded-[var(--radius-m)] border border-dashed p-[var(--spacing-md)] text-xs transition-colors duration-500 ${
            isDarkMode 
              ? 'border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 text-[color:var(--muted-foreground)]'
              : 'border-slate-300/50 bg-slate-50/60 text-slate-600'
          }`}>
            نصيحة: شارك رابطك بعد تحديث المحتوى – العملاء الذين يشاهدون قصة جديدة ينفقون 18٪ أكثر.
          </div>
        </div>

        <div className={`flex h-full flex-col gap-[var(--spacing-md)] rounded-[var(--radius-l)] border p-[var(--spacing-lg)] backdrop-blur-xl transition-colors duration-500 ${
          isDarkMode 
            ? 'border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/88 shadow-[var(--shadow-glass-soft)]'
            : 'border-slate-200/50 bg-white/90 shadow-lg'
        }`}>
          <h2 className={`text-sm font-semibold heading-ar transition-colors duration-500 ${
            isDarkMode ? 'text-[color:var(--glass-fg)]' : 'text-slate-800'
          }`}>روابط سريعة</h2>
          <nav aria-label="روابط عمليات المسوق" className="flex flex-col gap-[var(--spacing-sm)]">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const content = (
                <span className="flex flex-1 flex-col text-right">
                  <span className={`text-sm font-medium premium-text transition-colors duration-500 ${
                    isDarkMode ? 'text-[color:var(--glass-fg)]' : 'text-slate-800'
                  }`}>{action.label}</span>
                  <span className={`text-xs elegant-text transition-colors duration-500 ${
                    isDarkMode ? 'text-[color:var(--muted-foreground)]' : 'text-slate-600'
                  }`}>{action.description}</span>
                </span>
              );

              return action.to ? (
                <Link key={action.id} to={action.to} className={cn(quickActionLinkClass, 'w-full')}>
                  <Icon className={`h-5 w-5 transition-colors duration-500 ${
                    isDarkMode ? 'text-[color:var(--accent)]' : 'text-blue-600'
                  }`} aria-hidden />
                  {content}
                </Link>
              ) : (
                <Button
                  key={action.id}
                  type="button"
                  variant="ghost"
                  onClick={action.action}
                  className={cn(quickActionLinkClass, 'group w-full')}
                >
                  <Icon className={`h-5 w-5 transition-all duration-200 group-hover:scale-110 ${
                    isDarkMode ? 'text-[color:var(--accent)]' : 'text-blue-600'
                  }`} aria-hidden />
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
          رابط متجرك العام: <a className="underline decoration-dotted cursor-pointer" onClick={() => window.open(`/${storeSlug}`, '_blank')}>{publicStoreUrl}</a>
        </span>
        <span>سيتم ترحيل العمولات المؤكدة في يوم 3 من الشهر القادم.</span>
      </footer>
    </div>
  );
};

export default MarketerHome;
