import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { DollarSign, Clock, CheckCircle, Banknote, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useDarkMode } from '@/shared/components/DarkModeProvider';

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
  const { isDarkMode } = useDarkMode();

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
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={`transition-colors duration-500 ${
            isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
          }`}>جاري تحميل العمولات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>إدارة العمولات</h1>
        <p className={`transition-colors duration-500 ${
          isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
        }`}>
          متابعة عمولاتك وأرباحك من المبيعات
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <UnifiedCardTitle className={`text-sm font-medium transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>إجمالي العمولات</UnifiedCardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{totalCommissions.toFixed(2)} ر.س</div>
            <p className={`text-xs transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
            }`}>
              {commissions?.length || 0} عمولة
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>في الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCommissions.toFixed(2)} ر.س</div>
            <p className={`text-xs transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
            }`}>
              {commissions?.filter(c => c.status === 'PENDING').length || 0} عمولة
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>مؤكدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedCommissions.toFixed(2)} ر.س</div>
            <p className={`text-xs transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
            }`}>
              {commissions?.filter(c => c.status === 'CONFIRMED').length || 0} عمولة
            </p>
          </CardContent>
        </Card>

        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>مدفوعة</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paidCommissions.toFixed(2)} ر.س</div>
            <p className={`text-xs transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
            }`}>
              {commissions?.filter(c => c.status === 'PAID').length || 0} عمولة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      {!commissions || commissions.length === 0 ? (
        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardContent className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className={`text-lg font-semibold mb-2 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>لا توجد عمولات</h3>
            <p className={`transition-colors duration-500 ${
              isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
            }`}>
              لم تحصل على أي عمولات بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className={`transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              <TrendingUp className="h-5 w-5" />
              تفاصيل العمولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.map((commission) => {
                const StatusIcon = statusIcons[commission.status];
                
                return (
                  <div key={commission.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors duration-500 ${
                    isDarkMode 
                      ? 'border-slate-700/50 bg-slate-800/30' 
                      : 'border-slate-200 bg-slate-50/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className={`font-medium transition-colors duration-500 ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                          طلب #{commission.order_id.slice(-8)}
                        </p>
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
                        }`}>
                          {format(new Date(commission.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                        </p>
                        <p className={`text-sm transition-colors duration-500 ${
                          isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
                        }`}>
                          نسبة العمولة: {commission.commission_rate}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {commission.amount_sar.toFixed(2)} ر.س
                      </p>
                      <Badge variant={statusColors[commission.status]}>
                        {statusLabels[commission.status]}
                      </Badge>
                      {commission.confirmed_at && (
                        <p className={`text-xs mt-1 transition-colors duration-500 ${
                          isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
                        }`}>
                          تأكدت: {format(new Date(commission.confirmed_at), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                      )}
                      {commission.paid_at && (
                        <p className={`text-xs mt-1 transition-colors duration-500 ${
                          isDarkMode ? 'text-muted-foreground' : 'text-slate-500'
                        }`}>
                          دُفعت: {format(new Date(commission.paid_at), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}