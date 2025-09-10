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
    
    // Test the access token by making a simple API call
    if (accessToken) {
      try {
        const testResponse = await fetch(`https://www.zohoapis.com/inventory/v1/organizations/${organizationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!testResponse.ok) {
          tokenStatus = 'expired';
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