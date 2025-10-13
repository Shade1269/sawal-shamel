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

    // التحقق من آخر محاولة إرسال (cooldown: 60 ثانية)
    const { data: recentOtp } = await supabase
      .from('whatsapp_otp')
      .select('created_at')
      .eq('phone', phone)
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
    const twilioMessagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');

    if (twilioAccountSid && twilioAuthToken && twilioMessagingServiceSid) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const message = `رمز التحقق الخاص بك في منصة أناقتي: ${otp}\nصالح لمدة 5 دقائق`;

        // إضافة بادئة whatsapp: للرقم
        const whatsappPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
        
        console.log('Sending WhatsApp to:', whatsappPhone);

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: whatsappPhone,
            MessagingServiceSid: twilioMessagingServiceSid,
            Body: message,
          }),
        });

        if (twilioResponse.ok) {
          const twilioData = await twilioResponse.json();
          console.log('SMS sent successfully via Twilio:', twilioData.sid);
        } else {
          const errorData = await twilioResponse.text();
          console.error('Twilio error:', errorData);
        }
      } catch (twilioError) {
        console.error('Error sending SMS via Twilio:', twilioError);
      }
    } else {
      console.log('Twilio not configured - OTP:', otp);
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
