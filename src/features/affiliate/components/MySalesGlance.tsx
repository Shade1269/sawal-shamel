import { RefreshCcw, ShoppingBag, ShoppingCart, TrendingUp } from 'lucide-react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
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
  <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm">
    <p className="text-sm font-semibold text-muted-foreground">{title}</p>
    <div className="mt-3 flex flex-wrap items-center gap-6">
      <div className="flex items-baseline gap-1">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <span className="text-lg font-bold text-foreground">{formatter.format(snapshot.orders)}</span>
        <span className="text-xs text-muted-foreground">طلب</span>
      </div>
      <div className="flex items-baseline gap-1">
        <ShoppingCart className="h-4 w-4 text-accent" />
        <span className="text-lg font-bold text-foreground">{formatter.format(snapshot.items)}</span>
        <span className="text-xs text-muted-foreground">منتج</span>
      </div>
      <div className="flex items-baseline gap-1">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        <span className="text-lg font-bold text-foreground">{currencyFormatter.format(snapshot.revenue)}</span>
        <span className="text-xs text-muted-foreground">ر.س</span>
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
            className="rounded-full border-border text-primary"
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
          <div className="rounded-xl bg-card/70 p-6 text-sm text-muted-foreground">
            لم يتم تسجيل أي مبيعات بعد هذا الشهر. ابدأ بمشاركة متجرك لتحفيز أول عملية بيع!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MySalesGlance;
