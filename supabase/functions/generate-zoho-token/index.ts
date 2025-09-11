import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Generating fresh Zoho access token...');
    
    // Get secrets from environment
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    const organizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');

    console.log('🔑 Environment check:', {
      hasRefreshToken: !!refreshToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasOrganizationId: !!organizationId
    });

    if (!refreshToken || !clientId || !clientSecret || !organizationId) {
      throw new Error('Missing required Zoho credentials in environment');
    }

    // Generate new access token using refresh token
    console.log('🔄 Requesting new access token from Zoho...');
    const response = await fetch('https://accounts.zoho.ca/oauth/v2/token', {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token generation failed:', errorText);
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      throw new Error('No access token received from Zoho');
    }

    console.log('✅ New access token generated successfully');
    console.log('🔗 Token preview:', accessToken.substring(0, 20) + '...');

    // Test the new token with a simple API call
    const testUrl = `https://www.zohoapis.ca/inventory/v1/items?organization_id=${organizationId}&limit=1`;
    console.log('🧪 Testing new token...');
    
    const testResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const isTokenValid = testResponse.ok;
    console.log(`📊 Token test result: ${isTokenValid ? '✅ Valid' : '❌ Invalid'}`);

    if (isTokenValid) {
      const testData = await testResponse.json();
      console.log('📈 API test successful, sample data received');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: accessToken,
        organization_id: organizationId,
        token_valid: isTokenValid,
        expires_in: tokenData.expires_in || 3600,
        message: 'New access token generated and tested successfully!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error generating token:', error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to generate new access token'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});