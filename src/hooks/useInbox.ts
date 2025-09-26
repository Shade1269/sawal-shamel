import { useMemo, useRef, useSyncExternalStore } from "react";

export type InboxNotification = {
  id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "store";
  timestamp: string;
  read: boolean;
};

export type InboxActivity = {
  id: string;
  title: string;
  description: string;
  icon: "order" | "payment" | "customer" | "alert" | "store";
  timestamp: string;
};

export type InboxState = {
  notifications: InboxNotification[];
  activity: InboxActivity[];
  unreadCount: number;
  page: number;
};

export type InboxStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => InboxState;
  markAsRead: (id: string) => void;
  clear: () => void;
  loadMore: () => void;
  reset: () => void;
};

export type UseInboxOptions = {
  namespace?: string;
  disablePersistence?: boolean;
};

export type InboxHookValue = InboxState & {
  markAsRead: (id: string) => void;
  clear: () => void;
  loadMore: () => void;
};

const STORAGE_PREFIX = "sawal::inbox::";
const memoryStorage = new Map<string, string>();

const defaultNotifications: InboxNotification[] = [
  {
    id: "notif-1001",
    title: "طلب جديد بانتظار المعالجة",
    message: "عميلة جديدة أكملت الطلب #2451 بقيمة 480 ر.س.",
    type: "order",
    timestamp: "قبل 3 دقائق",
    read: false,
  },
  {
    id: "notif-1002",
    title: "تم تأكيد تحويل عمولة",
    message: "حوّلنا 1,250 ر.س إلى محفظتك الخاصة بالمسوقين.",
    type: "payment",
    timestamp: "قبل ساعة",
    read: false,
  },
  {
    id: "notif-1003",
    title: "تنبيه المخزون",
    message: "عطر العنبر الملكي أوشك على النفاد (متبقٍ 4 وحدات).",
    type: "store",
    timestamp: "اليوم 09:15 ص",
    read: true,
  },
  {
    id: "notif-1004",
    title: "تحديث النظام",
    message: "تجربة التحليلات الجديدة متاحة الآن لجميع المدراء.",
    type: "system",
    timestamp: "أمس 05:40 م",
    read: true,
  },
];

const defaultActivity: InboxActivity[] = [
  {
    id: "activity-2001",
    title: "تم شحن طلب العميلة نورة",
    description: "تم تحديث حالة الطلب #2448 إلى شحن قيد التسليم.",
    icon: "order",
    timestamp: "قبل 12 دقيقة",
  },
  {
    id: "activity-2002",
    title: "انضمت مسوقة جديدة",
    description: "رحب بـ فاطمة التي سجلت من خلال رابطك الشخصي.",
    icon: "customer",
    timestamp: "قبل ساعة",
  },
  {
    id: "activity-2003",
    title: "زيادة في زيارات المتجر",
    description: "ارتفعت زيارات متجر الأناقة بنسبة 32% خلال آخر 24 ساعة.",
    icon: "store",
    timestamp: "اليوم 08:20 ص",
  },
  {
    id: "activity-2004",
    title: "تم صرف دفعة العمولات",
    description: "أرسلنا دفعة عمولات جديدة بقيمة 3,480 ر.س.",
    icon: "payment",
    timestamp: "أمس 04:05 م",
  },
];

const stores = new Map<string, InboxStore>();

const getStorage = (disablePersistence: boolean | undefined) => {
  if (disablePersistence) {
    return null;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
    },
  } as Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

function createStateSnapshot(partial?: Partial<InboxState>): InboxState {
  const base: InboxState = {
    notifications: defaultNotifications,
    activity: defaultActivity,
    unreadCount: defaultNotifications.filter((item) => !item.read).length,
    page: 1,
  };

  if (!partial) {
    return base;
  }

  const merged: InboxState = {
    ...base,
    ...partial,
    notifications: partial.notifications ?? base.notifications,
    activity: partial.activity ?? base.activity,
  };

  merged.unreadCount = merged.notifications.filter((item) => !item.read).length;
  return merged;
}

function deserializeState(raw: string | null): InboxState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<InboxState>;
    return createStateSnapshot(parsed);
  } catch (error) {
    console.warn("[useInbox] Failed to parse stored state", error);
    return null;
  }
}

function serializeState(state: InboxState): string {
  return JSON.stringify({
    notifications: state.notifications,
    activity: state.activity,
    page: state.page,
  });
}

function generateMoreActivity(page: number): InboxActivity[] {
  const pageOffset = page * 4;
  return Array.from({ length: 3 }).map((_, index) => {
    const id = pageOffset + index + 1;
    return {
      id: `activity-more-${id}`,
      title: `زيارة جديدة للمتجر #${id}`,
      description: "تم تسجيل جلسة جديدة من خلال حملتك التسويقية.",
      icon: index % 2 === 0 ? "store" : "order",
      timestamp: `اليوم ${9 + index}:0${index} ص`,
    } satisfies InboxActivity;
  });
}

export function createInboxStore(
  namespace = "default",
  options?: UseInboxOptions
): InboxStore {
  if (stores.has(namespace)) {
    return stores.get(namespace)!;
  }

  const listeners = new Set<() => void>();
  const storage = getStorage(options?.disablePersistence);
  const storageKey = `${STORAGE_PREFIX}${namespace}`;
  let state: InboxState = createStateSnapshot();

  if (storage) {
    const stored = deserializeState(storage.getItem(storageKey));
    if (stored) {
      state = stored;
    }
  }

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const persist = () => {
    if (!storage) return;
    try {
      storage.setItem(storageKey, serializeState(state));
    } catch (error) {
      console.warn("[useInbox] Failed to persist state", error);
    }
  };

  const setState = (updater: (current: InboxState) => InboxState) => {
    state = updater(state);
    persist();
    notify();
  };

  const store: InboxStore = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    markAsRead: (id) => {
      setState((current) => {
        const nextNotifications = current.notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item
        );
        return {
          ...current,
          notifications: nextNotifications,
          unreadCount: nextNotifications.filter((item) => !item.read).length,
        };
      });
    },
    clear: () => {
      setState((current) => ({
        ...current,
        notifications: [],
        unreadCount: 0,
      }));
    },
    loadMore: () => {
      setState((current) => {
        const more = generateMoreActivity(current.page + 1);
        return {
          ...current,
          page: current.page + 1,
          activity: [...current.activity, ...more],
        };
      });
    },
    reset: () => {
      state = createStateSnapshot();
      persist();
      notify();
    },
  };

  stores.set(namespace, store);
  return store;
}

export function useInbox(options?: UseInboxOptions): InboxHookValue {
  const { namespace = "default" } = options ?? {};
  const storeRef = useRef<InboxStore>();

  if (!storeRef.current) {
    storeRef.current = createInboxStore(namespace, options);
  }

  const store = storeRef.current;

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  const actions = useMemo(
    () => ({
      markAsRead: store.markAsRead,
      clear: store.clear,
      loadMore: store.loadMore,
    }),
    [store]
  );

  return useMemo(
    () => ({
      ...snapshot,
      ...actions,
    }),
    [snapshot, actions]
  );
}

export default useInbox;
