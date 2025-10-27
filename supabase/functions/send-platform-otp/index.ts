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
    console.log('=== Edge Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log('Request body:', body);
    
    const { phone } = body;

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'رقم الجوال مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending platform OTP to:', phone);

    // التحقق من آخر محاولة إرسال (cooldown: 10 ثواني للاختبار)
    const { data: recentOtp } = await supabase
      .from('whatsapp_otp')
      .select('created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      const timeSinceLastOtp = Date.now() - new Date(recentOtp.created_at).getTime();
      if (timeSinceLastOtp < 10000) { // 10 ثواني للاختبار
        const waitTime = Math.ceil((10000 - timeSinceLastOtp) / 1000);
        
        // في وضع التطوير، نسمح بتجاوز الـ cooldown إذا لم يكن Ding مُعد
        const dingApiKey = Deno.env.get('DING_API_KEY');
        if (!dingApiKey) {
          console.log('Development mode: Skipping cooldown check');
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `الرجاء الانتظار ${waitTime} ثانية قبل طلب رمز جديد` 
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // إلغاء OTPs القديمة غير المحققة لنفس الرقم
    await supabase
      .from('whatsapp_otp')
      .update({ verified: true }) // نضعها كمحققة لإلغائها فعلياً
      .eq('phone', phone)
      .eq('verified', false);

    // توليد رمز OTP من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    // حفظ الـ OTP في قاعدة البيانات
    const { data: otpData, error: otpError } = await supabase
      .from('whatsapp_otp')
      .insert({
        phone: phone,
        code: otp,
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

    console.log('OTP saved to database:', otpData.id);

    // التحقق من وجود مستخدم بهذا الرقم
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('phone', phone)
      .maybeSingle();

    const isExistingUser = !!existingProfile;
    const existingRole = existingProfile?.role || null;
    
    console.log('User check:', { isExistingUser, existingRole });

    // إرسال OTP عبر Ding
    const dingApiKey = Deno.env.get('DING_API_KEY');

    if (dingApiKey) {
      try {
        const dingUrl = 'https://api.ding.live/v1/authentication';

        console.log('Sending OTP via Ding to:', phone);

        // تنسيق الرقم للتأكد من وجود + في البداية
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
          formattedPhone = `+${phone}`;
        }
        
        console.log('Ding phone format:', formattedPhone);

        const dingResponse = await fetch(dingUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': dingApiKey,
          },
          body: JSON.stringify({
            phone_number: formattedPhone,
            locale: 'ar-SA', // اللغة العربية - السعودية
          }),
        });

        if (dingResponse.ok) {
          const dingData = await dingResponse.json();
          console.log('OTP sent successfully via Ding:', dingData);
          console.log('Authentication UUID:', dingData.authentication_uuid);
          console.log('Status:', dingData.status);
          
          // حفظ authentication_uuid في قاعدة البيانات للتحقق لاحقاً
          await supabase
            .from('whatsapp_otp')
            .update({ 
              external_id: dingData.authentication_uuid 
            })
            .eq('id', otpData.id);
        } else {
          const errorData = await dingResponse.text();
          console.error('Ding error response:', errorData);
          console.error('Ding status:', dingResponse.status);
          
          // محاولة تحليل خطأ Ding
          let errorJson = null;
          try {
            errorJson = JSON.parse(errorData);
            console.error('Ding error details:', errorJson);
          } catch (e) {
            console.error('Could not parse Ding error as JSON');
          }
          
          // معالجة أخطاء Ding المختلفة
          let userMessage = 'فشل في إرسال رمز التحقق';
          let errorMessage = errorJson?.message || 'خطأ غير معروف من Ding';
          
          if (dingResponse.status === 400) {
            userMessage = 'تنسيق رقم الجوال غير صحيح';
          } else if (dingResponse.status === 401) {
            userMessage = 'خطأ في مفتاح API';
            errorMessage = 'Invalid API key';
          } else if (dingResponse.status === 429) {
            userMessage = 'تم تجاوز عدد الطلبات المسموح بها';
            errorMessage = 'Rate limit exceeded';
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: userMessage,
              details: errorMessage,
              status: dingResponse.status
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (dingError) {
        console.error('Error sending OTP via Ding:', dingError);
        return new Response(
          JSON.stringify({ success: false, error: 'خطأ في إرسال الرسالة' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('Ding not configured - OTP:', otp);
      // في التطوير، نعيد OTP للاختبار
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم إرسال رمز التحقق بنجاح (وضع التطوير)',
          is_existing_user: isExistingUser,
          existing_role: existingRole,
          otp: otp // إرجاع OTP للاختبار
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال رمز التحقق بنجاح',
        is_existing_user: isExistingUser,
        existing_role: existingRole,
        // في التطوير فقط - احذف في الإنتاج
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-platform-otp:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'خطأ في الخادم',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
