import React, { useState } from 'react';
import { CheckoutSteps } from './CheckoutSteps';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { Loader2, CheckCircle, Package, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  product: any;
  quantity: number;
  variant?: any;
}

interface CheckoutFlowProps {
  cart: CartItem[];
  onOrderComplete: (orderNumber: string) => void;
  onCancel: () => void;
  shopId: string;
  storeSettings: any;
  affiliateStoreId?: string; // إضافة معرف متجر المسوق
  customerSessionId?: string; // إضافة معرف جلسة العميل
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  cart,
  onOrderComplete,
  onCancel,
  shopId,
  storeSettings,
  affiliateStoreId,
  customerSessionId
}) => {
  console.log('CheckoutFlow: Component initialized with:', { 
    cartItems: cart.length, 
    shopId, 
    hasStoreSettings: !!storeSettings,
    storeSettings: storeSettings 
  });

  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [showSteps, setShowSteps] = useState(true);

  const handleStepsComplete = async (orderData: any) => {
    console.log('CheckoutFlow: Steps completed with order data:', orderData);
    setShowSteps(false);
    setOrderNumber(orderData.orderNumber);
    await processOrder(orderData);
  };

  const processOrder = async (orderData: any) => {
    const { customerInfo, cart, selectedShipping, selectedPayment, subtotal, shippingCost, totalPrice, orderNumber } = orderData;

    setLoading(true);
    
    try {
      const affiliateCommission = affiliateStoreId ? totalPrice * 0.1 : 0;

      const { data: order, error: orderError } = await supabase
        .from('ecommerce_orders')
        .insert({
          shop_id: shopId,
          affiliate_store_id: affiliateStoreId,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email || null,
          session_id: customerSessionId || null, // حفظ معرف الجلسة
          shipping_address: {
            address: customerInfo.address,
            city: customerInfo.city,
            area: customerInfo.area,
            email: customerInfo.email,
          },
          subtotal_sar: subtotal,
          shipping_sar: shippingCost,
          tax_sar: 0,
          total_sar: totalPrice,
          payment_method: selectedPayment,
          payment_status: 'PENDING',
          status: 'PENDING',
          order_number: orderNumber,
          affiliate_commission_sar: affiliateCommission,
        })
        .select('id, order_number')
        .maybeSingle();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('فشل في إنشاء الطلب');
      }

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_title: item.product.title,
        quantity: item.quantity,
        unit_price_sar: item.product.final_price || item.product.price_sar,
        total_price_sar: (item.product.final_price || item.product.price_sar) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('ecommerce_order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error('فشل في حفظ عناصر الطلب');
      }

      await supabase
        .from('ecommerce_payment_transactions')
        .insert({
          order_id: order.id,
          transaction_id: `COD-${order.id.slice(-6)}`,
          payment_method: selectedPayment,
          payment_status: 'PENDING',
          amount_sar: totalPrice,
          currency: 'SAR',
          gateway_name: 'Cash on Delivery',
        });

      // Handle non-payment gateway orders (COD, etc.)
      console.log('CheckoutFlow: Processing non-Emkan payment');
      toast({
        title: "جاري معالجة الطلب",
        description: "يرجى الانتظار..."
      });
      
      // For cash on delivery, mark order as confirmed
      const { error: updateError } = await supabase
        .from('ecommerce_orders')
        .update({ status: 'CONFIRMED' as const })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order status:', updateError);
      }

      // Inventory reservations/fulfillment now run inside the database triggers
      console.log('CheckoutFlow: inventory updates handled by internal pipeline');
      
      // Simulate payment processing for other methods
      setTimeout(() => {
        console.log('CheckoutFlow: Payment processing completed');
        setOrderCompleted(true);
        
        toast({
          title: "تم إنشاء الطلب بنجاح!",
          description: `رقم الطلب: ${orderNumber}`,
        });
        
        if (onOrderComplete) {
          onOrderComplete(orderNumber);
        }
      }, 2000);
    } catch (error: any) {
      console.error('CheckoutFlow: Order processing error:', error);
      toast({
        title: "خطأ في معالجة الطلب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('CheckoutFlow: Rendering component');

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">جاري معالجة طلبك</h3>
          <p className="text-muted-foreground text-center">
            يرجى الانتظار...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showSteps) {
    return (
      <CheckoutSteps
        cart={cart}
        onComplete={handleStepsComplete}
        onCancel={onCancel}
        shopSettings={storeSettings}
      />
    );
  }

  if (orderCompleted) {
    return (
      <Card className="w-full max-w-md mx-auto" dir="rtl">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-green-100 rounded-full p-4 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-green-800 mb-2">
            تم إنشاء طلبك بنجاح!
          </h3>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6 w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">رقم الطلب</span>
            </div>
            <p className="text-lg font-mono font-bold text-primary">
              {orderNumber}
            </p>
          </div>

          {paymentUrl && (
            <div className="w-full space-y-4">
              <p className="text-sm text-muted-foreground">
                سيتم فتح صفحة الدفع في نافذة جديدة خلال لحظات
              </p>
              <Button 
                onClick={() => window.open(paymentUrl, '_blank')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                إكمال الدفع الآن
              </Button>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            شكراً لك! سنتواصل معك قريباً لتأكيد طلبك.
          </p>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="mt-4"
          >
            إغلاق
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default CheckoutFlow;