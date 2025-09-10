import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting Zoho status check (FIXED VERSION)...');
    
    const organizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!organizationId || !supabaseUrl || !serviceRoleKey) {
      console.log('❌ Missing required configuration');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing configuration',
          is_enabled: false,
          token_status: 'error'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Read access token from database
    console.log('📊 Reading token from database...');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: dbIntegrations, error: dbErr } = await supabase
      .from('zoho_integration')
      .select('access_token, last_sync_at, updated_at')
      .eq('is_enabled', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (dbErr || !dbIntegrations || dbIntegrations.length === 0) {
      console.log('❌ No integration found in database');
      return new Response(
        JSON.stringify({ 
          success: true,
          organization_id: organizationId,
          is_enabled: false,
          token_status: 'error',
          last_sync_at: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const integration = dbIntegrations[0];
    const accessToken = integration.access_token;
    
    console.log('🎯 Found token in database:', {
      hasToken: !!accessToken,
      tokenPreview: accessToken?.substring(0, 20) + '...',
      lastUpdate: integration.updated_at
    });

    if (!accessToken) {
      console.log('❌ No access token in database');
      return new Response(
        JSON.stringify({ 
          success: true,
          organization_id: organizationId,
          is_enabled: true,
          token_status: 'expired',
          last_sync_at: integration.last_sync_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test the token
    console.log('🧪 Testing token with Zoho API...');
    const testUrl = `https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&limit=1`;
    
    const testResponse = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Zoho API response: ${testResponse.status}`);

    let tokenStatus = 'error';
    
    if (testResponse.ok) {
      tokenStatus = 'active';
      console.log('✅ Token is ACTIVE and working!');
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Token test failed:', errorText);
      tokenStatus = 'error';
    }

    console.log(`🏁 Final status: ${tokenStatus}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        organization_id: organizationId,
        is_enabled: true,
        token_status: tokenStatus,
        last_sync_at: integration.last_sync_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error in check-zoho-status:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        is_enabled: false,
        token_status: 'error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});