import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Button from '@/ui/Button';
import Card from '@/ui/Card';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    // Get payment status from URL params
    const paymentStatus = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('sessionId');

    console.log('Payment callback received:', { paymentStatus, orderId, sessionId });

    // Determine status
    if (paymentStatus === 'success') {
      setStatus('success');
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      setStatus('failed');
    } else {
      // Default to loading for unknown status
      setTimeout(() => setStatus('failed'), 3000);
    }
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
            الرجاء الانتظار بينما نتحقق من حالة الدفع
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
