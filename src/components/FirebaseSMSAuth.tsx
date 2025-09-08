import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { setupRecaptcha, sendSMSOTP, verifySMSOTP } from '@/lib/firebase';
import { MessageSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const FirebaseSMSAuth = () => {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeRecaptcha = async () => {
      try {
        await setupRecaptcha('recaptcha-container');
        console.log('reCAPTCHA initialized successfully');
      } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error);
      }
    };

    // Delay initialization slightly to ensure DOM is ready
    const timer = setTimeout(initializeRecaptcha, 500);

    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.log('Cleanup reCAPTCHA error:', error);
        }
      }
    };
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `${countryCode}${phoneNumber}`;

      // إعادة إنشاء reCAPTCHA في كل مرة لضمان عدم التداخل
      console.log('Setting up reCAPTCHA for SMS sending...');
      const recaptchaVerifier = await setupRecaptcha('recaptcha-container');

      const result = await sendSMSOTP(fullPhoneNumber, recaptchaVerifier);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep('verify');
        toast({
          title: "تم الإرسال",
          description: `تم إرسال رمز التحقق إلى ${fullPhoneNumber}. إذا لم تصلك الرسالة، تحقق من إعدادات Firebase أو جرب رقم آخر.`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "فشل في إرسال رمز التحقق",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق",
        variant: "destructive"
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على معلومات التحقق. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifySMSOTP(confirmationResult, otp);

      if (result.success) {
        // Firebase authentication successful
        const firebaseUser = result.user;
        
        // Create or update user in Supabase
        await createSupabaseUser(firebaseUser);
        
        toast({
          title: "تم التحقق بنجاح",
          description: mode === 'signup' ? "تم إنشاء حسابك بنجاح!" : "مرحباً بعودتك!"
        });
        
        navigate('/');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "خطأ في التحقق",
        description: error.message || "رمز التحقق غير صحيح",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSupabaseUser = async (firebaseUser: any) => {
    try {
      console.log('Checking/creating Supabase user for phone:', firebaseUser.phoneNumber);
      
      // Check if user exists in Supabase profiles
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', firebaseUser.phoneNumber)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      console.log('Existing profile search result:', { existingProfile, selectError });

      if (selectError) {
        console.error('Error searching for profile:', selectError);
      }

      if (!existingProfile) {
        // No existing profile found - create new one (works for both signup and signin)
        console.log('No existing profile found, creating new one...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            phone: firebaseUser.phoneNumber,
            full_name: firebaseUser.phoneNumber, // Use phone as default name
            role: 'affiliate'
          });

        if (insertError) {
          console.error('Error creating Supabase profile:', insertError);
          // Don't throw error here - user can still continue
        } else {
          console.log('Successfully created new profile');
        }
      } else {
        console.log('Found existing profile:', existingProfile);
      }
    } catch (error) {
      console.error('Error handling Supabase user:', error);
      // Don't throw error - let user continue with Firebase auth
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setConfirmationResult(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          {mode === 'signup' ? 'تسجيل عبر SMS' : 'دخول عبر SMS'}
        </CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'أدخل رقم هاتفك لإرسال رمز التحقق'
            : 'أدخل رمز التحقق المرسل إلى هاتفك'
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
                حساب جديد
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
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
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBack}
              >
                رجوع
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                <Shield className="ml-2 h-4 w-4" />
                {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
              </Button>
            </div>

            <div className="text-center">
              <Button 
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                إعادة إرسال الرمز
              </Button>
            </div>
          </form>
        )}

        {/* reCAPTCHA container - hidden */}
        <div id="recaptcha-container" className="hidden"></div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          محمي بواسطة reCAPTCHA وخدمة Firebase
        </div>
      </CardContent>
    </Card>
  );
};

export default FirebaseSMSAuth;