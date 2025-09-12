import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Supabase Auth state changed:', { event, hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, username?: string) => {
    try {
      // أولاً، تحقق من وجود المستخدم
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        toast({
          title: "خطأ في التسجيل",
          description: "هذا البريد الإلكتروني مستخدم مسبقاً. الرجاء استخدام بريد آخر أو تسجيل الدخول.",
          variant: "destructive"
        });
        
        return { error: new Error('Email already exists') };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: username || fullName,
            role: 'affiliate'
          }
        }
      });

      if (error) {
        let errorMessage = error.message;
        
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          errorMessage = 'هذا البريد الإلكتروني مستخدم مسبقاً. الرجاء استخدام بريد آخر أو تسجيل الدخول.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'البريد الإلكتروني غير صحيح';
        } else if (error.message.includes('weak password')) {
          errorMessage = 'كلمة المرور ضعيفة. استخدم أحرف وأرقام ورموز';
        } else if (error.message.includes('signup disabled')) {
          errorMessage = 'التسجيل معطل حالياً. تواصل مع الدعم الفني';
        }
        
        toast({
          title: "خطأ في التسجيل",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { error };
      }

      // إذا نجح التسجيل ولكن لم يتم تأكيد البريد الإلكتروني
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: "تم التسجيل بنجاح!",
          description: "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.",
        });
      } else {
        toast({
          title: "تم التسجيل بنجاح!",
          description: "مرحباً بك! تم إنشاء حسابك وتسجيل دخولك تلقائياً.",
        });
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('SignUp error:', error);
      
      let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
      
      if (error.message.includes('network')) {
        errorMessage = 'تحقق من اتصال الإنترنت وحاول مرة أخرى';
      }
      
      toast({
        title: "خطأ في التسجيل",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let errorMessage = error.message;
        
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات أو أنشئ حساب جديد.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'البريد الإلكتروني غير صحيح';
        } else if (error.message.includes('too many requests')) {
          errorMessage = 'محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'البريد الإلكتروني غير مؤكد. تحقق من بريدك الإلكتروني';
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { error };
      }

      // التحقق من وجود البروفايل
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
        }

        if (!profile) {
          // إنشاء البروفايل إذا لم يكن موجوداً
          const { data: insertData, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              auth_user_id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.email,
              role: 'affiliate'
            })
            .select('*')
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            // إذا فشل الإنشاء بسبب تكرار، لا تعتبره خطأ
            if (!insertError.message.includes('duplicate')) {
              toast({
                title: "تحذير",
                description: "تم تسجيل الدخول بنجاح لكن حدث خطأ في إنشاء الملف الشخصي",
                variant: "destructive"
              });
            }
          } else {
            console.log('Profile created successfully:', insertData);
          }
        } else {
          console.log('Profile exists:', profile);
        }
      }
      
      toast({
        title: "مرحباً بعودتك!",
        description: "تم تسجيل الدخول بنجاح"
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('SignIn error:', error);
      
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      
      if (error.message.includes('network')) {
        errorMessage = 'تحقق من اتصال الإنترنت وحاول مرة أخرى';
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
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

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};