import { useMemo, useRef, useSyncExternalStore } from "react";

type LeaderboardSeed = {
  id: string;
  name: string;
  points: number;
  commission: number;
  orders: number;
  pointsChange: number;
  commissionChange: number;
};

export type LeaderboardEntry = LeaderboardSeed & {
  rank: number;
};

export type LeaderboardTrendPoint = {
  date: string;
  points: number;
  commissions: number;
};

export type LeaderboardSummary = {
  totalPoints: number;
  totalCommission: number;
  averageCommission: number;
  activeAffiliates: number;
  topPerformer: LeaderboardEntry;
  pointsChange7d: number;
  commissionChange7d: number;
};

export type AdminLeaderboardSnapshot = {
  isLoading: boolean;
  generatedAt: string;
  summary: LeaderboardSummary;
  topByPoints: LeaderboardEntry[];
  topByCommission: LeaderboardEntry[];
  trend: LeaderboardTrendPoint[];
};

export type AdminLeaderboardStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => AdminLeaderboardSnapshot;
  refresh: () => void;
  reset: () => void;
};

const DEFAULT_NAMESPACE = "default";
const stores = new Map<string, AdminLeaderboardStore>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const BASE_SEED: LeaderboardSeed[] = [
  { id: "aff-leen", name: "لين العلي", points: 1240, commission: 24850, orders: 58, pointsChange: 18, commissionChange: 22 },
  { id: "aff-noura", name: "نورة الشهري", points: 1175, commission: 23120, orders: 54, pointsChange: 15, commissionChange: 19 },
  { id: "aff-farah", name: "فرح الزهراني", points: 990, commission: 19840, orders: 49, pointsChange: 11, commissionChange: 14 },
  { id: "aff-lama", name: "لمى المطيري", points: 905, commission: 18460, orders: 46, pointsChange: 9, commissionChange: 12 },
  { id: "aff-hessa", name: "حصة الحربي", points: 860, commission: 16920, orders: 42, pointsChange: 8, commissionChange: 10 },
  { id: "aff-yara", name: "يّارا القحطاني", points: 790, commission: 15280, orders: 39, pointsChange: 6, commissionChange: 9 },
  { id: "aff-reem", name: "ريم العبدالله", points: 720, commission: 13840, orders: 34, pointsChange: 5, commissionChange: 7 },
  { id: "aff-dana", name: "دانا العجلان", points: 655, commission: 12680, orders: 31, pointsChange: 4, commissionChange: 6 },
];

const POINTS_TREND = [
  580, 620, 605, 640, 655, 670, 690, 705, 720, 740, 760, 780, 795, 810,
];

const COMMISSIONS_TREND = [
  9400, 9800, 9720, 10040, 10160, 10320, 10680, 10820, 11040, 11200, 11460, 11820, 11980, 12140,
];

const formatISODate = (input: Date) => input.toISOString();

export const applyVariation = (value: number, index: number, step: number) => {
  const direction = index % 2 === 0 ? 1 : -1;
  return Math.round(value * (1 + direction * step));
};

const buildEntries = (seed: LeaderboardSeed[], step: number) => {
  return seed
    .map((entry, index) => ({
      ...entry,
      points: applyVariation(entry.points, index, step / 2),
      commission: applyVariation(entry.commission, index, step / 2),
      pointsChange: applyVariation(entry.pointsChange, index, step / 4),
      commissionChange: applyVariation(entry.commissionChange, index, step / 4),
    }))
    .sort((a, b) => b.points - a.points)
    .map((entry, rank) => ({ ...entry, rank: rank + 1 } satisfies LeaderboardEntry));
};

export const buildSummary = (entries: LeaderboardEntry[]): LeaderboardSummary => {
  const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0);
  const totalCommission = entries.reduce((sum, entry) => sum + entry.commission, 0);
  const activeAffiliates = entries.length;
  const averageCommission = Math.round(totalCommission / Math.max(activeAffiliates, 1));
  const topPerformer = entries[0];
  const pointsChange7d = Math.round(
    entries.reduce((sum, entry) => sum + entry.pointsChange, 0) / Math.max(activeAffiliates, 1)
  );
  const commissionChange7d = Math.round(
    entries.reduce((sum, entry) => sum + entry.commissionChange, 0) / Math.max(activeAffiliates, 1)
  );

  return {
    totalPoints,
    totalCommission,
    averageCommission,
    activeAffiliates,
    topPerformer,
    pointsChange7d,
    commissionChange7d,
  } satisfies LeaderboardSummary;
};

const buildTrend = (step: number): LeaderboardTrendPoint[] => {
  const today = new Date();
  return POINTS_TREND.map((points, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (POINTS_TREND.length - 1 - index));
    const commissions = applyVariation(COMMISSIONS_TREND[index], index, step / 3);
    return {
      date: date.toISOString().split("T")[0],
      points: applyVariation(points, index, step / 3),
      commissions,
    } satisfies LeaderboardTrendPoint;
  });
};

const createSnapshot = (seedStep = 0): AdminLeaderboardSnapshot => {
  const step = 0.015 * seedStep;
  const entries = buildEntries(BASE_SEED, step);
  const summary = buildSummary(entries);
  const byCommission = [...entries].sort((a, b) => b.commission - a.commission);

  return {
    isLoading: false,
    generatedAt: formatISODate(new Date()),
    summary,
    topByPoints: entries,
    topByCommission: byCommission,
    trend: buildTrend(step),
  } satisfies AdminLeaderboardSnapshot;
};

export const createAdminLeaderboardStore = (namespace = DEFAULT_NAMESPACE): AdminLeaderboardStore => {
  if (stores.has(namespace)) {
    return stores.get(namespace)!;
  }

  let state = createSnapshot(0);
  let version = 1;
  let lastGenerated = Date.now();
  const listeners = new Set<() => void>();
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const ensureFresh = () => {
    if (Date.now() - lastGenerated < CACHE_TTL) {
      return;
    }
    state = { ...createSnapshot(version), isLoading: false };
    lastGenerated = Date.now();
    version += 1;
  };

  const setState = (updater: (current: AdminLeaderboardSnapshot) => AdminLeaderboardSnapshot) => {
    state = updater(state);
    lastGenerated = Date.now();
    notify();
  };

  const refresh = () => {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
    }

    setState((current) => ({ ...current, isLoading: true }));

    pendingTimer = setTimeout(() => {
      state = { ...createSnapshot(version), isLoading: false };
      version += 1;
      lastGenerated = Date.now();
      pendingTimer = null;
      notify();
    }, 360);
  };

  const store: AdminLeaderboardStore = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => {
      ensureFresh();
      return state;
    },
    refresh,
    reset: () => {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      version = 1;
      state = createSnapshot(0);
      lastGenerated = Date.now();
      notify();
    },
  };

  stores.set(namespace, store);
  return store;
};

export type UseAdminLeaderboardOptions = {
  namespace?: string;
};

export const useAdminLeaderboard = (options?: UseAdminLeaderboardOptions) => {
  const namespace = options?.namespace ?? DEFAULT_NAMESPACE;
  const storeRef = useRef<AdminLeaderboardStore>();

  if (!storeRef.current) {
    storeRef.current = createAdminLeaderboardStore(namespace);
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
};

