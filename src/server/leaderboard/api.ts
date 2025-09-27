import { createClient, type PostgrestError, type SupabaseClient } from '@supabase/supabase-js';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { Database } from '@/integrations/supabase/types';

const DEFAULT_SUPABASE_URL = 'https://uewuiiopkctdtaexmtxu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA';

let cachedClient: SupabaseClient<Database> | null = null;

const resolveEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return undefined;
};

const getSupabaseUrl = () =>
  resolveEnv('SUPABASE_URL') ??
  resolveEnv('VITE_SUPABASE_URL') ??
  DEFAULT_SUPABASE_URL;

const getSupabaseKey = () =>
  resolveEnv('SUPABASE_SERVICE_ROLE_KEY') ??
  resolveEnv('VITE_SUPABASE_SERVICE_ROLE_KEY') ??
  resolveEnv('SUPABASE_ANON_KEY') ??
  resolveEnv('VITE_SUPABASE_ANON_KEY') ??
  DEFAULT_SUPABASE_ANON_KEY;

const getSupabaseServerClient = (): SupabaseClient<Database> => {
  if (!cachedClient) {
    const url = getSupabaseUrl();
    const key = getSupabaseKey();

    cachedClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
};

export type AllianceMonthlyLeaderboardRow = {
  alliance_id: string;
  alliance_name: string;
  month_number: number;
  year_number: number;
  total_points: number;
  events_count: number;
  rank: number;
};

export type UserMonthlyLeaderboardRow = {
  user_id: string;
  profile_name: string | null;
  month_number: number;
  year_number: number;
  points: number;
  events_count: number;
  rank: number;
};

export interface MonthlyLeaderboardFilters {
  month?: number;
  year?: number;
}

export interface MonthlyLeaderboardPayload {
  alliances: AllianceMonthlyLeaderboardRow[];
  users: UserMonthlyLeaderboardRow[];
}

const formatPostgrestError = (error: PostgrestError | null, fallback: string) => {
  if (!error) return fallback;
  return `${fallback}: ${error.message}`;
};

const ensureAuthenticated = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(formatPostgrestError(error, 'تعذر التحقق من هوية المستخدم'));
  }

  if (!data?.user) {
    throw new Error('يجب تسجيل الدخول للاطلاع على لوحة الصدارة.');
  }

  return data.user;
};

const applyTemporalFilters = <Row extends { month_number: number; year_number: number }>(
  query: PostgrestFilterBuilder<Database['public'], Row, Row>,
  filters?: MonthlyLeaderboardFilters,
) => {
  let builder = query;

  if (filters?.month) {
    builder = builder.eq('month_number', filters.month);
  }

  if (filters?.year) {
    builder = builder.eq('year_number', filters.year);
  }

  return builder;
};

export const getMonthlyLeaderboard = async (
  filters?: MonthlyLeaderboardFilters,
): Promise<MonthlyLeaderboardPayload> => {
  const supabase = getSupabaseServerClient();
  await ensureAuthenticated(supabase);

  const alliancesQuery = applyTemporalFilters<AllianceMonthlyLeaderboardRow>(
    supabase
      .from('alliances_monthly_leaderboard')
      .select<'*', AllianceMonthlyLeaderboardRow>('*')
      .order('total_points', { ascending: false })
      .order('alliance_name', { ascending: true }),
    filters,
  );

  const usersQuery = applyTemporalFilters<UserMonthlyLeaderboardRow>(
    supabase
      .from('monthly_leaderboard')
      .select<'*', UserMonthlyLeaderboardRow>('*')
      .order('points', { ascending: false })
      .order('profile_name', { ascending: true, nullsFirst: false })
      .order('user_id', { ascending: true }),
    filters,
  );

  const [alliancesResponse, usersResponse] = await Promise.all([
    alliancesQuery,
    usersQuery,
  ]);

  if (alliancesResponse.error) {
    throw new Error(
      formatPostgrestError(alliancesResponse.error, 'تعذر جلب لوحة صدارة التحالفات لهذا الشهر'),
    );
  }

  if (usersResponse.error) {
    throw new Error(
      formatPostgrestError(usersResponse.error, 'تعذر جلب لوحة صدارة الأفراد لهذا الشهر'),
    );
  }

  return {
    alliances: alliancesResponse.data ?? [],
    users: usersResponse.data ?? [],
  };
};

export const getAllianceMonthlyLeaderboard = async (
  filters?: MonthlyLeaderboardFilters,
): Promise<AllianceMonthlyLeaderboardRow[]> => {
  const { alliances } = await getMonthlyLeaderboard(filters);
  return alliances;
};

export const getUserMonthlyLeaderboard = async (
  filters?: MonthlyLeaderboardFilters,
): Promise<UserMonthlyLeaderboardRow[]> => {
  const { users } = await getMonthlyLeaderboard(filters);
  return users;
};

