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

    const { phone, otp } = await req.json();
    
    if (!phone || !otp) {
      throw new Error('رقم الهاتف ورمز التحقق مطلوبان');
    }

    console.log('Verifying OTP for phone:', phone);

    // 1. التحقق من OTP في الجدول
    const { data: otpSession, error: otpError } = await supabaseClient
      .from('customer_otp_sessions')
      .select('*')
      .eq('phone', phone)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpSession) {
      console.error('OTP verification failed:', otpError);
      throw new Error('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    console.log('OTP verified successfully');

    // 2. وضع علامة على OTP كـ verified
    await supabaseClient
      .from('customer_otp_sessions')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpSession.id);

    // 3. البحث عن مستخدم موجود بنفس الجوال
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.phone === phone);

    let userId: string;
    let session: any;

    if (existingUser) {
      // المستخدم موجود - إنشاء session
      console.log('Existing user found:', existingUser.id);
      userId = existingUser.id;
      
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createSession({
        user_id: userId,
      });

      if (sessionError) throw sessionError;
      session = sessionData.session;
    } else {
      // إنشاء مستخدم جديد
      console.log('Creating new user for phone:', phone);
      
      const { data: newUserData, error: createError } = await supabaseClient.auth.admin.createUser({
        phone,
        phone_confirm: true,
        user_metadata: {
          phone,
          role: 'affiliate',
        }
      });

      if (createError) throw createError;
      if (!newUserData.user) throw new Error('فشل إنشاء المستخدم');

      userId = newUserData.user.id;
      console.log('New user created:', userId);

      // إنشاء session للمستخدم الجديد
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createSession({
        user_id: userId,
      });

      if (sessionError) throw sessionError;
      session = sessionData.session;
    }

    // 4. التأكد من وجود profile
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (!existingProfile) {
      console.log('Creating profile for user:', userId);
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          auth_user_id: userId,
          phone,
          full_name: phone,
          role: 'affiliate',
          is_active: true,
          points: 0,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    } else {
      // تحديث آخر نشاط
      await supabaseClient
        .from('profiles')
        .update({ 
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', userId);
    }

    console.log('Verification complete, returning session');

    return new Response(
      JSON.stringify({ 
        success: true,
        session,
        user: {
          id: userId,
          phone
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
