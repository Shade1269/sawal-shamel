import React, { createContext, useContext, ReactNode } from 'react';
import { useUserData } from '@/hooks/useUserData';

const UserDataContext = createContext<ReturnType<typeof useUserData> | null>(null);

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
  const userData = useUserData();
  
  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  );
};