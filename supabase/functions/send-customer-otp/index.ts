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

    // إرسال SMS حقيقي باستخدام Twilio
    try {
      // تحقق من وجود أسرار Twilio
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_SMS_FROM');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        // إرسال SMS باستخدام Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        
        const formData = new URLSearchParams();
        formData.append('From', twilioPhoneNumber);
        formData.append('To', phone.startsWith('+') ? phone : `+966${phone.replace(/^0/, '')}`);
        formData.append('Body', `كود التحقق الخاص بك هو: ${otpCode}`);

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!twilioResponse.ok) {
          console.error('Twilio SMS failed:', await twilioResponse.text());
        } else {
          console.log('SMS sent successfully via Twilio');
        }
      } else {
        console.log('Twilio credentials not configured, SMS not sent');
      }
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
    }

    // Log للتطوير (سيتم إزالته لاحقاً)
    console.log(`OTP for ${phone}: ${otpCode}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال كود التحقق',
        // في بيئة التطوير فقط
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp: otpCode })
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