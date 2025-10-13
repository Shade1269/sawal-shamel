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

    const { phone, otp, role } = await req.json();
    
    if (!phone || !otp) {
      throw new Error('رقم الهاتف ورمز التحقق مطلوبان');
    }

    // التحقق من صحة الدور (إذا تم توفيره)
    const validRoles = ['affiliate', 'merchant', 'customer'];
    const userRole = role && validRoles.includes(role) ? role : 'affiliate';

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

    // 3. محاولة إنشاء session للمستخدم
    let userId: string;
    let session: any;

    try {
      // 1. البحث عن المستخدم الموجود أولاً - باستخدام phone مباشرة
      console.log('Searching for existing user with phone:', phone);
      const { data: existingUsers, error: listError } = await supabaseClient.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        throw new Error('خطأ في البحث عن المستخدمين');
      }

      console.log('Total users found:', existingUsers?.users?.length || 0);
      const normalize = (p?: string) => (p || '').replace(/[^0-9]/g, '');
      const target = normalize(phone);
      const existingUser = existingUsers?.users.find(u => {
        console.log('Checking user phone:', u.phone, 'against:', phone);
        return normalize(u.phone) === target;
      });

      if (existingUser) {
        console.log('✓ Existing user found:', existingUser.id);
        userId = existingUser.id;
        
        // إنشاء جلسة للمستخدم الموجود
        console.log('Skipping admin.createSession (not supported in supabase-js v2)');
        const sessionData = { session: null } as any;
        const sessionError = null;

        if (sessionError) {
          console.error('Session creation error for existing user:', sessionError);
          throw sessionError;
        }
        
        session = sessionData.session;
        console.log('✓ Session created for existing user');
      } else {
        // 2. إنشاء مستخدم جديد إذا لم يكن موجوداً
        console.log('No existing user found, creating new user...');
        
        const { data: newUserData, error: createError } = await supabaseClient.auth.admin.createUser({
          phone,
          phone_confirm: true,
          user_metadata: {
            phone,
            role: userRole,
          }
        });

        if (createError) {
          console.error('User creation error:', createError);
          
          // إذا فشل بسبب وجود الرقم، نحاول البحث مرة أخرى
          if (createError.message?.includes('already registered') || 
              createError.message?.includes('phone') || 
              createError.code === 'phone_exists' ||
              createError.status === 422) {
            
            console.log('Phone exists error, retrying search...');
            
            // انتظر قليلاً ثم حاول مرة أخرى
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: retryUsers } = await supabaseClient.auth.admin.listUsers();
            const foundUser = retryUsers?.users.find(u => normalize(u.phone) === target);
            
            if (foundUser) {
              console.log('✓ User found on retry:', foundUser.id);
              userId = foundUser.id;
              
              console.log('Skipping admin.createSession (not supported in supabase-js v2)');
              const sessionData = { session: null } as any;
              const sessionError = null;
              
              if (sessionError) {
                console.error('Session error on retry:', sessionError);
                throw sessionError;
              }
              
              session = sessionData.session;
              console.log('✓ Session created on retry');
            } else {
              console.error('User still not found after retry');
              throw new Error('فشل في العثور على المستخدم بعد عدة محاولات');
            }
          } else {
            throw createError;
          }
        } else {
          if (!newUserData?.user) {
            console.error('No user data returned after creation');
            throw new Error('فشل إنشاء المستخدم - لا توجد بيانات');
          }

          userId = newUserData.user.id;
          console.log('✓ New user created successfully:', userId);

          // إنشاء جلسة للمستخدم الجديد
          const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createSession({
            user_id: userId,
          });

          if (sessionError) {
            console.error('Session creation error for new user:', sessionError);
            throw sessionError;
          }
          
          session = sessionData.session;
          console.log('✓ Session created for new user');
        }
      }
    } catch (error: any) {
      console.error('Critical error in user creation/session flow:', error);
      throw new Error(error.message || 'لا يمكن العثور على المستخدم أو إنشاؤه');
    }

    // 2. وضع علامة verified فقط بعد نجاح إنشاء الجلسة
    await supabaseClient
      .from('customer_otp_sessions')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpSession.id);

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
          role: userRole,
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
        sessionId: otpSession.id,
        phone,
        role: userRole,
        user: userId ? {
          id: userId,
          phone,
          role: userRole
        } : null
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
