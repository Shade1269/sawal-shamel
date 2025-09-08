import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SupabaseSMSAuth = () => {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;

      setStep('verify');
      toast({
        title: 'تم الإرسال',
        description: `تم إرسال رمز التحقق إلى ${phone}.`,
      });
    } catch (error: any) {
      console.error('Supabase signInWithOtp error:', error);
      let msg = error?.message || 'فشل في إرسال رمز التحقق';
      if (msg.includes('Over rate limit')) msg = 'تم تجاوز حد الإرسال. حاول لاحقاً.';
      if (msg.includes('Invalid phone')) msg = 'تنسيق رقم الهاتف غير صحيح.';
      toast({ title: 'خطأ في الإرسال', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const ensureProfile = async (authUserId: string, phone: string) => {
    if (mode === 'signup') {
      // للتسجيل الجديد - إنشاء ملف شخصي جديد
      const { error } = await supabase
        .from('profiles')
        .insert({ auth_user_id: authUserId, phone, full_name: phone, role: 'affiliate' });
      if (error && !error.message.includes('duplicate')) {
        console.error('profile insert error:', error);
      }
    } else {
      // لتسجيل الدخول - التحقق من وجود الملف الشخصي
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (!existingProfile) {
        throw new Error('لا يوجد حساب مرتبط بهذا الرقم. يرجى إنشاء حساب جديد أولاً.');
      }
      
      // إذا كان الحساب موجود، تحديث auth_user_id إذا لزم الأمر
      await supabase
        .from('profiles')
        .update({ auth_user_id: authUserId })
        .eq('phone', phone);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const phone = fullPhone();
    if (!otp.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رمز التحقق', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;

      const sessionUserId = data.session?.user?.id;
      if (sessionUserId) await ensureProfile(sessionUserId, phone);

      toast({ 
        title: 'تم التحقق بنجاح', 
        description: mode === 'signup' ? 'تم إنشاء حسابك بنجاح!' : 'مرحباً بعودتك!' 
      });
      navigate('/');
    } catch (error: any) {
      console.error('Supabase verifyOtp error:', error);
      let msg = error?.message || 'رمز التحقق غير صحيح';
      if (msg.toLowerCase().includes('expired')) msg = 'انتهت صلاحية الرمز. اطلب رمزاً جديداً.';
      toast({ title: 'خطأ في التحقق', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
  };

  return (
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
  );
};

export default SupabaseSMSAuth;
