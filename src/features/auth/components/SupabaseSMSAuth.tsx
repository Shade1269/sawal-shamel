import React, { useState } from 'react';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageSquare, ArrowRight, ArrowLeft, Store, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatformPhoneAuth } from '@/hooks/usePlatformPhoneAuth';
const SupabaseSMSAuth = () => {
  const [step, setStep] = useState<'phone' | 'role' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [selectedRole, setSelectedRole] = useState<'affiliate' | 'merchant'>('affiliate');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false); // تتبع ما إذا كان المستخدم موجوداً
  const navigate = useNavigate();
  const {
    sendOTP,
    verifyOTP,
    loading,
    verifying
  } = usePlatformPhoneAuth();

  // Countdown effect
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [cooldown]);
  const sanitizePhone = (raw: string) => raw.replace(/\s|-/g, '');
  const fullPhone = () => {
    const raw = sanitizePhone(phoneNumber);
    return raw.startsWith('+') ? raw : `${countryCode}${raw}`;
  };
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = fullPhone();
    if (!phone || phone.length < 7) {
      return;
    }
    const result = await sendOTP(phone);
    if (result.success) {
      setInlineError(null);

      // إذا كان المستخدم موجود، نتخطى خطوة اختيار الدور
      if (result.isExistingUser && result.existingRole) {
        setIsExistingUser(true);
        setSelectedRole(result.existingRole);
        setStep('verify');
      } else {
        // مستخدم جديد - نذهب لاختيار الدور
        setIsExistingUser(false);
        setStep('role');
      }
    } else {
      if (result.code === 'COOLDOWN') {
        const secs = result.cooldownSeconds || 30;
        setCooldown(secs);
        setInlineError(`تم إنشاء طلبات عديدة. الرجاء الانتظار ${secs} ثانية قبل طلب رمز جديد`);
      } else if (result.code === 'INSUFFICIENT_BALANCE') {
        setInlineError('الخدمة غير متاحة مؤقتاً (نفاد رصيد الرسائل). استخدم تسجيل الدخول بالبريد الإلكتروني مؤقتاً.');
      } else {
        setInlineError(result.error || 'حدث خطأ أثناء إرسال الرمز');
      }
    }
  };
  const handleRoleSelection = () => {
    setStep('verify');
  };
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      return;
    }
    const result = await verifyOTP(fullPhone(), otp, selectedRole);
    if (result.success) {
      // إعادة تحميل الجلسة والانتقال للصفحة المناسبة
      setTimeout(() => {
        window.location.href = selectedRole === 'affiliate' ? '/affiliate' : '/merchant';
      }, 1000);
    }
  };
  const handleResendOTP = async () => {
    await sendOTP(fullPhone());
  };
  const handleBack = () => {
    if (step === 'verify') {
      // إذا كان المستخدم موجوداً، نرجع للهاتف مباشرة
      // إذا كان مستخدم جديد، نرجع لاختيار الدور
      setStep(isExistingUser ? 'phone' : 'role');
      setOtp('');
    } else if (step === 'role') {
      setStep('phone');
    }
  };
  return <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary-dark">
          <MessageSquare className="h-6 w-6 text-primary" />
          تسجيل الدخول عبر SMS
        </CardTitle>
        <CardDescription className="bg-accent-glow">
          {step === 'phone' ? 'أدخل رقم هاتفك لإرسال رمز التحقق' : step === 'role' ? 'اختر نوع حسابك' : isExistingUser ? 'مرحباً بك مرة أخرى! أدخل الرمز المرسل إلى هاتفك' : 'أدخل الرمز المرسل إلى هاتفك'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === 'phone' ? <form onSubmit={handleSendOTP} className="space-y-4" dir="rtl">
            <div className="space-y-2 border-primary-dark">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="flex gap-2" dir="ltr">
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-24 px-3 py-2 bg-background border border-input rounded-md">
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+965">🇰🇼 +965</option>
                  <option value="+973">🇧🇭 +973</option>
                  <option value="+974">🇶🇦 +974</option>
                  <option value="+968">🇴🇲 +968</option>
                  <option value="+20">🇪🇬 +20</option>
                  <option value="+962">🇯🇴 +962</option>
                </select>
                <Input id="phone" type="tel" placeholder="501234567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="flex-1" dir="ltr" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !phoneNumber.trim()}>
              {loading ? <>
                  <span className="animate-spin mr-2">⏳</span>
                  جاري الإرسال...
                </> : <>
                  إرسال رمز التحقق
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </>}
            </Button>
          </form> : step === 'role' ? <div className="space-y-4" dir="rtl">
            <RadioGroup value={selectedRole} onValueChange={value => setSelectedRole(value as 'affiliate' | 'merchant')} className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="affiliate" id="affiliate" />
                <Label htmlFor="affiliate" className="flex-1 cursor-pointer flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">مسوق</div>
                    <div className="text-sm text-muted-foreground">انضم كمسوق بالعمولة وابدأ في تسويق المنتجات</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="merchant" id="merchant" />
                <Label htmlFor="merchant" className="flex-1 cursor-pointer flex items-center gap-3">
                  <Store className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">تاجر</div>
                    <div className="text-sm text-muted-foreground">أضف منتجاتك واعمل مع المسوقين</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                <ArrowRight className="ml-2 h-4 w-4" />
                رجوع
              </Button>
              <Button type="button" className="flex-1" onClick={handleRoleSelection}>
                متابعة
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div> : <form onSubmit={handleVerifyOTP} className="space-y-4" dir="rtl">
            <div className="space-y-2">
              <Label htmlFor="otp">رمز التحقق</Label>
              <Input id="otp" type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} dir="ltr" className="text-center text-2xl tracking-widest" />
              <p className="text-sm text-muted-foreground text-center">
                تم إرسال الرمز إلى {fullPhone()}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={verifying || otp.length !== 6}>
              {verifying ? <>
                  <span className="animate-spin mr-2">⏳</span>
                  جاري التحقق...
                </> : <>
                  تحقق من الرمز
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </>}
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleBack} disabled={verifying}>
                <ArrowRight className="ml-2 h-4 w-4" />
                رجوع
              </Button>
              <Button type="button" variant="ghost" className="flex-1" onClick={handleResendOTP} disabled={loading}>
                إعادة إرسال الرمز
              </Button>
            </div>
          </form>}
      </CardContent>
    </Card>;
};
export default SupabaseSMSAuth;