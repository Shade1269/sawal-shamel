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
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { auth_user_id: authUserId, phone, full_name: phone, role: 'affiliate' },
        { onConflict: 'auth_user_id' }
      );
    if (error) console.error('profile upsert error:', error);
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

      toast({ title: 'تم التحقق بنجاح', description: 'مرحباً بك!' });
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
          تسجيل/دخول عبر SMS (Supabase)
        </CardTitle>
        <CardDescription>
          {step === 'phone' ? 'أدخل رقم هاتفك لإرسال رمز التحقق' : 'أدخل رمز التحقق المرسل إلى هاتفك'}
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

            <Button type="submit" className="w-full" disabled={isLoading}>
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
