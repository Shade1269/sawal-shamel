import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { phone, storeId } = await req.json();
    
    if (!phone) {
      throw new Error('رقم الهاتف مطلوب');
    }

    // توليد كود OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // حفظ جلسة OTP
    const { error: otpError } = await supabaseClient
      .from('customer_otp_sessions')
      .insert({
        phone,
        otp_code: otpCode,
        store_id: storeId,
        session_data: { timestamp: new Date().toISOString() }
      });

    if (otpError) throw otpError;

    // في بيئة الإنتاج، إرسال SMS حقيقي هنا
    console.log(`OTP for ${phone}: ${otpCode}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال كود التحقق',
        // فقط للتطوير
        otp: otpCode 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});