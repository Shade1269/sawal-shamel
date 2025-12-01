import { useState, useEffect } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    fetchMerchantData();
  }, [profile]);

  const fetchMerchantData = async () => {
    if (!profile) return;

    try {
      // Resolve real profile_id from public.profiles using auth_user_id
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('auth_user_id', profile.auth_user_id)
        .maybeSingle();

      if (profileErr && profileErr.code !== 'PGRST116') {
        throw profileErr;
      }

      const profileId = profileRow?.id;
      if (!profileId) {
        throw new Error('لا يوجد ملف شخصي مرتبط في جدول profiles');
      }

      let { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (merchantError && merchantError.code !== 'PGRST116') {
        throw merchantError;
      }

      // Create merchant if doesn't exist
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

      // Safely compute stats without blocking dashboard
      try {
        const { data: products } = await supabase
          .from('products')
          .select('id, approval_status')
          .eq('merchant_id', merchantData.id);

        const totalProducts = products?.length || 0;
        const pendingProducts = products?.filter((p: any) => p.approval_status === 'pending').length || 0;
        const approvedProducts = products?.filter((p: any) => p.approval_status === 'approved').length || 0;

        setStats((prev) => ({
          ...prev,
          totalProducts,
          pendingProducts,
          approvedProducts,
        }));
      } catch (e) {
        console.warn('Products stats error:', e);
      }

      // TODO: Add orders/revenue stats with correct relations later
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم التاجر</h1>
          <p className="text-muted-foreground">{merchant.business_name}</p>
        </div>
        <UnifiedButton variant="primary" onClick={() => navigate('/merchant/products')}>
          <Plus className="h-4 w-4 ml-2" />
          إدارة المنتجات
        </UnifiedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">إجمالي المنتجات</UnifiedCardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">قيد المراجعة</UnifiedCardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingProducts}</div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">موافق عليها</UnifiedCardTitle>
              <Package className="h-4 w-4 text-success" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-success">{stats.approvedProducts}</div>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <UnifiedCardTitle className="text-sm font-medium">إجمالي المبيعات</UnifiedCardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalRevenue.toLocaleString('ar-SA')} ر.س
            </div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      <UnifiedCard variant="glass" hover="none">
        <UnifiedCardHeader>
          <UnifiedCardTitle>نظرة عامة</UnifiedCardTitle>
          <UnifiedCardDescription>ملخص نشاطك التجاري</UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">المنتجات</TabsTrigger>
              <TabsTrigger value="orders">الطلبات</TabsTrigger>
              <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">إدارة منتجاتك من هنا</p>
                <UnifiedButton variant="primary" onClick={() => navigate('/merchant/products')}>
                  عرض جميع المنتجات
                </UnifiedButton>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">إدارة طلباتك من هنا</p>
                <UnifiedButton variant="primary" onClick={() => navigate('/merchant/orders')}>
                  عرض جميع الطلبات
                </UnifiedButton>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">تحليلات المبيعات قريباً</p>
              </div>
            </TabsContent>
          </Tabs>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default MerchantDashboard;
