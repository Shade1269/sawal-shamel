import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAffiliateOrders } from '@/hooks/useAffiliateOrders';
import { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardTitle, 
  EnhancedCardContent,
  InteractiveWidget,
  AnimatedCounter,
  ResponsiveLayout,
  ResponsiveGrid,
  EnhancedButton
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Store, Package, ShoppingBag, DollarSign, Users, TrendingUp, ExternalLink, Palette, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createStoreUrl } from '@/utils/domains';

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
          <EnhancedButton onClick={handleCreateStore} disabled={creating} variant="persian" animation="glow">
            {creating ? 'جاري الإنشاء...' : 'إنشاء متجر جديد'}
          </EnhancedButton>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout variant="glass" maxWidth="2xl" centerContent>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-persian bg-clip-text text-transparent">نظرة عامة</h1>
            <p className="text-muted-foreground">
              مرحباً بك في لوحة تحكم متجر {affiliateStore.store_name}
            </p>
          </div>
          <EnhancedButton asChild variant="outline">
            <a 
              href={createStoreUrl(affiliateStore.store_slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              عرض المتجر
            </a>
          </EnhancedButton>
        </div>
      </div>

      {/* Store Info Card */}
      <EnhancedCard variant="persian" className="mb-8" hover="glow">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2 text-white">
            <Store className="h-5 w-5" />
            معلومات المتجر
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-white/70">اسم المتجر</h4>
              <p className="text-lg font-semibold text-white">{affiliateStore.store_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-white/70">رابط المتجر</h4>
              <p className="text-lg font-semibold text-white">{createStoreUrl(affiliateStore.store_slug)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-white/70">الحالة</h4>
              <Badge variant={affiliateStore.is_active ? "default" : "secondary"} className="bg-white/20 text-white">
                {affiliateStore.is_active ? "نشط" : "غير نشط"}
              </Badge>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Stats Cards */}
      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap={{ mobile: 4, tablet: 6 }} className="mb-8">
        <InteractiveWidget
          title="المنتجات النشطة"
          description="منتج متاح للعملاء"
          variant="glass"
          metric={{
            value: productsCount || 0,
            label: "منتج",
            icon: Package
          }}
        />

        <InteractiveWidget
          title="إجمالي الطلبات"
          description="متوسط قيمة الطلب"
          variant="luxury"
          metric={{
            value: orderStats.totalOrders,
            label: "طلب",
            change: orderStats.averageOrderValue,
            icon: ShoppingBag
          }}
        />

        <InteractiveWidget
          title="إجمالي المبيعات"
          description="إجمالي المبيعات المسجلة"
          variant="glass"
          metric={{
            value: `${orderStats.totalRevenue.toFixed(2)} ر.س`,
            label: "مبيعات",
            icon: TrendingUp
          }}
        />

        <InteractiveWidget
          title="العمولات"
          description="معلقة ومؤكدة"
          variant="glass"
          metric={{
            value: `${orderStats.totalCommissions.toFixed(2)} ر.س`,
            label: "عمولة",
            icon: DollarSign
          }}
          progress={{
            value: orderStats.confirmedCommissions,
            max: orderStats.totalCommissions,
            label: "مؤكدة"
          }}
        />
      </ResponsiveGrid>

      {/* Quick Actions */}
      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 5 }} gap={{ mobile: 4, tablet: 6 }}>
        <EnhancedCard variant="glass" hover="lift">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              إدارة المنتجات
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <p className="text-muted-foreground mb-4">
              إدارة منتجات متجرك وإعدادات العمولة
            </p>
            <EnhancedButton asChild className="w-full" variant="default" animation="glow">
              <Link to="/dashboard/products">
                عرض المنتجات
              </Link>
            </EnhancedButton>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="glass" hover="lift">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              متابعة الطلبات
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <p className="text-muted-foreground mb-4">
              متابعة وإدارة طلبات العملاء
            </p>
            <EnhancedButton asChild className="w-full" variant="luxury" animation="glow">
              <Link to="/dashboard/orders">
                عرض الطلبات
              </Link>
            </EnhancedButton>
          </EnhancedCardContent>
        </EnhancedCard>

        <EnhancedCard variant="glass" hover="lift">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              إدارة المحتوى
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <p className="text-muted-foreground mb-4">
              إنشاء وإدارة صفحات وموديا المتجر
            </p>
            <EnhancedButton asChild className="w-full" variant="secondary" animation="glow">
              <Link to="/cms-management">
                نظام CMS
              </Link>
            </EnhancedButton>
          </EnhancedCardContent>
        </EnhancedCard>

         <EnhancedCard variant="glass" hover="lift">
           <EnhancedCardHeader>
             <EnhancedCardTitle className="flex items-center gap-2">
               <Palette className="h-5 w-5" />
               ثيمات المتجر
             </EnhancedCardTitle>
           </EnhancedCardHeader>
           <EnhancedCardContent>
             <p className="text-muted-foreground mb-4">
               اختر الثيم المناسب لطبيعة منتجاتك
             </p>
             <EnhancedButton asChild className="w-full" variant="persian" animation="glow">
               <Link to={`/store-themes/${affiliateStore.id}`}>
                 إدارة الثيمات
               </Link>
             </EnhancedButton>
           </EnhancedCardContent>
         </EnhancedCard>

         <EnhancedCard variant="glass" hover="lift">
           <EnhancedCardHeader>
             <EnhancedCardTitle className="flex items-center gap-2">
               <DollarSign className="h-5 w-5" />
               تتبع العمولات
             </EnhancedCardTitle>
           </EnhancedCardHeader>
           <EnhancedCardContent>
             <p className="text-muted-foreground mb-4">
               متابعة عمولاتك وأرباحك
             </p>
             <EnhancedButton asChild className="w-full" variant="outline" animation="glow">
               <Link to="/dashboard/commissions">
                 عرض العمولات
               </Link>
             </EnhancedButton>
           </EnhancedCardContent>
         </EnhancedCard>
      </ResponsiveGrid>
    </ResponsiveLayout>
  );
}