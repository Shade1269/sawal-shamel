import React from 'react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { MarketerStatistics } from '@/components/marketer/MarketerStatistics';
import { MarketerPerformance } from '@/components/marketer/MarketerPerformance';
import { MarketerQuickActions } from '@/components/marketer/MarketerQuickActions';

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

  const chartData = React.useMemo(() => {
    if (Array.isArray(userStatistics?.dailyAffiliateRevenue)) {
      return userStatistics.dailyAffiliateRevenue as number[];
    }
    return [12_800, 11_400, 14_200, 17_600, 16_400, 19_800, 22_100];
  }, [userStatistics]);

  return (
    <div className="space-y-[var(--spacing-lg)]">
      <MarketerStatistics
        totalSales={totalSales}
        monthlyCommission={monthlyCommission}
        leaderboardRank={leaderboardRank}
        leaderboardOutOf={leaderboardOutOf}
        userStatistics={userStatistics}
        chartData={chartData}
      />

      <section className="grid gap-[var(--spacing-lg)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <MarketerPerformance
          conversionRate={conversionRate}
          averageOrder={averageOrder}
          userStatistics={userStatistics}
          userName={nameOverride ?? profile?.full_name}
        />

        <MarketerQuickActions
          publicStoreUrl={publicStoreUrl}
          storeSlug={storeSlug}
        />
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-[var(--spacing-md)] text-xs text-muted-foreground">
        <span>
          رابط متجرك العام: <a className="underline decoration-dotted cursor-pointer" onClick={() => window.open(`/${storeSlug}`, '_blank')}>{publicStoreUrl}</a>
        </span>
        <span>سيتم ترحيل العمولات المؤكدة في يوم 3 من الشهر القادم.</span>
      </footer>
    </div>
  );
};

export default MarketerHome;
