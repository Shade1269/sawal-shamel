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
    console.log('🧪 Starting direct Zoho token test...');
    
    const organizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');

    console.log('🔑 Secrets check:', {
      hasOrganizationId: !!organizationId,
      hasRefreshToken: !!refreshToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      organizationId: organizationId
    });

    if (!organizationId || !refreshToken || !clientId || !clientSecret) {
      throw new Error('Missing required Zoho credentials');
    }

    // Generate new access token
    console.log('🔄 Generating new access token...');
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

    console.log(`🔄 Refresh response status: ${refreshResponse.status}`);
    
    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error('❌ Token refresh failed:', errorText);
      throw new Error(`Token refresh failed: ${refreshResponse.status} - ${errorText}`);
    }

    const tokenData = await refreshResponse.json();
    const newAccessToken = tokenData.access_token;
    
    console.log('✅ Got new access token:', newAccessToken?.substring(0, 20) + '...');

    // Test the new token
    const testUrl = `https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&limit=1`;
    console.log(`🧪 Testing with URL: ${testUrl}`);
    
    const testResponse = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${newAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Test response status: ${testResponse.status}`);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ SUCCESS! Token works perfectly!');
      console.log('📊 Sample data:', JSON.stringify(data).substring(0, 200));
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Token generated and tested successfully!',
          token_works: true,
          access_token_preview: newAccessToken?.substring(0, 20) + '...',
          organization_id: organizationId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorText = await testResponse.text();
      console.error('❌ Token test failed:', errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Token generated but test failed',
          token_works: false,
          error: errorText,
          status: testResponse.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('💥 Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        token_works: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});