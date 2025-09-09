import { getFirestore as initFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseAuth } from './firebase';

let db: any = null;

// Initialize Firestore
export const getFirestoreDB = async () => {
  if (db) return db;
  
  const auth = await getFirebaseAuth();
  const app = auth.app;
  db = initFirestore(app);
  
  return db;
};

// Save user data to Firestore
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
      // Create new user
      await setDoc(userRef, userData);
    }
    
    return { success: true, userData };
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
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
    const activitiesRef = collection(firestore, 'user_activities');
    
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