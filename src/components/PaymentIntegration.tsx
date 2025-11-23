import React, { useState } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from "@/components/design-system";
import { UnifiedButton } from "@/components/design-system";
import { UnifiedBadge } from "@/components/design-system";
import { usePaymentGateways } from "@/hooks/usePaymentGateways";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Zap,
  DollarSign,
  Wallet,
  Building
} from "lucide-react";

interface PaymentIntegrationProps {
  shopId?: string;
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({ shopId }) => {
  const { gateways, loading, testGateway } = usePaymentGateways(shopId);
  const { toast } = useToast();
  const [testing, setTesting] = useState<string | null>(null);

  const handleTestConnection = async (gatewayId: string) => {
    setTesting(gatewayId);
    try {
      const result = await testGateway(gatewayId);
      if (result.success) {
        toast({
          title: "اختبار ناجح",
          description: "تم اختبار الاتصال مع بوابة الدفع بنجاح",
        });
      }
    } finally {
      setTesting(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'stripe':
        return <CreditCard className="h-6 w-6 text-blue-500" />;
      case 'paypal':
        return <Wallet className="h-6 w-6 text-blue-600" />;
      case 'emkan':
        return <Building className="h-6 w-6 text-green-500" />;
      case 'mada':
        return <DollarSign className="h-6 w-6 text-purple-500" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (isEnabled: boolean) => {
    return isEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تكاملات الدفع</h2>
          <p className="text-muted-foreground">إدارة وتكوين بوابات الدفع المختلفة</p>
        </div>
        <UnifiedButton variant="primary">
          <Settings className="ml-2 h-4 w-4" />
          إضافة بوابة دفع
        </UnifiedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gateways.map((gateway) => (
          <UnifiedCard key={gateway.id} variant="default" padding="none" className="relative overflow-hidden">
            <UnifiedCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {getProviderIcon(gateway.provider)}
                  <div>
                    <UnifiedCardTitle className="text-lg">{gateway.display_name}</UnifiedCardTitle>
                    <p className="text-sm text-muted-foreground">{gateway.gateway_name}</p>
                  </div>
                </div>
                <UnifiedBadge className={getStatusColor(gateway.is_enabled)}>
                  {gateway.is_enabled ? (
                    <>
                      <CheckCircle className="ml-1 h-3 w-3" />
                      مفعلة
                    </>
                  ) : (
                    <>
                      <XCircle className="ml-1 h-3 w-3" />
                      معطلة
                    </>
                  )}
                </UnifiedBadge>
              </div>
            </UnifiedCardHeader>
            
            <UnifiedCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">رسوم النسبة:</span>
                  <div className="font-medium">{gateway.percentage_fee}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">رسوم ثابتة:</span>
                  <div className="font-medium">{gateway.fixed_fee_sar} ر.س</div>
                </div>
                <div>
                  <span className="text-muted-foreground">أدنى مبلغ:</span>
                  <div className="font-medium">{gateway.min_amount_sar} ر.س</div>
                </div>
                <div>
                  <span className="text-muted-foreground">البيئة:</span>
                  <UnifiedBadge variant={gateway.is_test_mode ? "secondary" : "default"}>
                    {gateway.is_test_mode ? "تجريبي" : "إنتاج"}
                  </UnifiedBadge>
                </div>
              </div>

              <div className="flex space-x-2 rtl:space-x-reverse">
                <UnifiedButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(gateway.id)}
                  disabled={testing === gateway.id}
                  className="flex-1"
                >
                  {testing === gateway.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  ) : (
                    <Zap className="ml-2 h-4 w-4" />
                  )}
                  اختبار الاتصال
                </UnifiedButton>
                <UnifiedButton variant="outline" size="sm">
                  <Settings className="ml-2 h-4 w-4" />
                  إعدادات
                </UnifiedButton>
              </div>

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  العملات المدعومة: {gateway.allowed_currencies.join(', ')}
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        ))}
      </div>

      {gateways.length === 0 && (
        <UnifiedCard variant="default" padding="lg" className="text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد بوابات دفع</h3>
          <p className="text-muted-foreground mb-4">
            قم بإضافة بوابة دفع لبدء قبول المدفوعات من العملاء
          </p>
          <UnifiedButton variant="primary">
            إضافة بوابة دفع جديدة
          </UnifiedButton>
        </UnifiedCard>
      )}
    </div>
  );
};