import { useMemo } from 'react';
import { ExternalLink, LineChart, ShoppingCart, TicketPercent, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import type { KpiCardProps } from '@/components/home/KpiCard';
import type { ActionCardProps } from '@/components/marketer/QuickActionsPanel';

const currencyFormatter = new Intl.NumberFormat('ar-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ar-EG');

export interface UseMarketerHomeContentOptions {
  statistics: Record<string, any>;
  totalSales: number;
  monthlyCommission: number;
  leaderboardRank: number;
  leaderboardOutOf: number;
  conversionRate: number;
  averageOrder: number;
  publicStoreUrl: string;
  storeSlug: string;
  displayName?: string | null;
}

export const useMarketerHomeContent = ({
  statistics,
  totalSales,
  monthlyCommission,
  leaderboardRank,
  leaderboardOutOf,
  conversionRate,
  averageOrder,
  publicStoreUrl,
  storeSlug,
  displayName,
}: UseMarketerHomeContentOptions) => {
  const metrics = useMemo(
    (): KpiCardProps[] => [
      {
        title: 'مبيعات المتجر الإجمالية',
        value: currencyFormatter.format(totalSales),
        icon: ShoppingCart,
        delta: { value: statistics?.storeGrowth ?? 9.2, trend: 'up', label: 'خلال 7 أيام' },
        footer: 'يشمل جميع القنوات المرتبطة',
        accent: 'success',
      },
      {
        title: 'عمولات هذا الشهر',
        value: currencyFormatter.format(monthlyCommission),
        icon: LineChart,
        delta: { value: statistics?.commissionGrowth ?? 6.4, trend: 'up', label: 'مقارنة بالشهر الماضي' },
        footer: 'يتم تحديثها يومياً بعد التسويات',
        accent: 'accent',
      },
      {
        title: 'ترتيبك في لوحة الشرف',
        value: `#${leaderboardRank} من ${numberFormatter.format(leaderboardOutOf)}`,
        icon: Trophy,
        delta: { value: statistics?.leaderboardDelta ?? 1.0, trend: 'up', label: 'تحسن خلال الأسبوع' },
        footer: 'حافظ على معدل تحويل مرتفع للصعود',
        accent: 'warning',
      },
    ],
    [leaderboardOutOf, leaderboardRank, monthlyCommission, statistics, totalSales]
  );

  const chartData = useMemo(() => {
    if (Array.isArray(statistics?.dailyAffiliateRevenue)) {
      return statistics.dailyAffiliateRevenue as number[];
    }
    return [12_800, 11_400, 14_200, 17_600, 16_400, 19_800, 22_100];
  }, [statistics]);

  const quickActions = useMemo<ActionCardProps[]>(
    () => [
      {
        id: 'share-store',
        label: 'زر مشاركة المتجر',
        description: 'انسخ رابط المتجر أو شاركه مباشرة مع عملائك',
        icon: ExternalLink,
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
    [publicStoreUrl, storeSlug]
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
        value: numberFormatter.format(statistics?.sessionsThisWeek ?? 2_430),
      },
    ],
    [averageOrder, conversionRate, statistics]
  );

  const userName = useMemo(() => (displayName?.split(' ')[0] ?? 'مرحبا'), [displayName]);

  return {
    metrics,
    quickActions,
    performanceHighlights,
    chartData,
    userName,
  } as const;
};
