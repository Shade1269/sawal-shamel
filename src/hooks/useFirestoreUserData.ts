import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { 
  getUserFromFirestore,
  getUserProducts,
  getUserShopSettings,
  getUserActivities,
  getUserStatistics,
  logUserActivity,
  createUserShop,
  addProductToUserStore,
  saveUserToFirestore
} from '@/lib/firestore';

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

export const useFirestoreUserData = () => {
  const { user } = useFirebaseAuth();
  const [userShop, setUserShop] = useState<UserShop | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userStatistics, setUserStatistics] = useState<any>(null);
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
      if (!user) return;
      
      await logUserActivity(user.uid, {
        activity_type: activityType,
        description: description,
        shop_id: shopId,
        metadata: metadata || {}
      });
      
      // Refresh activities
      await fetchUserActivities();
      
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // إنشاء متجر جديد
  const createShop = async (shopName: string, shopSlug?: string) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const slug = shopSlug || `${shopName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      const shopData = {
        shopName,
        shopSlug: slug,
        description: '',
        logoUrl: '',
        isActive: true
      };

      const result = await createUserShop(user.uid, shopData);
      
      if (result.success) {
        // Refresh shop data
        await fetchUserShop();
        return { shop_id: Date.now().toString(), ...shopData };
      } else {
        throw new Error('Failed to create shop');
      }
      
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
      if (!user) return;
      
      const result = await getUserShopSettings(user.uid);
      
      if (result.success && result.shopSettings && result.shopSettings.isActive) {
        const shopSettings = result.shopSettings;
        setUserShop({
          shop_id: user.uid,
          shop_name: shopSettings.shopName || '',
          shop_slug: shopSettings.shopSlug || '',
          total_products: 0,
          total_orders: 0,
          created_at: shopSettings.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
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
      if (!user) return;
      
      const result = await getUserActivities(user.uid, 50);
      
      if (result.success) {
        const activities = result.activities.map((activity: any) => ({
          id: activity.id,
          activity_type: activity.activity_type,
          description: activity.description || '',
          metadata: activity.metadata || {},
          created_at: activity.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          shop_id: activity.shop_id
        }));
        
        setUserActivities(activities);
      }
    } catch (err: any) {
      console.error('Error fetching user activities:', err);
      setError(err.message);
    }
  };

  // الحصول على إحصائيات المستخدم
  const fetchUserStatistics = async () => {
    try {
      if (!user) return;
      
      const result = await getUserStatistics(user.uid);
      
      if (result.success && result.statistics) {
        setUserStatistics(result.statistics);
        
        // Update shop with statistics if shop exists
        if (userShop) {
          setUserShop(prev => prev ? {
            ...prev,
            total_products: result.statistics.totalProducts || 0,
            total_orders: result.statistics.totalOrders || 0
          } : null);
        }
      }
    } catch (err: any) {
      console.error('Error fetching user statistics:', err);
    }
  };

  // إضافة منتج جديد
  const addProduct = async (productData: any) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await addProductToUserStore(user.uid, productData);
      
      if (result.success) {
        // Refresh data
        await Promise.all([
          fetchUserStatistics(),
          fetchUserActivities()
        ]);
        
        return { id: result.productId, ...productData };
      } else {
        throw new Error('Failed to add product');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // الحصول على منتجات المتجر
  const getShopProducts = async () => {
    try {
      if (!user) return [];
      
      const result = await getUserProducts(user.uid);
      
      if (result.success) {
        return result.products || [];
      }
      
      return [];
    } catch (err: any) {
      console.error('Error fetching shop products:', err);
      return [];
    }
  };

  // حفظ إعدادات المتجر
  const saveShopSettings = async (settings: any) => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      // This would use updateUserShopSettings from firestore.ts
      await fetchUserShop();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // تحديث البيانات عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      setLoading(true);
      
      // Make sure user exists in Firestore
      saveUserToFirestore(user).then(() => {
        Promise.all([
          fetchUserShop(),
          fetchUserActivities(),
          fetchUserStatistics()
        ]).finally(() => {
          setLoading(false);
        });
      });
    } else {
      setUserShop(null);
      setUserActivities([]);
      setUserStatistics(null);
      setLoading(false);
    }
  }, [user]);

  return {
    userShop,
    userActivities,
    userStatistics,
    loading,
    error,
    
    // وظائف إدارة المتجر
    createShop,
    addProduct,
    getShopProducts,
    saveShopSettings,
    
    // وظائف النشاط والجلسات
    logActivity,
    
    // وظائف التحديث
    refreshShop: fetchUserShop,
    refreshActivities: fetchUserActivities,
    refreshStatistics: fetchUserStatistics
  };
};