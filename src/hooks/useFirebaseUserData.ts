import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { logUserActivity, updateUserInFirestore, getUserFromFirestore } from '@/lib/firestore';

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

export const useFirebaseUserData = () => {
  const { user, userProfile } = useFirebaseAuth();
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
      if (!user) return;
      
      await logUserActivity(user.uid, {
        activity_type: activityType,
        description: description,
        shop_id: shopId,
        metadata: metadata || {}
      });
      
      // Add to local state
      const newActivity = {
        id: Date.now().toString(),
        activity_type: activityType,
        description: description || '',
        metadata: metadata || {},
        created_at: new Date().toISOString(),
        shop_id: shopId
      };
      
      setUserActivities(prev => [newActivity, ...prev.slice(0, 49)]);
      
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // إنشاء متجر جديد - يتطلب Firebase Firestore
  const createShop = async (shopName: string, shopSlug?: string) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create shop data in Firestore
      const shopData = {
        owner_id: user.uid,
        display_name: shopName,
        slug: shopSlug || `${shopName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        total_products: 0,
        total_orders: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      // For now, we'll store shop data locally until full Firestore integration
      const newShop: UserShop = {
        shop_id: Date.now().toString(),
        shop_name: shopName,
        shop_slug: shopData.slug,
        total_products: 0,
        total_orders: 0,
        created_at: new Date().toISOString()
      };

      setUserShop(newShop);
      
      // Log activity
      await logActivity('shop_created', `تم إنشاء متجر جديد: ${shopName}`, newShop.shop_id);
      
      return newShop;
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
      
      // For now, get from local storage or userProfile
      const savedShop = localStorage.getItem(`user_shop_${user.uid}`);
      if (savedShop) {
        setUserShop(JSON.parse(savedShop));
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
      
      // For now, get from local storage
      const savedActivities = localStorage.getItem(`user_activities_${user.uid}`);
      if (savedActivities) {
        setUserActivities(JSON.parse(savedActivities));
      }
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

      // For now, just log the activity
      await logActivity('product_added', `تم إضافة منتج جديد: ${productData.title}`, userShop.shop_id);
      
      // Update shop products count
      const updatedShop = {
        ...userShop,
        total_products: userShop.total_products + 1
      };
      
      setUserShop(updatedShop);
      localStorage.setItem(`user_shop_${user?.uid}`, JSON.stringify(updatedShop));
      
      return { id: Date.now().toString(), ...productData };
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // الحصول على منتجات المتجر
  const getShopProducts = async () => {
    try {
      if (!userShop) return [];
      
      // For now, return empty array - will be implemented with full Firestore
      return [];
    } catch (err: any) {
      console.error('Error fetching shop products:', err);
      return [];
    }
  };

  // حفظ إعدادات المتجر
  const saveShopSettings = async (settings: any) => {
    try {
      if (!userShop || !user) {
        throw new Error('No shop or user found');
      }

      // Save to localStorage for now
      const shopSettings = JSON.parse(localStorage.getItem(`shop_settings_${userShop.shop_id}`) || '{}');
      const updatedSettings = { ...shopSettings, ...settings, updated_at: new Date().toISOString() };
      
      localStorage.setItem(`shop_settings_${userShop.shop_id}`, JSON.stringify(updatedSettings));

      await logActivity('settings_updated', 'تم تحديث إعدادات المتجر', userShop.shop_id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // حفظ جلسة العمل
  const saveSession = async (sessionData: any) => {
    try {
      if (!user) return;

      localStorage.setItem(`user_session_${user.uid}`, JSON.stringify({
        session_data: sessionData,
        last_saved_at: new Date().toISOString()
      }));
    } catch (err: any) {
      console.error('Error saving session:', err);
    }
  };

  // استرجاع جلسة العمل
  const loadSession = async () => {
    try {
      if (!user) return null;

      const savedSession = localStorage.getItem(`user_session_${user.uid}`);
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        return sessionData.session_data || null;
      }
      
      return null;
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

  // Save activities to localStorage when they change
  useEffect(() => {
    if (user && userActivities.length > 0) {
      localStorage.setItem(`user_activities_${user.uid}`, JSON.stringify(userActivities));
    }
  }, [user, userActivities]);

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