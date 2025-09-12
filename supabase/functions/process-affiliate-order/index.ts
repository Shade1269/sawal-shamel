import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    const { orderId, affiliateStoreId, merchantId } = await req.json();

    if (!orderId || !affiliateStoreId || !merchantId) {
      throw new Error('Missing required parameters');
    }

    // إنشاء مراجعة ادمن للطلب
    const { data: reviewData, error: reviewError } = await supabaseClient
      .from('admin_order_reviews')
      .insert({
        order_id: orderId,
        affiliate_store_id: affiliateStoreId,
        merchant_id: merchantId,
        status: 'PENDING'
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating admin review:', reviewError);
      throw reviewError;
    }

    // تحديث حالة الطلب إلى "قيد مراجعة الادمن"
    const { error: orderUpdateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'ADMIN_REVIEW',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
      throw orderUpdateError;
    }

    // يمكن إضافة إشعار للادمن هنا
    console.log(`Order ${orderId} sent for admin review`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order sent for admin review',
        reviewId: reviewData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in process-affiliate-order:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});