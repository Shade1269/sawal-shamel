import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAffiliateOrders } from '@/hooks/useAffiliateOrders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Package, ShoppingBag, DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AffiliateDashboardOverview() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const handleCreateStore = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const storeName = 'متجر ' + (user.user_metadata?.full_name || user.email || 'المسوّق');
      const { data: newStoreId, error } = await supabase.rpc('create_affiliate_store', {
        p_store_name: storeName,
        p_bio: null,
        p_store_slug: null
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['affiliate-store', user.id] });
    } catch (e) {
      console.error('Error creating affiliate store:', e);
    } finally {
      setCreating(false);
    }
  };

  // Get affiliate store
  const { data: affiliateStore } = useQuery({
    queryKey: ['affiliate-store', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Use affiliate orders hook
  const { stats: orderStats, loading: ordersLoading } = useAffiliateOrders(affiliateStore?.id);

  // Get products count
  const { data: productsCount } = useQuery({
    queryKey: ['affiliate-products-count', affiliateStore?.id],
    queryFn: async () => {
      if (!affiliateStore) return 0;
      
      const { count, error } = await supabase
        .from('affiliate_products')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_store_id', affiliateStore.id)
        .eq('is_visible', true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!affiliateStore
  });

  if (!affiliateStore) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">لم يتم إنشاء متجر بعد</h2>
          <p className="text-muted-foreground mb-4">
            قم بإنشاء متجرك الأول لبدء التسويق بالعمولة
          </p>
          <Button onClick={handleCreateStore} disabled={creating}>{creating ? 'جاري الإنشاء...' : 'إنشاء متجر جديد'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">نظرة عامة</h1>
            <p className="text-muted-foreground">
              مرحباً بك في لوحة تحكم متجر {affiliateStore.store_name}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link 
              to={`/store/${affiliateStore.store_slug}`}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              عرض المتجر
            </Link>
          </Button>
        </div>
      </div>

      {/* Store Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            معلومات المتجر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">اسم المتجر</h4>
              <p className="text-lg font-semibold">{affiliateStore.store_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">رابط المتجر</h4>
              <p className="text-lg font-semibold">/store/{affiliateStore.store_slug}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">الحالة</h4>
              <Badge variant={affiliateStore.is_active ? "default" : "secondary"}>
                {affiliateStore.is_active ? "نشط" : "غير نشط"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات النشطة</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              منتج متاح للعملاء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {orderStats.averageOrderValue.toFixed(2)} ر.س متوسط قيمة الطلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.totalRevenue.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {affiliateStore.total_sales?.toFixed(2) || '0.00'} ر.س إجمالي المبيعات المسجلة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العمولات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.totalCommissions.toFixed(2)} ر.س</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>معلقة: {orderStats.pendingCommissions.toFixed(2)} ر.س</span>
              <span>مؤكدة: {orderStats.confirmedCommissions.toFixed(2)} ر.س</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              إدارة المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              إدارة منتجات متجرك وإعدادات العمولة
            </p>
            <Button asChild className="w-full">
              <Link to="/dashboard/products">
                عرض المنتجات
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              متابعة الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              متابعة وإدارة طلبات العملاء
            </p>
            <Button asChild className="w-full">
              <Link to="/dashboard/orders">
                عرض الطلبات
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              تتبع العمولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              متابعة عمولاتك وأرباحك
            </p>
            <Button asChild className="w-full">
              <Link to="/dashboard/commissions">
                عرض العمولات
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}