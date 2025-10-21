import { useMemo, useRef, useSyncExternalStore } from "react";

export type AdminOrderStatus = "pending" | "paid" | "shipped" | "refunded" | "cancelled";

export type AdminOrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrderPayment = {
  id: string;
  method: string;
  amount: number;
  status: "paid" | "pending" | "refunded";
  paidAt: string;
  reference: string;
};

export type AdminOrderAddress = {
  name: string;
  line1: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  notes?: string;
};

export type AdminOrder = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: AdminOrderStatus;
  total: number;
  placedAt: string;
  confirmationId: string;
  items: AdminOrderItem[];
  payments: AdminOrderPayment[];
  shippingAddress: AdminOrderAddress;
  shippingMethod: string;
  paymentMethod: string;
  notes?: string;
};

export type OrdersDatePreset = "today" | "7d" | "30d" | "custom";

export type OrdersDateRange = {
  preset: OrdersDatePreset;
  from?: string | null;
  to?: string | null;
};

export type AdminOrdersFilters = {
  status: "all" | AdminOrderStatus;
  search: string;
  dateRange: OrdersDateRange;
  customerId?: string | null;
};

export type AdminOrdersSnapshot = {
  isLoading: boolean;
  error: string | null;
  filters: AdminOrdersFilters;
  records: AdminOrder[];
  visibleOrders: AdminOrder[];
  total: number;
  pageSize: number;
  loadedPages: number;
  hasMore: boolean;
  lastUpdated: string | null;
};

type AdminOrdersBaseState = {
  isLoading: boolean;
  error: string | null;
  filters: AdminOrdersFilters;
  records: AdminOrder[];
  pageSize: number;
  loadedPages: number;
  lastUpdated: string | null;
};

export type AdminOrdersStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => AdminOrdersSnapshot;
  setSearchTerm: (value: string) => void;
  setStatusFilter: (status: "all" | AdminOrderStatus) => void;
  setDateRangePreset: (preset: OrdersDatePreset) => void;
  setCustomDateRange: (from: string | null, to: string | null) => void;
  setCustomerId: (customerId: string | null) => void;
  loadMore: () => void;
  refresh: () => void;
  exportToCsv: () => string;
  reset: () => void;
};

const DEFAULT_NAMESPACE = "default";
const stores = new Map<string, AdminOrdersStore>();
const caches = new Map<string, Map<string, { records: AdminOrder[]; fetchedAt: number }>>();

const CACHE_TTL = 2 * 60 * 1000;
const PAGE_SIZE = 8;

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

