import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserShop {
  shop_id: string;
  shop_name: string;
  shop_slug: string;
  total_products: number;
  total_orders: number;
  created_at: string;
}

export interface UserActivity {
  id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
  shop_id?: string;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [userShop, setUserShop] = useState<UserShop | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حفظ نشاط المستخدم
  const logActivity = async (
    activityType: string, 
    description?: string, 
    shopId?: string, 
    metadata?: any
  ) => {
    try {
      const { error } = await supabase.from('user_activities').insert({
        activity_type: activityType,
        description: description,
        shop_id: shopId,
        metadata: metadata || {},
        user_id: (await supabase.from('profiles').select('id').eq('auth_user_id', user?.id).single()).data?.id
      });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (err) {
      console.error('Error in logActivity:', err);
    }
  };

  // إنشاء متجر جديد
  const createShop = async (shopName: string, shopSlug?: string) => {
    try {
      setLoading(true);
      
      // الحصول على معرف المستخدم الحالي
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase.rpc('create_user_shop', {
        p_user_id: profile.id,
        p_shop_name: shopName,
        p_shop_slug: shopSlug
      });

      if (error) throw error;

      // تحديث بيانات المتجر
      await fetchUserShop();
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // الحصول على متجر المستخدم
  const fetchUserShop = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          id,
          display_name,
          slug,
          total_products,
          total_orders,
          created_at
        `)
        .eq('owner_id', (await supabase.from('profiles').select('id').eq('auth_user_id', user?.id).single()).data?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setUserShop({
          shop_id: data.id,
          shop_name: data.display_name,
          shop_slug: data.slug,
          total_products: data.total_products || 0,
          total_orders: data.total_orders || 0,
          created_at: data.created_at
        });
      } else {
        setUserShop(null);
      }
    } catch (err: any) {
      console.error('Error fetching user shop:', err);
      setError(err.message);
    }
  };

  // الحصول على أنشطة المستخدم
  const fetchUserActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setUserActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching user activities:', err);
      setError(err.message);
    }
  };

  // إضافة منتج جديد
  const addProduct = async (productData: any) => {
    try {
      if (!userShop) {
        throw new Error('No shop found. Please create a shop first.');
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          shop_id: userShop.shop_id
        })
        .select()
        .single();

      if (error) throw error;

      // تحديث بيانات المتجر لإظهار العدد الجديد للمنتجات
      await fetchUserShop();
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // الحصول على منتجات المتجر
  const getShopProducts = async () => {
    try {
      if (!userShop) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', userShop.shop_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (err: any) {
      console.error('Error fetching shop products:', err);
      return [];
    }
  };

  // حفظ إعدادات المتجر
  const saveShopSettings = async (settings: any) => {
    try {
      if (!userShop) {
        throw new Error('No shop found');
      }

      const { error } = await supabase
        .from('shop_settings_extended')
        .upsert({
          shop_id: userShop.shop_id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await logActivity('settings_updated', 'تم تحديث إعدادات المتجر', userShop.shop_id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // حفظ جلسة العمل
  const saveSession = async (sessionData: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: profile.id,
          session_data: sessionData,
          last_saved_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error saving session:', err);
    }
  };

  // استرجاع جلسة العمل
  const loadSession = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!profile) return null;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('session_data')
        .eq('user_id', profile.id)
        .order('last_saved_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      
      return data?.session_data || null;
    } catch (err: any) {
      console.error('Error loading session:', err);
      return null;
    }
  };

  // تحديث البيانات عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchUserShop(),
        fetchUserActivities()
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      setUserShop(null);
      setUserActivities([]);
      setLoading(false);
    }
  }, [user]);

  // الاستماع للتحديثات المباشرة
  useEffect(() => {
    if (!user) return;

    // الاستماع لتحديثات الأنشطة
    const activitiesChannel = supabase
      .channel('user_activities_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities'
        },
        (payload) => {
          setUserActivities(prev => [payload.new as UserActivity, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    // الاستماع لتحديثات المتجر
    const shopsChannel = supabase
      .channel('shops_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shops'
        },
        () => {
          fetchUserShop(); // إعادة تحميل بيانات المتجر عند التحديث
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(shopsChannel);
    };
  }, [user]);

  return {
    userShop,
    userActivities,
    loading,
    error,
    
    // وظائف إدارة المتجر
    createShop,
    addProduct,
    getShopProducts,
    saveShopSettings,
    
    // وظائف النشاط والجلسات
    logActivity,
    saveSession,
    loadSession,
    
    // وظائف التحديث
    refreshShop: fetchUserShop,
    refreshActivities: fetchUserActivities
  };
};