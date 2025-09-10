import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    
    // Test the access token by making a simple API call
    if (currentAccessToken) {
      try {
        const testResponse = await fetch(`https://www.zohoapis.com/inventory/v1/organizations/${organizationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${currentAccessToken}`,
            'Content-Type': 'application/json',
          },
        });

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
            
            // Test the new token
            const reTestResponse = await fetch(`https://www.zohoapis.com/inventory/v1/organizations/${organizationId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Zoho-oauthtoken ${currentAccessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (reTestResponse.ok) {
              tokenStatus = 'active';
            } else {
              tokenStatus = 'error';
            }
          } else {
            console.error('Failed to refresh token:', await refreshResponse.text());
            tokenStatus = 'expired';
          }
        }
      } catch (error) {
        console.error('Error testing access token:', error);
        tokenStatus = 'error';
      }
    } else {
      tokenStatus = 'expired';
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        organization_id: organizationId,
        is_enabled: true,
        token_status: tokenStatus,
        last_sync_at: null // We can add this later if needed
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