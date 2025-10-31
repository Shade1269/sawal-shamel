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

    // التأكد من وجود سجل في جدول profiles
    let profileId: string;
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (!existingProfile) {
      // إنشاء profile جديد للعميل
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          phone: phone,
          full_name: phone,
          role: 'customer'
        })
        .select('id')
        .single();
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        return new Response(
          JSON.stringify({ success: false, error: 'فشل في إنشاء الملف الشخصي' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      profileId = newProfile.id;
      console.log('Created new profile:', profileId);
    } else {
      profileId = existingProfile.id;
      console.log('Using existing profile:', profileId);
    }

    // التأكد من وجود سجل في جدول customers
    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (!existingCustomer) {
      // إنشاء سجل عميل جديد
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          profile_id: profileId
        })
        .select('id')
        .single();
      
      if (customerError) {
        console.error('Error creating customer:', customerError);
        return new Response(
          JSON.stringify({ success: false, error: 'فشل في إنشاء سجل العميل' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      customerId = newCustomer.id;
      console.log('Created new customer:', customerId);
    } else {
      customerId = existingCustomer.id;
      console.log('Using existing customer:', customerId);
    }

    // ربط العميل بالمتجر في store_customers
    const { data: existingStoreCustomer } = await supabase
      .from('store_customers')
      .select('id')
      .eq('store_id', storeId)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (!existingStoreCustomer) {
      const { error: storeCustomerError } = await supabase
        .from('store_customers')
        .insert({
          store_id: storeId,
          customer_id: customerId,
          first_purchase_at: new Date().toISOString()
        });
      
      if (storeCustomerError) {
        console.error('Error linking customer to store:', storeCustomerError);
        // نواصل حتى لو فشل الربط
      } else {
        console.log('Linked customer to store');
      }
    }

    console.log('Customer OTP verified successfully');

    // جلب معلومات العميل الكاملة
    const { data: customerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, phone, email, full_name')
      .eq('id', profileId)
      .single();

    if (profileError) {
      console.error('Error fetching customer profile:', profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: otpSession.id,
        customerId: customerId,
        customer: customerProfile || { id: profileId, phone, full_name: phone },
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
