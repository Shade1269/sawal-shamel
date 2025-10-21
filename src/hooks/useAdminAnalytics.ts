import { useMemo, useRef, useSyncExternalStore } from "react";

export type AnalyticsMetric = {
  id: string;
  label: string;
  value: number;
  change: number;
  changeDirection: "up" | "down" | "flat";
  unit: "currency" | "count";
};

export type AnalyticsListItem = {
  id: string;
  name: string;
  value: number;
  trend: number;
};

export type AnalyticsTrendPoint = {
  date: string;
  orders: number;
};

export type AdminAnalyticsSnapshot = {
  isLoading: boolean;
  generatedAt: string;
  metrics: AnalyticsMetric[];
  topProducts: AnalyticsListItem[];
  topAffiliates: AnalyticsListItem[];
  trend: AnalyticsTrendPoint[];
};

export type AdminAnalyticsStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => AdminAnalyticsSnapshot;
  refresh: () => void;
  reset: () => void;
};

const DEFAULT_NAMESPACE = "default";
const stores = new Map<string, AdminAnalyticsStore>();

function formatISODate(date: Date): string {
  return date.toISOString();
}

const TREND_TEMPLATE = [54, 62, 58, 66, 71, 64, 59, 68, 72, 77, 69, 74, 81, 88];

function createTrendPoints(): AnalyticsTrendPoint[] {
  const today = new Date();
  return TREND_TEMPLATE.map((orders, index) => {
    const pointDate = new Date(today);
    pointDate.setDate(today.getDate() - (TREND_TEMPLATE.length - 1 - index));
    return {
      date: pointDate.toISOString().split("T")[0],
      orders,
    } satisfies AnalyticsTrendPoint;
  });
}

function createTopProducts(): AnalyticsListItem[] {
  return [
    { id: "prod-amber", name: "عطر العنبر الملكي", value: 186000, trend: 18 },
    { id: "prod-musk", name: "مسك الليل", value: 152400, trend: 12 },
    { id: "prod-oud", name: "دهن العود الفاخر", value: 137800, trend: 9 },
    { id: "prod-rose", name: "ورد الطائف", value: 118200, trend: 6 },
    { id: "prod-gold", name: "أمواج الذهب", value: 97500, trend: 4 },
  ];
}

function createTopAffiliates(): AnalyticsListItem[] {
  return [
    { id: "aff-leen", name: "لين العلي", value: 24850, trend: 26 },
    { id: "aff-noura", name: "نورة الشهري", value: 23120, trend: 21 },
    { id: "aff-farah", name: "فرح الزهراني", value: 19840, trend: 15 },
    { id: "aff-lama", name: "لمى المطيري", value: 18460, trend: 11 },
    { id: "aff-hessa", name: "حصة الحربي", value: 16920, trend: 8 },
  ];
}

function createMetrics(): AnalyticsMetric[] {
  return [
    { id: "sales-day", label: "مبيعات اليوم", value: 64500, change: 12, changeDirection: "up", unit: "currency" },
    { id: "sales-week", label: "مبيعات هذا الأسبوع", value: 412800, change: 7, changeDirection: "up", unit: "currency" },
    { id: "sales-month", label: "مبيعات هذا الشهر", value: 1689000, change: -4, changeDirection: "down", unit: "currency" },
    { id: "orders-count", label: "عدد الطلبات", value: 982, change: 5, changeDirection: "up", unit: "count" },
    { id: "avg-order", label: "متوسط قيمة الطلب", value: 472, change: 3, changeDirection: "up", unit: "currency" },
    { id: "return-rate", label: "معدل الإرجاع", value: 38, change: -2, changeDirection: "down", unit: "count" },
  ];
}

function createSnapshot(): AdminAnalyticsSnapshot {
  const generatedAt = formatISODate(new Date());
  return {
    isLoading: false,
    generatedAt,
    metrics: createMetrics(),
    topProducts: createTopProducts(),
    topAffiliates: createTopAffiliates(),
    trend: createTrendPoints(),
  } satisfies AdminAnalyticsSnapshot;
}

export function createAdminAnalyticsStore(namespace = DEFAULT_NAMESPACE): AdminAnalyticsStore {
  if (stores.has(namespace)) {
    return stores.get(namespace)!;
  }

  let state = createSnapshot();
  const listeners = new Set<() => void>();
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (updater: (current: AdminAnalyticsSnapshot) => AdminAnalyticsSnapshot) => {
    state = updater(state);
    notify();
  };

  const refresh = () => {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }

    setState((current) => ({ ...current, isLoading: true }));

    pendingTimer = setTimeout(() => {
      state = { ...createSnapshot(), isLoading: false };
      pendingTimer = null;
      notify();
    }, 360);
  };

  const store: AdminAnalyticsStore = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    refresh,
    reset: () => {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      state = createSnapshot();
      notify();
    },
  };

  stores.set(namespace, store);
  return store;
}

export type UseAdminAnalyticsOptions = {
  namespace?: string;
};

export function useAdminAnalytics(options?: UseAdminAnalyticsOptions) {
  const namespace = options?.namespace ?? DEFAULT_NAMESPACE;
  const storeRef = useRef<AdminAnalyticsStore>();

  if (!storeRef.current) {
    storeRef.current = createAdminAnalyticsStore(namespace);
  }

  const snapshot = useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getSnapshot,
    storeRef.current.getSnapshot
  );

  return useMemo(
    () => ({
      ...snapshot,
      refresh: storeRef.current!.refresh,
    }),
    [snapshot]
  );
}
