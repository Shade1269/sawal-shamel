import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, Lock } from 'lucide-react';
import { useCustomerOTP } from '@/hooks/useCustomerOTP';

interface CheckoutOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (sessionId: string, phone: string) => void;
  storeId: string;
  initialPhone?: string;
}

export const CheckoutOTPModal: React.FC<CheckoutOTPModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  storeId,
  initialPhone = '',
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  
  const {
    sendOTP,
    verifyOTP,
    loading,
    verifying,
    getCustomerSession,
  } = useCustomerOTP(storeId);

  useEffect(() => {
    if (isOpen) {
      // التحقق من وجود جلسة نشطة
      const existingSession = getCustomerSession();
      if (existingSession?.sessionId) {
        onVerified(existingSession.sessionId, existingSession.phone);
        onClose();
      }
    }
  }, [isOpen, getCustomerSession, onVerified, onClose]);

  const handleSendOTP = async () => {
    const result = await sendOTP(phone);
    if (result.success) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(phone, otp);
    if (result.success && result.sessionId) {
      onVerified(result.sessionId, phone);
      onClose();
    }
  };

  const handleClose = () => {
    setStep('phone');
    setOtp('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'phone' ? 'التحقق من رقم الجوال' : 'إدخال رمز التحقق'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'phone'
              ? 'يرجى إدخال رقم جوالك لإرسال رمز التحقق'
              : `تم إرسال رمز التحقق إلى ${phone}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'phone' ? (
            <>
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
                  dir="ltr"
                  className="text-center"
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={!phone.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال رمز التحقق'
                )}
              </Button>
            </>
          ) : (
            <>
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
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  dir="ltr"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || verifying}
                  className="flex-1"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    'تأكيد الرمز'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('phone')}
                  disabled={verifying}
                >
                  تغيير الرقم
                </Button>
              </div>
            </>
          )}
        </div>
        
        {/* reCAPTCHA container */}
        <div id="storefront-customer-recaptcha" />
      </DialogContent>
    </Dialog>
  );
};
