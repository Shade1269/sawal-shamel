import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { DollarSign, Clock, CheckCircle, Banknote, TrendingUp, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { SalesChart, AIRecommendations, DashboardHeader, EnhancedStatsCard } from '@/components/dashboard';

interface Commission {
  id: string;
  amount_sar: number;
  commission_rate: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID';
  confirmed_at: string | null;
  paid_at: string | null;
  created_at: string;
  order_id: string;
}

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PAID: Banknote,
};

const statusColors = {
  PENDING: "default",
  CONFIRMED: "secondary",
  PAID: "default",
} as const;

const statusLabels = {
  PENDING: "في الانتظار",
  CONFIRMED: "مؤكدة",
  PAID: "مدفوعة",
};

export default function AffiliateCommissionsPage() {
  const { user } = useSupabaseAuth();

  // Get profile ID first
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Get affiliate store ID
  const { data: affiliateStore } = useQuery({
    queryKey: ['affiliate-store-for-chart', profile?.id],
    queryFn: async () => {
      if (!profile) return null;

      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profile
  });

  const { data: commissions, isLoading } = useQuery({
    queryKey: ['affiliate-commissions', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Commission[];
    },
    enabled: !!profile
  });

  // Calculate totals
  const totalCommissions = commissions?.reduce((sum, commission) => sum + Number(commission.amount_sar), 0) || 0;
  const pendingCommissions = commissions?.filter(c => c.status === 'PENDING').reduce((sum, commission) => sum + Number(commission.amount_sar), 0) || 0;
  const confirmedCommissions = commissions?.filter(c => c.status === 'CONFIRMED').reduce((sum, commission) => sum + Number(commission.amount_sar), 0) || 0;
  const paidCommissions = commissions?.filter(c => c.status === 'PAID').reduce((sum, commission) => sum + Number(commission.amount_sar), 0) || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 md:py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10"></div>
          </div>
          <p className="text-muted-foreground mt-4 animate-pulse">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 space-y-6">
      {/* Enhanced Header */}
      <DashboardHeader
        title="التحليلات والعمولات"
        subtitle="متابعة أداء مبيعاتك وأرباحك من العمولات"
        icon={<BarChart3 className="h-6 w-6" />}
      />

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <EnhancedStatsCard
          title="إجمالي العمولات"
          value={`${totalCommissions.toFixed(2)} ر.س`}
          subtitle={`${commissions?.length || 0} عمولة`}
          icon={<DollarSign className="h-5 w-5" />}
          variant="primary"
        />

        <EnhancedStatsCard
          title="في الانتظار"
          value={`${pendingCommissions.toFixed(2)} ر.س`}
          subtitle={`${commissions?.filter(c => c.status === 'PENDING').length || 0} عمولة`}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
        />

        <EnhancedStatsCard
          title="مؤكدة"
          value={`${confirmedCommissions.toFixed(2)} ر.س`}
          subtitle={`${commissions?.filter(c => c.status === 'CONFIRMED').length || 0} عمولة`}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />

        <EnhancedStatsCard
          title="مدفوعة"
          value={`${paidCommissions.toFixed(2)} ر.س`}
          subtitle={`${commissions?.filter(c => c.status === 'PAID').length || 0} عمولة`}
          icon={<Banknote className="h-5 w-5" />}
          variant="info"
        />
      </div>

      {/* Sales Chart - Enhanced Card */}
      <UnifiedCard variant="glass" className="overflow-hidden">
        <SalesChart affiliateStoreId={affiliateStore?.id} />
      </UnifiedCard>

      {/* AI Recommendations */}
      <AIRecommendations affiliateStoreId={affiliateStore?.id} />

      {/* Commissions List - Enhanced */}
      {!commissions || commissions.length === 0 ? (
        <UnifiedCard variant="glass" className="overflow-hidden">
          <UnifiedCardContent className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">لا توجد عمولات بعد</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              ابدأ بمشاركة منتجاتك لتحصل على عمولات من كل عملية بيع
            </p>
          </UnifiedCardContent>
        </UnifiedCard>
      ) : (
        <UnifiedCard variant="glass" className="overflow-hidden">
          <UnifiedCardHeader className="border-b border-border/50 bg-muted/20">
            <UnifiedCardTitle className="flex items-center gap-3 text-foreground">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              تفاصيل العمولات
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent className="p-0">
            <div className="divide-y divide-border/50">
              {commissions.map((commission, index) => {
                const StatusIcon = statusIcons[commission.status];

                return (
                  <div 
                    key={commission.id} 
                    className="flex items-center justify-between p-4 md:p-5 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${
                        commission.status === 'PAID' ? 'bg-info/10 text-info' :
                        commission.status === 'CONFIRMED' ? 'bg-success/10 text-success' :
                        'bg-warning/10 text-warning'
                      }`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          طلب #{commission.order_id.slice(-8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(commission.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          نسبة العمولة: <span className="text-accent font-medium">{commission.commission_rate}%</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <p className="text-xl font-bold text-foreground">
                        {commission.amount_sar.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">ر.س</span>
                      </p>
                      <UnifiedBadge 
                        variant={statusColors[commission.status]}
                        className="mt-1"
                      >
                        {statusLabels[commission.status]}
                      </UnifiedBadge>
                      {commission.confirmed_at && (
                        <p className="text-xs mt-2 text-muted-foreground">
                          تأكدت: {format(new Date(commission.confirmed_at), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                      )}
                      {commission.paid_at && (
                        <p className="text-xs mt-1 text-success">
                          دُفعت: {format(new Date(commission.paid_at), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      )}
    </div>
  );
}
