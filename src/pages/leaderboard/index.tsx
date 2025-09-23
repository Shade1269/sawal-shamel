import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Users as UsersIcon, Target, Crown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useFastAuth } from '@/hooks/useFastAuth';
import {
  getMonthlyLeaderboard,
  getMyMonthlyPoints,
  LeaderboardScope,
  AllianceLeaderboardRow,
  UserLeaderboardRow,
  LeaderboardResponse,
  MonthlyPointsSummary,
} from '@/server/leaderboard/api';

const formatPoints = (points: number) => new Intl.NumberFormat('ar-SA').format(points ?? 0);

const scopeLabel: Record<LeaderboardScope, string> = {
  alliances: 'تحالفات',
  users: 'أفراد',
};

const monthLabel = new Intl.DateTimeFormat('ar-SA', {
  month: 'long',
  year: 'numeric',
}).format(new Date());

const renderSkeletonRows = (rows = 5) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} className="h-14 w-full rounded-xl" />
    ))}
  </div>
);

const LeaderboardPage = () => {
  const { profile } = useFastAuth();
  const [alliancesSupported, setAlliancesSupported] = useState(true);
  const [requestedScope, setRequestedScope] = useState<LeaderboardScope>('alliances');

  const scope: LeaderboardScope = alliancesSupported ? requestedScope : 'users';

  const leaderboardQuery = useQuery<LeaderboardResponse<any>>({
    queryKey: ['monthly-leaderboard', scope],
    queryFn: () => getMonthlyLeaderboard({ scope, limit: 20, offset: 0 }),
    enabled: Boolean(profile),
    retry: 0,
  });

  const summaryQuery = useQuery<MonthlyPointsSummary>({
    queryKey: ['my-monthly-points', scope],
    queryFn: () => getMyMonthlyPoints(scope),
    enabled: Boolean(profile),
    retry: 0,
  });

  useEffect(() => {
    if (scope === 'alliances' && alliancesSupported && (leaderboardQuery.error || summaryQuery.error)) {
      setAlliancesSupported(false);
      setRequestedScope('users');
    }
  }, [alliancesSupported, scope, leaderboardQuery.error, summaryQuery.error]);

  const leaderboardEntries = useMemo(() => {
    if (!leaderboardQuery.data) return [];
    return leaderboardQuery.data.entries as Array<AllianceLeaderboardRow | UserLeaderboardRow>;
  }, [leaderboardQuery.data]);

  const mySummary = summaryQuery.data ?? null;

  const selectedScope = scope;
  const isAllianceView = selectedScope === 'alliances';

  return (
    <div className="container mx-auto max-w-5xl py-10">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">لوحة الترتيب الشهرية</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            تابع أداء {scopeLabel[selectedScope]} هذا الشهر واحصل على نظرة فورية لنقاطك وترتيبك داخل المنصة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            {monthLabel}
          </div>
          <div className="flex rounded-lg border bg-muted/30 p-1 text-xs font-medium">
            <Button
              type="button"
              variant={selectedScope === 'alliances' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-md"
              onClick={() => alliancesSupported && setRequestedScope('alliances')}
              disabled={!alliancesSupported}
            >
              <UsersIcon className="mr-2 h-4 w-4" /> تحالفات
            </Button>
            <Button
              type="button"
              variant={selectedScope === 'users' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-md"
              onClick={() => setRequestedScope('users')}
            >
              <Target className="mr-2 h-4 w-4" /> أفراد
            </Button>
          </div>
        </div>
      </div>

      {!alliancesSupported && requestedScope === 'alliances' && (
        <div className="mb-6 rounded-xl border border-dashed border-yellow-400 bg-yellow-50/80 p-4 text-sm text-yellow-800">
          لم يتم تفعيل تحالفات المسوّقين بعد، لذلك يتم عرض ترتيب الأفراد تلقائيًا.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-muted-foreground">نقاطي هذا الشهر</CardTitle>
            <Crown className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <Skeleton className="h-10 w-24 rounded-lg" />
            ) : (
              <div>
                <div className="text-4xl font-bold text-foreground">{formatPoints(mySummary?.totalPoints ?? 0)}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isAllianceView && mySummary?.allianceName
                    ? `ضمن تحالف ${mySummary.allianceName}`
                    : 'الإجمالي المحتسب من طلبات هذا الشهر'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-muted-foreground">ترتيبي الحالي</CardTitle>
            <Trophy className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <Skeleton className="h-10 w-24 rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {mySummary?.rank ? `#${mySummary.rank}` : '—'}
                </span>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  {scopeLabel[selectedScope]}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              أفضل {scopeLabel[selectedScope]} هذا الشهر
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              الترتيب يعتمد على مجموع النقاط المسجلة في events التابعة للطلبات المدفوعة خلال الشهر الحالي.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboardQuery.isLoading ? (
            renderSkeletonRows()
          ) : leaderboardEntries.length === 0 ? (
            <div className="rounded-xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              لم يتم تسجيل نقاط بعد خلال هذا الشهر.
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardEntries.map((entry, index) => {
                const rank = (entry as any).rank ?? index + 1;
                const displayName = isAllianceView
                  ? (entry as AllianceLeaderboardRow).alliance_name
                  : (entry as UserLeaderboardRow).profile_name ?? (entry as UserLeaderboardRow).user_id;
                const pointsValue = isAllianceView
                  ? (entry as AllianceLeaderboardRow).total_points
                  : (entry as UserLeaderboardRow).points;
                const eventsCount = entry.events_count ?? 0;

                return (
                  <div
                    key={`${scope}-${index}-${displayName}`}
                    className={cn(
                      'flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3 shadow-sm transition hover:shadow-md',
                      rank === 1 ? 'border-primary/40 bg-primary/5' : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold',
                        rank === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      )}>
                        #{rank}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{displayName}</div>
                        <div className="text-xs text-muted-foreground">{eventsCount} حدث نقاط خلال الشهر</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div className="text-sm font-semibold text-foreground">{formatPoints(pointsValue)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
