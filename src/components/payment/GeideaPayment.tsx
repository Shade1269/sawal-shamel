import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Button from '@/ui/Button';
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
    script.src = 'https://www.merchant.geidea.net/hpp/geideaCheckout.min.js';
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
      const callbackUrl = `${window.location.origin}/payment/callback`;
      const webhookUrl = `https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/geidea-webhook`;
      const { data, error } = await supabase.functions.invoke('create-geidea-session', {
        body: {
          amount: amount, // decimal SAR as per Checkout docs
          currency: 'SAR',
          orderId: orderId,
          customerEmail: customerEmail,
          customerName: customerName,
          customerPhone: customerPhone,
          callbackUrl: callbackUrl,
          webhookUrl: webhookUrl,
          merchantReferenceId: `ORDER_${orderId}_${Date.now()}`,
        },
      });

      if (error) throw error;

      if (!data.success || !data.sessionId) {
        throw new Error(data.error || 'فشل في إنشاء جلسة الدفع');
      }

      setSessionId(data.sessionId);
      
      // Initialize Geidea Checkout with Apple Pay enabled
      if (window.GeideaCheckout && sdkLoaded) {
        window.GeideaCheckout.configure({
          merchantKey: data.sessionData?.merchantPublicKey,
          enableApplePay: true, // تفعيل Apple Pay
          applePayDisplayName: 'متجرك', // اسم يظهر في Apple Pay
          onSuccess: (response: any) => {
            console.log('Payment successful:', response);
            toast({
              title: 'تم الدفع بنجاح',
              description: 'تم إتمام عملية الدفع بنجاح',
            });
            onSuccess(response);
          },
          onError: (error: any) => {
            console.error('Payment error:', error);
            toast({
              title: 'خطأ في الدفع',
              description: error.message || 'حدث خطأ أثناء معالجة الدفع',
              variant: 'destructive',
            });
            onError(error.message || 'Payment failed');
          },
          onCancel: () => {
            console.log('Payment cancelled by user');
            toast({
              title: 'تم الإلغاء',
              description: 'تم إلغاء عملية الدفع',
            });
            if (onCancel) onCancel();
          },
        });

        // Start payment with modal
        window.GeideaCheckout.startPayment(data.sessionId, 'geidea-container');
      }

    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء جلسة الدفع',
        variant: 'destructive',
      });
      onError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-6 w-6 text-[color:var(--accent)]" />
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--glass-fg)]">الدفع عبر Geidea</h3>
            <p className="text-sm text-[color:var(--fg-muted)]">دفع آمن ومشفر</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--fg-muted)]">المبلغ المطلوب:</span>
            <span className="font-semibold text-[color:var(--glass-fg)]">
              {amount.toFixed(2)} ريال سعودي
            </span>
          </div>

          {!sessionId ? (
            <Button
              variant="solid"
              className="w-full"
              onClick={createPaymentSession}
              disabled={loading || !sdkLoaded}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحضير...
                </>
              ) : !sdkLoaded ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 ml-2" />
                  الدفع الآن
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Geidea payment container */}
      <div id="geidea-container" className="min-h-[400px]"></div>
    </div>
  );
};
