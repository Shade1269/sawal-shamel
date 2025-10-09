import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedOrdersService } from '@/lib/unifiedOrdersService';
import { createStoreUrl } from '@/utils/domains';
import {
  deriveSalesSnapshotsRuntime,
  deriveTopProductSharesRuntime,
} from './useAffiliateMetricsRuntime';

export interface AffiliateStoreSummary {
  id: string;
  store_name: string;
  store_slug: string;
  store_description?: string | null;
  share_message?: string | null;
  branding_color?: string | null;
}

export interface AffiliateOrderItemSummary {
  id: string;
  product_id?: string | null;
  product_title?: string | null;
  quantity: number;
  total_price_sar: number;
}

export interface AffiliateOrderMonthlyRecord {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  total_sar: number;
  payment_status: string | null;
  status: string | null;
  created_at: string;
  items: AffiliateOrderItemSummary[];
}

export interface AffiliateRecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  customerName: string;
}

export interface SalesSnapshot {
  orders: number;
  items: number;
  revenue: number;
}

export interface AffiliateMetricsSnapshot {
  today: SalesSnapshot;
  week: SalesSnapshot;
  month: SalesSnapshot;
}

export interface AffiliateProductShare {
  productId: string;
  title: string;
  quantity: number;
  revenue: number;
}

export interface UseAffiliateMetricsParams {
  profileId?: string | null;
}

export interface UseAffiliateMetricsResult {
  store: AffiliateStoreSummary | null;
  shareUrl: string | null;
  metrics: AffiliateMetricsSnapshot | null;
  monthOrders: AffiliateOrderMonthlyRecord[];
  recentOrders: AffiliateRecentOrder[];
  topProducts: AffiliateProductShare[];
  loading: boolean;
  metricsLoading: boolean;
  ordersLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const normaliseNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normaliseQuantity = (value: number | string | null | undefined): number => {
  const parsed = normaliseNumber(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
export const deriveSalesSnapshots = (
  orders: AffiliateOrderMonthlyRecord[],
  referenceDate: Date = new Date()
): AffiliateMetricsSnapshot => deriveSalesSnapshotsRuntime(orders as any, referenceDate) as AffiliateMetricsSnapshot;

export const useAffiliateMetrics = ({ profileId }: UseAffiliateMetricsParams): UseAffiliateMetricsResult => {
  const storeQuery = useQuery({
    queryKey: ['affiliate-store-summary', profileId],
    queryFn: async () => {
      if (!profileId) {
        return null;
      }

      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('id, store_name, store_slug, bio')
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      return data as AffiliateStoreSummary;
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });

  const monthlyQuery = useQuery({
    queryKey: ['affiliate-monthly-orders', storeQuery.data?.id],
    queryFn: async () => {
      const storeId = storeQuery.data?.id;
      if (!storeId) {
        return { metrics: null as AffiliateMetricsSnapshot | null, orders: [] as AffiliateOrderMonthlyRecord[] };
      }

      const monthStart = startOfMonth(new Date()).toISOString();

      const { data, error } = await supabase
        .from('ecommerce_orders')
        .select(`
          id,
          order_number,
          customer_name,
          total_sar,
          payment_status,
          status,
          created_at,
          ecommerce_order_items (id, product_id, product_title, quantity, total_price_sar)
        `)
        .eq('affiliate_store_id', storeId)
        .gte('created_at', monthStart)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const orders: AffiliateOrderMonthlyRecord[] = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number ?? null,
        customer_name: order.customer_name ?? null,
        total_sar: normaliseNumber(order.total_sar),
        payment_status: order.payment_status ?? null,
        status: order.status ?? null,
        created_at: order.created_at,
        items: Array.isArray(order.ecommerce_order_items)
          ? order.ecommerce_order_items.map((item: any) => ({
              id: item.id,
              product_id: item.product_id ?? null,
              product_title: item.product_title ?? null,
              quantity: normaliseQuantity(item.quantity),
              total_price_sar: normaliseNumber(item.total_price_sar),
            }))
          : [],
      }));

      return {
        orders,
        metrics: deriveSalesSnapshots(orders),
      };
    },
    enabled: !!storeQuery.data?.id,
    staleTime: 60 * 1000,
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['affiliate-recent-orders', storeQuery.data?.id],
    queryFn: async () => {
      const storeId = storeQuery.data?.id;
      if (!storeId) {
        return [] as AffiliateRecentOrder[];
      }

      const orders = await UnifiedOrdersService.getOrders({
        affiliate_store_id: storeId,
        limit: 10,
      });

      return orders.map((order) => ({
        id: order.id,
        orderNumber: order.order_number ?? `#${order.id.slice(0, 8)}`,
        total: normaliseNumber(order.total_sar),
        paymentStatus: order.payment_status ?? 'PENDING',
        fulfillmentStatus: order.status ?? 'PROCESSING',
        createdAt: order.created_at,
        customerName: order.customer_name ?? 'عميل',
      }));
    },
    enabled: !!storeQuery.data?.id,
    staleTime: 60 * 1000,
  });

  const shareUrl = useMemo(() => {
    if (!storeQuery.data) {
      return null;
    }
    return createStoreUrl(storeQuery.data.store_slug);
  }, [storeQuery.data]);

  const topProducts = useMemo(() => {
    return deriveTopProductSharesRuntime(monthlyQuery.data?.orders ?? [], { limit: 4 });
  }, [monthlyQuery.data?.orders]);

  const loading = storeQuery.isLoading || monthlyQuery.isLoading || recentOrdersQuery.isLoading;

  const error = storeQuery.error?.message
    || (monthlyQuery.error instanceof Error ? monthlyQuery.error.message : monthlyQuery.error as string | null)
    || (recentOrdersQuery.error instanceof Error ? recentOrdersQuery.error.message : recentOrdersQuery.error as string | null)
    || null;

  return {
    store: storeQuery.data ?? null,
    shareUrl,
    metrics: monthlyQuery.data?.metrics ?? null,
    monthOrders: monthlyQuery.data?.orders ?? [],
    recentOrders: recentOrdersQuery.data ?? [],
    topProducts,
    loading,
    metricsLoading: monthlyQuery.isLoading,
    ordersLoading: recentOrdersQuery.isLoading,
    error,
    refetch: () => {
      storeQuery.refetch();
      monthlyQuery.refetch();
      recentOrdersQuery.refetch();
    },
  };
};

