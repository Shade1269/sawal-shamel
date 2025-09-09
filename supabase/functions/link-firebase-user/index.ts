import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    const { phone } = await req.json()
    console.log('Linking Firebase user with phone:', phone)

    if (!phone) {
      throw new Error('Phone number is required')
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })
    
    let authUser = existingUsers?.users?.find(user => user.phone === phone)
    let userId = authUser?.id

    if (!authUser) {
      // Create new auth user if doesn't exist
      console.log('Creating new user for phone:', phone)
      const { data: newAuthUser, error: authError } = await supabaseClient.auth.admin.createUser({
        phone: phone,
        phone_confirmed: true,
        user_metadata: { 
          phone: phone,
          firebase_verified: true
        }
      })

      if (authError) {
        console.error('Auth creation error:', authError)
        throw authError
      }
      
      authUser = newAuthUser?.user
      userId = authUser?.id
    } else {
      console.log('User already exists, using existing user:', userId)
    }

    console.log('Auth user ID:', userId)

    // Create or update profile
    if (userId) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({
          auth_user_id: userId,
          phone: phone,
          full_name: phone,
          role: 'affiliate'
        }, {
          onConflict: 'auth_user_id'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    // Generate session for existing or new user
    const { data: session, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      phone: phone
    })

    if (sessionError) {
      console.error('Session generation error:', sessionError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authUser?.user,
        session: session
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error linking Firebase user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})