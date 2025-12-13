import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Sparkles, TrendingUp, Target, AlertTriangle, Lightbulb, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIRecommendation {
  id: string;
  type: 'growth' | 'warning' | 'opportunity' | 'tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIRecommendationsProps {
  affiliateStoreId?: string;
}

const typeIcons = {
  growth: TrendingUp,
  warning: AlertTriangle,
  opportunity: Target,
  tip: Lightbulb,
};

const typeColors = {
  growth: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  opportunity: 'text-primary bg-primary/10',
  tip: 'text-info bg-info/10',
};

const priorityColors = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-muted-foreground',
};

export function AIRecommendations({ affiliateStoreId }: AIRecommendationsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch store performance data
  const { data: performanceData } = useQuery({
    queryKey: ['store-performance', affiliateStoreId],
    queryFn: async () => {
      if (!affiliateStoreId) return null;

      // Get orders stats
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_sar, created_at, status')
        .eq('affiliate_store_id', affiliateStoreId);

      if (ordersError) throw ordersError;

      // Get products count
      const { count: productsCount } = await supabase
        .from('affiliate_products')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_store_id', affiliateStoreId)
        .eq('is_visible', true);

      // Get commissions
      const { data: commissions } = await supabase
        .from('commissions')
        .select('amount_sar, status')
        .eq('affiliate_id', affiliateStoreId);

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_sar || 0), 0) || 0;
      const pendingCommissions = commissions?.filter(c => c.status === 'PENDING')?.reduce((sum, c) => sum + Number(c.amount_sar || 0), 0) || 0;
      const confirmedCommissions = commissions?.filter(c => c.status === 'CONFIRMED')?.reduce((sum, c) => sum + Number(c.amount_sar || 0), 0) || 0;

      return {
        totalOrders,
        totalRevenue,
        productsCount: productsCount || 0,
        pendingCommissions,
        confirmedCommissions,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };
    },
    enabled: !!affiliateStoreId,
  });

  // Generate AI recommendations based on performance data
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['ai-recommendations', affiliateStoreId, performanceData],
    queryFn: async (): Promise<AIRecommendation[]> => {
      if (!performanceData) return [];

      // Generate recommendations based on performance metrics
      const recs: AIRecommendation[] = [];

      // Low products recommendation
      if (performanceData.productsCount < 10) {
        recs.push({
          id: 'low-products',
          type: 'opportunity',
          title: 'أضف المزيد من المنتجات',
          description: `لديك ${performanceData.productsCount} منتج فقط. أضف المزيد من المنتجات لزيادة فرص المبيعات. المتاجر الناجحة تحتوي على 20+ منتج.`,
          priority: 'high',
        });
      }

      // Low orders recommendation
      if (performanceData.totalOrders === 0) {
        recs.push({
          id: 'no-orders',
          type: 'warning',
          title: 'لا توجد طلبات بعد',
          description: 'لم تحصل على أي طلبات. جرب مشاركة رابط متجرك على وسائل التواصل الاجتماعي أو استخدم كوبونات خصم لجذب العملاء.',
          priority: 'high',
        });
      } else if (performanceData.totalOrders < 5) {
        recs.push({
          id: 'low-orders',
          type: 'tip',
          title: 'زيادة الطلبات',
          description: 'لديك عدد قليل من الطلبات. حاول التسويق عبر قصص انستغرام أو سناب شات لزيادة الوعي بمتجرك.',
          priority: 'medium',
        });
      }

      // Average order value optimization
      if (performanceData.averageOrderValue > 0 && performanceData.averageOrderValue < 100) {
        recs.push({
          id: 'low-aov',
          type: 'growth',
          title: 'زيادة متوسط قيمة الطلب',
          description: `متوسط قيمة الطلب ${performanceData.averageOrderValue.toFixed(0)} ر.س. جرب تقديم عروض "اشتري 2 واحصل على خصم" لزيادة قيمة السلة.`,
          priority: 'medium',
        });
      }

      // High pending commissions
      if (performanceData.pendingCommissions > performanceData.confirmedCommissions && performanceData.pendingCommissions > 100) {
        recs.push({
          id: 'pending-commissions',
          type: 'tip',
          title: 'عمولات في الانتظار',
          description: `لديك ${performanceData.pendingCommissions.toFixed(0)} ر.س عمولات في الانتظار. تأكد من متابعة حالة الطلبات مع التجار لتأكيد العمولات.`,
          priority: 'low',
        });
      }

      // Success celebration
      if (performanceData.totalRevenue > 1000) {
        recs.push({
          id: 'success',
          type: 'growth',
          title: 'أداء ممتاز! 🎉',
          description: `حققت مبيعات بقيمة ${performanceData.totalRevenue.toFixed(0)} ر.س. استمر في هذا الأداء الرائع واستفد من الزخم لزيادة المبيعات.`,
          priority: 'low',
        });
      }

      // Default recommendations if no specific ones
      if (recs.length === 0) {
        recs.push({
          id: 'general-tip',
          type: 'tip',
          title: 'نصيحة اليوم',
          description: 'شارك منتجاتك المفضلة مع متابعيك واكتب مراجعات شخصية لكل منتج لزيادة الثقة والمبيعات.',
          priority: 'low',
        });
      }

      return recs;
    },
    enabled: !!performanceData,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRefresh = async () => {
    setIsGenerating(true);
    await refetch();
    setTimeout(() => setIsGenerating(false), 1000);
  };

  if (!affiliateStoreId) {
    return null;
  }

  return (
    <UnifiedCard variant="glass" className="overflow-hidden">
      <UnifiedCardHeader>
        <div className="flex items-center justify-between">
          <UnifiedCardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            توصيات الذكاء الاصطناعي
          </UnifiedCardTitle>
          <UnifiedButton
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isGenerating}
          >
            {isLoading || isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </UnifiedButton>
        </div>
      </UnifiedCardHeader>
      <UnifiedCardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const Icon = typeIcons[rec.type];
              return (
                <div
                  key={rec.id}
                  className={cn(
                    "p-4 rounded-lg border-l-4 bg-card/50 transition-all hover:bg-card",
                    priorityColors[rec.priority]
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", typeColors[rec.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>لا توجد توصيات حالياً</p>
          </div>
        )}
      </UnifiedCardContent>
    </UnifiedCard>
  );
}
