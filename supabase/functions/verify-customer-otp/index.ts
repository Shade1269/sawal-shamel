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

    const { phone, otp, storeId } = await req.json();

    if (!phone || !otp || !storeId) {
      return new Response(
        JSON.stringify({ success: false, error: 'جميع الحقول مطلوبة' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying customer OTP for:', phone, 'store:', storeId);

    // البحث عن OTP صالح
    const { data: otpSession, error: otpError } = await supabase
      .from('customer_otp_sessions')
      .select('*')
      .eq('phone', phone)
      .eq('store_id', storeId)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error('Database error:', otpError);
      return new Response(
        JSON.stringify({ success: false, error: 'خطأ في التحقق من الرمز' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpSession) {
      return new Response(
        JSON.stringify({ success: false, error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // تحديث الجلسة كمحققة وتمديد صلاحيتها
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 أيام

    const { error: updateError } = await supabase
      .from('customer_otp_sessions')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', otpSession.id);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'فشل في تحديث الجلسة' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التأكد من وجود سجل في جدول profiles (للدمج مع النظام الموجود)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (!existingProfile) {
      // إنشاء profile جديد للعميل
      await supabase
        .from('profiles')
        .insert({
          phone: phone,
          full_name: phone,
          role: 'customer'
        });
    }

    console.log('Customer OTP verified successfully');

    // جلب معلومات العميل الكاملة من profiles
    const { data: customerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, phone, email, full_name')
      .eq('phone', phone)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching customer profile:', profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: otpSession.id,
        customer: customerProfile || { id: existingProfile?.id, phone, full_name: phone },
        message: 'تم التحقق بنجاح'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-customer-otp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
