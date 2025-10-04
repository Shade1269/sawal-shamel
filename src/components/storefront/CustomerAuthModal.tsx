import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeSlug: string;
  storeName: string;
}

/**
 * مودال بسيط لتسجيل دخول العملاء
 * يستخدم رقم الجوال + OTP فقط
 */
export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  storeId,
  storeSlug,
  storeName
}) => {
  const { isLoading, sendOTP, verifyOTP, isAuthenticated } = useCustomerAuthContext();
  const [step, setStep] = useState<'phone' | 'otp' | 'authenticated'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      const result = await sendOTP(phone, storeId);
      if (result.success) {
        setStep('otp');
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim()) {
      const result = await verifyOTP(phone, otp, storeId);
      if (result.success) {
        setStep('authenticated');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  // Reset when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhone('');
      setOtp('');
    }
  }, [isOpen]);

  // Check if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && isOpen) {
      setStep('authenticated');
    }
  }, [isAuthenticated, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            تسجيل الدخول
          </DialogTitle>
          <DialogDescription className="text-center">
            سجل دخولك لتتبع طلباتك في {storeName}
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="p-6 space-y-6">
            {/* خطوة 1: رقم الجوال */}
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    رقم الجوال
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-lg text-right"
                    dir="ltr"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    سنرسل لك رمز تحقق عبر رسالة نصية
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={isLoading || !phone.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Phone className="h-5 w-5 ml-2" />
                      إرسال رمز التحقق
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* خطوة 2: رمز التحقق */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    رمز التحقق
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="text-2xl text-center tracking-widest font-mono"
                    dir="ltr"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    أدخل الرمز المكون من 6 أرقام المرسل إلى {phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 ml-2" />
                        تحقق
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => sendOTP(phone, storeId)}
                    disabled={isLoading}
                  >
                    إعادة إرسال الرمز
                  </Button>
                </div>
              </form>
            )}

            {/* خطوة 3: تم التحقق */}
            {step === 'authenticated' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">تم تسجيل الدخول بنجاح!</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    يمكنك الآن تتبع طلباتك ومتابعة عملياتك الشرائية
                  </p>
                </div>
                <Button 
                  onClick={onClose}
                  className="w-full"
                  size="lg"
                >
                  ابدأ التسوق
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
