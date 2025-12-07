import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  ConfirmationResult
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { saveUserToFirestore, updateUserInFirestore } from '@/lib/firestore';
import UsernameRegistration from './UsernameRegistration';
import { createRecaptchaManager } from '../utils/recaptchaManager';
import type { RecaptchaManager } from '../utils/recaptchaManager';

const FirebaseSMSAuth = () => {
  const [step, setStep] = useState<'phone' | 'verify' | 'username'>('phone');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [otp, setOtp] = useState('');
  const [_username, setUsername] = useState('');
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createVerifier = useCallback(async () => {
    const auth = await getFirebaseAuth();

    return new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        toast({
          title: 'انتهت صلاحية التحقق',
          description: 'يرجى المحاولة مرة أخرى',
          variant: 'destructive'
        });
      }
    });
  }, [toast]);

  const resetRecaptchaContainer = useCallback(async () => {
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = '';
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  const recaptchaManagerRef = useRef<RecaptchaManager<RecaptchaVerifier> | null>(null);

  const createRecaptchaManagerInstance = useCallback(() => {
    return createRecaptchaManager<RecaptchaVerifier>({
      createInstance: createVerifier,
      resetContainer: resetRecaptchaContainer,
      onClearError: () => { /* Ignore clear errors */ },
    });
  }, [createVerifier, resetRecaptchaContainer]);

  const initializeRecaptcha = useCallback(async (forceReset = false) => {
    if (!recaptchaManagerRef.current) {
      recaptchaManagerRef.current = createRecaptchaManagerInstance();
    }

    try {
      return await recaptchaManagerRef.current.initialize(forceReset);
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      throw error;
    }
  }, [createRecaptchaManagerInstance]);

  useEffect(() => {
    const manager = createRecaptchaManagerInstance();
    recaptchaManagerRef.current = manager;

    manager.initialize().catch(error => {
      if (error) {
        console.error('Error during initial reCAPTCHA setup:', error);
      }
    });

    return () => {
      manager.cleanup();
      if (recaptchaManagerRef.current === manager) {
        recaptchaManagerRef.current = null;
      }
    };
  }, [createRecaptchaManagerInstance]);

  const sanitizePhone = (raw: string) => raw.replace(/\s|-/g, '');

  const fullPhone = () => {
    const raw = sanitizePhone(phoneNumber);
    return raw.startsWith('+') ? raw : `${countryCode}${raw}`;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const phone = fullPhone();
    if (!phone || phone.length < 7) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم هاتف صحيح', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const auth = await getFirebaseAuth();
      const verifier = await initializeRecaptcha();

      if (!verifier) {
        toast({ title: 'خطأ', description: 'لم يتم تهيئة نظام التحقق بعد', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      // للتسجيل الجديد - التحقق من عدم وجود المستخدم
      if (mode === 'signup') {
        const userExists = await checkUserExists(phone);
        if (userExists) {
          toast({
            title: 'الحساب موجود مسبقاً',
            description: 'يوجد حساب مرتبط بهذا الرقم. يرجى تسجيل الدخول بدلاً من ذلك.',
            variant: 'destructive',
            action: (
              <Button
                size="sm"
                onClick={() => setMode('signin')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                تسجيل الدخول
              </Button>
            ),
          });
          setIsLoading(false);
          return;
        }
      }
      
      // لتسجيل الدخول - التحقق من وجود المستخدم
      if (mode === 'signin') {
        const userExists = await checkUserExists(phone);
        if (!userExists) {
          toast({
            title: 'الحساب غير موجود',
            description: 'لا يوجد حساب مرتبط بهذا الرقم. يرجى إنشاء حساب جديد أولاً.',
            variant: 'destructive',
            action: (
              <Button
                size="sm"
                onClick={() => setMode('signup')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                إنشاء حساب
              </Button>
            ),
          });
          setIsLoading(false);
          return;
        }
      }

      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(confirmation);
      setStep('verify');
      
      toast({
        title: 'تم الإرسال',
        description: `تم إرسال رمز التحقق إلى ${phone}`,
      });
    } catch (error: any) {
      console.error('Firebase SMS error:', error);
      let msg = error?.message || 'فشل في إرسال رمز التحقق';
      
      if (msg.includes('too-many-requests')) {
        msg = 'تم تجاوز حد الإرسال. حاول لاحقاً.';
      } else if (msg.includes('invalid-phone-number')) {
        msg = 'تنسيق رقم الهاتف غير صحيح.';
      } else if (msg.includes('لا يوجد حساب')) {
        msg = error.message;
      }
      
      toast({ title: 'خطأ في الإرسال', description: msg, variant: 'destructive' });
      
      // إعادة تعيين reCAPTCHA
      await initializeRecaptcha(true);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserExists = async (phone: string): Promise<boolean> => {
    try {
      // البحث في Firestore عن مستخدم بهذا الرقم
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const { getFirebaseApp } = await import('@/lib/firebase');
      
      const app = await getFirebaseApp();
      const db = getFirestore(app);
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking user existence:', error);
      
      // البحث في Supabase كذلك
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', phone)
          .maybeSingle();
        
        return !!data;
      } catch (supabaseError) {
        console.error('Error checking Supabase profiles:', supabaseError);
        return false;
      }
    }
  };

  const ensureProfile = async (firebaseUser: any, phone: string, username?: string) => {
    try {
      // إنشاء/تحديث ملف المستخدم في Firebase
      if (mode === 'signup') {
        const result = await saveUserToFirestore(firebaseUser, {
          phone,
          displayName: username || phone,
          fullName: username || phone,
          username: username || phone,
          role: 'affiliate'
        });
        
        if (!result.success) {
          throw new Error('فشل في إنشاء الملف الشخصي في Firebase');
        }
      } else {
        await updateUserInFirestore(firebaseUser.uid, {
          phone,
          lastLoginAt: new Date(),
          lastActivityAt: new Date()
        });
      }

      // إنشاء/تحديث ملف المستخدم في Supabase
      await ensureSupabaseProfile(firebaseUser, phone, username);
      
    } catch (error) {
      console.error('Error ensuring profile:', error);
      throw error;
    }
  };

  const ensureSupabaseProfile = async (firebaseUser: any, phone: string, _username?: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // إنشاء session في Supabase باستخدام Firebase JWT
      await firebaseUser.getIdToken();
      
      // محاولة تسجيل الدخول في Supabase باستخدام Firebase token
      try {
        // إنشاء مستخدم جديد في Supabase Auth
        const { error: authError } = await supabase.auth.signUp({
          email: `${phone.replace('+', '')}@temp.com`, // ايميل مؤقت
          password: firebaseUser.uid.substring(0,20) + 'Pass123!', // كلمة مرور قوية مؤقتة
          options: {
            data: {
              phone: phone,
              full_name: phone,
              firebase_uid: firebaseUser.uid,
            }
          }
        });

        if (authError && !authError.message.includes('already registered')) {
          console.error('Error creating Supabase auth user:', authError);
        }
      } catch (error) {
        console.error('Error with Supabase auth:', error);
      }

      // التحقق من وجود المستخدم في profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (existingProfile) {
        // Profile already exists
        return;
      }

      // إنشاء مستخدم جديد في profiles باستخدام edge function
      const response = await fetch('https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/create-phone-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VpaW9wa2N0ZHRhZXhtdHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjE2ODUsImV4cCI6MjA3MTg5NzY4NX0._q03bmVxGQhCczoBaOHM6mIGbA7_B4B7PZ5mhDefuFA`
        },
        body: JSON.stringify({
          phone,
          full_name: _username || phone,
          firebase_uid: firebaseUser.uid
        })
      });

      if (response.ok) {
        await response.json();
      }
      // Profile will be created on next login if edge function fails
    } catch {
      // Profile creation deferred - Firebase authentication succeeded
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رمز التحقق', variant: 'destructive' });
      return;
    }

    if (!confirmationResult) {
      toast({ title: 'خطأ', description: 'لم يتم العثور على طلب التحقق', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const verifiedUser = result.user;
      
      if (verifiedUser) {
        if (mode === 'signup') {
          // للمستخدمين الجدد، انتقل لخطوة اسم المستخدم
          setFirebaseUser(verifiedUser);
          setStep('username');
          toast({ 
            title: 'تم التحقق بنجاح!', 
            description: 'الآن اختر اسم المستخدم الذي سيظهر في المحادثات',
          });
        } else {
          // لتسجيل الدخول، أكمل العملية مباشرة
          await ensureProfile(verifiedUser, fullPhone());
          toast({ 
            title: 'مرحباً بعودتك!', 
            description: 'تم تسجيل دخولك بنجاح.'
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Firebase OTP verification error:', error);
      let msg = error?.message || 'رمز التحقق غير صحيح';
      
      if (msg.includes('invalid-verification-code')) {
        msg = 'رمز التحقق غير صحيح';
      } else if (msg.includes('code-expired')) {
        msg = 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.';
      }
      
      toast({ title: 'خطأ في التحقق', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);

    try {
      // إعادة تعيين reCAPTCHA تماماً وإنشاء مثيل جديد
      const verifier = await initializeRecaptcha(true);
      const auth = await getFirebaseAuth();

      if (!verifier) {
        toast({ title: 'خطأ', description: 'لم يتم تهيئة نظام التحقق بعد', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      // إرسال رمز جديد
      const phone = fullPhone();
      if (!phone || phone.length < 7) {
        toast({ title: 'خطأ', description: 'يرجى إدخال رقم هاتف صحيح', variant: 'destructive' });
        return;
      }

      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(confirmation);

      toast({
        title: 'تم الإرسال',
        description: `تم إرسال رمز التحقق الجديد إلى ${phone}`,
      });
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      let msg = error?.message || 'فشل في إعادة إرسال الرمز';
      
      if (msg.includes('too-many-requests')) {
        msg = 'تم تجاوز حد الإرسال. حاول لاحقاً.';
      } else if (msg.includes('invalid-phone-number')) {
        msg = 'تنسيق رقم الهاتف غير صحيح.';
      } else if (msg.includes('reCAPTCHA')) {
        msg = 'مشكلة في نظام التحقق. يرجى إعادة تحميل الصفحة.';
      }
      
      toast({ title: 'خطأ في إعادة الإرسال', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = async (usernameInput: string) => {
    if (!firebaseUser) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على بيانات المستخدم',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await ensureProfile(firebaseUser, fullPhone(), usernameInput);
      
      toast({ 
        title: 'تم إنشاء الحساب بنجاح!', 
        description: `مرحباً ${usernameInput}! تم إنشاء حسابك بنجاح`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error completing registration:', error);
      toast({
        title: 'خطأ في إكمال التسجيل',
        description: 'فشل في إكمال عملية التسجيل. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'username') {
      setStep('verify');
      setUsername('');
      setFirebaseUser(null);
    } else {
      setStep('phone');
      setOtp('');
      setConfirmationResult(null);
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            {mode === 'signup' ? 'إنشاء حساب عبر SMS' : 'تسجيل دخول عبر SMS'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'أدخل رقم هاتفك لإرسال رمز التحقق' 
              : step === 'verify' 
                ? 'أدخل رمز التحقق المرسل إلى هاتفك'
                : 'اختر اسم المستخدم الذي سيظهر في المحادثات'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    mode === 'signup' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  إنشاء حساب جديد
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    mode === 'signin' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  تسجيل دخول
                </button>
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+968">🇴🇲 +968</option>
                    <option value="+20">🇪🇬 +20</option>
                  </select>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="501234567"
                    required
                    className="text-right flex-1"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <MessageSquare className="ml-2 h-4 w-4" />
                {isLoading ? 'جاري الإرسال...' : 
                  mode === 'signup' ? 'إرسال رمز التحقق للتسجيل' : 'إرسال رمز التحقق للدخول'
                }
              </Button>
            </form>
          ) : step === 'verify' ? (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2 text-right">
                <Label htmlFor="otp">رمز التحقق</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="أدخل الرمز المكون من 6 أرقام"
                  required
                  className="text-right"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                  رجوع
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  <Shield className="ml-2 h-4 w-4" />
                  {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleResendOTP()}
                  disabled={isLoading}
                >
                  إعادة إرسال الرمز
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <UsernameRegistration
                onUsernameSubmit={handleUsernameSubmit}
                isLoading={isLoading}
              />
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  رجوع للخطوة السابقة
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default FirebaseSMSAuth;