import { supabase } from '@/integrations/supabase/client';

export type LeaderboardScope = 'alliances' | 'users';

interface BaseLeaderboardRow {
  month_number: number;
  year_number: number;
  rank: number | null;
  events_count: number;
}

export interface AllianceLeaderboardRow extends BaseLeaderboardRow {
  alliance_id: string;
  alliance_name: string;
  total_points: number;
}

export interface UserLeaderboardRow extends BaseLeaderboardRow {
  user_id: string;
  profile_name: string | null;
  points: number;
}

export interface LeaderboardResponse<T> {
  scope: LeaderboardScope;
  entries: T[];
  total: number;
}

export interface MonthlyPointsSummary {
  scope: LeaderboardScope;
  totalPoints: number;
  rank: number | null;
  userId?: string;
  allianceId?: string;
  allianceName?: string | null;
}

interface GetMonthlyLeaderboardParams {
  scope?: LeaderboardScope;
  limit?: number;
  offset?: number;
}

const ensureAuthenticated = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error('Not authenticated');
  }
  return data.user;
};

const resolveProfileId = async (authUserId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error('Profile not found for authenticated user');
  }

  return data.id;
};

export const getMonthlyLeaderboard = async <T extends LeaderboardScope = 'alliances'>(params: GetMonthlyLeaderboardParams = {}): Promise<
  LeaderboardResponse<T extends 'alliances' ? AllianceLeaderboardRow : UserLeaderboardRow>
> => {
  const scope = params.scope ?? 'alliances';
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;

  await ensureAuthenticated();

  const view = scope === 'alliances' ? 'alliances_monthly_leaderboard' : 'monthly_leaderboard';
  const orderColumn = scope === 'alliances' ? 'total_points' : 'points';
  const { data, error, count } = await supabase
    .from(view)
    .select('*', { count: 'exact' })
    .order(orderColumn, { ascending: false })
    .range(offset, Math.max(offset, offset + limit - 1));

  if (error) {
    throw new Error(`Failed to load ${scope} leaderboard: ${error.message}`);
  }

  const entries = (data ?? []).map((row: any) => {
    if (scope === 'alliances') {
      const allianceRow: AllianceLeaderboardRow = {
        alliance_id: row.alliance_id,
        alliance_name: row.alliance_name,
        total_points: Number(row.total_points ?? 0),
        month_number: Number(row.month_number ?? 0),
        year_number: Number(row.year_number ?? 0),
        rank: row.rank ?? null,
        events_count: Number(row.events_count ?? 0),
      };
      return allianceRow;
    }

    const userRow: UserLeaderboardRow = {
      user_id: row.user_id,
      profile_name: row.profile_name ?? null,
      points: Number(row.points ?? 0),
      month_number: Number(row.month_number ?? 0),
      year_number: Number(row.year_number ?? 0),
      rank: row.rank ?? null,
      events_count: Number(row.events_count ?? 0),
    };
    return userRow;
  });

  return {
    scope: scope as T,
    entries: entries as any,
    total: count ?? entries.length,
  };
};

export const getMyMonthlyPoints = async (scope: LeaderboardScope = 'alliances'): Promise<MonthlyPointsSummary> => {
  const user = await ensureAuthenticated();
  const profileId = await resolveProfileId(user.id);

  if (scope === 'alliances') {
    const { data: membership, error: membershipError } = await supabase
      .from('alliance_members')
      .select('alliance_id')
      .eq('user_id', profileId)
      .eq('is_active', true)
      .maybeSingle();

    if (membershipError) {
      throw new Error(`Failed to load alliance membership: ${membershipError.message}`);
    }

    if (!membership?.alliance_id) {
      return {
        scope: 'alliances',
        totalPoints: 0,
        rank: null,
        allianceId: undefined,
        allianceName: null,
      };
    }

    const { data, error } = await supabase
      .from('alliances_monthly_leaderboard')
      .select('*')
      .eq('alliance_id', membership.alliance_id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load alliance leaderboard entry: ${error.message}`);
    }

    return {
      scope: 'alliances',
      totalPoints: Number(data?.total_points ?? 0),
      rank: data?.rank ?? null,
      allianceId: membership.alliance_id,
      allianceName: data?.alliance_name ?? null,
    };
  }

  const { data, error } = await supabase
    .from('monthly_leaderboard')
    .select('*')
    .eq('user_id', profileId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load monthly leaderboard entry: ${error.message}`);
  }

  return {
    scope: 'users',
    totalPoints: Number(data?.points ?? 0),
    rank: data?.rank ?? null,
    userId: profileId,
  };
};
