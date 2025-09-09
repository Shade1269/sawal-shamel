import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { saveUserToFirestore, getUserFromFirestore, updateUserInFirestore } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updateData: any) => Promise<{ error: any }>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let auth: any = null;
    
    const initializeAuth = async () => {
      try {
        auth = await getFirebaseAuth();
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log('Firebase Auth state changed:', { hasUser: !!firebaseUser });
          
          setUser(firebaseUser);
          
          if (firebaseUser) {
            // Load user profile from Firestore
            const profileResult = await getUserFromFirestore(firebaseUser.uid);
            if (profileResult.success) {
              setUserProfile(profileResult.user);
            } else {
              // Create profile if doesn't exist
              await saveUserToFirestore(firebaseUser);
              const newProfileResult = await getUserFromFirestore(firebaseUser.uid);
              if (newProfileResult.success) {
                setUserProfile(newProfileResult.user);
              }
            }
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error initializing Firebase Auth:', error);
        setLoading(false);
      }
    };
    
    const unsubscribePromise = initializeAuth();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const auth = await getFirebaseAuth();
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user profile to Firestore
      const saveResult = await saveUserToFirestore(firebaseUser, {
        fullName,
        email,
        displayName: fullName
      });
      
      if (saveResult.success) {
        toast({
          title: "تم التسجيل بنجاح",
          description: "تم إنشاء حسابك بنجاح!"
        });
        return { error: null };
      } else {
        throw new Error('فشل في حفظ بيانات المستخدم');
      }
    } catch (error: any) {
      console.error('SignUp error:', error);
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'هذا البريد الإلكتروني مستخدم مسبقاً';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      }
      
      toast({
        title: "خطأ في التسجيل",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const auth = await getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      
      // Save remember preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({ 
          email, 
          timestamp: Date.now(),
          rememberMe: true 
        }));
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك!"
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('SignIn error:', error);
      let errorMessage = error.message;
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'المستخدم غير موجود';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      }
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const auth = await getFirebaseAuth();
      await firebaseSignOut(auth);
      localStorage.removeItem('rememberMe');
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "إلى اللقاء!"
      });
    } catch (error: any) {
      console.error('SignOut error:', error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updateData: any) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const result = await updateUserInFirestore(user.uid, updateData);
      
      if (result.success) {
        // Refresh user profile
        const profileResult = await getUserFromFirestore(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.user);
        }
        
        toast({
          title: "تم تحديث الملف الشخصي",
          description: "تم حفظ التغييرات بنجاح"
        });
        
        return { error: null };
      } else {
        throw new Error('فشل في تحديث البيانات');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive"
      });
      
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};