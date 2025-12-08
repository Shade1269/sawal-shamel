import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAffiliateOrders } from '@/hooks/useAffiliateOrders';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Store, Package, ShoppingBag, DollarSign, TrendingUp, ExternalLink, Palette, FileText, Megaphone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createStoreUrl } from '@/utils/domains';

export default function AffiliateDashboardOverview() {
  const { user } = useSupabaseAuth();
  const [_creating, _setCreating] = useState(false);

  const handleCreateStore = () => {
    // توجيه المستخدم لصفحة إنشاء المتجر
    window.location.href = '/affiliate/store/setup';
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
  const { stats: orderStats } = useAffiliateOrders(affiliateStore?.id);

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
          <UnifiedButton onClick={handleCreateStore} variant="persian">
            إنشاء متجر جديد
          </UnifiedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-persian bg-clip-text text-transparent">نظرة عامة</h1>
            <p className="text-muted-foreground">
              مرحباً بك في لوحة تحكم متجر {affiliateStore.store_name}
            </p>
          </div>
          <a 
            href={createStoreUrl(affiliateStore.store_slug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <UnifiedButton variant="outline">
              <ExternalLink className="h-4 w-4 ml-2" />
              عرض المتجر
            </UnifiedButton>
          </a>
        </div>
      </div>

      {/* Store Info Card */}
      <UnifiedCard variant="persian" className="mb-8" hover="glow">
        <UnifiedCardHeader>
          <UnifiedCardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            معلومات المتجر
          </UnifiedCardTitle>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm opacity-70">اسم المتجر</h4>
              <p className="text-lg font-semibold">{affiliateStore.store_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm opacity-70">رابط المتجر</h4>
              <p className="text-lg font-semibold">{createStoreUrl(affiliateStore.store_slug)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm opacity-70">الحالة</h4>
              <UnifiedBadge variant={affiliateStore.is_active ? "default" : "secondary"}>
                {affiliateStore.is_active ? "نشط" : "غير نشط"}
              </UnifiedBadge>
            </div>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{productsCount || 0}</span>
            </div>
            <h3 className="font-semibold">المنتجات النشطة</h3>
            <p className="text-sm text-muted-foreground">منتج متاح للعملاء</p>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="luxury" hover="lift">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="h-8 w-8" />
              <span className="text-3xl font-bold">{orderStats.totalOrders}</span>
            </div>
            <h3 className="font-semibold">إجمالي الطلبات</h3>
            <p className="text-sm opacity-70">متوسط: {orderStats.averageOrderValue.toFixed(2)} ر.س</p>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-success" />
              <span className="text-3xl font-bold">{orderStats.totalRevenue.toFixed(0)}</span>
            </div>
            <h3 className="font-semibold">إجمالي المبيعات</h3>
            <p className="text-sm text-muted-foreground">ر.س</p>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-warning" />
              <span className="text-3xl font-bold">{orderStats.totalCommissions.toFixed(0)}</span>
            </div>
            <h3 className="font-semibold">العمولات</h3>
            <p className="text-sm text-muted-foreground">
              مؤكدة: {orderStats.confirmedCommissions.toFixed(2)} ر.س
            </p>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader>
            <UnifiedCardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              إدارة المنتجات
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <p className="text-muted-foreground mb-4">
              إدارة منتجات متجرك وإعدادات العمولة
            </p>
            <Link to="/affiliate/storefront">
              <UnifiedButton fullWidth variant="primary">
                عرض المنتجات
              </UnifiedButton>
            </Link>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader>
            <UnifiedCardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              متابعة الطلبات
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <p className="text-muted-foreground mb-4">
              متابعة وإدارة طلبات العملاء
            </p>
            <Link to="/affiliate/orders">
              <UnifiedButton fullWidth variant="luxury">
                عرض الطلبات
              </UnifiedButton>
            </Link>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader>
            <UnifiedCardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              إدارة المحتوى
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <p className="text-muted-foreground mb-4">
              إنشاء وإدارة صفحات المتجر
            </p>
            <Link to="/cms-management">
              <UnifiedButton fullWidth variant="secondary">
                نظام CMS
              </UnifiedButton>
            </Link>
          </UnifiedCardContent>
        </UnifiedCard>

        <UnifiedCard variant="glass" hover="lift">
          <UnifiedCardHeader>
            <UnifiedCardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              البانرات الترويجية
            </UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <p className="text-muted-foreground mb-4">
              إنشاء وإدارة الإعلانات الترويجية
            </p>
            <Link to={`/banner-management/${affiliateStore?.id || ''}`}>
              <UnifiedButton fullWidth variant="premium">
                إدارة البانرات
              </UnifiedButton>
            </Link>
          </UnifiedCardContent>
        </UnifiedCard>

         <UnifiedCard variant="glass" hover="lift">
           <UnifiedCardHeader>
             <UnifiedCardTitle className="flex items-center gap-2">
               <Sparkles className="h-5 w-5" />
               الاستوديو المتقدم
             </UnifiedCardTitle>
           </UnifiedCardHeader>
           <UnifiedCardContent>
             <p className="text-muted-foreground mb-4">
               تصميم ثيمات متقدمة بالذكاء الاصطناعي
             </p>
             <Link to={`/theme-studio?storeId=${affiliateStore?.id || ''}`}>
               <UnifiedButton fullWidth variant="persian">
                 الاستوديو المتقدم
               </UnifiedButton>
             </Link>
           </UnifiedCardContent>
         </UnifiedCard>

         <UnifiedCard variant="glass" hover="lift">
           <UnifiedCardHeader>
             <UnifiedCardTitle className="flex items-center gap-2">
               <DollarSign className="h-5 w-5" />
               تتبع العمولات
             </UnifiedCardTitle>
           </UnifiedCardHeader>
           <UnifiedCardContent>
             <p className="text-muted-foreground mb-4">
               متابعة عمولاتك وأرباحك
             </p>
             <Link to="/affiliate/analytics">
               <UnifiedButton fullWidth variant="outline">
                 عرض العمولات
               </UnifiedButton>
             </Link>
           </UnifiedCardContent>
          </UnifiedCard>

         <UnifiedCard variant="glass" hover="lift">
           <UnifiedCardHeader>
             <UnifiedCardTitle className="flex items-center gap-2">
               <Palette className="h-5 w-5" />
               ثيمات المتجر
             </UnifiedCardTitle>
           </UnifiedCardHeader>
           <UnifiedCardContent>
             <p className="text-muted-foreground mb-4">
               اختر الثيم المناسب لطبيعة منتجاتك
             </p>
             <Link to={`/store-themes/${affiliateStore.id}`}>
               <UnifiedButton fullWidth variant="persian">
                 إدارة الثيمات
               </UnifiedButton>
             </Link>
           </UnifiedCardContent>
         </UnifiedCard>
      </div>
    </div>
  );
}