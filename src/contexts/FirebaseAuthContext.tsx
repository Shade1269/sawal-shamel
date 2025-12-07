import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getUserFromFirestore } from '@/lib/firestore';

interface FirebaseAuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
});

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      const result = await getUserFromFirestore(firebaseUser.uid);
      if (result.success) {
        setUserProfile(result.user);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.info('Firebase profile fetch not available:', error);
      setUserProfile(null);
    }
  };

  const signOut = async () => {
    try {
      const auth = await getFirebaseAuth();
      if (auth) {
        await auth.signOut();
      }
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.info('Firebase sign out not available:', error);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        const auth = await getFirebaseAuth();
        
        // If Firebase is not available, just mark as not loading
        if (!auth) {
          console.info('Firebase auth not configured - skipping');
          setLoading(false);
          return;
        }
        
        unsubscribe = auth.onAuthStateChanged(async (firebaseUser: User | null) => {
          setUser(firebaseUser);
          
          if (firebaseUser) {
            await fetchUserProfile(firebaseUser);
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        });
      } catch (error) {
        console.info('Firebase auth not available:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <FirebaseAuthContext.Provider 
      value={{
        user,
        userProfile,
        loading,
        signOut
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};