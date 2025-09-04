import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, verifyMethod?: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('AuthContext: Setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext: Auth state changed:', { event, hasSession: !!session, hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        console.log('AuthContext: Got session:', { hasSession: !!session, hasUser: !!session?.user, error });
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          // Clear any problematic session data
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('AuthContext: Failed to get session:', err);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // Failsafe timeout to prevent infinite loading
    const failsafeTimeout = setTimeout(() => {
      console.log('AuthContext: Failsafe timeout - setting loading to false');
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(failsafeTimeout);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, verifyMethod: string = 'email', phone?: string) => {
    let signUpOptions: any = {
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName
        }
      }
    };

    if (verifyMethod === 'phone' && phone) {
      // التسجيل عن طريق الجوال
      signUpOptions = {
        phone: phone,
        password: password,
        options: {
          data: {
            full_name: fullName
          }
        }
      };
    } else {
      // التسجيل عن طريق الإيميل
      signUpOptions = {
        email: email,
        password: password,
        ...signUpOptions
      };
    }

    console.log('SignUp method:', verifyMethod, 'Options:', signUpOptions);

    const { error } = await supabase.auth.signUp(signUpOptions);

    if (error) {
      toast({
        title: "خطأ في التسجيل",
        description: error.message,
        variant: "destructive"
      });
    } else {
      const method = verifyMethod === 'phone' ? 'رقم الجوال' : 'البريد الإلكتروني';
      toast({
        title: "تم التسجيل بنجاح", 
        description: `تم إرسال رمز التحقق إلى ${method}`
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    console.log('AuthContext signIn called with:', { email, password: '***', rememberMe });
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('Supabase signIn response:', { error });

    if (error) {
      console.error('SignIn error details:', error);
      toast({
        title: "خطأ في تسجيل الدخول", 
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Save user preference for "remember me"
      if (rememberMe) {
        console.log('AuthContext: Saving remember preference');
        localStorage.setItem('rememberMe', JSON.stringify({ 
          email, 
          timestamp: Date.now(),
          rememberMe: true 
        }));
      } else {
        // Remove remember preference if unchecked
        localStorage.removeItem('rememberMe');
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في دردشتي!"
      });
    }

    return { error };
  };

  const signOut = async () => {
    // Clear remember preference on sign out
    localStorage.removeItem('rememberMe');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signInWithPhone = async (phone: string) => {
    console.log('SignInWithPhone called with:', phone);
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        channel: 'sms'
      }
    });

    if (error) {
      console.error('SignInWithPhone error:', error);
      toast({
        title: "خطأ في إرسال رمز التحقق",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "تم إرسال رمز التحقق",
        description: "تحقق من رسائلك القصيرة وأدخل الرمز"
      });
    }

    return { error };
  };

  const verifyOTP = async (phone: string, token: string) => {
    console.log('VerifyOTP called with:', { phone, token });
    
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
    });

    if (error) {
      console.error('VerifyOTP error:', error);
      toast({
        title: "خطأ في التحقق من الرمز",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في دردشتي!"
      });
    }

    return { error };
  };

  const resendVerification = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "تعذّر إرسال البريد",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "تم الإرسال",
        description: "أعدنا إرسال رابط التحقق إلى بريدك"
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithPhone,
    verifyOTP,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};