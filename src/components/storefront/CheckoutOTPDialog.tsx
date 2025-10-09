import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCustomerOTP } from '@/hooks/useCustomerOTP';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';

interface CheckoutOTPDialogProps {
  open: boolean;
  storeId?: string;
  initialPhone: string;
  onClose: () => void;
  onVerified: (phone: string) => void;
}

type OTPDialogStep = 'phone' | 'code' | 'success';

const sanitizePhone = (value: string) => value.replace(/[^0-9+]/g, '');

const normalizeNationalPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('966')) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('0')) {
    return digits;
  }

  if (digits.startsWith('5')) {
    return `0${digits}`;
  }

  return digits;
};

export const CheckoutOTPDialog: React.FC<CheckoutOTPDialogProps> = ({
  open,
  storeId,
  initialPhone,
  onClose,
  onVerified,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<OTPDialogStep>('phone');
  const [phone, setPhone] = useState(initialPhone);
  const [otpCode, setOtpCode] = useState('');
  const [autoSent, setAutoSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { sendOTP, verifyOTP, loading, verifying } = useCustomerOTP(storeId || '');

  const formattedPhone = useMemo(() => sanitizePhone(phone), [phone]);

  useEffect(() => {
    if (open) {
      setPhone(initialPhone);
      setStep('phone');
      setOtpCode('');
      setAutoSent(false);
    }
  }, [open, initialPhone]);

  useEffect(() => {
    if (!open || step !== 'phone' || autoSent) return;
    if (!formattedPhone || formattedPhone.length < 6) return;

    void handleSendOTP();
  }, [open, step, autoSent, formattedPhone, handleSendOTP]);

  useEffect(() => {
    if (!open || resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, resendCooldown]);

  const handleSendOTP = useCallback(async () => {
    if (!formattedPhone) {
      toast({
        title: 'رقم الجوال مطلوب',
        description: 'يرجى إدخال رقم الجوال قبل إرسال كود التحقق',
        variant: 'destructive',
      });
      return;
    }

    const result = await sendOTP(formattedPhone);
    if (result.success) {
      setStep('code');
      setAutoSent(true);
      setResendCooldown(45);
    }
  }, [formattedPhone, sendOTP, toast]);

  const handleVerifyOTP = async () => {
    if (otpCode.trim().length !== 6) {
      toast({
        title: 'كود غير صحيح',
        description: 'يرجى إدخال كود مكون من 6 أرقام',
        variant: 'destructive',
      });
      return;
    }

    const result = await verifyOTP(formattedPhone, otpCode.trim());
    if (result.success) {
      setStep('success');
      const normalized = normalizeNationalPhone(formattedPhone);
      onVerified(normalized || formattedPhone);
    }
  };

  const handleClose = () => {
    if (verifying || loading) return;
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5" />
            توثيق رقم الجوال
          </DialogTitle>
          <DialogDescription>
            حفاظًا على أمان طلبك، نحتاج لتوثيق رقم الجوال قبل إتمام الطلب.
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="checkout-otp-phone">رقم الجوال</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="checkout-otp-phone"
                  dir="ltr"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="05xxxxxxxx"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                إلغاء
              </Button>
              <Button onClick={handleSendOTP} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال الكود'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="checkout-otp-code">أدخل كود التحقق</Label>
              <Input
                id="checkout-otp-code"
                dir="ltr"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="tracking-widest text-center text-2xl"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ''))}
                placeholder="123456"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                تم إرسال الكود إلى {formattedPhone}
              </p>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="ghost" onClick={() => setStep('phone')} disabled={verifying}>
                تعديل الرقم
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={loading || resendCooldown > 0}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : resendCooldown > 0 ? (
                    `إعادة الإرسال خلال ${resendCooldown}s`
                  ) : (
                    'إعادة الإرسال'
                  )}
                </Button>
                <Button onClick={handleVerifyOTP} disabled={verifying || otpCode.length !== 6}>
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    'تأكيد'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">تم التحقق بنجاح</h3>
              <p className="text-sm text-muted-foreground">
                يمكنك الآن إكمال طلبك بنفس الصفحة دون فقدان البيانات.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>متابعة</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutOTPDialog;
