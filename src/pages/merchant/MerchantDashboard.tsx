import { useState, useEffect } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Package, DollarSign, ShoppingCart, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useNavigate } from 'react-router-dom';
import { useMerchantDashboardData } from '@/hooks/useMerchantDashboardData';
import { MerchantSalesChart } from '@/components/merchant/MerchantSalesChart';
import { MerchantQuickActions } from '@/components/merchant/MerchantQuickActions';
import { MerchantRecentProducts, MerchantRecentOrders } from '@/components/merchant/MerchantRecentItems';
import { MerchantWalletSummary } from '@/components/merchant/MerchantWalletSummary';

const MerchantDashboard = () => {
  const { profile } = useFastAuth();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const { data: dashboardData } = useMerchantDashboardData(merchant?.id);

  useEffect(() => {
    fetchMerchantData();
  }, [profile]);

  const fetchMerchantData = async () => {
    if (!profile) return;

    try {
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('auth_user_id', profile.auth_user_id ?? '')
        .maybeSingle();

      if (profileErr && profileErr.code !== 'PGRST116') throw profileErr;

      const profileId = profileRow?.id;
      if (!profileId) throw new Error('لا يوجد ملف شخصي');

      let { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (merchantError && merchantError.code !== 'PGRST116') throw merchantError;

      if (!merchantData) {
        const { data: newMerchant, error: createError } = await supabase
          .from('merchants')
          .insert({
            profile_id: profileId,
            business_name: profile.full_name || profile.email || 'تاجر',
            default_commission_rate: 10.00,
            vat_enabled: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        merchantData = newMerchant;
      }

      setMerchant(merchantData);

      // إحصائيات المنتجات
      const { data: products } = await supabase
        .from('products')
        .select('id, approval_status')
        .eq('merchant_id', merchantData.id);

      const totalProducts = products?.length || 0;
      const pendingProducts = products?.filter((p: any) => p.approval_status === 'pending').length || 0;
      const approvedProducts = products?.filter((p: any) => p.approval_status === 'approved').length || 0;

      // إحصائيات الطلبات
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, line_total_sar')
        .eq('merchant_id', merchantData.id);

      const uniqueOrderIds = new Set((orderItems || []).map((oi: any) => oi.order_id));
      const totalOrders = uniqueOrderIds.size;
      const totalRevenue = (orderItems || []).reduce((sum: number, oi: any) => sum + (Number(oi.line_total_sar) || 0), 0);

      setStats({ totalProducts, pendingProducts, approvedProducts, totalOrders, totalRevenue });
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="container mx-auto p-6">
        <UnifiedCard variant="glass">
          <UnifiedCardHeader>
            <UnifiedCardTitle>لم يتم العثور على حساب تاجر</UnifiedCardTitle>
            <UnifiedCardDescription>يبدو أنك لست مسجلاً كتاجر في النظام</UnifiedCardDescription>
          </UnifiedCardHeader>
        </UnifiedCard>
      </div>
    );
  }

  const percentChange = dashboardData?.comparison.percentChange || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مرحباً، {merchant.business_name}</h1>
          <p className="text-muted-foreground">إليك ملخص نشاطك التجاري</p>
        </div>
        <UnifiedButton variant="primary" onClick={() => navigate('/merchant/products')}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج
        </UnifiedButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">المنتجات</UnifiedCardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.approvedProducts} موافق عليها</p>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">قيد المراجعة</UnifiedCardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingProducts}</div>
            <p className="text-xs text-muted-foreground">بانتظار الموافقة</p>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">الطلبات</UnifiedCardTitle>
              <ShoppingCart className="h-4 w-4 text-info" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">طلب مكتمل</p>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">الإيرادات</UnifiedCardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-success">
              {stats.totalRevenue.toLocaleString('ar-SA')} ر.س
            </div>
            <div className="flex items-center gap-1 text-xs">
              {percentChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={percentChange >= 0 ? 'text-success' : 'text-destructive'}>
                {Math.abs(percentChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">عن الشهر السابق</span>
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      {/* Quick Actions */}
      <MerchantQuickActions />

      {/* Wallet Summary */}
      {dashboardData && (
        <MerchantWalletSummary balance={dashboardData.walletBalance} />
      )}

      {/* Sales Chart */}
      {dashboardData && dashboardData.salesChart.length > 0 && (
        <MerchantSalesChart data={dashboardData.salesChart} />
      )}

      {/* Recent Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MerchantRecentProducts products={dashboardData?.recentProducts || []} />
        <MerchantRecentOrders orders={dashboardData?.recentOrders || []} />
      </div>
    </div>
  );
};

export default MerchantDashboard;
