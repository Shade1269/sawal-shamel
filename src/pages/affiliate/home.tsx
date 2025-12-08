import { useEffect } from 'react';
import { useFastAuth } from '@/hooks/useFastAuth';
import {
  useAffiliateMetrics,
  AffiliateStoreSummary,
  AffiliateMetricsSnapshot,
  AffiliateRecentOrder,
  AffiliateProductShare,
} from '@/features/affiliate/hooks/useAffiliateMetrics';
import { AffiliateHomeViewRuntime } from './homeViewRuntime';
import {
  resolveAffiliateHomeStateRuntime,
  describeAffiliateHomeSectionsRuntime,
} from './homeStateRuntime.js';

export interface AffiliateHomeViewProps {
  loading: boolean;
  isAuthorized: boolean;
  store: AffiliateStoreSummary | null;
  shareUrl: string | null;
  metrics: AffiliateMetricsSnapshot | null;
  metricsLoading?: boolean;
  orders: AffiliateRecentOrder[];
  ordersLoading?: boolean;
  topProducts?: AffiliateProductShare[];
  error?: string | null;
  onRefresh?: () => void;
  onStoreCreated?: () => void;
}

export const AffiliateHomeView = (props: AffiliateHomeViewProps) => <AffiliateHomeViewRuntime {...props} />;

export const resolveAffiliateHomeState = (
  props: Pick<AffiliateHomeViewProps, 'loading' | 'isAuthorized' | 'store'>,
) => resolveAffiliateHomeStateRuntime(props as any);

export const describeAffiliateHomeSections = (_props: AffiliateHomeViewProps) =>
  describeAffiliateHomeSectionsRuntime();

const AffiliateHomePage = () => {
  const { profile, loading: authLoading, isAffiliate, isAdmin } = useFastAuth();
  const profileId = profile?.id ?? null;

  const {
    store,
    shareUrl,
    metrics,
    recentOrders,
    topProducts,
    loading: dataLoading,
    metricsLoading,
    ordersLoading,
    error,
    refetch,
  } = useAffiliateMetrics({ profileId });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('anaqti-skin');
    return () => {
      document.body.classList.remove('anaqti-skin');
    };
  }, []);

  const isAuthorized = Boolean(profile) && (isAffiliate || isAdmin);
  const loading = authLoading || dataLoading;

  const handleStoreCreated = () => {
    refetch(); // Refresh data after store creation
  };

  return (
    <AffiliateHomeView
      loading={loading}
      isAuthorized={isAuthorized}
      store={store}
      shareUrl={shareUrl}
      metrics={metrics}
      metricsLoading={metricsLoading}
      orders={recentOrders}
      ordersLoading={ordersLoading}
      topProducts={topProducts}
      error={error}
      onRefresh={refetch}
      onStoreCreated={handleStoreCreated}
    />
  );
};

export default AffiliateHomePage;
