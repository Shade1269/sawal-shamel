import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Zoho configuration from secrets
    const organizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');
    const accessToken = Deno.env.get('ZOHO_ACCESS_TOKEN');
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

    if (!organizationId || !clientId || !clientSecret || !refreshToken) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing Zoho configuration in secrets',
          is_enabled: false,
          token_status: 'error'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let tokenStatus = 'active';
    let currentAccessToken = accessToken;
    let lastSyncAt: string | null = null;

    // Try to read the freshest access token from Supabase if available
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: dbIntegrations, error: dbErr } = await supabase
          .from('zoho_integration')
          .select('access_token, organization_id, last_sync_at, is_enabled, updated_at')
          .eq('is_enabled', true)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (!dbErr && dbIntegrations && dbIntegrations.length > 0) {
          const dbInt = dbIntegrations[0] as any;
          if (dbInt?.access_token) currentAccessToken = dbInt.access_token;
          if (dbInt?.last_sync_at) lastSyncAt = dbInt.last_sync_at;
        }
      }
    } catch (dbError) {
      console.warn('Could not fetch latest access token from DB:', dbError);
    }
    
    // Test the access token by making a simple API call
    if (currentAccessToken) {
      try {
        // Use the correct Zoho API endpoint with organization_id as query parameter
        const testResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&limit=1`, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${currentAccessToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`Testing token with URL: https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&limit=1`);
        console.log(`Test response status: ${testResponse.status}`);

        if (!testResponse.ok) {
          console.log('Access token expired, attempting to refresh...');
          // Try to refresh the token
          const refreshResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              refresh_token: refreshToken,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'refresh_token',
            }),
          });

          if (refreshResponse.ok) {
            const tokenData = await refreshResponse.json();
            currentAccessToken = tokenData.access_token;
            console.log('Successfully refreshed access token');
            
            // Test the new token with correct endpoint
            const reTestResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&limit=1`, {
              method: 'GET',
              headers: {
                'Authorization': `Zoho-oauthtoken ${currentAccessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            console.log(`Re-test response status: ${reTestResponse.status}`);
            
            if (reTestResponse.ok) {
              tokenStatus = 'active';
              console.log('Token is now active after refresh');
            } else {
              tokenStatus = 'error';
              console.log('Token still not working after refresh');
            }
          } else {
            console.error('Failed to refresh token:', await refreshResponse.text());
            tokenStatus = 'expired';
          }
        } else {
          tokenStatus = 'active';
          console.log('Token is active and working');
        }
      } catch (error) {
        console.error('Error testing access token:', error);
        tokenStatus = 'error';
      }
    } else {
      tokenStatus = 'expired';
      console.log('No access token available');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        organization_id: organizationId,
        is_enabled: true,
        token_status: tokenStatus,
        last_sync_at: lastSyncAt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-zoho-status:', error);
    
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