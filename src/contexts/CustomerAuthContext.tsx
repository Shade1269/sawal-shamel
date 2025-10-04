import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerProfile {
  id: string;
  profile_id: string;
  phone: string;
  email?: string;
  full_name: string;
  loyalty_points: number;
  total_orders: number;
  total_spent_sar: number;
  created_at: string;
  updated_at: string;
}

interface CustomerSession {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
}

interface CustomerAuthContextType {
  // الحالة الأساسية
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // وظائف المصادقة
  sendOTP: (phone: string, storeId?: string) => Promise<{ success: boolean; otpCode?: string; error?: string }>;
  verifyOTP: (phone: string, otpCode: string, storeId?: string) => Promise<{ success: boolean; customer?: CustomerProfile; error?: string }>;
  signInWithPassword: (phone: string, password: string) => Promise<{ success: boolean; customer?: CustomerProfile; error?: string }>;
  setPassword: (phone: string, otpCode: string, password: string) => Promise<{ success: boolean; error?: string }>;
  
  // إدارة الجلسة
  signOut: () => void;
  refreshSession: () => Promise<void>;
  checkStoredSession: () => Promise<void>;
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<{ success: boolean; error?: string }>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_SESSION_KEY = 'customer_session';
const SESSION_EXPIRY_DAYS = 30;

interface CustomerAuthProviderProps {
  children: ReactNode;
}

const CustomerAuthProvider: React.FC<CustomerAuthProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [session, setSession] = useState<CustomerSession>({
    customer: null,
    isAuthenticated: false,
    isLoading: true,
    sessionToken: null
  });

