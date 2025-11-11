import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, Banknote, Gift } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  enabled: boolean;
}

interface PaymentIntegrationProps {
  total: number;
  onPaymentSuccess: (method: string, transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'الدفع عند التوصيل',
    icon: Banknote,
    description: 'ادفع عند استلام الطلب',
    enabled: true
  },
  {
    id: 'tabby',
    name: 'تقسيط مع تابي',
    icon: CreditCard,
    description: 'قسط مشترياتك على 4 دفعات',
    enabled: true
  },
  {
    id: 'tamara',
    name: 'تقسيط مع تمارا',
    icon: Smartphone,
    description: 'ادفع لاحقاً أو قسط',
    enabled: true
  },
  {
    id: 'visa',
    name: 'بطاقة ائتمانية',
    icon: CreditCard,
    description: 'فيزا أو ماستركارد',
    enabled: true
  }
];

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  total,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async (methodId: string) => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      switch (methodId) {
        case 'cod':
          onPaymentSuccess(methodId, transactionId);
          break;
        case 'tabby':
          // Simulate Tabby integration
          onPaymentSuccess(methodId, transactionId);
          break;
        case 'tamara':
          // Simulate Tamara integration
          onPaymentSuccess(methodId, transactionId);
          break;
        case 'visa':
          // Simulate card payment
          onPaymentSuccess(methodId, transactionId);
          break;
        default:
          throw new Error('طريقة دفع غير مدعومة');
      }
      
      toast({
        title: "✅ تم الدفع بنجاح",
        description: `رقم المعاملة: ${transactionId}`,
        variant: "default"
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في عملية الدفع';
      onPaymentError(errorMessage);
      toast({
        title: "❌ فشل في الدفع",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">اختر طريقة الدفع</h3>
        <p className="text-lg text-muted-foreground">
          المبلغ الإجمالي: <span className="font-bold text-primary">{total.toFixed(2)} ريال</span>
        </p>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <Card 
              key={method.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedMethod === method.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'border-border'
              } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => method.enabled && setSelectedMethod(method.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{method.name}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={() => selectedMethod && handlePayment(selectedMethod)}
        disabled={!selectedMethod || processing}
        className="w-full py-6 text-lg font-semibold"
        size="lg"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            جاري المعالجة...
          </>
        ) : (
          <>
            <Gift className="w-5 h-5 mr-2" />
            تأكيد الطلب والدفع
          </>
        )}
      </Button>
    </div>
  );
};