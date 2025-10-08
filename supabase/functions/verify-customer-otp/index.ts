import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { store_id, phone, code } = await req.json()

    if (!store_id || !phone || !code) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'جميع البيانات مطلوبة' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // تنظيف البيانات
    const cleanPhone = phone.replace(/\D/g, '')
    const cleanCode = code.replace(/\D/g, '')

    if (cleanCode.length !== 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'كود التحقق يجب أن يكون 6 أرقام' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // البحث عن جلسة OTP صالحة
    const { data: otpSession, error: otpError } = await supabaseClient
      .from('customer_otp_sessions')
      .select('*')
      .eq('store_id', store_id)
      .eq('phone', cleanPhone)
      .eq('otp_code', cleanCode)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .lt('attempts', 3)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpSession) {
      // زيادة عدد المحاولات الفاشلة لجلسات غير محققة
      const { data: sessionsToUpdate } = await supabaseClient
        .from('customer_otp_sessions')
        .select('id, attempts')
        .eq('store_id', store_id)
        .eq('phone', cleanPhone)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())

      if (sessionsToUpdate && sessionsToUpdate.length > 0) {
        for (const session of sessionsToUpdate) {
          await supabaseClient
            .from('customer_otp_sessions')
            .update({ attempts: session.attempts + 1 })
            .eq('id', session.id)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'كود التحقق غير صحيح أو منتهي الصلاحية' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // تحديث الجلسة كمُحقّقة وتمديد صلاحيتها
    const { error: updateError } = await supabaseClient
      .from('customer_otp_sessions')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
      })
      .eq('id', otpSession.id)

    if (updateError) {
      console.error('Error updating OTP session:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'فشل في التحقق' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // إنشاء حساب العميل تلقائياً باستخدام database function
    try {
      const { data: customerData, error: customerError } = await supabaseClient
        .rpc('create_customer_account', {
          p_phone: cleanPhone,
          p_store_id: store_id
        })

      if (customerError) {
        console.error('Error creating customer account:', customerError)
        // لا نفشل العملية إذا فشل إنشاء الحساب
      } else {
        console.log('Customer account created/updated:', customerData)
      }
    } catch (accountError) {
      console.error('Exception creating customer account:', accountError)
      // نستمر حتى لو فشل إنشاء الحساب
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: otpSession.id,
        phone: cleanPhone,
        message: 'تم التحقق بنجاح'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in verify-customer-otp:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'خطأ في الخادم' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})