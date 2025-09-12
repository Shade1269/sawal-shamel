import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getUserFromFirestore, saveUserToFirestore } from '@/lib/firestore';

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

export const useUnifiedUserData = () => {
  const { user: supabaseUser } = useSupabaseAuth();
  const { user: firebaseUser, userProfile: firebaseProfile } = useFirebaseAuth();
  const { toast } = useToast();
  
  const [userShop, setUserShop] = useState<UserShop | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unifiedProfile, setUnifiedProfile] = useState<any>(null);

  // دمج البيانات من كلا المصدرين
  const unifyUserData = async () => {
    let profile = null;
    
    try {
      // إذا كان المستخدم مسجل دخول عبر Supabase
      if (supabaseUser) {
        console.log('Unifying Supabase user:', supabaseUser.id);
        
        const { data: supabaseProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', supabaseUser.id)
          .maybeSingle();
        
        if (fetchError) {
          console.error('Error fetching Supabase profile:', fetchError);
        }
        
        if (supabaseProfile) {
          profile = supabaseProfile;
          console.log('Found existing Supabase profile:', profile.id);
          
          // إذا كان هناك مستخدم Firebase أيضاً، نحفظ بياناته في Firebase
          if (firebaseUser && !firebaseProfile) {
            try {
              await saveUserToFirestore(firebaseUser, {
                email: supabaseProfile.email,
                fullName: supabaseProfile.full_name,
                role: supabaseProfile.role
              });
            } catch (error) {
              console.error('Error saving to Firestore:', error);
            }
          }
        } else {
          // إنشاء profile جديد في Supabase إذا لم يكن موجود
          console.log('Creating new Supabase profile for user:', supabaseUser.id);
          
          const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({
              auth_user_id: supabaseUser.id,
              email: supabaseUser.email,
              full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
              role: 'affiliate'
            })
            .select()
            .single();
            
          if (error) {
            console.error('Error creating Supabase profile:', error);
          } else {
            profile = newProfile;
            console.log('Created new Supabase profile:', profile.id);
          }
        }
      }
      
      // إذا كان المستخدم مسجل دخول عبر Firebase فقط
      else if (firebaseUser) {
        console.log('Unifying Firebase user:', firebaseUser.uid);
        console.log('Firebase profile:', firebaseProfile);
        
        const phoneNumber = firebaseProfile?.phone || firebaseUser.phoneNumber;
        
        if (phoneNumber) {
          // استخدام service role لتجنب مشاكل RLS
          console.log('Looking for profile with phone:', phoneNumber);
          
          // محاولة إنشاء profile جديد مباشرة، سيفشل إذا كان موجود
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              phone: phoneNumber,
              full_name: firebaseProfile?.displayName || firebaseProfile?.fullName || phoneNumber,
              role: 'affiliate'
            })
            .select()
            .single();
            
          if (insertError) {
            // إذا فشل الإدراج، ربما الملف موجود، نحاول البحث
            console.log('Profile might exist, trying to fetch:', insertError);
            
            // البحث بطريقة مختلفة
            const { data: existingProfiles, error: selectError } = await supabase
              .from('profiles')
              .select('*')
              .limit(1000); // نحصل على جميع الملفات ونبحث محلياً
              
            if (!selectError && existingProfiles) {
              const phoneProfile = existingProfiles.find(p => p.phone === phoneNumber);
              if (phoneProfile) {
                profile = phoneProfile;
                console.log('Found existing profile:', profile.id);
              }
            }
          } else {
            profile = newProfile;
            console.log('Created new profile for Firebase user:', profile.id);
          }
        } else {
          console.error('Firebase user has no phone number');
        }
      }
    } catch (error) {
      console.error('Error in unifyUserData:', error);
    }
    
    setUnifiedProfile(profile);
    return profile;
  };

  // باقي الدوال كما هي لكن تستخدم unifiedProfile
  const logActivity = async (activityType: string, description?: string, shopId?: string, metadata?: any): Promise<void> => {
    const profile = unifiedProfile || await unifyUserData();
    if (!profile) return;

    try {
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

  const createShop = async (shopName: string, shopSlug?: string): Promise<any> => {
    const profile = unifiedProfile || await unifyUserData();
    if (!profile) {
      throw new Error('لم يتم العثور على ملف المستخدم');
    }

    try {
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

  const fetchUserShop = async (): Promise<void> => {
    const profile = unifiedProfile || await unifyUserData();
    if (!profile) return;

    try {
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

  const fetchUserActivities = async (): Promise<void> => {
    const profile = unifiedProfile || await unifyUserData();
    if (!profile) return;

    try {
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

  const fetchUserStatistics = async (): Promise<void> => {
    const profile = unifiedProfile || await unifyUserData();
    if (!profile) return;

    try {
      const { data: shopData } = await supabase
        .from('shops')
        .select('total_products, total_orders')
        .eq('owner_id', profile.id)
        .single();

      setUserStatistics({
        totalProducts: shopData?.total_products || 0,
        totalOrders: shopData?.total_orders || 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  const addProduct = async (productData: any): Promise<string | undefined> => {
    const profile = unifiedProfile || await unifyUserData();
    if (!profile || !userShop) {
      throw new Error('المستخدم أو المتجر غير متوفر');
    }

    try {
      let { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!merchant) {
        const { data: newMerchant, error: merchantError } = await supabase
          .from('merchants')
          .insert({
            profile_id: profile.id,
            business_name: userShop.display_name
          })
          .select('id')
          .single();

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
        .single();

      if (error) throw error;

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

  const saveShopSettings = async (settings: any): Promise<void> => {
    if (!userShop) {
      throw new Error('المتجر غير متوفر');
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

  const updateProduct = async (productId: string, updateData: any): Promise<void> => {
    if (!userShop) {
      throw new Error('المتجر غير متوفر');
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      fetchUserShop();
      logActivity('product_updated', `تم تحديث منتج`);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (supabaseUser || firebaseUser) {
      setLoading(true);
      unifyUserData().then(() => {
        if (isMounted) {
          Promise.all([
            fetchUserShop(),
            fetchUserActivities(),
            fetchUserStatistics()
          ]).finally(() => {
            if (isMounted) {
              setLoading(false);
            }
          });
        }
      });
    } else {
      setUserShop(null);
      setUserActivities([]);
      setUserStatistics(null);
      setUnifiedProfile(null);
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [supabaseUser?.id, firebaseUser?.uid]);

  // حفظ المنتج داخل مكتبة المتجر لظهوره في قسم المنتجات
  const addProductToLibrary = async (productId: string): Promise<string | undefined> => {
    if (!userShop) {
      throw new Error('المتجر غير متوفر');
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
        .single();

      if (error) throw error;

      await logActivity('product_saved_to_library', 'تم حفظ المنتج في قسم المنتجات', userShop.id, { productId });

      return data?.id;
    } catch (error) {
      console.error('Error adding product to library:', error);
      throw error;
    }
  };

  // جلب عناصر مكتبة المتجر مع تفاصيل المنتجات
  const getProductLibraryItems = async (): Promise<any[]> => {
    if (!userShop) return [];

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

  // جلب منتجات المتجر المحددة (المضافة لمكتبة المتجر)
  const getMyStoreProducts = async (): Promise<any[]> => {
    if (!userShop) return [];

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
    user: supabaseUser || firebaseUser,
    userProfile: unifiedProfile,
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
    updateProduct,
    getShopProducts, // جميع المنتجات المتاحة (للمخزون)
    getMyStoreProducts, // منتجات متجري فقط
    saveShopSettings,
    addProductToLibrary,
    getProductLibraryItems,
  };
};