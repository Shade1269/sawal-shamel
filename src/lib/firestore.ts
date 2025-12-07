import { getFirestore as initFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { getFirebaseAuth } from './firebase';

let db: any = null;

// Initialize Firestore
export const getFirestoreDB = async () => {
  if (db) return db;
  
  try {
    const auth = await getFirebaseAuth();
    if (!auth) return null;
    
    const app = auth.app;
    db = initFirestore(app);
    
    return db;
  } catch (error) {
    console.warn('Firestore not available:', error);
    return null;
  }
};

// Save user data to Firestore with complete user database structure
export const saveUserToFirestore = async (user: any, additionalData: any = {}) => {
  try {
    const firestore = await getFirestoreDB();
    const userRef = doc(firestore, 'users', user.uid);
    
    const userData = {
      uid: user.uid,
      phone: user.phoneNumber,
      email: user.email || null,
      displayName: user.displayName || additionalData.fullName || user.phoneNumber,
      photoURL: user.photoURL || null,
      role: additionalData.role || 'affiliate',
      isActive: true,
      points: 0,
      createdShopsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      ...additionalData
    };
    
    // Check if user already exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        createdAt: userDoc.data().createdAt, // Keep original creation date
        updatedAt: new Date()
      });
    } else {
      // Create new user with complete database structure
      await setDoc(userRef, userData);
      
      // Initialize user's subcollections and data structure
      await initializeUserDatabase(user.uid);
    }
    
    return { success: true, userData };
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    return { success: false, error };
  }
};

