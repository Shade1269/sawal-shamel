import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  try {
    console.log('=== Edge Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log('Request body:', body);
    
    const { phone } = body;

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'رقم الجوال مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending platform OTP to:', phone);

    // التحقق من آخر محاولة إرسال (cooldown: 10 ثواني للاختبار)
    const { data: recentOtp } = await supabase
      .from('whatsapp_otp')
      .select('created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      const timeSinceLastOtp = Date.now() - new Date(recentOtp.created_at).getTime();
      if (timeSinceLastOtp < 10000) { // 10 ثواني للاختبار
        const waitTime = Math.ceil((10000 - timeSinceLastOtp) / 1000);
        
        // في وضع التطوير، نسمح بتجاوز الـ cooldown إذا لم يكن Ding مُعد
        const dingApiKey = Deno.env.get('DING_API_KEY');
        if (!dingApiKey) {
          console.log('Development mode: Skipping cooldown check');
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `الرجاء الانتظار ${waitTime} ثانية قبل طلب رمز جديد` 
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
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

    // التحقق من وجود مستخدم بهذا الرقم (مع معالجة تنسيقات متعددة)
    const digits = String(phone).replace(/\D/g, '');
    const national = digits.startsWith('966') ? digits.slice(3) : digits;
    const normalizedNational = national.startsWith('0') ? national.slice(1) : national;
    const withPlus = `+966${normalizedNational}`;
    const withoutPlus = `966${normalizedNational}`;
    const localWith0 = `0${normalizedNational}`;
    const withPlusExtra0 = `+9660${normalizedNational}`;

    const variantsSet = new Set<string>([
      phone,
      withPlus,
      withoutPlus,
      localWith0,
      withPlusExtra0,
      normalizedNational,
    ]);
    const variants = Array.from(variantsSet).filter(Boolean);
    console.log('Phone variants for lookup:', variants);

    // استخدم or مع in لمطابقة كل الاحتمالات في حقلي phone و whatsapp
    const csv = variants.map((v) => `"${v}"`).join(',');
    const { data: profileList, error: profileErr } = await supabase
      .from('profiles')
      .select('id, role, phone, whatsapp')
      .or(`phone.in.(${csv}),whatsapp.in.(${csv})`)
      .limit(1);

    const profileMatch = Array.isArray(profileList) ? profileList[0] : (profileList as any);

    if (profileErr) {
      console.warn('Profile lookup warning:', profileErr);
    }

    const isExistingUser = !!profileMatch;
    const existingRole = profileMatch?.role || null;
    const mappedRole = (existingRole === 'affiliate' || existingRole === 'merchant') ? existingRole : null;
    
    console.log('User check:', { isExistingUser, existingRole, mappedRole, matchedPhone: profileMatch?.phone, matchedWhatsapp: profileMatch?.whatsapp });

    // إرسال OTP عبر Prelude (Ding v2 API)
    const preludeApiKey = Deno.env.get('DING_API_KEY');

    if (preludeApiKey) {
      try {
        const preludeUrl = 'https://api.prelude.dev/v2/verification';

        console.log('Sending OTP via Prelude to:', phone);

        // تنسيق الرقم للتأكد من وجود + في البداية
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
          formattedPhone = `+${phone}`;
        }
        
        console.log('Prelude phone format:', formattedPhone);

        const preludeResponse = await fetch(preludeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${preludeApiKey}`,
          },
          body: JSON.stringify({
            target: {
              type: 'phone_number',
              value: formattedPhone
            },
            options: {
              locale: 'ar-SA',
              preferred_channel: 'sms'
            }
          }),
        });

        if (preludeResponse.ok) {
          const preludeData = await preludeResponse.json();
          console.log('OTP sent successfully via Prelude:', preludeData);
          console.log('Verification ID:', preludeData.id);
          console.log('Status:', preludeData.status);
          
          // معالجة حالة "blocked" بسبب المحاولات المتكررة
          if (preludeData.status === 'blocked' && preludeData.reason === 'repeated_attempts') {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'تم حظر إرسال الرموز مؤقتاً بسبب كثرة المحاولات. الرجاء الانتظار 5 دقائق قبل المحاولة مرة أخرى.',
                code: 'RATE_LIMIT',
                cooldownSeconds: 300
              }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // حفظ verification_id في قاعدة البيانات للتحقق لاحقاً
          await supabase
            .from('whatsapp_otp')
            .update({ 
              external_id: preludeData.id 
            })
            .eq('id', otpData.id);
        } else {
          const errorData = await preludeResponse.text();
          console.error('Prelude error response:', errorData);
          console.error('Prelude status:', preludeResponse.status);
          
          // محاولة تحليل خطأ Prelude
          let errorJson = null;
          try {
            errorJson = JSON.parse(errorData);
            console.error('Prelude error details:', errorJson);
          } catch (e) {
            console.error('Could not parse Prelude error as JSON');
          }
          
          // معالجة أخطاء Prelude المختلفة
          let userMessage = 'فشل في إرسال رمز التحقق';
          let errorMessage = errorJson?.message || 'خطأ غير معروف';
          
          if (preludeResponse.status === 400) {
            userMessage = 'تنسيق رقم الجوال غير صحيح';
          } else if (preludeResponse.status === 401) {
            userMessage = 'خطأ في مفتاح API';
            errorMessage = 'Invalid API key';
          } else if (preludeResponse.status === 429) {
            userMessage = 'تم تجاوز عدد الطلبات المسموح بها';
            errorMessage = 'Rate limit exceeded';
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: userMessage,
              details: errorMessage,
              status: preludeResponse.status
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (preludeError) {
        console.error('Error sending OTP via Prelude:', preludeError);
        return new Response(
          JSON.stringify({ success: false, error: 'خطأ في إرسال الرسالة' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('Prelude not configured - OTP:', otp);
      // في التطوير، نعيد OTP للاختبار
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم إرسال رمز التحقق بنجاح (وضع التطوير)',
          is_existing_user: isExistingUser,
          existing_role: existingRole,
          otp: otp // إرجاع OTP للاختبار
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال رمز التحقق بنجاح',
        is_existing_user: isExistingUser,
        existing_role: existingRole,
        // في التطوير فقط - احذف في الإنتاج
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-platform-otp:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'خطأ في الخادم',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
