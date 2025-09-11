import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'merchant' | 'affiliate' | 'customer' | 'moderator';
  level: 'bronze' | 'silver' | 'gold' | 'legendary';
  points: number;
  total_earnings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try user_profiles first, then profiles table
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      // If not found in user_profiles, try profiles table
      if (!data && (error?.code === 'PGRST116' || !data)) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', userId)
          .maybeSingle();
        
        data = profileData;
        error = profileError;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'merchant' | 'affiliate' | 'customer' = 'customer') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) {
        toast({
          title: "خطأ في التسجيل",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يمكنك الآن تسجيل الدخول",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "مرحباً بك",
        description: "تم تسجيل الدخول بنجاح",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "تم تسجيل الخروج",
        description: "وداعاً، نراك قريباً",
      });
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "خطأ في تحديث الملف الشخصي",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setProfile(data);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ بياناتك الجديدة",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error };
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isMerchant: profile?.role === 'merchant',
    isAffiliate: profile?.role === 'affiliate',
    isCustomer: profile?.role === 'customer',
  };
};