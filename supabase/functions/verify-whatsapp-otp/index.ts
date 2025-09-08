import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code, fullName } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: 'Phone number and code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Verifying OTP ${code} for phone ${phone}`);

    // Find the OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from('whatsapp_otp')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      console.log('OTP verification failed:', otpError);
      
      // Increment attempts if record exists
      if (!otpError) {
        await supabase
          .from('whatsapp_otp')
          .update({ attempts: (otpRecord?.attempts || 0) + 1 })
          .eq('phone', phone)
          .eq('code', code);
      }

      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many failed attempts. Please request a new code.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('whatsapp_otp')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error updating OTP record:', updateError);
      return new Response(
        JSON.stringify({ error: 'Verification failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      // User exists, create session
      const { data: authData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: existingUser.email || `${phone}@whatsapp.temp`,
        options: {
          redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('//', '//')}/auth/v1/callback`
        }
      });

      if (signInError) {
        console.error('Error generating auth link:', signInError);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: existingUser,
          authData: authData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // New user, create account
      if (!fullName) {
        return new Response(
          JSON.stringify({ error: 'Full name is required for new accounts' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create auth user
      const tempEmail = `${phone.replace('+', '')}@whatsapp.temp`;
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        phone: phone,
        user_metadata: {
          full_name: fullName,
          phone: phone
        },
        email_confirm: true,
        phone_confirm: true
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate magic link to create a session for the new user
      const { data: authData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: tempEmail,
        options: {
          redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`
        }
      });

      if (linkError) {
        console.error('Error generating auth link for new user:', linkError);
        return new Response(
          JSON.stringify({ error: 'Account created but failed to start session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Account created successfully',
          user: authUser.user,
          authData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in verify-whatsapp-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});