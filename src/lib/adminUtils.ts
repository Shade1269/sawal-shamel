import { updateUserInFirestore } from './firestore';

// تعيين دور admin لمستخدم معين
export const setUserRole = async (email: string, role: 'admin' | 'affiliate' | 'moderator') => {
  try {
    // هذه وظيفة مؤقتة لتعيين الأدوار
    // في الواقع تحتاج صلاحيات admin للقيام بهذا
    console.log(`Setting role ${role} for user ${email}`);
    
    // يمكن استخدام هذا في console المطور:
    // import { setUserRole } from './lib/adminUtils';
    // setUserRole('shade199633@icloud.com', 'admin');
    
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
    
    console.log('User role updated to admin:', result);
    return result;
  } catch (error) {
    console.error('Error making user admin:', error);
    return { success: false, error };
  }
};