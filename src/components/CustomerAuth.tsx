import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Phone, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

interface CustomerAuthProps {
  storeId?: string;
  storeName?: string;
  onSuccess?: (customer: any) => void;
  onCancel?: () => void;
}

type AuthStep = 'phone' | 'otp' | 'details';

export const CustomerAuth: React.FC<CustomerAuthProps> = ({
  storeId,
  storeName,
  onSuccess,
  onCancel
}) => {
  const { sendOTP, verifyOTP, isLoading } = useCustomerAuth();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    email: ''
  });
  const [generatedOTP, setGeneratedOTP] = useState(''); // للاختبار فقط

  // إرسال كود التحقق
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) return;

    const result = await sendOTP(phone, storeId);
    if (result.success) {
      setGeneratedOTP(result.otpCode || ''); // للاختبار فقط
      setStep('otp');
    }
  };

  // التحقق من كود OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim()) return;

    const result = await verifyOTP(phone, otpCode, storeId);
    if (result.success && result.customer) {
      onSuccess?.(result.customer);
    }
  };

  // العودة للخطوة السابقة
  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtpCode('');
    } else if (step === 'details') {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold">
              {step === 'phone' ? 'تسجيل الدخول' : 
               step === 'otp' ? 'التحقق من الهاتف' : 'إكمال البيانات'}
            </CardTitle>
            <CardDescription className="mt-2">
              {storeName && (
                <div className="mb-2 text-primary font-medium">
                  متجر {storeName}
                </div>
              )}
              {step === 'phone' ? 'أدخل رقم هاتفك للمتابعة' :
               step === 'otp' ? 'أدخل كود التحقق المرسل إليك' :
               'أكمل بياناتك الشخصية'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right">رقم الجوال</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-right"
                  dir="rtl"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-right">
                  سنرسل لك كود التحقق عبر رسالة نصية
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !phone.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )}
                إرسال كود التحقق
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-right">كود التحقق</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="text-center tracking-widest text-lg"
                  maxLength={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-right">
                  تم إرسال الكود إلى {phone}
                </p>
                {generatedOTP && (
                  <p className="text-xs text-green-600 text-center bg-green-50 p-2 rounded">
                    كود التحقق للاختبار: {generatedOTP}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  تراجع
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !otpCode.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Lock className="w-4 h-4 ml-2" />
                  )}
                  تحقق
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => handleSendOTP({ preventDefault: () => {} } as any)}
                  disabled={isLoading}
                  className="text-sm"
                >
                  إعادة إرسال الكود
                </Button>
              </div>
            </form>
          )}

          {onCancel && (
            <>
              <Separator />
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="w-full"
                disabled={isLoading}
              >
                إلغاء
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};