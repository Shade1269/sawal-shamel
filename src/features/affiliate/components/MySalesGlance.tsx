import { RefreshCcw, ShoppingBag, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AffiliateMetricsSnapshot, SalesSnapshot } from '../hooks/useAffiliateMetrics';

interface MySalesGlanceProps {
  metrics: AffiliateMetricsSnapshot | null;
  loading?: boolean;
  onRefresh?: () => void;
}

const formatter = new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MetricCard = ({ title, snapshot }: { title: string; snapshot: SalesSnapshot }) => (
  <div className="rounded-2xl border border-[color:var(--anaqti-border,rgba(209,168,142,0.35))] bg-white/70 p-4 shadow-sm">
    <p className="text-sm font-semibold text-[color:var(--anaqti-muted,rgba(61,43,43,0.45))]">{title}</p>
    <div className="mt-3 flex flex-wrap items-center gap-6">
      <div className="flex items-baseline gap-1">
        <ShoppingBag className="h-4 w-4 text-[color:var(--anaqti-primary,#c64262)]" />
        <span className="text-lg font-bold text-[color:var(--anaqti-text,#3d2b2b)]">{formatter.format(snapshot.orders)}</span>
        <span className="text-xs text-[color:var(--anaqti-muted,rgba(61,43,43,0.45))]">طلب</span>
      </div>
      <div className="flex items-baseline gap-1">
        <ShoppingCart className="h-4 w-4 text-[color:var(--anaqti-accent,#1f7a8c)]" />
        <span className="text-lg font-bold text-[color:var(--anaqti-text,#3d2b2b)]">{formatter.format(snapshot.items)}</span>
        <span className="text-xs text-[color:var(--anaqti-muted,rgba(61,43,43,0.45))]">منتج</span>
      </div>
      <div className="flex items-baseline gap-1">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        <span className="text-lg font-bold text-[color:var(--anaqti-text,#3d2b2b)]">{currencyFormatter.format(snapshot.revenue)}</span>
        <span className="text-xs text-[color:var(--anaqti-muted,rgba(61,43,43,0.45))]">ر.س</span>
      </div>
    </div>
  </div>
);

export const MySalesGlance = ({ metrics, loading, onRefresh }: MySalesGlanceProps) => {
  return (
    <Card className="anaqti-card" dir="rtl">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="anaqti-section-title text-lg">مبيعاتي المختصرة</CardTitle>
            <p className="text-sm anaqti-muted">تحديث فوري كل ٦٠ ثانية لأداء اليوم، الأسبوع، والشهر.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[color:var(--anaqti-border,rgba(209,168,142,0.35))] text-[color:var(--anaqti-primary,#c64262)]"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCcw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : metrics ? (
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="اليوم" snapshot={metrics.today} />
            <MetricCard title="هذا الأسبوع" snapshot={metrics.week} />
            <MetricCard title="هذا الشهر" snapshot={metrics.month} />
          </div>
        ) : (
          <div className="rounded-xl bg-white/70 p-6 text-sm text-[color:var(--anaqti-muted,rgba(61,43,43,0.45))]">
            لم يتم تسجيل أي مبيعات بعد هذا الشهر. ابدأ بمشاركة متجرك لتحفيز أول عملية بيع!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MySalesGlance;
