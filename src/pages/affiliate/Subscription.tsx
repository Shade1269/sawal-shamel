import React, { useState } from 'react';
import { useAffiliateSubscription } from '@/hooks/useAffiliateSubscription';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { CreditCard, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { GeideaPayment } from '@/components/payment/GeideaPayment';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const AffiliateSubscriptionPage = () => {
  const { subscription, isLoading, createSubscription } = useAffiliateSubscription();
  const { user } = useSupabaseAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [orderId] = useState(`SUB_${Date.now()}`);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'success' as const, icon: CheckCircle2, color: 'text-success' },
      inactive: { label: 'غير نشط', variant: 'secondary' as const, icon: XCircle, color: 'text-muted-foreground' },
      expired: { label: 'منتهي', variant: 'error' as const, icon: XCircle, color: 'text-destructive' },
      pending: { label: 'قيد المعالجة', variant: 'outline' as const, icon: Clock, color: 'text-warning' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <UnifiedBadge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </UnifiedBadge>
    );
  };

  const handlePaymentSuccess = (paymentData: any) => {
    const transactionId = paymentData.transactionId || paymentData.orderId || orderId;
    createSubscription({ transactionId, paymentMethod: 'geidea' });
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <UnifiedButton
            variant="ghost"
            onClick={() => setShowPayment(false)}
            className="mb-4"
          >
            ← رجوع
          </UnifiedButton>
          <GeideaPayment
            amount={1.00}
            orderId={orderId}
            customerName={user?.email?.split('@')[0] || 'عميل'}
            customerEmail={user?.email}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            اشتراك المنصة
          </h1>
          <p className="text-muted-foreground">
            إدارة اشتراكك في منصة التسويق بالعمولة
          </p>
        </div>

        {subscription ? (
          <UnifiedCard variant="glass" className="bg-card border-border">
            <UnifiedCardHeader>
              <div className="flex items-center justify-between">
                <UnifiedCardTitle className="text-foreground">
                  معلومات الاشتراك
                </UnifiedCardTitle>
                {getStatusBadge(subscription.status)}
              </div>
              <UnifiedCardDescription>
                تفاصيل اشتراكك الحالي في المنصة
              </UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      قيمة الاشتراك
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {subscription.subscription_amount} ريال
                  </p>
                </div>

                {subscription.start_date && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        تاريخ البداية
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {format(new Date(subscription.start_date), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                )}

                {subscription.end_date && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        تاريخ الانتهاء
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {format(new Date(subscription.end_date), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                )}

                {subscription.payment_method && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        طريقة الدفع
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {subscription.payment_method === 'geidea' ? 'جيديا' : subscription.payment_method}
                    </p>
                  </div>
                )}
              </div>

              {(subscription.status === 'expired' || subscription.status === 'inactive') && (
                <UnifiedButton
                  onClick={() => setShowPayment(true)}
                  fullWidth
                  size="lg"
                  variant="primary"
                >
                  تجديد الاشتراك
                </UnifiedButton>
              )}
            </UnifiedCardContent>
          </UnifiedCard>
        ) : (
          <UnifiedCard variant="glass" className="bg-card border-border">
            <UnifiedCardHeader>
              <UnifiedCardTitle className="text-foreground">
                اشترك الآن
              </UnifiedCardTitle>
              <UnifiedCardDescription>
                ابدأ رحلتك في التسويق بالعمولة
              </UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-foreground">
                  ١ ريال
                </div>
                <p className="text-muted-foreground">
                  شهرياً
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    إنشاء متجر خاص بك
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    عرض وبيع المنتجات
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    عمولة على كل عملية بيع
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    تحليلات ومتابعة دقيقة
                  </span>
                </div>
              </div>

              <UnifiedButton
                onClick={() => setShowPayment(true)}
                fullWidth
                size="lg"
                variant="primary"
              >
                اشترك الآن
              </UnifiedButton>
            </UnifiedCardContent>
          </UnifiedCard>
        )}
      </div>
    </div>
  );
};

export default AffiliateSubscriptionPage;
