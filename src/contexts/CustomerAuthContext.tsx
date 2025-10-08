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

  // حفظ الجلسة في localStorage (محمي لـ Safari Private)
  const saveSession = (customer: CustomerProfile) => {
    const sessionToken = generateSessionToken();
    const sessionData = {
      customer,
      sessionToken,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)).toISOString()
    };
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(sessionData));
      }
    } catch {
      // تجاهل أخطاء التخزين في وضع التصفح الخاص
    }
    setSession({
      customer,
      isAuthenticated: true,
      isLoading: false,
      sessionToken
    });
  };

  // إزالة الجلسة (محمي لـ Safari Private)
  const clearSession = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(CUSTOMER_SESSION_KEY);
      }
    } catch {
      // تجاهل أخطاء التخزين
    }
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
      let storedSession: string | null = null;
      try {
        if (typeof window !== 'undefined') {
          storedSession = window.localStorage?.getItem(CUSTOMER_SESSION_KEY) ?? null;
        }
      } catch {
        storedSession = null;
      }
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
      
      // تنظيف رقم الهاتف وتحويله إلى E.164
      const digits = phone.replace(/\D/g, '');
      let fullPhone = '';
      if (digits.startsWith('966')) {
        fullPhone = `+${digits}`;
      } else if (digits.startsWith('0')) {
        fullPhone = `+966${digits.replace(/^0+/, '')}`;
      } else if (digits.startsWith('5') && digits.length === 9) {
        fullPhone = `+966${digits}`;
      } else if (phone.startsWith('+')) {
        fullPhone = phone;
      } else {
        fullPhone = `+${digits}`;
      }

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
      console.log('Fetching customer by phone:', savedPhone);
      const customerData = await fetchCustomerByPhone(savedPhone);
      
      if (customerData) {
        console.log('Customer data fetched successfully:', customerData.id);
        saveSession(customerData);

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${customerData.full_name}`,
        });

        return { success: true, customer: customerData };
      }

      console.error('Failed to fetch customer data');
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

  // Utilities: normalize phone formats to E.164 and national (05...)
  const getPhoneVariants = (input: string) => {
    const digits = input.replace(/\D/g, '');
    if (digits.startsWith('966')) {
      const national = '0' + digits.slice(3);
      return { e164: `+${digits}`, national };
    }
    if (digits.startsWith('0')) {
      const core = digits.replace(/^0+/, '');
      return { e164: `+966${core}`, national: `0${core}` };
    }
    if (digits.startsWith('5') && digits.length === 9) {
      return { e164: `+966${digits}`, national: `0${digits}` };
    }
    return { e164: input.startsWith('+') ? input : `+${digits}`, national: input };
  };

  // جلب بيانات العميل بالهاتف
  const fetchCustomerByPhone = async (phone: string): Promise<CustomerProfile | null> => {
    try {
      const { e164, national } = getPhoneVariants(phone);

      // جرّب أولاً بصيغة E.164، ثم الصيغة المحلية
      let profile: any = null;
      let profileError: any = null;

      // First try E.164 format
      let resp = await supabase
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
        .eq('phone', e164)
        .eq('role', 'customer')
        .maybeSingle();
      
      if (resp.error) {
        console.error('Error fetching with E.164:', resp.error);
      }
      
      profile = resp.data;
      profileError = resp.error;

      // If not found, try national format
      if (!profile && !profileError) {
        resp = await supabase
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
          .eq('phone', national)
          .eq('role', 'customer')
          .maybeSingle();
        
        if (resp.error) {
          console.error('Error fetching with national format:', resp.error);
        }
        
        profile = resp.data;
        profileError = resp.error;
      }

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileError) throw profileError;
      
      // إذا لم يكن هناك profile، قم بإنشاءه عبر RPC الآمن ثم أعد الجلب
      if (!profile) {
        console.log('Provisioning customer via RPC (no profile found):', e164, '/', national);
        const { error: provisionError } = await supabase
          .rpc('create_customer_account', {
            p_phone: e164,
            p_store_id: null
          });
        if (provisionError) {
          console.error('Error provisioning customer via RPC:', provisionError);
          throw provisionError;
        }

        // أعد الجلب بعد التهيئة
        const { data: fetchedAfterCreate, error: fetchAfterCreateError } = await supabase
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
          .eq('phone', e164)
          .eq('role', 'customer')
          .maybeSingle();

        if (fetchAfterCreateError) {
          console.error('Error refetching profile after RPC:', fetchAfterCreateError);
          throw fetchAfterCreateError;
        }

        profile = fetchedAfterCreate;
      }

      // إذا كان هناك profile ولكن لا يوجد customer، استخدم RPC لإنشائه ثم أعد الجلب
      const customersArray = Array.isArray(profile.customers) ? profile.customers : (profile.customers ? [profile.customers] : []);
      if (customersArray.length === 0) {
        console.log('Creating customer via RPC for existing profile:', profile.id);
        const { error: createCustRpcErr } = await supabase
          .rpc('create_customer_account', {
            p_phone: profile.phone,
            p_store_id: null
          });
        if (createCustRpcErr) {
          console.error('Error creating customer via RPC:', createCustRpcErr);
          throw createCustRpcErr;
        }

        // أعد الجلب بعد الإنشاء
        const { data: refreshed, error: refreshErr } = await supabase
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
          .eq('id', profile.id)
          .maybeSingle();

        if (refreshErr) throw refreshErr;
        const refreshedCustomer = Array.isArray(refreshed?.customers) ? refreshed?.customers[0] : refreshed?.customers;
        if (!refreshed || !refreshedCustomer) {
          throw new Error('لم يتم إنشاء سجل العميل');
        }

        return {
          id: refreshedCustomer.id,
          profile_id: profile.id,
          phone: refreshed.phone,
          email: refreshed.email,
          full_name: refreshed.full_name,
          loyalty_points: refreshedCustomer.loyalty_points || 0,
          total_orders: refreshedCustomer.total_orders || 0,
          total_spent_sar: refreshedCustomer.total_spent_sar || 0,
          created_at: refreshedCustomer.created_at,
          updated_at: refreshedCustomer.updated_at
        };
      }

      const customerData = customersArray[0];

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
    } catch (error: any) {
      console.error('خطأ في جلب بيانات العميل:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message || 'حدث خطأ أثناء جلب بيانات العميل',
        variant: "destructive",
      });
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