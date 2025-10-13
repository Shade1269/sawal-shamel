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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { phone, otp, role } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ success: false, error: 'رقم الجوال ورمز التحقق مطلوبان' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!role || !['affiliate', 'merchant'].includes(role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'يجب اختيار الدور (مسوق أو تاجر)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying platform OTP for:', phone, 'with role:', role);

    // التحقق من OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('whatsapp_otp')
      .select('*')
      .eq('phone', phone)
      .eq('code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      console.error('OTP verification failed:', otpError);
      return new Response(
        JSON.stringify({ success: false, error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OTP verified successfully');

    // البحث عن مستخدم موجود في auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = authUsers?.users?.find(u => u.phone === phone);
    
    // البحث عن profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, auth_user_id, phone')
      .eq('phone', phone)
      .maybeSingle();

    let userId: string;
    let profileId: string;
    let session = null;

    if (existingAuthUser) {
      // المستخدم موجود في auth.users
      console.log('Existing auth user found:', existingAuthUser.id);
      userId = existingAuthUser.id;
      
      // إنشاء profile إذا لم يكن موجوداً
      if (!existingProfile) {
        console.log('Creating missing profile for existing user');
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: userId,
            phone: phone,
            full_name: phone,
            role: role,
            is_active: true,
            points: 0
          })
          .select()
          .single();
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          return new Response(
            JSON.stringify({ success: false, error: 'فشل في إنشاء الملف الشخصي' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        profileId = newProfile.id;
      } else {
        profileId = existingProfile.id;
      }

      // تحديث أو إضافة الدور
      await supabase
        .from('user_roles')
        .upsert({
          user_id: profileId,
          role: role,
          is_active: true
        }, {
          onConflict: 'user_id,role'
        });

      // إنشاء session للمستخدم
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${phone.replace(/\+/g, '')}@temp.anaqti.sa`,
      });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
      } else if (sessionData?.properties?.action_link) {
        // استخراج tokens من الرابط
        const url = new URL(sessionData.properties.action_link);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { id: userId, phone }
          };
        }
      }

    } else {
      // مستخدم جديد - إنشاء حساب
      console.log('Creating new user account');
      
      // إنشاء email مؤقت من رقم الجوال
      const tempEmail = `${phone.replace(/\+/g, '')}@temp.anaqti.sa`;
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        phone: phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          phone: phone,
          role: role
        }
      });

      if (authError || !authData.user) {
        // إذا كان الرقم مسجلاً سابقاً، عالج الحالة كـ مستخدم موجود
        // ولا تُرجع خطأ للمستخدم
        // نحاول إيجاد/إنشاء profile ثم نكمل بدون جلسة Supabase إن لم نتمكن من إنشائها
        if (authError && (authError as any).code === 'phone_exists') {
          console.error('Phone already exists, proceeding as existing user');

          // حاول إيجاد profile لهذا الرقم
          let ensuredProfileId = existingProfile?.id as string | undefined;
          if (!ensuredProfileId) {
            const { data: createdProfile, error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                phone: phone,
                full_name: phone,
                role: role,
                is_active: true,
                points: 0
              })
              .select()
              .single();
            if (createProfileError) {
              console.error('Profile creation error (phone_exists path):', createProfileError);
            } else {
              ensuredProfileId = createdProfile.id;
            }
          }

          if (ensuredProfileId) {
            // تأكد من وجود الدور
            await supabase
              .from('user_roles')
              .upsert({ user_id: ensuredProfileId, role: role, is_active: true }, { onConflict: 'user_id,role' });
          }

          profileId = ensuredProfileId || profileId;
          userId = userId || '';
        } else {
          console.error('User creation error:', authError);
          return new Response(
            JSON.stringify({ success: false, error: 'فشل في إنشاء الحساب' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        userId = authData.user.id;
        console.log('New user created:', userId);
      }

      if (userId) {
        // إنشاء profile للمستخدم الجديد
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: userId,
            phone: phone,
            full_name: phone,
            role: role,
            is_active: true,
            points: 0
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return new Response(
            JSON.stringify({ success: false, error: 'فشل في إنشاء الملف الشخصي' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        profileId = newProfile.id;

        // إضافة الدور في جدول user_roles
        await supabase
          .from('user_roles')
          .insert({
            user_id: profileId,
            role: role,
            is_active: true
          });

        // إنشاء session
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: tempEmail,
        });

        if (!sessionError && sessionData?.properties?.action_link) {
          const url = new URL(sessionData.properties.action_link);
          const accessToken = url.searchParams.get('access_token');
          const refreshToken = url.searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            session = {
              access_token: accessToken,
              refresh_token: refreshToken,
              user: { id: userId, phone }
            };
          }
        }
      }
    }

    // تحديث OTP كمُحقق
    await supabase
      .from('whatsapp_otp')
      .update({ 
        verified: true,
        ...(userId ? { user_id: userId } : {})
      })
      .eq('id', otpRecord.id);

    console.log('OTP marked as verified');

    return new Response(
      JSON.stringify({ 
        success: true,
        session: session,
        user: {
          id: userId || null,
          phone: phone,
          role: role,
          profileId: profileId || null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-platform-otp:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
