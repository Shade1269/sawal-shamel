import React, { useMemo } from 'react';
import { Share2, TicketPercent, ExternalLink, Trophy, ShoppingCart, LineChart } from 'lucide-react';
import type { KpiCardProps } from '@/components/home/KpiCard';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { 
  PerformanceMetrics, 
  PerformanceHighlights, 
  QuickActionsPanel, 
  DailyRevenueChart 
} from '@/components/marketer';

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

  const performanceHighlights = useMemo(
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

  const userName = (nameOverride ?? profile?.full_name)?.split(' ')[0] ?? 'مرحبا';

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <PerformanceMetrics metrics={metrics} />

      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <PerformanceHighlights highlights={performanceHighlights} userName={userName} />
        <QuickActionsPanel actions={quickActions} />
      </section>

      <DailyRevenueChart chartData={chartData} />

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
