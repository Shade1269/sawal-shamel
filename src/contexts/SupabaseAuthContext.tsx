import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useFastAuth } from '@/hooks/useFastAuth';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // استخدام النظام المحسن useFastAuth مع الاحتفاظ بنفس الواجهة
  const authData = useFastAuth();
  
  const value = {
    user: authData.user,
    session: authData.session,
    loading: authData.loading,
    signUp: authData.signUp,
    signIn: authData.signIn,
    signOut: authData.signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};