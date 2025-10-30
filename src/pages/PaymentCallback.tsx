import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Button from '@/ui/Button';
import Card from '@/ui/Card';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('جاري معالجة الدفع...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // الحصول على البيانات من URL parameters
        const orderId = searchParams.get('orderId') || searchParams.get('merchantReferenceId');
        const sessionId = searchParams.get('sessionId');
        const paymentStatus = searchParams.get('status');
        const paymentId = searchParams.get('paymentId');
        const detailedResponseCode = searchParams.get('detailedResponseCode');
        const detailedResponseMessage = searchParams.get('detailedResponseMessage');
        const amount = searchParams.get('amount');
        const currency = searchParams.get('currency') || 'SAR';

        console.log('Payment callback data:', {
          orderId,
          sessionId,
          paymentStatus,
          paymentId,
          detailedResponseCode,
          detailedResponseMessage,
        });

        if (!orderId) {
          setStatus('failed');
          setMessage('خطأ: لم يتم العثور على رقم الطلب');
          return;
        }

        // استدعاء Edge Function لمعالجة النتيجة
        const { data, error } = await supabase.functions.invoke('process-geidea-callback', {
          body: {
            orderId,
            sessionId,
            status: paymentStatus,
            amount: amount ? parseFloat(amount) : 0,
            currency,
            paymentId,
            detailedResponseCode,
            detailedResponseMessage,
          },
        });

        if (error) {
          console.error('Error processing callback:', error);
          setStatus('failed');
          setMessage('حدث خطأ أثناء معالجة الدفع');
          return;
        }

        console.log('Callback processed:', data);

        if (data.success) {
          if (data.status === 'PAID') {
            setStatus('success');
            setMessage('تم الدفع بنجاح! شكراً لك.');
          } else {
            setStatus('failed');
            setMessage(data.message || 'فشل الدفع');
          }
        } else {
          setStatus('failed');
          setMessage(data.error || 'فشل الدفع');
        }

      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('failed');
        setMessage('حدث خطأ غير متوقع');
      }
    };

    processCallback();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4">
        <Card className="w-full max-w-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-8 text-center">
          <Loader2 className="h-16 w-16 mx-auto mb-4 text-[color:var(--accent)] animate-spin" />
          <h1 className="text-2xl font-semibold text-[color:var(--glass-fg)] mb-2">
            جاري معالجة الدفع...
          </h1>
          <p className="text-[color:var(--fg-muted)]">
            {message}
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4">
        <Card className="w-full max-w-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-8 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-semibold text-[color:var(--glass-fg)] mb-2">
            تم الدفع بنجاح!
          </h1>
          <p className="text-[color:var(--fg-muted)] mb-6">
            تمت عملية الدفع بنجاح. سيتم معالجة طلبك قريباً.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="solid" onClick={() => navigate('/orders')}>
              عرض طلباتي
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              الصفحة الرئيسية
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4">
      <Card className="w-full max-w-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-8 text-center">
        <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-semibold text-[color:var(--glass-fg)] mb-2">
          فشل الدفع
        </h1>
        <p className="text-[color:var(--fg-muted)] mb-6">
          لم تكتمل عملية الدفع. يرجى المحاولة مرة أخرى.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="solid" onClick={() => navigate('/checkout')}>
            إعادة المحاولة
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            الصفحة الرئيسية
          </Button>
        </div>
      </Card>
    </div>
  );
};
