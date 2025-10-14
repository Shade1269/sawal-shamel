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
        expires_at: expiresAt.toISOString()
      })
      .eq('id', otpSession.id);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'فشل في تحديث الجلسة' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إنشاء أو الحصول على profile للعميل (منفصل لكل متجر)
    let profileId: string;
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingProfile) {
      profileId = existingProfile.id;
    } else {
      // إنشاء profile جديد للعميل
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          phone: phone,
          role: 'customer',
          is_active: true,
          points: 0
        })
        .select('id')
        .single();

      if (profileError || !newProfile) {
        console.error('Error creating profile:', profileError);
        return new Response(
          JSON.stringify({ success: false, error: 'فشل في إنشاء الحساب' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      profileId = newProfile.id;
    }

    // إنشاء أو الحصول على customer record
    let customerId: string;
    
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          profile_id: profileId
        })
        .select('id')
        .single();

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError);
        return new Response(
          JSON.stringify({ success: false, error: 'فشل في إنشاء حساب العميل' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      customerId = newCustomer.id;
    }

    // ربط العميل بالمتجر المحدد (فصل البيانات)
    const { data: existingStoreCustomer } = await supabase
      .from('store_customers')
      .select('id')
      .eq('customer_id', customerId)
      .eq('store_id', storeId)
      .maybeSingle();

    if (!existingStoreCustomer) {
      const { error: storeCustomerError } = await supabase
        .from('store_customers')
        .insert({
          store_id: storeId,
          customer_id: customerId
        });

      if (storeCustomerError) {
        console.error('Error linking customer to store:', storeCustomerError);
        return new Response(
          JSON.stringify({ success: false, error: 'فشل في ربط العميل بالمتجر' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Customer linked to store successfully');
    }

    console.log('Customer OTP verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: otpSession.id,
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
