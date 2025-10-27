import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: paginate through auth users to find a user by phone
async function findUserByPhone(supabase: any, phone: string) {
  for (let page = 1; page <= 12; page++) {
    const { data: pageData } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    const user = pageData?.users?.find((u: any) => u.phone === phone);
    if (user) return user;
    if (!pageData || !pageData.users || pageData.users.length === 0) break;
  }
  return null;
}

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

    // الحصول على سجل OTP من قاعدة البيانات
    const { data: otpRecord, error: otpError } = await supabase
      .from('whatsapp_otp')
      .select('*')
      .eq('phone', phone)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      console.error('OTP record not found:', otpError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من عدد المحاولات
    if (otpRecord.attempts >= 5) {
      await supabase
        .from('whatsapp_otp')
        .update({ verified: true })
        .eq('id', otpRecord.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'تم تجاوز الحد الأقصى للمحاولات. الرجاء طلب رمز جديد' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let otpVerified = false;
    const preludeApiKey = Deno.env.get('DING_API_KEY');

    // إذا كان external_id موجوداً، استخدم Prelude API للتحقق
    if (otpRecord.external_id && preludeApiKey) {
      try {
        console.log('Verifying OTP via Prelude API');
        const preludeCheckUrl = `https://api.prelude.so/v2/verification/${otpRecord.external_id}/check`;
        
        const preludeCheckResponse = await fetch(preludeCheckUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${preludeApiKey}`,
          },
          body: JSON.stringify({
            code: otp,
          }),
        });

        if (preludeCheckResponse.ok) {
          const preludeCheckData = await preludeCheckResponse.json();
          console.log('Prelude verification response:', preludeCheckData);
          
          if (preludeCheckData.status === 'valid' || preludeCheckData.status === 'succeeded') {
            otpVerified = true;
            console.log('OTP verified successfully via Prelude');
          } else {
            console.log('OTP verification failed via Prelude:', preludeCheckData.status);
          }
        } else {
          console.error('Prelude check failed:', preludeCheckResponse.status);
          // إذا فشل Prelude API، نستخدم التحقق المحلي كـ fallback
          if (otpRecord.code === otp) {
            otpVerified = true;
            console.log('OTP verified via local fallback');
          }
        }
      } catch (preludeError) {
        console.error('Error checking OTP via Prelude:', preludeError);
        // استخدام التحقق المحلي كـ fallback
        if (otpRecord.code === otp) {
          otpVerified = true;
          console.log('OTP verified via local fallback after Prelude error');
        }
      }
    } else {
      // لا يوجد external_id أو Prelude API، استخدام التحقق المحلي
      if (otpRecord.code === otp) {
        otpVerified = true;
        console.log('OTP verified via local check');
      }
    }

    if (!otpVerified) {
      // زيادة عدد المحاولات الفاشلة
      const newAttempts = (otpRecord.attempts || 0) + 1;
      await supabase
        .from('whatsapp_otp')
        .update({ attempts: newAttempts })
        .eq('id', otpRecord.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'رمز التحقق غير صحيح' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OTP verified successfully');

    // البحث عن profile أولاً
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, auth_user_id, phone')
      .eq('phone', phone)
      .maybeSingle();

    // البحث عن مستخدم في auth.users (مع ترقيم صفحات)
    let existingAuthUser = await findUserByPhone(supabase, phone);

    let userId: string;
    let profileId: string;
    let session = null;

    // **حالة خاصة**: إذا كان profile موجود بدون auth_user_id لكن auth user موجود
    if (existingProfile && !existingProfile.auth_user_id && existingAuthUser) {
      console.log('Linking orphaned profile to existing auth user');
      userId = existingAuthUser.id;
      profileId = existingProfile.id;
      
      // ربط الـ profile بالـ auth_user_id
      await supabase
        .from('profiles')
        .update({ auth_user_id: userId })
        .eq('id', profileId);

      // تحديث أو إضافة الدور - استخدام userId (auth_user_id) وليس profileId
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          is_active: true
        }, {
          onConflict: 'user_id,role'
        });

      // إنشاء جلسة
      const tempEmail = existingAuthUser.email || `${phone.replace(/\+/g, '')}@temp.anaqti.sa`;
      if (!existingAuthUser.email) {
        await supabase.auth.admin.updateUserById(userId, {
          email: tempEmail,
          email_confirm: true,
        });
      }

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: tempEmail,
      });

      if (!linkError && linkData?.properties?.hashed_token) {
        session = {
          email: tempEmail,
          token: linkData.properties.hashed_token,
          email_otp: linkData.properties.email_otp
        };
      } else {
        console.error('Failed to generate session token:', linkError);
      }

    } else if (existingAuthUser) {
      // المستخدم موجود في auth.users
      console.log('Existing auth user found:', existingAuthUser.id);
      userId = existingAuthUser.id;
      
      // إنشاء أو تحديث profile
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

      // تحديث أو إضافة الدور - استخدام userId (auth_user_id) وليس profileId
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          is_active: true
        }, {
          onConflict: 'user_id,role'
        });

      // إنشاء جلسة
      const tempEmail = existingAuthUser.email || `${phone.replace(/\+/g, '')}@temp.anaqti.sa`;
      if (!existingAuthUser.email) {
        await supabase.auth.admin.updateUserById(userId, {
          email: tempEmail,
          email_confirm: true,
        });
      }

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: tempEmail,
      });

      if (!linkError && linkData?.properties?.hashed_token) {
        session = {
          email: tempEmail,
          token: linkData.properties.hashed_token,
          email_otp: linkData.properties.email_otp
        };
      } else {
        console.error('Failed to generate session token:', linkError);
      }

    } else {
      // مستخدم جديد - التحقق أولاً من وجود حساب بالبريد المؤقت
      console.log('Checking for existing user account');
      
      const tempEmail = `${phone.replace(/\+/g, '')}@temp.anaqti.sa`;
      
      // البحث عن مستخدم موجود بنفس البريد المؤقت
      let existingUserByEmail = null;
      for (let page = 1; page <= 5; page++) {
        const { data: pageData } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
        const user = pageData?.users?.find((u: any) => u.email === tempEmail);
        if (user) {
          existingUserByEmail = user;
          break;
        }
        if (!pageData || !pageData.users || pageData.users.length === 0) break;
      }

      if (existingUserByEmail) {
        // إعادة استخدام الحساب الموجود
        console.log('Reusing existing user with temp email:', existingUserByEmail.id);
        userId = existingUserByEmail.id;
        
        // تحديث رقم الجوال إذا لم يكن مسجلاً
        if (!existingUserByEmail.phone) {
          await supabase.auth.admin.updateUserById(userId, {
            phone: phone,
            phone_confirm: true,
            user_metadata: { phone, role }
          });
        }
      } else {
        // إنشاء حساب جديد فقط إذا لم يكن موجوداً
        console.log('Creating new user account');
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
          if ((authError as any)?.code === 'phone_exists') {
            console.error('Phone exists, finding existing auth user');
            existingAuthUser = await findUserByPhone(supabase, phone);
            if (existingAuthUser) {
              userId = existingAuthUser.id;
              // تأكيد/إنشاء profile
              if (existingProfile && !existingProfile.auth_user_id) {
                await supabase.from('profiles').update({ auth_user_id: userId }).eq('id', existingProfile.id);
                profileId = existingProfile.id;
              } else if (!existingProfile) {
                const { data: createdProfile } = await supabase
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
                profileId = createdProfile?.id || profileId;
              } else {
                profileId = existingProfile.id;
              }

              // تحديث/إضافة الدور - استخدام userId (auth_user_id)
              await supabase
                .from('user_roles')
                .upsert({ user_id: userId, role: role, is_active: true }, { onConflict: 'user_id,role' });

              // إنشاء جلسة عبر magic link
              const tempEmail = existingAuthUser.email || `${phone.replace(/\+/g, '')}@temp.anaqti.sa`;
              if (!existingAuthUser.email) {
                await supabase.auth.admin.updateUserById(userId, { email: tempEmail, email_confirm: true });
              }
              const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                type: 'magiclink',
                email: tempEmail,
              });
              if (!linkError && linkData?.properties?.hashed_token) {
                session = { email: tempEmail, token: linkData.properties.hashed_token, email_otp: linkData.properties.email_otp };
              } else {
                console.error('Failed to generate session token (fallback):', linkError);
              }
            } else {
              console.error('Could not locate existing auth user after phone_exists');
              // Fallback: try to find auth user via profiles table by phone
              const { data: profileWithAuth } = await supabase
                .from('profiles')
                .select('auth_user_id')
                .eq('phone', phone)
                .not('auth_user_id', 'is', null)
                .maybeSingle();

              if (profileWithAuth?.auth_user_id) {
                userId = profileWithAuth.auth_user_id;
                // Ensure role entry exists - استخدام userId (auth_user_id)
                await supabase
                  .from('user_roles')
                  .upsert({ user_id: userId, role: role, is_active: true }, { onConflict: 'user_id,role' });

                const tempEmail = `${phone.replace(/\+/g, '')}@temp.anaqti.sa`;
                // Try to set email and generate magic link
                try {
                  await supabase.auth.admin.updateUserById(userId, { email: tempEmail, email_confirm: true });
                } catch (e) {
                  console.warn('Unable to update user email in fallback:', e);
                }
                const { data: linkData2, error: linkError2 } = await supabase.auth.admin.generateLink({
                  type: 'magiclink',
                  email: tempEmail,
                });
                if (!linkError2 && linkData2?.properties?.hashed_token) {
                  session = { email: tempEmail, token: linkData2.properties.hashed_token, email_otp: linkData2.properties.email_otp };
                } else {
                  console.error('Failed to generate session token (profile fallback):', linkError2);
                }
              } else {
                // لم نعثر على مستخدم Auth رغم وجود phone_exists -> إنشاء مستخدم جديد بالبريد فقط كحل أخير
                console.warn('Fallback: creating email-only user since phone_exists and no auth user found');
                const fallbackEmail = `${phone.replace(/\+/g, '')}@temp.anaqti.sa`;
                const fallbackPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
                const { data: createdAuth, error: createErr } = await supabase.auth.admin.createUser({
                  email: fallbackEmail,
                  password: fallbackPassword,
                  email_confirm: true,
                  user_metadata: { phone, role }
                });
                if (createErr || !createdAuth?.user) {
                  console.error('Fallback create user failed:', createErr);
                  return new Response(
                    JSON.stringify({ success: false, error: 'فشل إنشاء المستخدم الاحتياطي' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  );
                }
                userId = createdAuth.user.id;

                // إنشاء/تحديث profile وربطه
                if (existingProfile && !existingProfile.auth_user_id) {
                  await supabase.from('profiles').update({ auth_user_id: userId }).eq('id', existingProfile.id);
                  profileId = existingProfile.id;
                } else if (!existingProfile) {
                  const { data: createdProfile, error: profErr } = await supabase
                    .from('profiles')
                    .insert({ auth_user_id: userId, phone, full_name: phone, role, is_active: true, points: 0 })
                    .select()
                    .single();
                  if (profErr) {
                    console.error('Fallback profile create failed:', profErr);
                  }
                  profileId = createdProfile?.id || profileId;
                } else {
                  profileId = existingProfile.id;
                }

                // إضافة الدور (باستخدام userId)
                await supabase
                  .from('user_roles')
                  .upsert({ user_id: userId, role, is_active: true }, { onConflict: 'user_id,role' });

                // توليد magic link
                const { data: linkData2, error: linkError2 } = await supabase.auth.admin.generateLink({
                  type: 'magiclink',
                  email: fallbackEmail,
                });
                if (!linkError2 && (linkData2?.properties?.hashed_token || linkData2?.properties?.email_otp)) {
                  session = {
                    email: fallbackEmail,
                    token: linkData2.properties.hashed_token,
                    email_otp: linkData2.properties.email_otp
                  };
                } else {
                  console.error('Failed to generate session token in fallback:', linkError2);
                  return new Response(
                    JSON.stringify({ success: false, error: 'فشل إنشاء الجلسة' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  );
                }
              }
            }
          } else {
            console.error('User creation error:', authError);
            return new Response(
              JSON.stringify({ success: false, error: 'فشل في إنشاء الحساب: ' + (authError?.message || 'خطأ غير معروف') }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          userId = authData.user.id;
          console.log('New user created:', userId);
        }
      }

      if (userId) {
        // الحصول على profile الذي ربما تم إنشاؤه تلقائياً عبر التريجر
        const { data: existingByAuth } = await supabase
          .from('profiles')
          .select('id, phone, role')
          .eq('auth_user_id', userId)
          .maybeSingle();

        if (existingByAuth?.id) {
          profileId = existingByAuth.id;
          // تحديث البيانات الأساسية لضمان الاتساق
          await supabase
            .from('profiles')
            .update({ phone, full_name: phone, role, is_active: true, updated_at: new Date().toISOString() })
            .eq('id', profileId);
        } else {
          // إنشاء profile فقط إذا لم يكن موجوداً
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
        }

        // إضافة/تحديث الدور في جدول user_roles - استخدام userId (auth_user_id)
        await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: role, is_active: true }, { onConflict: 'user_id,role' });

        // إنشاء session token للمستخدم الجديد
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: tempEmail,
        });

        if (!linkError && (linkData?.properties?.hashed_token || linkData?.properties?.email_otp)) {
          session = {
            email: tempEmail,
            token: linkData.properties.hashed_token,
            email_otp: linkData.properties.email_otp
          };
        } else {
          console.error('Failed to generate session token for new user:', linkError);
        }
      }
    }

    // Ensure session exists
    if (!session || (!session.token && !session.email_otp)) {
      console.error('No session generated after OTP verification');
      return new Response(
        JSON.stringify({ success: false, error: 'فشل إنشاء الجلسة' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
