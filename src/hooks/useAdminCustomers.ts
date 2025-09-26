import { useMemo, useRef, useSyncExternalStore } from "react";

import type { AdminOrderStatus } from "./useAdminOrders";

export type CustomerOrder = {
  id: string;
  total: number;
  status: AdminOrderStatus;
  placedAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalSpent: number;
  lifetimeOrders: number;
  lastActiveAt: string;
  lastOrders: CustomerOrder[];
  lastOrderId: string | null;
  lastOrderTotal: number | null;
  lastOrderStatus: AdminOrderStatus | null;
  notes?: string;
};

export type CustomerDatePreset = "all" | "7d" | "30d" | "90d" | "custom";

export type CustomerDateRange = {
  preset: CustomerDatePreset;
  from?: string | null;
  to?: string | null;
};

export type SpendRange = {
  min?: number | null;
  max?: number | null;
};

export type CustomerSort = "recent" | "spend-desc" | "spend-asc";

export type AdminCustomersFilters = {
  search: string;
  dateRange: CustomerDateRange;
  spendRange: SpendRange;
  sort: CustomerSort;
};

export type AdminCustomersSnapshot = {
  isLoading: boolean;
  error: string | null;
  filters: AdminCustomersFilters;
  records: AdminCustomer[];
  visibleCustomers: AdminCustomer[];
  total: number;
  pageSize: number;
  loadedPages: number;
  hasMore: boolean;
  lastUpdated: string | null;
};

type AdminCustomersBaseState = {
  isLoading: boolean;
  error: string | null;
  filters: AdminCustomersFilters;
  records: AdminCustomer[];
  pageSize: number;
  loadedPages: number;
  lastUpdated: string | null;
};

export type AdminCustomersStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => AdminCustomersSnapshot;
  setSearchTerm: (term: string) => void;
  setDateRangePreset: (preset: CustomerDatePreset) => void;
  setCustomDateRange: (from: string | null, to: string | null) => void;
  setSpendRange: (min: number | null, max: number | null) => void;
  setSort: (sort: CustomerSort) => void;
  loadMore: () => void;
  refresh: () => void;
  exportToCsv: () => string;
  reset: () => void;
};

const DEFAULT_NAMESPACE = "default";
const stores = new Map<string, AdminCustomersStore>();
const caches = new Map<string, Map<string, { records: AdminCustomer[]; fetchedAt: number }>>();

const CACHE_TTL = 2 * 60 * 1000;
const PAGE_SIZE = 9;

const currency = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
});

