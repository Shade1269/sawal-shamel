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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Setup reCAPTCHA when component mounts
    const timer = setTimeout(() => {
      setupRecaptcha('recaptcha-container');
    }, 1000);

    return () => clearTimeout(timer);
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

      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const result = await sendSMSOTP(fullPhoneNumber, recaptchaVerifier);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep('verify');
        toast({
          title: "تم الإرسال",
          description: "تم إرسال رمز التحقق إلى هاتفك"
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
          description: "مرحباً بك في المنصة!"
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
      // Check if user exists in Supabase profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', firebaseUser.phoneNumber)
        .single();

      if (!existingProfile) {
        // Create new profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .insert({
            phone: firebaseUser.phoneNumber,
            full_name: firebaseUser.phoneNumber, // Use phone as default name
            role: 'affiliate'
          });

        if (error) {
          console.error('Error creating Supabase profile:', error);
        }
      }
    } catch (error) {
      console.error('Error handling Supabase user:', error);
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
          تسجيل عبر SMS
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
              {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
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