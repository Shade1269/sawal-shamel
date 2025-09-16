import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (customerData: {
    phone: string;
    name?: string;
    email?: string;
    sessionId: string;
  }) => void;
  storeId: string;
}

type Step = 'phone' | 'otp' | 'details';

export const CustomerOTPModal: React.FC<CustomerOTPModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  storeId
}) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabasePublic.functions.invoke('send-customer-otp', {
        body: { phone, storeId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setOtpSessionId(data.sessionId);
      setStep('otp');
      toast.success('تم إرسال كود التحقق', {
        description: 'تحقق من رسائلك النصية'
      });
    },
    onError: (error) => {
      toast.error('خطأ في إرسال كود التحقق', {
        description: 'تأكد من رقم الهاتف وحاول مرة أخرى'
      });
      console.error('OTP send error:', error);
    }
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: async () => {
      if (!otpSessionId) throw new Error('No OTP session');

      const { data, error } = await supabasePublic.functions.invoke('verify-customer-otp', {
        body: { 
          sessionId: otpSessionId,
          otpCode: otpCode.trim()
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setStep('details');
        toast.success('تم التحقق بنجاح!');
      } else {
        toast.error('كود التحقق غير صحيح');
      }
    },
    onError: (error) => {
      toast.error('فشل التحقق', {
        description: 'تأكد من كود التحقق وحاول مرة أخرى'
      });
      console.error('OTP verify error:', error);
    }
  });

  const handleComplete = () => {
    if (!otpSessionId) return;
    
    onVerified({
      phone,
      name: customerName || undefined,
      email: customerEmail || undefined,
      sessionId: otpSessionId
    });
    
    // Reset form
    setStep('phone');
    setPhone('');
    setOtpCode('');
    setCustomerName('');
    setCustomerEmail('');
    setOtpSessionId(null);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Add +966 prefix if not present
    if (cleaned.length > 0 && !cleaned.startsWith('966')) {
      if (cleaned.startsWith('0')) {
        return '+966' + cleaned.substring(1);
      } else if (cleaned.startsWith('5')) {
        return '+966' + cleaned;
      }
    } else if (cleaned.startsWith('966')) {
      return '+' + cleaned;
    }
    
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        {step === 'phone' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>تسجيل دخول سريع</CardTitle>
              <CardDescription>
                أدخل رقم هاتفك لإرسال كود التحقق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+966 50 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  dir="ltr"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  إلغاء
                </Button>
                <Button 
                  onClick={() => sendOTPMutation.mutate()}
                  disabled={!phone || sendOTPMutation.isPending}
                  className="flex-1"
                >
                  {sendOTPMutation.isPending ? 'جاري الإرسال...' : 'إرسال الكود'}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {step === 'otp' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>أدخل كود التحقق</CardTitle>
              <CardDescription>
                تم إرسال كود التحقق إلى {phone}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="otp">كود التحقق</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')} 
                  className="flex-1"
                >
                  رجوع
                </Button>
                <Button 
                  onClick={() => verifyOTPMutation.mutate()}
                  disabled={otpCode.length !== 6 || verifyOTPMutation.isPending}
                  className="flex-1"
                >
                  {verifyOTPMutation.isPending ? 'جاري التحقق...' : 'تحقق'}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {step === 'details' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <CardTitle>اكتمل التحقق!</CardTitle>
              <CardDescription>
                أضف معلوماتك لتسهيل عملية التسوق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل (اختياري)</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="محمد أحمد"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleComplete}
                  className="flex-1"
                >
                  تخطي
                </Button>
                <Button 
                  onClick={handleComplete}
                  className="flex-1"
                >
                  إكمال
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};