const isoDaysAgo = (days: number, hours = 9, minutes = 0) => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(hours, minutes, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const SEED_CUSTOMERS: AdminCustomer[] = [
  {
    id: "CUS-501",
    name: "مشاعل السبيعي",
    email: "mashael@example.com",
    phone: "+966500112233",
    location: "الرياض، السعودية",
    totalSpent: 42850,
    lifetimeOrders: 42,
    lastActiveAt: isoDaysAgo(0, 9, 24),
    notes: "تفضل العطور الشرقية، اشتركت في النشرة الموسمية.",
    lastOrders: [
      { id: "ORD-2054", total: 1840, status: "pending", placedAt: isoDaysAgo(0, 9, 24) },
      { id: "ORD-2042", total: 2480, status: "paid", placedAt: isoDaysAgo(5, 11, 5) },
      { id: "ORD-2038", total: 960, status: "paid", placedAt: isoDaysAgo(9, 19, 3) },
    ],
    lastOrderId: "ORD-2054",
    lastOrderTotal: 1840,
    lastOrderStatus: "pending",
  },
  {
    id: "CUS-498",
    name: "نوف التركي",
    email: "nouf@example.com",
    phone: "+966501234567",
    location: "جدة، السعودية",
    totalSpent: 23980,
    lifetimeOrders: 21,
    lastActiveAt: isoDaysAgo(1, 19, 42),
    lastOrders: [
      { id: "ORD-2053", total: 1280, status: "paid", placedAt: isoDaysAgo(1, 19, 42) },
      { id: "ORD-2041", total: 1280, status: "paid", placedAt: isoDaysAgo(7, 14, 42) },
      { id: "ORD-2022", total: 640, status: "refunded", placedAt: isoDaysAgo(35, 18, 12) },
    ],
    lastOrderId: "ORD-2053",
    lastOrderTotal: 1280,
    lastOrderStatus: "paid",
  },
  {
    id: "CUS-495",
    name: "تهاني الغامدي",
    email: "tehani@example.com",
    phone: "+966550998877",
    location: "الخبر، السعودية",
    totalSpent: 1680,
    lifetimeOrders: 3,
    lastActiveAt: isoDaysAgo(1, 15, 7),
    lastOrders: [
      { id: "ORD-2052", total: 560, status: "shipped", placedAt: isoDaysAgo(1, 15, 7) },
      { id: "ORD-2035", total: 580, status: "paid", placedAt: isoDaysAgo(15, 10, 22) },
    ],
    lastOrderId: "ORD-2052",
    lastOrderTotal: 560,
    lastOrderStatus: "shipped",
  },
  {
    id: "CUS-492",
    name: "جواهر القحطاني",
    email: "jawaher@example.com",
    phone: "+966512223344",
    location: "الرياض، السعودية",
    totalSpent: 9640,
    lifetimeOrders: 12,
    lastActiveAt: isoDaysAgo(2, 11, 33),
    notes: "تأخر آخر طلب بسبب شركة الشحن.",
    lastOrders: [
      { id: "ORD-2051", total: 980, status: "refunded", placedAt: isoDaysAgo(2, 11, 33) },
      { id: "ORD-2021", total: 760, status: "paid", placedAt: isoDaysAgo(45, 15, 17) },
    ],
    lastOrderId: "ORD-2051",
    lastOrderTotal: 980,
    lastOrderStatus: "refunded",
  },
  {
    id: "CUS-489",
    name: "أروى الدوسري",
    email: "arwa@example.com",
    phone: "+966503336655",
    location: "مكة المكرمة، السعودية",
    totalSpent: 18620,
    lifetimeOrders: 18,
    lastActiveAt: isoDaysAgo(2, 9, 18),
    lastOrders: [
      { id: "ORD-2050", total: 360, status: "paid", placedAt: isoDaysAgo(2, 9, 18) },
      { id: "ORD-2032", total: 1450, status: "paid", placedAt: isoDaysAgo(20, 19, 10) },
    ],
    lastOrderId: "ORD-2050",
    lastOrderTotal: 360,
    lastOrderStatus: "paid",
  },
  {
    id: "CUS-486",
    name: "هديل العتيبي",
    email: "hadeel@example.com",
    phone: "+966512776655",
    location: "الرياض، السعودية",
    totalSpent: 30540,
    lifetimeOrders: 28,
    lastActiveAt: isoDaysAgo(3, 20, 2),
    lastOrders: [
      { id: "ORD-2049", total: 1490, status: "shipped", placedAt: isoDaysAgo(3, 20, 2) },
      { id: "ORD-2037", total: 1120, status: "shipped", placedAt: isoDaysAgo(14, 16, 55) },
    ],
    lastOrderId: "ORD-2049",
    lastOrderTotal: 1490,
    lastOrderStatus: "shipped",
  },
  {
    id: "CUS-480",
    name: "وجدان الشريف",
    email: "wajdan@example.com",
    phone: "+966544112266",
    location: "الدمام، السعودية",
    totalSpent: 5240,
    lifetimeOrders: 7,
    lastActiveAt: isoDaysAgo(3, 14, 46),
    lastOrders: [
      { id: "ORD-2048", total: 620, status: "cancelled", placedAt: isoDaysAgo(3, 14, 46) },
      { id: "ORD-2015", total: 480, status: "refunded", placedAt: isoDaysAgo(80, 14, 5) },
    ],
    lastOrderId: "ORD-2048",
    lastOrderTotal: 620,
    lastOrderStatus: "cancelled",
  },
  {
    id: "CUS-475",
    name: "سمر الدخيل",
    email: "samar@example.com",
    phone: "+966588776655",
    location: "المدينة المنورة، السعودية",
    totalSpent: 940,
    lifetimeOrders: 2,
    lastActiveAt: isoDaysAgo(4, 13, 12),
    lastOrders: [
      { id: "ORD-2047", total: 540, status: "pending", placedAt: isoDaysAgo(4, 13, 12) },
      { id: "ORD-2030", total: 420, status: "paid", placedAt: isoDaysAgo(25, 12, 15) },
    ],
    lastOrderId: "ORD-2047",
    lastOrderTotal: 540,
    lastOrderStatus: "pending",
  },
];

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const normalizeFilters = (filters: AdminCustomersFilters) => ({
  search: filters.search.trim().toLowerCase(),
  dateRange: {
    preset: filters.dateRange.preset,
    from: filters.dateRange.from ?? null,
    to: filters.dateRange.to ?? null,
  },
  spendRange: {
    min: filters.spendRange.min ?? null,
    max: filters.spendRange.max ?? null,
  },
  sort: filters.sort,
});

const createCacheKey = (namespace: string, filters: AdminCustomersFilters) =>
  `${namespace}:${JSON.stringify(normalizeFilters(filters))}`;

const withinDatePreset = (isoDate: string, range: CustomerDateRange) => {
  if (range.preset === "all") return true;
  if (range.preset === "custom") {
    if (!range.from && !range.to) return true;
    const target = new Date(isoDate).getTime();
    const from = range.from ? startOfDay(new Date(range.from)).getTime() : Number.NEGATIVE_INFINITY;
    const to = range.to ? endOfDay(new Date(range.to)).getTime() : Number.POSITIVE_INFINITY;
    return target >= from && target <= to;
  }

  const now = new Date();
  let fromDate = startOfDay(new Date(now));

  if (range.preset === "7d") {
    fromDate = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
  } else if (range.preset === "30d") {
    fromDate = startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
  } else if (range.preset === "90d") {
    fromDate = startOfDay(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
  }

  const toDate = endOfDay(new Date(now));
  const value = new Date(isoDate).getTime();
  return value >= fromDate.getTime() && value <= toDate.getTime();
};

const withinSpendRange = (amount: number, range: SpendRange) => {
  const min = range.min ?? null;
  const max = range.max ?? null;
  if (min === null && max === null) return true;
  if (min !== null && amount < min) return false;
  if (max !== null && amount > max) return false;
  return true;
};

const applyFilters = (customers: AdminCustomer[], filters: AdminCustomersFilters) => {
  const term = filters.search.trim().toLowerCase();

  const filtered = customers.filter((customer) => {
    const matchesTerm = term
      ? customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term)
      : true;

    const matchesDate = withinDatePreset(customer.lastActiveAt, filters.dateRange);
    const matchesSpend = withinSpendRange(customer.totalSpent, filters.spendRange);

    return matchesTerm && matchesDate && matchesSpend;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (filters.sort === "recent") {
      return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
    }

    if (filters.sort === "spend-desc") {
      return b.totalSpent - a.totalSpent;
    }

    return a.totalSpent - b.totalSpent;
  });

  return sorted;
};

const toSnapshot = (state: AdminCustomersBaseState): AdminCustomersSnapshot => {
  const visibleCustomers = state.records.slice(0, state.loadedPages * state.pageSize);
  return {
    ...state,
    visibleCustomers,
    total: state.records.length,
    hasMore: visibleCustomers.length < state.records.length,
  } satisfies AdminCustomersSnapshot;
};

const ensureCacheBucket = (namespace: string) => {
  if (!caches.has(namespace)) {
    caches.set(namespace, new Map());
  }
  return caches.get(namespace)!;
};

const defaultFilters: AdminCustomersFilters = {
  search: "",
  dateRange: { preset: "30d" },
  spendRange: {},
  sort: "recent",
};

export const createAdminCustomersStore = (namespace = DEFAULT_NAMESPACE): AdminCustomersStore => {
  if (stores.has(namespace)) {
    return stores.get(namespace)!;
  }

  const cacheBucket = ensureCacheBucket(namespace);
  const seededRecords = applyFilters(SEED_CUSTOMERS, defaultFilters);

  let state: AdminCustomersBaseState = {
    isLoading: false,
    error: null,
    filters: defaultFilters,
    records: seededRecords,
    pageSize: PAGE_SIZE,
    loadedPages: 1,
    lastUpdated: new Date().toISOString(),
  };

  cacheBucket.set(createCacheKey(namespace, defaultFilters), {
    records: seededRecords,
    fetchedAt: Date.now(),
  });

  const listeners = new Set<() => void>();
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (updater: (current: AdminCustomersBaseState) => AdminCustomersBaseState) => {
    state = updater(state);
    notify();
  };

  const runQuery = (filters: AdminCustomersFilters, options?: { bustCache?: boolean }) => {
    const key = createCacheKey(namespace, filters);

    if (options?.bustCache) {
      cacheBucket.delete(key);
    }

    const cached = cacheBucket.get(key);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: null,
        filters,
        records: cached.records,
        loadedPages: 1,
        lastUpdated: new Date().toISOString(),
      }));
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
      filters,
      loadedPages: 1,
    }));

    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }

    pendingTimer = setTimeout(() => {
      const filtered = applyFilters(SEED_CUSTOMERS, filters);
      cacheBucket.set(key, { records: filtered, fetchedAt: Date.now() });
      setState((current) => ({
        ...current,
        isLoading: false,
        error: null,
        filters,
        records: filtered,
        loadedPages: 1,
        lastUpdated: new Date().toISOString(),
      }));
      pendingTimer = null;
    }, 140);
  };

  const exportToCsv = () => {
    const headers = [
      "customer_id",
      "customer_name",
      "email",
      "phone",
      "total_spent",
      "lifetime_orders",
      "last_active_at",
      "last_order_id",
      "last_order_total",
      "last_order_status",
    ];

    const rows = state.records.map((customer) => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone,
      currency.format(customer.totalSpent),
      customer.lifetimeOrders,
      customer.lastActiveAt,
      customer.lastOrderId ?? "",
      customer.lastOrderTotal !== null ? currency.format(customer.lastOrderTotal) : "",
      customer.lastOrderStatus ?? "",
    ]);

    return [headers, ...rows]
      .map((cells) =>
        cells
          .map((cell) => {
            const value = String(cell ?? "");
            return value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(",")
      )
      .join("\n");
  };

  const store: AdminCustomersStore = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => toSnapshot(state),
    setSearchTerm: (term) => {
      runQuery({ ...state.filters, search: term });
    },
    setDateRangePreset: (preset) => {
      const next: CustomerDateRange = preset === "custom" ? { preset, from: null, to: null } : { preset };
      runQuery({ ...state.filters, dateRange: next });
    },
    setCustomDateRange: (from, to) => {
      runQuery({
        ...state.filters,
        dateRange: { preset: "custom", from: from ?? null, to: to ?? null },
      });
    },
    setSpendRange: (min, max) => {
      runQuery({
        ...state.filters,
        spendRange: {
          min: typeof min === "number" && !Number.isNaN(min) ? min : null,
          max: typeof max === "number" && !Number.isNaN(max) ? max : null,
        },
      });
    },
    setSort: (sort) => {
      runQuery({ ...state.filters, sort });
    },
    loadMore: () => {
      setState((current) => {
        const visible = (current.loadedPages + 1) * current.pageSize;
        if (visible >= current.records.length) {
          return { ...current, loadedPages: Math.ceil(current.records.length / current.pageSize) };
        }
        return { ...current, loadedPages: current.loadedPages + 1 };
      });
    },
    refresh: () => {
      runQuery({ ...state.filters }, { bustCache: true });
    },
    exportToCsv,
    reset: () => {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      runQuery(defaultFilters, { bustCache: true });
    },
  };

  stores.set(namespace, store);
  return store;
};

