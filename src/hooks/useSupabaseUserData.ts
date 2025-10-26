import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserShop {
  id: string;
  shop_id: string;
  display_name: string;
  slug: string;
  created_at: string;
  total_products: number;
  total_orders: number;
  settings?: any;
}

export interface UserActivity {
  id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
  shop_id?: string;
}

export const useSupabaseUserData = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [userShop, setUserShop] = useState<UserShop | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حفظ نشاط المستخدم
  const logActivity = async (activityType: string, description?: string, shopId?: string, metadata?: any): Promise<void> => {
    if (!user) return;

    try {
      const profile = await getUserProfile();
      if (!profile) return;

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: profile.id,
          shop_id: shopId || userShop?.id,
          activity_type: activityType,
          description: description || '',
          metadata: metadata || {}
        });

      if (error) {
        console.error('Error logging activity:', error);
      } else {
        fetchUserActivities();
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const getUserProfile = async () => {
    if (!user) return null;

    // البحث بـ auth_user_id أولاً
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (data) return data;

    // Return null if no profile found
    return null;
  };

  // إنشاء متجر جديد
  const createShop = async (shopName: string, shopSlug?: string): Promise<any> => {
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }

    try {
      const profile = await getUserProfile();
      if (!profile) {
        throw new Error('لم يتم العثور على ملف المستخدم');
      }

      const { data, error } = await supabase.rpc('create_user_shop', {
        p_user_id: profile.id,
        p_shop_name: shopName,
        p_shop_slug: shopSlug
      });

      if (error) {
        console.error('Error creating shop:', error);
        throw error;
      }

      toast({
        title: "تم إنشاء المتجر بنجاح",
        description: `متجر "${shopName}" تم إنشاؤه بنجاح`,
      });

      fetchUserShop();
      fetchUserStatistics();
      logActivity('shop_created', `تم إنشاء متجر: ${shopName}`);

      return { success: true, shopId: data };
    } catch (error: any) {
      console.error('Error creating shop:', error);
      throw error;
    }
  };

  // جلب بيانات المتجر
  const fetchUserShop = async (): Promise<void> => {
    if (!user) return;

    try {
      const profile = await getUserProfile();
      if (!profile) return;

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user shop:', error);
        setError('فشل في جلب بيانات المتجر');
        return;
      }

      if (data) {
        setUserShop({
          id: data.id,
          shop_id: data.id,
          display_name: data.display_name,
          slug: data.slug,
          created_at: data.created_at,
          total_products: data.total_products || 0,
          total_orders: data.total_orders || 0,
          settings: data.settings
        });
      } else {
        setUserShop(null);
      }
    } catch (error) {
      console.error('Error fetching user shop:', error);
      setError('فشل في جلب بيانات المتجر');
    }
  };

  // جلب أنشطة المستخدم
  const fetchUserActivities = async (): Promise<void> => {
    if (!user) return;

    try {
      const profile = await getUserProfile();
      if (!profile) return;

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching user activities:', error);
        return;
      }

      setUserActivities(data || []);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  // جلب إحصائيات المستخدم
  const fetchUserStatistics = async (): Promise<void> => {
    if (!user) return;

    try {
      const profile = await getUserProfile();
      if (!profile) return;

      // جلب عدد المنتجات والطلبات
      const { data: shopData } = await supabase
        .from('shops')
        .select('total_products, total_orders')
        .eq('owner_id', profile.id)
        .maybeSingle();

      setUserStatistics({
        totalProducts: shopData?.total_products || 0,
        totalOrders: shopData?.total_orders || 0,
        totalRevenue: 0 // يمكن حسابها لاحقاً
      });
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  // إضافة منتج
  const addProduct = async (productData: any): Promise<string | undefined> => {
    if (!user || !userShop) {
      throw new Error('المستخدم أو المتجر غير متوفر');
    }

    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error('لم يتم العثور على ملف المستخدم');

      // إنشاء merchant إذا لم يكن موجوداً
      let { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!merchant) {
        const { data: newMerchant, error: merchantError } = await supabase
          .from('merchants')
          .insert({
            profile_id: profile.id,
            business_name: userShop.display_name
          })
          .select('id')
        .maybeSingle();

        if (merchantError) throw merchantError;
        merchant = newMerchant;
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          merchant_id: merchant.id,
          shop_id: userShop.id
        })
        .select('id')
        .maybeSingle();

      if (error) throw error;

      // تحديث عدد المنتجات في المتجر
      await supabase
        .from('shops')
        .update({ 
          total_products: (userShop.total_products || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userShop.id);

      fetchUserShop();
      fetchUserStatistics();
      logActivity('product_added', `تم إضافة منتج: ${productData.title}`);

      return data.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  // جلب منتجات المتجر
  const getShopProducts = async (): Promise<any[]> => {
    try {
      // جلب جميع المنتجات المتاحة (للمخزون العام)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching shop products:', error);
      return [];
    }
  };

  // حفظ إعدادات المتجر
  const saveShopSettings = async (settings: any): Promise<void> => {
    if (!user || !userShop) {
      throw new Error('المستخدم أو المتجر غير متوفر');
    }

    try {
      const { error } = await supabase
        .from('shops')
        .update({ 
          settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', userShop.id);

      if (error) throw error;

      fetchUserShop();
      logActivity('settings_updated', 'تم تحديث إعدادات المتجر');
    } catch (error) {
      console.error('Error saving shop settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (user) {
      setLoading(true);
      Promise.all([
        fetchUserShop(),
        fetchUserActivities(),
        fetchUserStatistics()
      ]).finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    } else {
      setUserShop(null);
      setUserActivities([]);
      setUserStatistics(null);
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // حفظ المنتج داخل مكتبة المتجر لظهوره في قسم المنتجات
  const addProductToLibrary = async (productId: string): Promise<string | undefined> => {
    if (!user || !userShop) {
      throw new Error('المستخدم أو المتجر غير متوفر');
    }

    try {
      const { data, error } = await supabase
        .from('product_library')
        .insert({
          shop_id: userShop.id,
          product_id: productId,
          is_visible: true,
          is_featured: false,
          sort_index: 0,
          commission_amount: 0
        })
        .select('id')
        .maybeSingle();

      if (error) throw error;

      // سجل نشاط الحفظ
      await logActivity('product_saved_to_library', 'تم حفظ المنتج في قسم المنتجات', userShop.id, { productId });

      return data?.id;
    } catch (error) {
      console.error('Error adding product to library:', error);
      throw error;
    }
  };

  // جلب عناصر مكتبة المتجر مع تفاصيل المنتجات
  const getProductLibraryItems = async (): Promise<any[]> => {
    if (!user || !userShop) return [];

    try {
      const { data: libraryRows, error: libError } = await supabase
        .from('product_library')
        .select('*')
        .eq('shop_id', userShop.id);

      if (libError) throw libError;
      if (!libraryRows || libraryRows.length === 0) return [];

      const productIds = libraryRows.map((r: any) => r.product_id).filter(Boolean);
      if (productIds.length === 0) return [];

      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (prodError) throw prodError;

      const productMap = new Map((products || []).map((p: any) => [p.id, p]));

      return libraryRows.map((row: any) => ({
        id: row.id,
        is_featured: row.is_featured,
        is_visible: row.is_visible,
        sort_index: row.sort_index,
        commission_amount: row.commission_amount,
        products: productMap.get(row.product_id) || null,
      }));
    } catch (error) {
      console.error('Error fetching product library items:', error);
      return [];
    }
  };

  // جلب منتجات متجري المحددة (المضافة لمكتبة المتجر)
  const getMyStoreProducts = async (): Promise<any[]> => {
    if (!user || !userShop) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', userShop.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching my store products:', error);
      return [];
    }
  };

  return {
    userShop,
    userActivities,
    userStatistics,
    loading,
    error,
    logActivity,
    createShop,
    fetchUserShop,
    fetchUserActivities,
    fetchUserStatistics,
    addProduct,
    getShopProducts, // جميع المنتجات المتاحة (للمخزون)
    getMyStoreProducts, // منتجات متجري فقط
    saveShopSettings,
    addProductToLibrary,
    getProductLibraryItems,
  };
};