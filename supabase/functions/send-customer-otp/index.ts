import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { phone, storeId } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'رقم الجوال مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!storeId) {
      return new Response(
        JSON.stringify({ success: false, error: 'معرف المتجر مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending customer OTP to:', phone, 'for store:', storeId);

    // التحقق من آخر محاولة إرسال (cooldown: 60 ثانية)
    const { data: recentOtp } = await supabase
      .from('customer_otp_sessions')
      .select('created_at')
      .eq('phone', phone)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      const timeSinceLastOtp = Date.now() - new Date(recentOtp.created_at).getTime();
      if (timeSinceLastOtp < 60000) { // 60 ثانية
        const waitTime = Math.ceil((60000 - timeSinceLastOtp) / 1000);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `الرجاء الانتظار ${waitTime} ثانية قبل طلب رمز جديد` 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // إلغاء OTPs القديمة غير المحققة لنفس الرقم والمتجر
    await supabase
      .from('customer_otp_sessions')
      .update({ verified: true })
      .eq('phone', phone)
      .eq('store_id', storeId)
      .eq('verified', false);

    // توليد رمز OTP من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated customer OTP:', otp);

    // حفظ الـ OTP في قاعدة البيانات
    const { data: otpData, error: otpError } = await supabase
      .from('customer_otp_sessions')
      .insert({
        phone: phone,
        store_id: storeId,
        otp_code: otp,
        verified: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 دقائق
        attempts: 0
      })
      .select()
      .single();

    if (otpError) {
      console.error('Database error:', otpError);
      return new Response(
        JSON.stringify({ success: false, error: 'فشل في حفظ رمز التحقق' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Customer OTP saved to database:', otpData.id);

    // إرسال OTP عبر Prelude (نفس المنصة الرئيسية)
    const preludeApiKey = Deno.env.get('PRELUDE_API_KEY');
    
    if (preludeApiKey) {
      try {
        const preludeUrl = 'https://api.prelude.dev/v2/verification';
        
        console.log('Sending customer OTP via Prelude to:', phone);

        // تنسيق الرقم للتأكد من وجود + في البداية
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

        const preludeResponse = await fetch(preludeUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${preludeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: {
              type: "phone_number",
              value: formattedPhone
            },
            code: otp,
            language: 'ar'
          }),
        });

        if (preludeResponse.ok) {
          const preludeData = await preludeResponse.json();
          console.log('Customer OTP sent successfully via Prelude:', preludeData);
        } else {
          const errorText = await preludeResponse.text();
          console.error('Prelude error response:', errorText);
          
          // نجاح جزئي - OTP محفوظ لكن الإرسال فشل
          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'تم حفظ رمز التحقق، ولكن حدث خطأ في الإرسال',
              otp: otp // للاختبار فقط
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (preludeError) {
        console.error('Error sending customer OTP via Prelude:', preludeError);
        
        // نجاح جزئي - OTP محفوظ لكن الإرسال فشل
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'تم حفظ رمز التحقق، ولكن حدث خطأ في الإرسال',
            otp: otp // للاختبار فقط
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('Prelude not configured - Customer OTP:', otp);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال رمز التحقق بنجاح',
        otp: otp // للاختبار - سيظهر في console.log وللعميل
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-customer-otp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