// Initialize complete database structure for new user
export const initializeUserDatabase = async (uid: string) => {
  try {
    const firestore = await getFirestoreDB();
    
    // Create user's shop settings document
    const shopSettingsRef = doc(firestore, 'users', uid, 'shopSettings', 'main');
    await setDoc(shopSettingsRef, {
      shopName: '',
      shopSlug: '',
      description: '',
      logoUrl: '',
      coverImageUrl: '',
      isActive: false,
      theme: 'classic',
      currency: 'SAR',
      taxRate: 15,
      paymentMethods: ['cash_on_delivery'],
      shippingMethods: ['standard'],
      businessHours: {
        monday: { open: '09:00', close: '17:00', isOpen: true },
        tuesday: { open: '09:00', close: '17:00', isOpen: true },
        wednesday: { open: '09:00', close: '17:00', isOpen: true },
        thursday: { open: '09:00', close: '17:00', isOpen: true },
        friday: { open: '09:00', close: '17:00', isOpen: true },
        saturday: { open: '09:00', close: '17:00', isOpen: false },
        sunday: { open: '09:00', close: '17:00', isOpen: false }
      },
      socialLinks: {
        whatsapp: '',
        instagram: '',
        twitter: '',
        facebook: ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create initial statistics document
    const statsRef = doc(firestore, 'users', uid, 'statistics', 'main');
    await setDoc(statsRef, {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      monthlyStats: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create preferences document
    const preferencesRef = doc(firestore, 'users', uid, 'preferences', 'main');
    await setDoc(preferencesRef, {
      language: 'ar',
      notifications: {
        email: true,
        sms: true,
        push: true,
        orderAlerts: true,
        productAlerts: true
      },
      displaySettings: {
        itemsPerPage: 20,
        defaultView: 'grid',
        showTutorials: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error initializing user database:', error);
    return { success: false, error };
  }
};

// Create a shop for user
export const createUserShop = async (uid: string, shopData: any) => {
  try {
    const firestore = await getFirestoreDB();
    
    // Check if shop settings document exists, create if not
    const shopSettingsRef = doc(firestore, 'users', uid, 'shopSettings', 'main');
    const shopSettingsDoc = await getDoc(shopSettingsRef);
    
    if (!shopSettingsDoc.exists()) {
      // Initialize the document first if it doesn't exist
      await initializeUserDatabase(uid);
    }
    
    // Now update shop settings
    await updateDoc(shopSettingsRef, {
      shopName: shopData.shopName || shopData.shop_name,
      shopSlug: shopData.shopSlug || shopData.shop_slug,
      isActive: true,
      updatedAt: new Date()
    });

    // Update user's main document
    const userRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // If user document doesn't exist, create it first
      await setDoc(userRef, {
        uid: uid,
        createdShopsCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      await updateDoc(userRef, {
        createdShopsCount: 1,
        updatedAt: new Date()
      });
    }

    // Log activity
    await logUserActivity(uid, {
      activity_type: 'shop_created',
      description: `تم إنشاء متجر: ${shopData.shopName}`,
      metadata: { shopName: shopData.shopName }
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating user shop:', error);
    return { success: false, error };
  }
};

// Add product to user's store
export const addProductToUserStore = async (uid: string, productData: any) => {
  try {
    const firestore = await getFirestoreDB();
    
    let productId;
    
    // If productData has an id, use setDoc to set specific ID
    if (productData.id) {
      productId = productData.id;
      const productRef = doc(firestore, 'users', uid, 'products', productId);
      
      const { id, ...dataWithoutId } = productData; // Remove id from data
      await setDoc(productRef, {
        ...dataWithoutId,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Normalize to isActive (consistent field name)
        isActive: productData.is_active !== false,
        viewCount: 0,
        orderCount: 0
      });
    } else {
      // Use addDoc for auto-generated ID
      const productsRef = collection(firestore, 'users', uid, 'products');
      const productRef = await addDoc(productsRef, {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Normalize to isActive (consistent field name)
        isActive: productData.is_active !== false,
        viewCount: 0,
        orderCount: 0
      });
      productId = productRef.id;
    }

    // Update statistics
    const statsRef = doc(firestore, 'users', uid, 'statistics', 'main');
    const statsDoc = await getDoc(statsRef);
    const currentStats = statsDoc.data();
    
    await updateDoc(statsRef, {
      totalProducts: (currentStats?.totalProducts || 0) + 1,
      updatedAt: new Date()
    });

    // Log activity
    await logUserActivity(uid, {
      activity_type: 'product_added',
      description: `تم إضافة منتج: ${productData.title}`,
      metadata: { productId: productId, productTitle: productData.title }
    });

    return { success: true, productId: productId };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error };
  }
};

// Get user's products (including store products)
export const getUserProducts = async (uid: string) => {
  try {
    const firestore = await getFirestoreDB();
    const productsRef = collection(firestore, 'users', uid, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Normalize the active field - check both isActive and is_active
        is_active: data.isActive !== undefined ? data.isActive : data.is_active !== false
      };
    }).filter(product => product.is_active !== false); // Only return active products

    return { success: true, products };
  } catch (error) {
    console.error('Error getting user products:', error);
    return { success: false, error, products: [] };
  }
};

// Get user's shop settings
export const getUserShopSettings = async (uid: string) => {
  try {
    const firestore = await getFirestoreDB();
    const shopSettingsRef = doc(firestore, 'users', uid, 'shopSettings', 'main');
    const shopSettingsDoc = await getDoc(shopSettingsRef);
    
    if (shopSettingsDoc.exists()) {
      return { success: true, shopSettings: shopSettingsDoc.data() };
    } else {
      return { success: false, shopSettings: null };
    }
  } catch (error) {
    console.error('Error getting shop settings:', error);
    return { success: false, error, shopSettings: null };
  }
};

// Update user's shop settings
export const updateUserShopSettings = async (uid: string, settings: any) => {
  try {
    const firestore = await getFirestoreDB();
    const shopSettingsRef = doc(firestore, 'users', uid, 'shopSettings', 'main');
    
    await updateDoc(shopSettingsRef, {
      ...settings,
      updatedAt: new Date()
    });

    // Log activity
    await logUserActivity(uid, {
      activity_type: 'settings_updated',
      description: 'تم تحديث إعدادات المتجر',
      metadata: settings
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating shop settings:', error);
    return { success: false, error };
  }
};

// Get user data from Firestore
export const getUserFromFirestore = async (uid: string) => {
  try {
    const firestore = await getFirestoreDB();
    const userRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, user: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return { success: false, error };
  }
};

// Update user data in Firestore
export const updateUserInFirestore = async (uid: string, updateData: any) => {
  try {
    const firestore = await getFirestoreDB();
    const userRef = doc(firestore, 'users', uid);
    
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    return { success: false, error };
  }
};

// Log user activity to Firestore
export const logUserActivity = async (uid: string, activityData: any) => {
  try {
    const firestore = await getFirestoreDB();
    const activitiesRef = collection(firestore, 'users', uid, 'activities');
    
    await addDoc(activitiesRef, {
      userId: uid,
      createdAt: new Date(),
      ...activityData
    });
    
    // Update user's last activity
    await updateUserInFirestore(uid, { lastActivityAt: new Date() });
    
    return { success: true };
  } catch (error) {
    console.error('Error logging user activity:', error);
    return { success: false, error };
  }
};

// Get user activities
export const getUserActivities = async (uid: string, limitCount: number = 50) => {
  try {
    const firestore = await getFirestoreDB();
    const activitiesRef = collection(firestore, 'users', uid, 'activities');
    const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, activities };
  } catch (error) {
    console.error('Error getting user activities:', error);
    return { success: false, error, activities: [] };
  }
};

// Get user statistics
export const getUserStatistics = async (uid: string) => {
  try {
    const firestore = await getFirestoreDB();
    const statsRef = doc(firestore, 'users', uid, 'statistics', 'main');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return { success: true, statistics: statsDoc.data() };
    } else {
      return { success: false, statistics: null };
    }
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return { success: false, error, statistics: null };
  }
};