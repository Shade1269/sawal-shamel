import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sessionId, otpCode } = await req.json()
    
    if (!sessionId || !otpCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Session ID and OTP code are required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Find and validate OTP session
    const { data: otpSession, error: fetchError } = await supabaseClient
      .from('customer_otp_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('otp_code', otpCode.trim())
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .lt('attempts', 3)
      .single()

    if (fetchError || !otpSession) {
      // Increment attempts for failed verification
      await supabaseClient
        .from('customer_otp_sessions')
        .update({ attempts: 'attempts + 1' })
        .eq('id', sessionId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired OTP code' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Mark session as verified
    const { error: updateError } = await supabaseClient
      .from('customer_otp_sessions')
      .update({ 
        verified: true, 
        verified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Extend to 24 hours
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to verify session' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: sessionId,
        phone: otpSession.phone,
        storeId: otpSession.store_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})