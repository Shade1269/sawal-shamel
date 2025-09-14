import React, { useState } from 'react';
import { CheckoutSteps } from './CheckoutSteps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  storeSettings
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
      // First, save the order to database
      console.log('Creating order in database...', { orderNumber, shopId, cart });
      
      const orderDbData = {
        shop_id: shopId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        subtotal_sar: subtotal,
        vat_sar: 0, // No VAT for now
        total_sar: totalPrice,
        payment_method: selectedPayment,
        shipping_address: {
          address: customerInfo.address,
          city: customerInfo.city,
          area: customerInfo.area,
          email: customerInfo.email
        },
        status: 'PENDING' as const
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderDbData)
        .select()
        .maybeSingle();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('فشل في إنشاء الطلب');
      }

      console.log('Order created successfully:', order);

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        merchant_id: shopId, // Will be updated when we have proper merchant linking
        title_snapshot: item.product.title,
        quantity: item.quantity,
        unit_price_sar: item.product.final_price || item.product.price_sar,
        line_total_sar: (item.product.final_price || item.product.price_sar) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Don't fail the whole process for this, but log it
        console.warn('Order items creation failed, but order was saved');
      } else {
        console.log('Order items created successfully');
      }

      // Handle non-payment gateway orders (COD, etc.)
      console.log('CheckoutFlow: Processing non-Emkan payment');
      toast({
        title: "جاري معالجة الطلب",
        description: "يرجى الانتظار..."
      });
      
      // For cash on delivery, mark order as confirmed
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'CONFIRMED' as const })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order status:', updateError);
      }

      // Update Zoho inventory
      try {
        await supabase.functions.invoke('update-zoho-inventory', {
          body: { orderId: order.id }
        });
      } catch (zohoError) {
        console.error('CheckoutFlow: Zoho inventory update error:', zohoError);
        // Don't fail the order if Zoho update fails
      }
      
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