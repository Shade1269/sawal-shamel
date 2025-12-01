import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UnifiedButton } from '@/components/design-system';
import { CreditCard, Loader2 } from 'lucide-react';

interface GeideaPaymentProps {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    GeideaCheckout?: new (
      onSuccess: (response: any) => void,
      onError: (error: any) => void,
      onCancel: (data: any) => void
    ) => {
      startPayment: (sessionId: string) => void;
    };
  }
}

export const GeideaPayment: React.FC<GeideaPaymentProps> = ({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const { toast } = useToast();

  // Load Geidea SDK
  useEffect(() => {
    if (window.GeideaCheckout) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    // SDK URL for KSA region - matches API endpoint
    script.src = 'https://www.ksamerchant.geidea.net/hpp/geideaCheckout.min.js';
    script.async = true;
    script.onload = () => {
      console.log('Geidea SDK loaded');
      setSdkLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Geidea SDK');
      toast({
        title: 'خطأ',
        description: 'فشل تحميل نظام الدفع',
        variant: 'destructive',
      });
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [toast]);

  const createPaymentSession = async () => {
    setLoading(true);
    try {
      const callbackUrl = 'https://atlantiss.tech/payment-callback';
      const { data, error } = await supabase.functions.invoke('create-geidea-session', {
        body: {
          amount: amount,
          currency: 'SAR',
          orderId: orderId,
          customerEmail: customerEmail,
          customerName: customerName,
          customerPhone: customerPhone,
          callbackUrl: callbackUrl,
          merchantReferenceId: orderId,
        },
      });

      if (error) throw error;

      if (!data.success || !data.sessionId) {
        throw new Error(data.error || 'فشل في إنشاء جلسة الدفع');
      }

      setSessionId(data.sessionId);
      
      // Prefer SDK checkout when available
      const payload = data as any;
      const sid: string = payload?.sessionId;
      const sessionData = payload?.sessionData;

      if (window.GeideaCheckout && sdkLoaded) {
        const checkout = new window.GeideaCheckout(
          (response: any) => {
            console.log('Payment successful:', response);
            toast({
              title: 'تم الدفع بنجاح',
              description: 'تم إتمام عملية الدفع بنجاح',
            });
            onSuccess(response);
          },
          (error: any) => {
            console.error('Payment error:', error);
            toast({
              title: 'خطأ في الدفع',
              description: error.message || 'حدث خطأ أثناء معالجة الدفع',
              variant: 'destructive',
            });
            onError(error.message || 'Payment failed');
          },
          () => {
            console.log('Payment cancelled by user');
            toast({
              title: 'تم الإلغاء',
              description: 'تم إلغاء عملية الدفع',
            });
            if (onCancel) onCancel();
          }
        );

        // Start payment via SDK (embedded/overlay)
        checkout.startPayment(sid);
        return;
      }

      // Fallback: redirect to Hosted Payment Page if SDK not available
      const redirectCandidates = [
        sessionData?.session?.redirectUrl,
        sessionData?.redirectUrl,
        sessionData?.session?.checkoutUrl,
        sessionData?.checkoutUrl,
        sessionData?.paymentLink,
        sessionData?.session?.url,
      ];
      const redirectUrl = redirectCandidates.find((u: any) => typeof u === 'string' && u.length > 0);

      if (redirectUrl) {
        console.log('SDK not loaded, redirecting to HPP:', redirectUrl);
        window.location.href = redirectUrl as string;
      } else {
        console.warn('No SDK and no redirect URL found in session data', sessionData);
        toast({
          title: 'تم إنشاء جلسة الدفع',
          description: 'تعذر تحميل مكون الدفع تلقائياً. حاول مرة أخرى أو استخدم متصفحاً آخر.',
          variant: 'destructive',
        });
        onError('Geidea SDK not available and no redirect URL provided');
      }

    } catch (error) {
      console.error('Error creating payment session:', error);
      // حاول استخراج رسالة الخطأ المفصلة من Edge Function
      const e: any = error;
      let details = error instanceof Error ? error.message : 'فشل في إنشاء جلسة الدفع';
      const serverBody = e?.context?.body;
      try {
        const parsed = typeof serverBody === 'string' ? JSON.parse(serverBody) : serverBody;
        const serverMsg = parsed?.error || parsed?.message;
        if (serverMsg) details = serverMsg;
      } catch {
        // Ignore JSON parsing errors for server body
      }

      // توضيح أخطاء Geidea الشائعة
      if (details.includes('[023]')) {
        details += ' — فشل توثيق التاجر: تحقق من Merchant Public Key وAPI Password وفعالية حساب KSA.';
      }
      if (details.includes('[036]')) {
        details += ' — لا يوجد تهيئة للبوابة: فعّل Checkout v2 Direct Session لهذه المفاتيح ومنطقة KSA.';
      }

      toast({
        title: 'خطأ',
        description: details,
        variant: 'destructive',
      });
      onError(details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card/90 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-6 w-6 text-accent" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">الدفع عبر Geidea</h3>
            <p className="text-sm text-muted-foreground">دفع آمن ومشفر</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">المبلغ المطلوب:</span>
            <span className="font-semibold text-foreground">
              {amount.toFixed(2)} ريال سعودي
            </span>
          </div>

          {!sessionId ? (
            <UnifiedButton
              variant="primary"
              className="w-full"
              onClick={createPaymentSession}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحضير...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 ml-2" />
                  الدفع الآن
                </>
              )}
            </UnifiedButton>
          ) : null}
        </div>
      </div>

      {/* Geidea payment container */}
      <div id="geidea-container" className="min-h-[400px]"></div>
    </div>
  );
};
