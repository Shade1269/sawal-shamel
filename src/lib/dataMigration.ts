import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  getFirestoreDB, 
  addProductToUserStore
} from './firestore';
import { doc, setDoc, getDocs, collection, getDoc } from 'firebase/firestore';

// Create admin Supabase client for data migration
const getSupabaseAdmin = () => {
  const supabaseUrl = 'https://uewuiiopkctdtaexmtxu.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA';
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
};

// نقل المستخدمين من Supabase إلى Firebase
export const migrateUsers = async () => {
  try {
    // جلب المستخدمين من Supabase باستخدام admin client
    const supabaseAdmin = getSupabaseAdmin();
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return { success: true, count: 0 };
    }

    const firestore = await getFirestoreDB();
    let successCount = 0;

    for (const profile of profiles) {
      try {
        // إنشاء بيانات المستخدم للنقل
        const userData = {
          uid: profile.auth_user_id || profile.id,
          phone: profile.phone || profile.whatsapp,
          email: profile.email,
          displayName: profile.full_name || profile.email,
          photoURL: profile.avatar_url,
          role: profile.role || 'affiliate',
          isActive: profile.is_active !== false,
          points: profile.points || 0,
          createdShopsCount: profile.created_shops_count || 0,
          createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
          updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
          lastActivityAt: profile.last_activity_at ? new Date(profile.last_activity_at) : new Date()
        };

        // حفظ المستخدم في Firebase
        const userRef = doc(firestore, 'users', userData.uid);
        await setDoc(userRef, userData, { merge: true });

        successCount++;
      } catch (error) {
        // Ignore individual user migration errors
      }
    }

    return { success: true, count: successCount, total: profiles.length };

  } catch (error) {
    return { success: false, error };
  }
};

// نقل المتاجر من Supabase إلى Firebase
export const migrateShops = async () => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: shops, error: shopsError } = await supabaseAdmin
      .from('shops')
      .select(`
        *,
        profiles!shops_owner_id_fkey (auth_user_id),
        shop_settings_extended (*)
      `)
      .order('created_at', { ascending: false });

    if (shopsError) {
      throw shopsError;
    }

    if (!shops || shops.length === 0) {
      return { success: true, count: 0 };
    }

    const firestore = await getFirestoreDB();
    let successCount = 0;

    for (const shop of shops) {
      try {
        const ownerUid = shop.profiles?.auth_user_id || shop.owner_id;
        if (!ownerUid) {
          continue;
        }

        // إنشاء إعدادات المتجر
        const shopSettingsRef = doc(firestore, 'users', ownerUid, 'shopSettings', 'main');
        const shopSettings = {
          shopName: shop.display_name || '',
          shopSlug: shop.slug || '',
          description: shop.bio || '',
          logoUrl: shop.logo_url || '',
          isActive: true,
          theme: shop.theme || 'classic',
          currency: 'SAR',
          taxRate: shop.shop_settings_extended?.[0]?.tax_rate || 15,
          settings: shop.settings || {},
          createdAt: shop.created_at ? new Date(shop.created_at) : new Date(),
          updatedAt: shop.updated_at ? new Date(shop.updated_at) : new Date()
        };

        await setDoc(shopSettingsRef, shopSettings, { merge: true });

        // تحديث إحصائيات المتجر
        const statsRef = doc(firestore, 'users', ownerUid, 'statistics', 'main');
        await setDoc(statsRef, {
          totalProducts: shop.total_products || 0,
          totalOrders: shop.total_orders || 0,
          totalRevenue: 0,
          totalCustomers: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });

        successCount++;
      } catch (error) {
        // Ignore individual shop migration errors
      }
    }

    return { success: true, count: successCount, total: shops.length };

  } catch (error) {
    return { success: false, error };
  }
};

