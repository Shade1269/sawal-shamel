import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    const rawPhone = String(phone || '').trim();
    const cleanPhone = rawPhone.replace(/\s+/g, '');

    if (!cleanPhone || !/^\+?\d+$/.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone format. Use +<country><number>' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`Generated SMS OTP ${otpCode} for phone ${cleanPhone}`);

    // Clean up expired OTP codes first
    await supabase.rpc('cleanup_expired_otp');

    // Check if there's an existing active OTP for this phone
    const { data: existingOtp } = await supabase
      .from('whatsapp_otp')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existingOtp) {
      return new Response(
        JSON.stringify({ 
          error: 'An OTP code was already sent. Please wait before requesting a new one.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store OTP in database
    const { error: dbError } = await supabase
      .from('whatsapp_otp')
      .insert({
        phone: cleanPhone,
        code: otpCode,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const smsFrom = Deno.env.get('TWILIO_SMS_FROM') || '+12345678901'; // Default Twilio number

    if (!accountSid || !authToken) {
      console.error('Twilio credentials not configured');
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SMS From/To:', smsFrom, cleanPhone);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const message = `Your verification code is: ${otpCode}. This code expires in 5 minutes.`;

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: smsFrom,
        To: cleanPhone,
        Body: message,
      }),
    });

    if (!twilioResponse.ok) {
      const twilioError = await twilioResponse.text();
      console.error('Twilio error:', twilioError);
      console.error('Response status:', twilioResponse.status);
      console.error('Response headers:', Object.fromEntries(twilioResponse.headers.entries()));
      
      // Clean up the OTP from database since sending failed
      await supabase
        .from('whatsapp_otp')
        .delete()
        .eq('phone', cleanPhone)
        .eq('code', otpCode);

      return new Response(
        JSON.stringify({ error: 'Failed to send SMS message', details: twilioError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twilioData = await twilioResponse.json();
    console.log('SMS OTP sent successfully:', twilioData);
    console.log('Message SID:', twilioData.sid);
    console.log('Message Status:', twilioData.status);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent via SMS successfully',
        twilioSid: twilioData.sid,
        twilioStatus: twilioData.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-sms-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});