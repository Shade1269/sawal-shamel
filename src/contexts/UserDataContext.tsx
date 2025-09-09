import React, { createContext, useContext, ReactNode } from 'react';
import { useFirebaseUserData } from '@/hooks/useFirebaseUserData';
import { useAutoMigration } from '@/hooks/useAutoMigration';

const UserDataContext = createContext<ReturnType<typeof useFirebaseUserData> | null>(null);

export const useUserDataContext = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserDataContext must be used within UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const userData = useFirebaseUserData();
  
  // Auto-migrate user data from Supabase to Firestore
  useAutoMigration();
  
  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  );
};