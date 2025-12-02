import { updateUserInFirestore } from './firestore';

// تعيين دور admin لمستخدم معين
export const setUserRole = async (_email: string, _role: 'admin' | 'affiliate' | 'moderator') => {
  try {
    // هذه وظيفة مؤقتة لتعيين الأدوار
    // في الواقع تحتاج صلاحيات admin للقيام بهذا
    return { success: true };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { success: false, error };
  }
};

// للاستخدام المؤقت فقط - تعيين دور admin لحساب محدد
export const makeUserAdmin = async (userUid: string) => {
  try {
    const result = await updateUserInFirestore(userUid, {
      role: 'admin',
      updatedAt: new Date()
    });
    
    return result;
  } catch (error) {
    console.error('Error making user admin:', error);
    return { success: false, error };
  }
};