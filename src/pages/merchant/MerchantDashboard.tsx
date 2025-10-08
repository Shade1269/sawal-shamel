import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      let { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (merchantError && merchantError.code !== 'PGRST116') {
        throw merchantError;
      }

      // Create merchant if doesn't exist
      if (!merchantData) {
        const { data: newMerchant, error: createError } = await supabase
          .from('merchants')
          .insert({
            profile_id: profile.id,
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

      const { data: products } = await supabase
        .from('products')
        .select('id, approval_status')
        .eq('merchant_id', merchantData.id);

      const totalProducts = products?.length || 0;
      const pendingProducts = products?.filter((p: any) => p.approval_status === 'pending').length || 0;
      const approvedProducts = products?.filter((p: any) => p.approval_status === 'approved').length || 0;

      const { data: orders } = await supabase
        .from('ecommerce_orders')
        .select('total_sar, order_items!inner(product_id)')
        .eq('order_items.product_id', merchantData.id);

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_sar), 0) || 0;

      setStats({
        totalProducts,
        pendingProducts,
        approvedProducts,
        totalOrders,
        totalRevenue,
      });
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
        <Card>
          <CardHeader>
            <CardTitle>لم يتم العثور على حساب تاجر</CardTitle>
            <CardDescription>يبدو أنك لست مسجلاً كتاجر في النظام</CardDescription>
          </CardHeader>
        </Card>
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
        <Button onClick={() => navigate('/merchant/products')}>
          <Plus className="h-4 w-4 ml-2" />
          إدارة المنتجات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">موافق عليها</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalRevenue.toLocaleString('ar-SA')} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>نظرة عامة</CardTitle>
          <CardDescription>ملخص نشاطك التجاري</CardDescription>
        </CardHeader>
        <CardContent>
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
                <Button onClick={() => navigate('/merchant/products')}>
                  عرض جميع المنتجات
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">إدارة طلباتك من هنا</p>
                <Button onClick={() => navigate('/admin/orders')}>
                  عرض جميع الطلبات
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">تحليلات المبيعات قريباً</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantDashboard;
