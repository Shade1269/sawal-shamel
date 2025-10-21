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

    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'رقم الجوال مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending platform OTP to:', phone);

    // التحقق من آخر محاولة إرسال (cooldown: 30 ثانية)
    const { data: recentOtp } = await supabase
      .from('whatsapp_otp')
      .select('created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      const timeSinceLastOtp = Date.now() - new Date(recentOtp.created_at).getTime();
      if (timeSinceLastOtp < 30000) { // 30 ثانية بدلاً من 60
        const waitTime = Math.ceil((30000 - timeSinceLastOtp) / 1000);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `الرجاء الانتظار ${waitTime} ثانية قبل طلب رمز جديد` 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

    // إرسال OTP عبر Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const message = `رمز التحقق الخاص بك في منصة أتلانتس: ${otp}\nصالح لمدة 5 دقائق`;

        console.log('Sending SMS to:', phone);

        // تنسيق الرقم السعودي لـ Twilio (إزالة + وإضافة 966)
        let twilioPhone = phone;
        if (phone.startsWith('+966')) {
          twilioPhone = phone.slice(1); // إزالة + من +966507988487
        } else if (phone.startsWith('966')) {
          twilioPhone = phone; // 966507988487
        } else {
          twilioPhone = `966${phone}`; // إضافة 966 للرقم المحلي
        }

        const requestBody = new URLSearchParams({
          To: twilioPhone, // رقم سعودي بدون + لـ Twilio
          From: twilioPhoneNumber, // رقم Twilio الأمريكي
          Body: message,
        });

        console.log('Twilio request details:', {
          url: twilioUrl,
          originalPhone: phone,
          twilioPhone: twilioPhone,
          from: twilioPhoneNumber,
          message: message,
          body: requestBody.toString(),
          note: 'Sending as SMS (not WhatsApp) - Saudi number formatted for Twilio'
        });

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestBody,
        });

        if (twilioResponse.ok) {
          const twilioData = await twilioResponse.json();
          console.log('SMS sent successfully via Twilio:', twilioData.sid);
          console.log('Twilio response:', twilioData);
          console.log('Message status:', twilioData.status);
          console.log('Message direction:', twilioData.direction);
        } else {
          const errorData = await twilioResponse.text();
          console.error('Twilio error response:', errorData);
          console.error('Twilio status:', twilioResponse.status);
          
          // محاولة تحليل خطأ Twilio
          try {
            const errorJson = JSON.parse(errorData);
            console.error('Twilio error details:', errorJson);
          } catch (e) {
            console.error('Could not parse Twilio error as JSON');
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'فشل في إرسال الرسالة',
              details: errorData,
              status: twilioResponse.status
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (twilioError) {
        console.error('Error sending SMS via Twilio:', twilioError);
        return new Response(
          JSON.stringify({ success: false, error: 'خطأ في إرسال الرسالة' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('Twilio not configured - OTP:', otp);
      // في التطوير، نعيد OTP للاختبار
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم إرسال رمز التحقق بنجاح (وضع التطوير)',
          otp: otp // إرجاع OTP للاختبار
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال رمز التحقق بنجاح',
        // في التطوير فقط - احذف في الإنتاج
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-platform-otp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