// نقل المنتجات من Supabase إلى Firebase
export const migrateProducts = async () => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        merchants (profile_id, profiles (auth_user_id)),
        product_variants (*)
      `)
      .order('created_at', { ascending: false });

    if (productsError) {
      throw productsError;
    }

    if (!products || products.length === 0) {
      return { success: true, count: 0 };
    }

    let successCount = 0;

    for (const product of products) {
      try {
        const ownerUid = product.merchants?.profiles?.auth_user_id;
        if (!ownerUid) {
          continue;
        }

        // إعداد بيانات المنتج
        const productData = {
          id: product.id,
          title: product.title,
          description: product.description,
          price_sar: product.price_sar,
          category: product.category,
          stock: product.stock || 0,
          image_urls: product.image_urls || [],
          commission_rate: product.commission_rate || 10,
          is_active: product.is_active !== false,
          external_id: product.external_id,
          view_count: product.view_count || 0,
          last_viewed_at: product.last_viewed_at ? new Date(product.last_viewed_at) : null,
          attributes_schema: product.attributes_schema || {},
          variants: (product.product_variants || []).map((v: any) => ({
            id: v.id,
            variant_type: v.variant_type,
            variant_value: v.variant_value,
            stock: v.stock || 0,
            price_modifier: v.price_modifier || 0,
            sku: v.sku,
            external_id: v.external_id,
            option1_name: v.option1_name,
            option1_value: v.option1_value,
            option2_name: v.option2_name,
            option2_value: v.option2_value
          })),
          createdAt: product.created_at ? new Date(product.created_at) : new Date(),
          updatedAt: product.updated_at ? new Date(product.updated_at) : new Date()
        };

        // إضافة المنتج للمستخدم
        await addProductToUserStore(ownerUid, productData);

        successCount++;
      } catch (error) {
        // Ignore individual product migration errors
      }
    }

    return { success: true, count: successCount, total: products.length };

  } catch (error) {
    return { success: false, error };
  }
};

// نقل مكتبة المنتجات من Supabase إلى Firebase
export const migrateProductLibrary = async () => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: libraryItems, error: libraryError } = await supabaseAdmin
      .from('product_library')
      .select(`
        *,
        products (*),
        shops (owner_id, profiles (auth_user_id))
      `)
      .order('sort_index', { ascending: true });

    if (libraryError) {
      throw libraryError;
    }

    if (!libraryItems || libraryItems.length === 0) {
      return { success: true, count: 0 };
    }

    let successCount = 0;

    for (const item of libraryItems) {
      try {
        const ownerUid = item.shops?.profiles?.auth_user_id;
        if (!ownerUid || !item.products) {
          continue;
        }

        // إعداد بيانات عنصر المكتبة
        const libraryItemData = {
          id: item.product_id,
          is_featured: item.is_featured || false,
          is_visible: item.is_visible !== false,
          sort_index: item.sort_index || 0,
          commission_amount: item.commission_amount || 0,
          products: {
            id: item.products.id,
            title: item.products.title,
            description: item.products.description,
            price_sar: item.products.price_sar,
            image_urls: item.products.image_urls || [],
            category: item.products.category,
            stock: item.products.stock || 0,
            commission_rate: item.products.commission_rate || 10,
            is_active: item.products.is_active !== false
          }
        };

        // إضافة العنصر لمكتبة المستخدم
        await addProductToUserStore(ownerUid, libraryItemData);

        successCount++;
      } catch (error) {
        // Ignore individual library item migration errors
      }
    }

    return { success: true, count: successCount, total: libraryItems.length };

  } catch (error) {
    return { success: false, error };
  }
};

// نقل أنشطة المستخدمين من Supabase إلى Firebase
export const migrateUserActivities = async () => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from('user_activities')
      .select(`
        *,
        profiles (auth_user_id)
      `)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      throw activitiesError;
    }

    if (!activities || activities.length === 0) {
      return { success: true, count: 0 };
    }

    const firestore = await getFirestoreDB();
    let successCount = 0;

    for (const activity of activities) {
      try {
        const ownerUid = activity.profiles?.auth_user_id;
        if (!ownerUid) {
          continue;
        }

        // إضافة النشاط للمستخدم
        const activitiesRef = collection(firestore, 'users', ownerUid, 'activities');
        await setDoc(doc(activitiesRef), {
          userId: ownerUid,
          activity_type: activity.activity_type,
          description: activity.description,
          shop_id: activity.shop_id,
          metadata: activity.metadata || {},
          createdAt: activity.created_at ? new Date(activity.created_at) : new Date()
        });

        successCount++;
      } catch (error) {
        // Ignore individual activity migration errors
      }
    }

    return { success: true, count: successCount, total: activities.length };

  } catch (error) {
    return { success: false, error };
  }
};

// نقل جميع البيانات مباشرة إلى Firebase
export const migrateAllData = async () => {
  try {
    const results = {
      users: { success: false, count: 0, total: 0, error: null },
      shops: { success: false, count: 0, total: 0, error: null },
      products: { success: false, count: 0, total: 0, error: null },
      productLibrary: { success: true, count: 0, total: 0 },
      activities: { success: false, count: 0, total: 0, error: null }
    };

    // استدعاء Edge Function للحصول على البيانات
    const { data, error } = await supabase.functions.invoke('migrate-supabase-to-firestore', {
      body: { action: 'get_data_only' }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.success) {
      return { success: false, error: data.error };
    }

    // الآن ننقل البيانات مباشرة إلى Firebase
    const { getFirestoreDB } = await import('./firestore');
    const { doc, setDoc, collection: firestoreCollection } = await import('firebase/firestore');
    void firestoreCollection; // Reserved for dynamic import usage
    const firestore = await getFirestoreDB();

    // 1. نقل المستخدمين
    if (data.profiles && data.profiles.length > 0) {
      results.users.total = data.profiles.length;
      
      for (const profile of data.profiles) {
        try {
          const userData = {
            uid: profile.auth_user_id || profile.id,
            phone: profile.phone || profile.whatsapp,
            email: profile.email,
            displayName: profile.full_name || profile.email,
            photoURL: profile.avatar_url,
            role: profile.role || 'affiliate',
            isActive: profile.is_active !== false,
            points: profile.points || 0,
            createdShopsCount: profile.created_shops_count || 0,
            createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
            updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
            lastActivityAt: profile.last_activity_at ? new Date(profile.last_activity_at) : new Date()
          };

          const userRef = doc(firestore, 'users', userData.uid);
          await setDoc(userRef, userData, { merge: true });
          results.users.count++;
        } catch (error) {
          // Ignore individual user migration errors
        }
      }
      results.users.success = true;
    }

    // 2. نقل المتاجر
    if (data.shops && data.shops.length > 0) {
      results.shops.total = data.shops.length;
      
      for (const shop of data.shops) {
        try {
          const ownerUid = shop.profiles?.auth_user_id || shop.owner_id;
          if (!ownerUid) {
            continue;
          }

          const shopSettings = {
            shopName: shop.display_name || '',
            shopSlug: shop.slug || '',
            description: shop.bio || '',
            logoUrl: shop.logo_url || '',
            isActive: true,
            theme: shop.theme || 'classic',
            currency: 'SAR',
            taxRate: shop.shop_settings_extended?.[0]?.tax_rate || 15,
            settings: shop.settings || {},
            createdAt: shop.created_at ? new Date(shop.created_at) : new Date(),
            updatedAt: shop.updated_at ? new Date(shop.updated_at) : new Date()
          };

          const shopRef = doc(firestore, 'users', ownerUid, 'shopSettings', 'main');
          await setDoc(shopRef, shopSettings, { merge: true });

          const stats = {
            totalProducts: shop.total_products || 0,
            totalOrders: shop.total_orders || 0,
            totalRevenue: 0,
            totalCustomers: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const statsRef = doc(firestore, 'users', ownerUid, 'statistics', 'main');
          await setDoc(statsRef, stats, { merge: true });

          results.shops.count++;
        } catch (error) {
          // Ignore individual shop migration errors
        }
      }
      results.shops.success = true;
    }

    // 3. نقل المنتجات
    if (data.products && data.products.length > 0) {
      results.products.total = data.products.length;
      
      for (const product of data.products) {
        try {
          const ownerUid = product.merchants?.profiles?.auth_user_id;
          if (!ownerUid) {
            continue;
          }

          const productData = {
            id: product.id,
            title: product.title,
            description: product.description,
            price_sar: product.price_sar,
            category: product.category,
            stock: product.stock || 0,
            image_urls: product.image_urls || [],
            commission_rate: product.commission_rate || 10,
            is_active: product.is_active !== false,
            external_id: product.external_id,
            view_count: product.view_count || 0,
            last_viewed_at: product.last_viewed_at ? new Date(product.last_viewed_at) : null,
            attributes_schema: product.attributes_schema || {},
            variants: (product.product_variants || []).map((v: any) => ({
              id: v.id,
              variant_type: v.variant_type,
              variant_value: v.variant_value,
              stock: v.stock || 0,
              price_modifier: v.price_modifier || 0,
              sku: v.sku,
              external_id: v.external_id,
              option1_name: v.option1_name,
              option1_value: v.option1_value,
              option2_name: v.option2_name,
              option2_value: v.option2_value
            })),
            createdAt: product.created_at ? new Date(product.created_at) : new Date(),
            updatedAt: product.updated_at ? new Date(product.updated_at) : new Date()
          };

          const productRef = doc(firestore, 'users', ownerUid, 'products', product.id);
          await setDoc(productRef, productData, { merge: true });

          results.products.count++;
        } catch (error) {
          // Ignore individual product migration errors
        }
      }
      results.products.success = true;
    }

    return { success: true, results };

  } catch (error) {
    return { success: false, error };
  }
};

// فحص البيانات المنقولة
export const checkMigratedData = async (userId?: string) => {
  try {
    const firestore = await getFirestoreDB();
    
    if (userId) {
      // فحص بيانات مستخدم محدد
      const userRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { success: false, message: 'المستخدم غير موجود في Firebase' };
      }

      const userData = userDoc.data();
      
      // فحص المنتجات
      const productsRef = collection(firestore, 'users', userId, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const productsCount = productsSnapshot.size;

      // فحص الأنشطة
      const activitiesRef = collection(firestore, 'users', userId, 'activities');
      const activitiesSnapshot = await getDocs(activitiesRef);
      const activitiesCount = activitiesSnapshot.size;

      return {
        success: true,
        userData,
        productsCount,
        activitiesCount
      };
    }

    // فحص عام للبيانات
    const usersRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    return {
      success: true,
      totalUsers,
      message: `يوجد ${totalUsers} مستخدم في Firebase`
    };

  } catch (error) {
    return { success: false, error };
  }
};