const SEED_ORDERS: AdminOrder[] = [
  {
    id: "ORD-2054",
    customerId: "CUS-501",
    customerName: "مشاعل السبيعي",
    customerEmail: "mashael@example.com",
    customerPhone: "+966500112233",
    status: "pending",
    total: 1840,
    placedAt: isoDaysAgo(0, 9, 24),
    confirmationId: "9c2a67",
    items: [
      { id: "prod-amber", name: "عطر العنبر الملكي", quantity: 2, unitPrice: 420 },
      { id: "prod-oud", name: "دهن العود الفاخر", quantity: 1, unitPrice: 1000 },
    ],
    payments: [
      {
        id: "pay-1054",
        method: "بطاقة مدى",
        amount: 1840,
        status: "pending",
        paidAt: isoDaysAgo(0, 9, 24),
        reference: "MADA-2054",
      },
    ],
    shippingAddress: {
      name: "مشاعل السبيعي",
      line1: "حي الياسمين، شارع العليا",
      city: "الرياض",
      region: "منطقة الرياض",
      country: "السعودية",
      phone: "+966500112233",
      notes: "يرجى تغليف الطلب كهدية",
    },
    shippingMethod: "شحن سريع",
    paymentMethod: "بطاقة مدى",
    notes: "تأكيد عبر الرسائل النصية",
  },
  {
    id: "ORD-2053",
    customerId: "CUS-498",
    customerName: "نوف التركي",
    customerEmail: "nouf@example.com",
    customerPhone: "+966501234567",
    status: "paid",
    total: 1280,
    placedAt: isoDaysAgo(1, 19, 42),
    confirmationId: "7ab221",
    items: [
      { id: "prod-musk", name: "مسك الليل", quantity: 2, unitPrice: 320 },
      { id: "prod-rose", name: "ورد الطائف", quantity: 1, unitPrice: 640 },
    ],
    payments: [
      {
        id: "pay-1053",
        method: "Apple Pay",
        amount: 1280,
        status: "paid",
        paidAt: isoDaysAgo(1, 19, 43),
        reference: "APPLE-2053",
      },
    ],
    shippingAddress: {
      name: "نوف التركي",
      line1: "حي الشاطئ، شارع الأمير فيصل",
      city: "جدة",
      region: "منطقة مكة",
      country: "السعودية",
      phone: "+966501234567",
    },
    shippingMethod: "شحن قياسي",
    paymentMethod: "Apple Pay",
  },
  {
    id: "ORD-2052",
    customerId: "CUS-495",
    customerName: "تهاني الغامدي",
    customerEmail: "tehani@example.com",
    customerPhone: "+966550998877",
    status: "shipped",
    total: 560,
    placedAt: isoDaysAgo(1, 15, 7),
    confirmationId: "3e8bc5",
    items: [{ id: "prod-gold", name: "أمواج الذهب", quantity: 1, unitPrice: 560 }],
    payments: [
      {
        id: "pay-1052",
        method: "الدفع عند الاستلام",
        amount: 560,
        status: "pending",
        paidAt: isoDaysAgo(0, 9, 10),
        reference: "COD-2052",
      },
    ],
    shippingAddress: {
      name: "تهاني الغامدي",
      line1: "حي اليرموك، طريق الملك عبد العزيز",
      city: "الخبر",
      region: "المنطقة الشرقية",
      country: "السعودية",
      phone: "+966550998877",
    },
    shippingMethod: "استلام من المتجر",
    paymentMethod: "الدفع عند الاستلام",
  },
  {
    id: "ORD-2051",
    customerId: "CUS-492",
    customerName: "جواهر القحطاني",
    customerEmail: "jawaher@example.com",
    customerPhone: "+966512223344",
    status: "refunded",
    total: 980,
    placedAt: isoDaysAgo(2, 11, 33),
    confirmationId: "5d12af",
    items: [
      { id: "prod-amber", name: "عطر العنبر الملكي", quantity: 2, unitPrice: 420 },
      { id: "prod-musk", name: "مسك الليل", quantity: 1, unitPrice: 140 },
    ],
    payments: [
      {
        id: "pay-1051",
        method: "بطاقة ائتمان",
        amount: 980,
        status: "refunded",
        paidAt: isoDaysAgo(2, 11, 34),
        reference: "VISA-2051",
      },
    ],
    shippingAddress: {
      name: "جواهر القحطاني",
      line1: "حي النهضة، شارع التحلية",
      city: "الرياض",
      region: "منطقة الرياض",
      country: "السعودية",
      phone: "+966512223344",
    },
    shippingMethod: "شحن دولي",
    paymentMethod: "بطاقة ائتمان",
    notes: "تم إرجاع الطلب بسبب كسر في العبوة",
  },
  {
    id: "ORD-2050",
    customerId: "CUS-489",
    customerName: "أروى الدوسري",
    customerEmail: "arwa@example.com",
    customerPhone: "+966503336655",
    status: "paid",
    total: 360,
    placedAt: isoDaysAgo(2, 9, 18),
    confirmationId: "912cf0",
    items: [{ id: "prod-rose", name: "ورد الطائف", quantity: 1, unitPrice: 360 }],
    payments: [
      {
        id: "pay-1050",
        method: "مدى",
        amount: 360,
        status: "paid",
        paidAt: isoDaysAgo(2, 9, 18),
        reference: "MADA-2050",
      },
    ],
    shippingAddress: {
      name: "أروى الدوسري",
      line1: "حي الشفا، طريق الملك فهد",
      city: "مكة",
      region: "منطقة مكة",
      country: "السعودية",
      phone: "+966503336655",
    },
    shippingMethod: "شحن سريع",
    paymentMethod: "مدى",
  },
  {
    id: "ORD-2049",
    customerId: "CUS-486",
    customerName: "هديل العتيبي",
    customerEmail: "hadeel@example.com",
    customerPhone: "+966512776655",
    status: "shipped",
    total: 1490,
    placedAt: isoDaysAgo(3, 20, 2),
    confirmationId: "1a9de1",
    items: [
      { id: "prod-oud", name: "دهن العود الفاخر", quantity: 2, unitPrice: 700 },
      { id: "prod-musk", name: "مسك الليل", quantity: 1, unitPrice: 90 },
    ],
    payments: [
      {
        id: "pay-1049",
        method: "تحويل بنكي",
        amount: 1490,
        status: "paid",
        paidAt: isoDaysAgo(3, 20, 5),
        reference: "BANK-2050",
      },
    ],
    shippingAddress: {
      name: "هديل العتيبي",
      line1: "حي قرطبة، شارع الأمير سعود",
      city: "الرياض",
      region: "منطقة الرياض",
      country: "السعودية",
      phone: "+966512776655",
    },
    shippingMethod: "شحن مبرّد",
    paymentMethod: "تحويل بنكي",
  },
  {
    id: "ORD-2048",
    customerId: "CUS-480",
    customerName: "وجدان الشريف",
    customerEmail: "wajdan@example.com",
    customerPhone: "+966544112266",
    status: "cancelled",
    total: 620,
    placedAt: isoDaysAgo(3, 14, 46),
    confirmationId: "5f7d00",
    items: [
      { id: "prod-gold", name: "أمواج الذهب", quantity: 1, unitPrice: 560 },
      { id: "prod-musk", name: "مسك الليل", quantity: 1, unitPrice: 60 },
    ],
    payments: [
      {
        id: "pay-1048",
        method: "بطاقة ائتمان",
        amount: 620,
        status: "refunded",
        paidAt: isoDaysAgo(3, 14, 50),
        reference: "VISA-2048",
      },
    ],
    shippingAddress: {
      name: "وجدان الشريف",
      line1: "حي الفيصلية، شارع الظهران",
      city: "الدمام",
      region: "المنطقة الشرقية",
      country: "السعودية",
      phone: "+966544112266",
    },
    shippingMethod: "شحن قياسي",
    paymentMethod: "بطاقة ائتمان",
    notes: "ألغت الطلب قبل الإرسال",
  },
  {
    id: "ORD-2047",
    customerId: "CUS-475",
    customerName: "سمر الدخيل",
    customerEmail: "samar@example.com",
    customerPhone: "+966588776655",
    status: "pending",
    total: 540,
    placedAt: isoDaysAgo(4, 13, 12),
    confirmationId: "83b241",
    items: [
      { id: "prod-rose", name: "ورد الطائف", quantity: 1, unitPrice: 420 },
      { id: "prod-musk", name: "مسك الليل", quantity: 1, unitPrice: 120 },
    ],
    payments: [
      {
        id: "pay-1047",
        method: "Apple Pay",
        amount: 540,
        status: "pending",
        paidAt: isoDaysAgo(4, 13, 12),
        reference: "APPLE-2047",
      },
    ],
    shippingAddress: {
      name: "سمر الدخيل",
      line1: "حي أحد، شارع قباء",
      city: "المدينة المنورة",
      region: "منطقة المدينة",
      country: "السعودية",
      phone: "+966588776655",
    },
    shippingMethod: "شحن قياسي",
    paymentMethod: "Apple Pay",
  },
];