export type UseAdminCustomersOptions = {
  namespace?: string;
};

export const useAdminCustomers = (options?: UseAdminCustomersOptions) => {
  const namespace = options?.namespace ?? DEFAULT_NAMESPACE;
  const storeRef = useRef<AdminCustomersStore>();

  if (!storeRef.current) {
    storeRef.current = createAdminCustomersStore(namespace);
  }

  const snapshot = useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getSnapshot,
    storeRef.current.getSnapshot
  );

  return useMemo(
    () => ({
      ...snapshot,
      setSearchTerm: storeRef.current!.setSearchTerm,
      setDateRangePreset: storeRef.current!.setDateRangePreset,
      setCustomDateRange: storeRef.current!.setCustomDateRange,
      setSpendRange: storeRef.current!.setSpendRange,
      setSort: storeRef.current!.setSort,
      loadMore: storeRef.current!.loadMore,
      refresh: storeRef.current!.refresh,
      exportToCsv: storeRef.current!.exportToCsv,
      reset: storeRef.current!.reset,
    }),
    [snapshot]
  );
};

export const getNextCustomerIndex = (currentIndex: number, direction: "up" | "down", total: number) => {
  if (total === 0) return -1;
  if (direction === "up") {
    return currentIndex <= 0 ? total - 1 : currentIndex - 1;
  }
  return currentIndex >= total - 1 ? 0 : currentIndex + 1;
};
