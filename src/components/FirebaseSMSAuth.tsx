import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { saveUserToFirestore, getUserFromFirestore, updateUserInFirestore } from '@/lib/firestore';

const FirebaseSMSAuth = () => {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // إعداد reCAPTCHA
  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        const auth = await getFirebaseAuth();
        
        // إنشاء RecaptchaVerifier
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            toast({
              title: 'انتهت صلاحية التحقق',
              description: 'يرجى المحاولة مرة أخرى',
              variant: 'destructive'
            });
          }
        });
        
        setRecaptchaVerifier(verifier);
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
      }
    };

    initRecaptcha();

    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

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

    if (!recaptchaVerifier) {
      toast({ title: 'خطأ', description: 'لم يتم تهيئة نظام التحقق بعد', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const auth = await getFirebaseAuth();
      
      // للتحقق من وجود المستخدم في حالة تسجيل الدخول
      if (mode === 'signin') {
        const userExists = await checkUserExists(phone);
        if (!userExists) {
          throw new Error('لا يوجد حساب مرتبط بهذا الرقم. يرجى إنشاء حساب جديد أولاً.');
        }
      }

      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
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
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        const auth = await getFirebaseAuth();
        const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
        setRecaptchaVerifier(newVerifier);
      }
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
      return false;
    }
  };

  const ensureProfile = async (firebaseUser: any, phone: string) => {
    try {
      // إنشاء/تحديث ملف المستخدم في Firebase
      if (mode === 'signup') {
        const result = await saveUserToFirestore(firebaseUser, {
          phone,
          displayName: phone,
          fullName: phone,
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
      await ensureSupabaseProfile(firebaseUser, phone);
      
    } catch (error) {
      console.error('Error ensuring profile:', error);
      throw error;
    }
  };

  const ensureSupabaseProfile = async (firebaseUser: any, phone: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // إنشاء session في Supabase باستخدام Firebase JWT
      const firebaseToken = await firebaseUser.getIdToken();
      
      // محاولة تسجيل الدخول في Supabase باستخدام Firebase token
      try {
        // إنشاء مستخدم جديد في Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
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
        console.log('Profile already exists, updating activity');
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
          full_name: phone,
          firebase_uid: firebaseUser.uid
        })
      });

      if (!response.ok) {
        console.log('Edge function not available, profile will be created on next login');
      } else {
        const result = await response.json();
        console.log('Profile created via edge function:', result);
      }
    } catch (error) {
      console.error('Error ensuring Supabase profile:', error);
      // لا نرمي خطأ هنا لأن Firebase authentication نجح
      console.log('Profile creation deferred');
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
      const firebaseUser = result.user;
      
      if (firebaseUser) {
        await ensureProfile(firebaseUser, fullPhone());
        
        toast({ 
          title: 'تم التحقق بنجاح', 
          description: mode === 'signup' ? 'تم إنشاء حسابك بنجاح!' : 'مرحباً بعودتك!' 
        });
        navigate('/');
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

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setConfirmationResult(null);
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
            {step === 'phone' ? 'أدخل رقم هاتفك لإرسال رمز التحقق' : 'أدخل رمز التحقق المرسل إلى هاتفك'}
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
          ) : (
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
                <Button type="button" variant="ghost" size="sm" onClick={handleSendOTP} disabled={isLoading}>
                  إعادة إرسال الرمز
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default FirebaseSMSAuth;