import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// TypeScript interfaces for removed server API
type LeaderboardScope = 'users' | 'alliances';
interface MonthlyPointsSummary {
  totalPoints: number;
  rank?: number;
}

const getMyMonthlyPoints = async (scope: LeaderboardScope): Promise<MonthlyPointsSummary> => {
  // Mock data since server API is removed
  return { totalPoints: 0, rank: undefined };
};

interface MyScoreCardProps {
  scope?: LeaderboardScope;
  summary?: MonthlyPointsSummary | null;
  loading?: boolean;
  storeName?: string;
}

const formatPoints = (value: number) => new Intl.NumberFormat('ar-SA').format(value);

export const MyScoreCard = ({ scope = 'users', summary, loading, storeName }: MyScoreCardProps) => {
  const queryEnabled = !summary;

  const { data, isLoading, error } = useQuery({
    queryKey: ['affiliate-monthly-points', scope],
    queryFn: () => getMyMonthlyPoints(scope),
    enabled: queryEnabled,
    staleTime: 60 * 1000,
  });

  const resolved = useMemo(() => summary ?? data ?? null, [summary, data]);
  const isBusy = loading ?? (queryEnabled ? isLoading : false);

  return (
    <Card className="anaqti-card h-full overflow-hidden" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="anaqti-section-title text-lg">
            <span className="anaqti-gradient-title">نقاطي هذا الشهر</span>
          </CardTitle>
          <Badge className="anaqti-soft-badge bg-transparent text-[color:var(--anaqti-primary-dark,#8f1e3a)] border border-transparent">
            <Sparkles className="h-4 w-4" />
            {storeName ? `متجر ${storeName}` : 'برنامج النقاط'}
          </Badge>
        </div>
        <p className="text-sm anaqti-muted">
          إجمالي النقاط المعتمدة لهذا الشهر مع ترتيبك الحالي على لوحة المسوّقات.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {isBusy ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : resolved ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[color:var(--anaqti-primary,#c64262)]">
                {formatPoints(resolved.totalPoints)}
              </span>
              <span className="text-sm anaqti-muted">نقطة</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--anaqti-primary,#c64262)]/10">
                <Trophy className="h-5 w-5 text-[color:var(--anaqti-primary-dark,#8f1e3a)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[color:var(--anaqti-text,#3d2b2b)]">
                  الترتيب الحالي
                </p>
                <p className="text-xs anaqti-muted">
                  {resolved.rank != null ? `المركز ${formatPoints(resolved.rank)}` : 'لم يتم الترتيب بعد'}
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            حدث خطأ أثناء تحميل النقاط. حاول مرة أخرى لاحقًا.
          </div>
        ) : (
          <div className="text-sm anaqti-muted">لا توجد نقاط مسجلة لهذا الشهر حتى الآن.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyScoreCard;