const formatDateStart = (input: Date) => {
  const start = new Date(input);
  start.setHours(0, 0, 0, 0);
  return start;
};

const formatDateEnd = (input: Date) => {
  const end = new Date(input);
  end.setHours(23, 59, 59, 999);
  return end;
};

const normalizeFilters = (filters: AdminOrdersFilters) => ({
  status: filters.status,
  search: filters.search.trim().toLowerCase(),
  customerId: filters.customerId ?? null,
  dateRange: {
    preset: filters.dateRange.preset,
    from: filters.dateRange.from ?? null,
    to: filters.dateRange.to ?? null,
  },
});

const createCacheKey = (namespace: string, filters: AdminOrdersFilters) =>
  `${namespace}:${JSON.stringify(normalizeFilters(filters))}`;

const withinDateRange = (dateISO: string, range: OrdersDateRange) => {
  if (range.preset === "custom") {
    if (!range.from && !range.to) return true;
    const time = new Date(dateISO).getTime();
    const from = range.from ? formatDateStart(new Date(range.from)).getTime() : Number.NEGATIVE_INFINITY;
    const to = range.to ? formatDateEnd(new Date(range.to)).getTime() : Number.POSITIVE_INFINITY;
    return time >= from && time <= to;
  }

  const now = new Date();
  let fromDate = formatDateStart(new Date(now));

  if (range.preset === "7d") {
    fromDate = formatDateStart(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
  } else if (range.preset === "30d") {
    fromDate = formatDateStart(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
  }

  const toDate = formatDateEnd(new Date(now));
  const value = new Date(dateISO);
  return value.getTime() >= fromDate.getTime() && value.getTime() <= toDate.getTime();
};

const applyFilters = (orders: AdminOrder[], filters: AdminOrdersFilters) => {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return orders
    .filter((order) => {
      const matchesSearch = normalizedSearch
        ? order.id.toLowerCase().includes(normalizedSearch) ||
          order.customerName.toLowerCase().includes(normalizedSearch) ||
          order.customerEmail.toLowerCase().includes(normalizedSearch) ||
          order.customerPhone.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesStatus = filters.status === "all" ? true : order.status === filters.status;
      const matchesCustomer = filters.customerId ? order.customerId === filters.customerId : true;
      const matchesDate = withinDateRange(order.placedAt, filters.dateRange);

      return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
    })
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
};

const toSnapshot = (state: AdminOrdersBaseState): AdminOrdersSnapshot => {
  const visibleOrders = state.records.slice(0, state.loadedPages * state.pageSize);
  return {
    ...state,
    visibleOrders,
    total: state.records.length,
    hasMore: visibleOrders.length < state.records.length,
  } satisfies AdminOrdersSnapshot;
};

const ensureCacheBucket = (namespace: string) => {
  if (!caches.has(namespace)) {
    caches.set(namespace, new Map());
  }
  return caches.get(namespace)!;
};

const defaultFilters: AdminOrdersFilters = {
  status: "all",
  search: "",
  customerId: null,
  dateRange: { preset: "7d" },
};

export const createAdminOrdersStore = (namespace = DEFAULT_NAMESPACE): AdminOrdersStore => {
  if (stores.has(namespace)) {
    return stores.get(namespace)!;
  }

  const cacheBucket = ensureCacheBucket(namespace);

  const seededRecords = applyFilters(SEED_ORDERS, defaultFilters);

  let state: AdminOrdersBaseState = {
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
  let cachedSnapshot: AdminOrdersSnapshot | null = null;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (updater: (current: AdminOrdersBaseState) => AdminOrdersBaseState) => {
    state = updater(state);
    cachedSnapshot = null;
    notify();
  };

  const runQuery = (filters: AdminOrdersFilters, options?: { bustCache?: boolean }) => {
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
      const filtered = applyFilters(SEED_ORDERS, filters);
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
    }, 160);
  };

  const exportToCsv = () => {
    const headers = [
      "order_id",
      "customer_id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "status",
      "total",
      "placed_at",
      "payment_methods",
    ];

    const rows = state.records.map((order) => [
      order.id,
      order.customerId,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.status,
      currency.format(order.total),
      order.placedAt,
      order.payments.map((payment) => `${payment.method} (${payment.status})`).join(" | "),
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

  const store: AdminOrdersStore = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => {
      if (cachedSnapshot) {
        return cachedSnapshot;
      }
      cachedSnapshot = toSnapshot(state);
      return cachedSnapshot;
    },
    setSearchTerm: (value) => {
      runQuery({ ...state.filters, search: value });
    },
    setStatusFilter: (status) => {
      runQuery({ ...state.filters, status });
    },
    setDateRangePreset: (preset) => {
      const next: OrdersDateRange = preset === "custom" ? { preset, from: null, to: null } : { preset };
      runQuery({ ...state.filters, dateRange: next });
    },
    setCustomDateRange: (from, to) => {
      runQuery({
        ...state.filters,
        dateRange: { preset: "custom", from: from ?? null, to: to ?? null },
      });
    },
    setCustomerId: (customerId) => {
      runQuery({ ...state.filters, customerId });
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

export type UseAdminOrdersOptions = {
  namespace?: string;
};

export const useAdminOrders = (options?: UseAdminOrdersOptions) => {
  const namespace = options?.namespace ?? DEFAULT_NAMESPACE;
  const storeRef = useRef<AdminOrdersStore>();

  if (!storeRef.current) {
    storeRef.current = createAdminOrdersStore(namespace);
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
      setStatusFilter: storeRef.current!.setStatusFilter,
      setDateRangePreset: storeRef.current!.setDateRangePreset,
      setCustomDateRange: storeRef.current!.setCustomDateRange,
      setCustomerId: storeRef.current!.setCustomerId,
      loadMore: storeRef.current!.loadMore,
      refresh: storeRef.current!.refresh,
      exportToCsv: storeRef.current!.exportToCsv,
      reset: storeRef.current!.reset,
    }),
    [snapshot]
  );
};

export const getNextRowIndex = (currentIndex: number, direction: "up" | "down", total: number) => {
  if (total === 0) return -1;
  if (direction === "up") {
    return currentIndex <= 0 ? total - 1 : currentIndex - 1;
  }
  return currentIndex >= total - 1 ? 0 : currentIndex + 1;
};
