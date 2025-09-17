import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardTitle, 
  EnhancedCardContent,
  ResponsiveLayout,
  ResponsiveGrid,
  InteractiveWidget,
  AnimatedCounter,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, Banknote, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
          <p className="text-muted-foreground">جاري تحميل العمولات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة العمولات</h1>
        <p className="text-muted-foreground">
          متابعة عمولاتك وأرباحك من المبيعات
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العمولات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommissions.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {commissions?.length || 0} عمولة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCommissions.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {commissions?.filter(c => c.status === 'PENDING').length || 0} عمولة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مؤكدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedCommissions.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {commissions?.filter(c => c.status === 'CONFIRMED').length || 0} عمولة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدفوعة</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paidCommissions.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {commissions?.filter(c => c.status === 'PAID').length || 0} عمولة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      {!commissions || commissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد عمولات</h3>
            <p className="text-muted-foreground">
              لم تحصل على أي عمولات بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              تفاصيل العمولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.map((commission) => {
                const StatusIcon = statusIcons[commission.status];
                
                return (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          طلب #{commission.order_id.slice(-8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(commission.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          نسبة العمولة: {commission.commission_rate}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {commission.amount_sar.toFixed(2)} ر.س
                      </p>
                      <Badge variant={statusColors[commission.status]}>
                        {statusLabels[commission.status]}
                      </Badge>
                      {commission.confirmed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          تأكدت: {format(new Date(commission.confirmed_at), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                      )}
                      {commission.paid_at && (
                        <p className="text-xs text-muted-foreground mt-1">
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