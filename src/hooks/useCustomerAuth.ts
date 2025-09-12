import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerProfile {
  id: string;
  profile_id: string;
  auth_user_id: string;
  phone: string;
  email?: string;
  full_name: string;
  role: string;
  is_active: boolean;
  customer_data?: {
    id: string;
    total_orders: number;
    total_spent_sar: number;
    loyalty_points: number;
  };
}

interface CustomerSession {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useCustomerAuth = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<CustomerSession>({
    customer: null,
    isAuthenticated: false,
    isLoading: false
  });

  // إرسال كود OTP
  const sendOTP = useCallback(async (phone: string, storeId?: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));
      
      // توليد كود OTP (في بيئة الإنتاج سيتم إرساله عبر SMS)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // حفظ جلسة OTP في قاعدة البيانات
      const { error } = await supabase
        .from('customer_otp_sessions')
        .insert({
          phone,
          otp_code: otpCode,
          store_id: storeId,
          session_data: { timestamp: new Date().toISOString() }
        });

      if (error) throw error;

      // في بيئة التطوير، نعرض الكود في التوست
      toast({
        title: "تم إرسال كود التحقق",
        description: `كود التحقق: ${otpCode} (للاختبار فقط)`,
        duration: 10000,
      });

      return { success: true, otpCode }; // فقط للاختبار
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال الكود",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setSession(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  // التحقق من كود OTP وتسجيل الدخول
  const verifyOTP = useCallback(async (phone: string, otpCode: string, storeId?: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));

      // التحقق من كود OTP
      const { data, error } = await supabase.rpc('verify_customer_otp', {
        p_phone: phone,
        p_otp_code: otpCode,
        p_store_id: storeId
      });

      if (error) throw error;

      const result = data as any;
      if (!result?.success) {
        throw new Error(result?.error || 'فشل في التحقق من الكود');
      }

      // جلب بيانات العميل كاملة
      const customerData = await fetchCustomerProfile(phone);
      
      if (customerData) {
        setSession({
          customer: customerData,
          isAuthenticated: true,
          isLoading: false
        });

        // حفظ الجلسة في localStorage مع خاصية "تذكرني"
        localStorage.setItem('customer_session', JSON.stringify({
          customer: customerData,
          timestamp: new Date().toISOString(),
          store_id: storeId
        }));

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${customerData.full_name}`,
        });

        return { success: true, customer: customerData };
      }

      throw new Error('فشل في جلب بيانات العميل');
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setSession(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  // جلب بيانات العميل
  const fetchCustomerProfile = useCallback(async (phone: string): Promise<CustomerProfile | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          auth_user_id,
          phone,
          email,
          full_name,
          role,
          is_active,
          customers (
            id,
            total_orders,
            total_spent_sar,
            loyalty_points
          )
        `)
        .eq('phone', phone)
        .eq('role', 'customer')
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) return null;

      return {
        id: profile.id,
        profile_id: profile.id,
        auth_user_id: profile.auth_user_id,
        phone: profile.phone,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
        customer_data: profile.customers?.[0] || null
      };
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  }, []);

  // تسجيل الخروج
  const signOut = useCallback(() => {
    setSession({
      customer: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('customer_session');
    
    toast({
      title: "تم تسجيل الخروج",
      description: "شكراً لاستخدام متجرنا",
    });
  }, [toast]);

  // التحقق من الجلسة المحفوظة
  const checkStoredSession = useCallback(async () => {
    try {
      const storedSession = localStorage.getItem('customer_session');
      if (!storedSession) return;

      const parsedSession = JSON.parse(storedSession);
      const sessionTimestamp = new Date(parsedSession.timestamp);
      const now = new Date();
      
      // التحقق من انتهاء صلاحية الجلسة (30 يوم)
      const daysDiff = (now.getTime() - sessionTimestamp.getTime()) / (1000 * 3600 * 24);
      if (daysDiff > 30) {
        localStorage.removeItem('customer_session');
        return;
      }

      // التحقق من صحة البيانات
      const currentData = await fetchCustomerProfile(parsedSession.customer.phone);
      if (currentData) {
        setSession({
          customer: currentData,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        localStorage.removeItem('customer_session');
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
      localStorage.removeItem('customer_session');
    }
  }, [fetchCustomerProfile]);

  // تحديث بيانات العميل
  const updateCustomerProfile = useCallback(async (updates: Partial<CustomerProfile>) => {
    if (!session.customer) return { success: false, error: 'لا يوجد عميل مسجل دخول' };

    try {
      setSession(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          email: updates.email
        })
        .eq('id', session.customer.profile_id);

      if (error) throw error;

      // تحديث البيانات المحلية
      const updatedCustomer = { ...session.customer, ...updates };
      setSession(prev => ({
        ...prev,
        customer: updatedCustomer,
        isLoading: false
      }));

      // تحديث الجلسة المحفوظة
      const storedSession = localStorage.getItem('customer_session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        parsedSession.customer = updatedCustomer;
        localStorage.setItem('customer_session', JSON.stringify(parsedSession));
      }

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
    } finally {
      setSession(prev => ({ ...prev, isLoading: false }));
    }
  }, [session.customer, toast]);

  return {
    // البيانات
    customer: session.customer,
    isAuthenticated: session.isAuthenticated,
    isLoading: session.isLoading,

    // الوظائف
    sendOTP,
    verifyOTP,
    signOut,
    checkStoredSession,
    updateCustomerProfile,
    fetchCustomerProfile
  };
};