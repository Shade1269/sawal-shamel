import React, { useState } from 'react';
import { useAffiliateSubscription } from '@/hooks/useAffiliateSubscription';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
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
  const { isDarkMode } = useDarkMode();
  const [showPayment, setShowPayment] = useState(false);
  const [orderId] = useState(`SUB_${Date.now()}`);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'success' as const, icon: CheckCircle2, color: 'text-green-500' },
      inactive: { label: 'غير نشط', variant: 'secondary' as const, icon: XCircle, color: 'text-gray-500' },
      expired: { label: 'منتهي', variant: 'error' as const, icon: XCircle, color: 'text-red-500' },
      pending: { label: 'قيد المعالجة', variant: 'outline' as const, icon: Clock, color: 'text-yellow-500' }
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
          <p className={`transition-colors duration-500 ${
            isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
          }`}>جاري التحميل...</p>
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
          <h1 className={`text-3xl font-bold transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            اشتراك المنصة
          </h1>
          <p className={`transition-colors duration-500 ${
            isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
          }`}>
            إدارة اشتراكك في منصة التسويق بالعمولة
          </p>
        </div>

        {subscription ? (
          <UnifiedCard variant="glass" className={`transition-all duration-500 ${
            isDarkMode 
              ? 'bg-card border-border' 
              : 'bg-white border-slate-200'
          }`}>
            <UnifiedCardHeader>
              <div className="flex items-center justify-between">
                <UnifiedCardTitle className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
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
                <div className={`p-4 rounded-lg transition-colors duration-500 ${
                  isDarkMode ? 'bg-muted/50' : 'bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                    }`}>
                      قيمة الاشتراك
                    </span>
                  </div>
                  <p className={`text-2xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {subscription.subscription_amount} ريال
                  </p>
                </div>

                {subscription.start_date && (
                  <div className={`p-4 rounded-lg transition-colors duration-500 ${
                    isDarkMode ? 'bg-muted/50' : 'bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                      }`}>
                        تاريخ البداية
                      </span>
                    </div>
                    <p className={`text-lg font-semibold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {format(new Date(subscription.start_date), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                )}

                {subscription.end_date && (
                  <div className={`p-4 rounded-lg transition-colors duration-500 ${
                    isDarkMode ? 'bg-muted/50' : 'bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                      }`}>
                        تاريخ الانتهاء
                      </span>
                    </div>
                    <p className={`text-lg font-semibold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {format(new Date(subscription.end_date), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                )}

                {subscription.payment_method && (
                  <div className={`p-4 rounded-lg transition-colors duration-500 ${
                    isDarkMode ? 'bg-muted/50' : 'bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className={`text-sm font-medium transition-colors duration-500 ${
                        isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                      }`}>
                        طريقة الدفع
                      </span>
                    </div>
                    <p className={`text-lg font-semibold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
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
          <UnifiedCard variant="glass" className={`transition-all duration-500 ${
            isDarkMode 
              ? 'bg-card border-border' 
              : 'bg-white border-slate-200'
          }`}>
            <UnifiedCardHeader>
              <UnifiedCardTitle className={`transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                اشترك الآن
              </UnifiedCardTitle>
              <UnifiedCardDescription>
                ابدأ رحلتك في التسويق بالعمولة
              </UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className={`text-5xl font-bold transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  ١ ريال
                </div>
                <p className={`transition-colors duration-500 ${
                  isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                }`}>
                  شهرياً
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className={`transition-colors duration-500 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                  }`}>
                    إنشاء متجر خاص بك
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className={`transition-colors duration-500 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                  }`}>
                    عرض وبيع المنتجات
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className={`transition-colors duration-500 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                  }`}>
                    عمولة على كل عملية بيع
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className={`transition-colors duration-500 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
                  }`}>
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
