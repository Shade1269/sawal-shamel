import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    
    console.log('Geidea webhook received:', JSON.stringify(webhookData, null, 2));

    // استخراج معلومات الدفع من Geidea
    const paymentStatus = webhookData.responseCode === '000' ? 'success' : 'failed';
    const orderId = webhookData.merchantReferenceId?.split('_')[1]; // ORDER_{orderId}_{timestamp}
    const transactionId = webhookData.orderId; // Geidea transaction ID
    const amount = webhookData.amount;

    if (!orderId) {
      throw new Error('Order ID not found in webhook data');
    }

    console.log('Processing payment for order:', orderId, 'Status:', paymentStatus);

    if (paymentStatus === 'success') {
      // 1. تحديث حالة الطلب إلى PAID
      const { data: order, error: orderError } = await supabaseClient
        .from('ecommerce_orders')
        .update({
          payment_status: 'PAID',
          payment_method: 'GEIDEA_CARD',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) {
        console.error('Error updating order:', orderError);
        throw orderError;
      }

      console.log('Order updated to PAID:', order.id);

      // 2. إنشاء سجل معاملة الدفع
      const { error: transactionError } = await supabaseClient
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          amount_sar: amount,
          payment_method: 'GEIDEA_CARD',
          transaction_id: transactionId,
          status: 'COMPLETED',
          gateway_response: webhookData,
          processed_at: new Date().toISOString(),
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      // 3. Trigger `create_merchant_pending_balance` سيتم تفعيله تلقائياً عند تحديث payment_status
      // هذا سيضيف الرصيد المعلق للتاجر وينشئ سجل في platform_revenue

      console.log('Payment processed successfully for order:', orderId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully',
          orderId: orderId 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else {
      // الدفع فشل
      const { error: updateError } = await supabaseClient
        .from('ecommerce_orders')
        .update({
          payment_status: 'FAILED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating failed payment:', updateError);
      }

      // تسجيل المعاملة الفاشلة
      await supabaseClient
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          amount_sar: amount,
          payment_method: 'GEIDEA_CARD',
          transaction_id: transactionId,
          status: 'FAILED',
          gateway_response: webhookData,
          processed_at: new Date().toISOString(),
        });

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Payment failed',
          orderId: orderId 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