  // توليد رمز جلسة فريد
  const generateSessionToken = () => {
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // حفظ الجلسة في localStorage
  const saveSession = (customer: CustomerProfile) => {
    const sessionToken = generateSessionToken();
    const sessionData = {
      customer,
      sessionToken,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)).toISOString()
    };
    
    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(sessionData));
    
    setSession({
      customer,
      isAuthenticated: true,
      isLoading: false,
      sessionToken
    });
  };

  // إزالة الجلسة
  const clearSession = () => {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    setSession({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      sessionToken: null
    });
  };

  // التحقق من صحة الجلسة المحفوظة
  const validateStoredSession = async (): Promise<boolean> => {
    try {
      const storedSession = localStorage.getItem(CUSTOMER_SESSION_KEY);
      if (!storedSession) return false;

      const sessionData = JSON.parse(storedSession);
      
      // التحقق من انتهاء الصلاحية
      if (new Date() > new Date(sessionData.expiresAt)) {
        clearSession();
        return false;
      }

      // التحقق من صحة بيانات العميل من قاعدة البيانات
      const { data: customerData, error } = await supabase
        .from('customers')
        .select(`
          *,
          profiles!customers_profile_id_fkey (
            id,
            phone,
            email,
            full_name
          )
        `)
        .eq('id', sessionData.customer.id)
        .maybeSingle();

      if (error || !customerData || !customerData.profiles) {
        clearSession();
        return false;
      }

      // تحديث بيانات الجلسة بالبيانات الأحدث
      const updatedCustomer: CustomerProfile = {
        id: customerData.id,
        profile_id: customerData.profile_id,
        phone: customerData.profiles.phone,
        email: customerData.profiles.email,
        full_name: customerData.profiles.full_name,
        loyalty_points: customerData.loyalty_points || 0,
        total_orders: customerData.total_orders || 0,
        total_spent_sar: customerData.total_spent_sar || 0,
        created_at: customerData.created_at,
        updated_at: customerData.updated_at
      };

      setSession({
        customer: updatedCustomer,
        isAuthenticated: true,
        isLoading: false,
        sessionToken: sessionData.sessionToken
      });

      return true;
    } catch (error) {
      console.error('خطأ في التحقق من الجلسة:', error);
      clearSession();
      return false;
    }
  };

  // إرسال كود OTP عبر Firebase
  const sendOTP = async (phone: string, storeId?: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));
      
      // تنظيف رقم الهاتف
      const cleanPhone = phone.replace(/\s|-/g, '');
      const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `+966${cleanPhone}`;
      
      // استخدام مساعدات Firebase
      const { setupRecaptcha, sendSMSOTP } = await import('@/lib/firebase');
      
      // إنشاء container لـ reCAPTCHA
      const recaptchaContainer = 'customer-recaptcha-container';
      let container = document.getElementById(recaptchaContainer);
      
      if (!container) {
        container = document.createElement('div');
        container.id = recaptchaContainer;
        container.style.display = 'none';
        document.body.appendChild(container);
      }
      
      // إعداد reCAPTCHA
      const verifier = await setupRecaptcha(recaptchaContainer);
      
      // إرسال OTP
      const result = await sendSMSOTP(fullPhone, verifier);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // حفظ confirmationResult في sessionStorage
      sessionStorage.setItem('customer-otp-confirmation', JSON.stringify({
        verificationId: result.confirmationResult.verificationId,
        phone: fullPhone,
        storeId
      }));
      
      toast({
        title: "تم إرسال كود التحقق",
        description: `تم إرسال رمز التحقق إلى ${fullPhone}`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('خطأ في إرسال OTP:', error);
      
      let errorMessage = error.message || 'فشل في إرسال رمز التحقق';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'رقم الهاتف غير صحيح';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'تم تجاوز حد الإرسال. حاول لاحقاً';
      }
      
      toast({
        title: "خطأ في إرسال الكود",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setSession(prev => ({ ...prev, isLoading: false }));
    }
  };

  // التحقق من كود OTP وتسجيل الدخول عبر Firebase
  const verifyOTP = async (phone: string, otpCode: string, storeId?: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));

      // استرجاع بيانات التحقق
      const confirmationData = sessionStorage.getItem('customer-otp-confirmation');
      if (!confirmationData) {
        throw new Error('لم يتم العثور على جلسة التحقق');
      }

      const { verificationId, phone: savedPhone } = JSON.parse(confirmationData);
      
      // التحقق من الكود عبر Firebase
      const { PhoneAuthProvider, signInWithCredential } = await import('firebase/auth');
      const { getFirebaseAuth } = await import('@/lib/firebase');
      
      const auth = await getFirebaseAuth();
      const credential = PhoneAuthProvider.credential(verificationId, otpCode);
      await signInWithCredential(auth, credential);

      // تنظيف بيانات التحقق
      sessionStorage.removeItem('customer-otp-confirmation');
      
      // تنظيف reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          await window.recaptchaVerifier.clear();
          delete window.recaptchaVerifier;
        } catch (e) {
          console.log('Clearing reCAPTCHA:', e);
        }
      }

      // جلب أو إنشاء بيانات العميل في Supabase
      const customerData = await fetchCustomerByPhone(savedPhone);
      
      if (customerData) {
        saveSession(customerData);

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${customerData.full_name}`,
        });

        return { success: true, customer: customerData };
      }

      throw new Error('فشل في جلب بيانات العميل');
    } catch (error: any) {
      console.error('خطأ في التحقق:', error);
      
      let errorMessage = error.message || 'فشل في التحقق من الكود';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'رمز التحقق غير صحيح';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'انتهت صلاحية رمز التحقق';
      }
      
      toast({
        title: "خطأ في التحقق",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setSession(prev => ({ ...prev, isLoading: false }));
    }
  };

  // تسجيل الدخول بكلمة المرور (سيتم تطويره لاحقاً)
  const signInWithPassword = async (phone: string, password: string) => {
    // TODO: تطوير نظام كلمة المرور لاحقاً
    return { success: false, error: 'نظام كلمة المرور قيد التطوير' };
  };

  // تعيين كلمة مرور جديدة (سيتم تطويره لاحقاً) 
  const setPassword = async (phone: string, otpCode: string, password: string) => {
    // TODO: تطوير نظام كلمة المرور لاحقاً
    return { success: false, error: 'نظام كلمة المرور قيد التطوير' };
  };

  // جلب بيانات العميل بالهاتف
  const fetchCustomerByPhone = async (phone: string): Promise<CustomerProfile | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          phone,
          email,
          full_name,
          customers (
            id,
            profile_id,
            total_orders,
            total_spent_sar,
            loyalty_points,
            created_at,
            updated_at
          )
        `)
        .eq('phone', phone)
        .eq('role', 'customer')
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile || !profile.customers?.[0]) return null;

      const customerData = profile.customers[0];

      return {
        id: customerData.id,
        profile_id: profile.id,
        phone: profile.phone,
        email: profile.email,
        full_name: profile.full_name,
        loyalty_points: customerData.loyalty_points || 0,
        total_orders: customerData.total_orders || 0,
        total_spent_sar: customerData.total_spent_sar || 0,
        created_at: customerData.created_at,
        updated_at: customerData.updated_at
      };
    } catch (error) {
      console.error('خطأ في جلب بيانات العميل:', error);
      return null;
    }
  };

  // تسجيل الخروج
  const signOut = () => {
    clearSession();
    toast({
      title: "تم تسجيل الخروج",
      description: "شكراً لاستخدام متجرنا",
    });
  };

  // تحديث الجلسة
  const refreshSession = async () => {
    if (session.customer) {
      const updated = await fetchCustomerByPhone(session.customer.phone);
      if (updated) {
        saveSession(updated);
      }
    }
  };

  // تحديث بيانات العميل
  const updateProfile = async (updates: Partial<CustomerProfile>) => {
    if (!session.customer) return { success: false, error: 'لا يوجد عميل مسجل دخول' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          email: updates.email
        })
        .eq('id', session.customer.profile_id);

      if (error) throw error;

      // تحديث الجلسة المحلية
      const updatedCustomer = { ...session.customer, ...updates };
      saveSession(updatedCustomer);

      toast({
        title: "تم تحديث البيانات",
        description: "تم حفظ التغييرات بنجاح",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  // التحقق من الجلسة عند التحميل
  useEffect(() => {
    const initSession = async () => {
      const isValid = await validateStoredSession();
      if (!isValid) {
        setSession(prev => ({ ...prev, isLoading: false }));
      }
    };

    initSession();
  }, []);

  // التحقق من الجلسة المحفوظة
  const checkStoredSession = async () => {
    await validateStoredSession();
  };

  const contextValue: CustomerAuthContextType = {
    customer: session.customer,
    isAuthenticated: session.isAuthenticated,
    isLoading: session.isLoading,
    sendOTP,
    verifyOTP,
    signInWithPassword,
    setPassword,
    signOut,
    refreshSession,
    checkStoredSession,
    updateProfile
  };

  return (
    <CustomerAuthContext.Provider value={contextValue}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

const useCustomerAuthContext = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuthContext must be used within a CustomerAuthProvider');
  }
  return context;
};

export { CustomerAuthProvider, useCustomerAuthContext };