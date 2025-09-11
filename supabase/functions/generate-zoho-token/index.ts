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

    // Try multiple Zoho account regions for token refresh
    console.log('🔄 Requesting new access token from Zoho...');
    const TOKEN_DOMAINS = [
      'https://accounts.zoho.ca',
      'https://accounts.zoho.com',
      'https://accounts.zoho.eu',
      'https://accounts.zoho.in',
      'https://accounts.zoho.com.au',
      'https://accounts.zoho.jp'
    ];

    let accessToken: string | null = null;
    let tokenDomainUsed: string | null = null;
    const tokenErrors: Array<{ domain: string; status?: number; body?: string }> = [];

    for (const domain of TOKEN_DOMAINS) {
      const url = `${domain}/oauth/v2/token`;
      console.log(`🌐 Trying token endpoint: ${url}`);

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        tokenErrors.push({ domain, status: resp.status, body: errText });
        console.warn(`⚠️ Token refresh failed on ${domain}: ${resp.status} ${errText}`);
        continue;
      }

      const tokenData = await resp.json();
      if (tokenData?.access_token) {
        accessToken = tokenData.access_token as string;
        tokenDomainUsed = domain;
        console.log(`✅ Token obtained from ${domain}`);
        // Attach expires_in to be returned later
        (tokenData.expires_in ??= 3600);
        // Proceed with testing below
        var expiresIn = tokenData.expires_in as number;
        break;
      } else {
        tokenErrors.push({ domain, body: JSON.stringify(tokenData).slice(0, 300) });
      }
    }

    if (!accessToken) {
      throw new Error(`All token endpoints failed. Details: ${JSON.stringify(tokenErrors).slice(0, 800)}`);
    }

    // Test the new token against multiple API regions
    const API_DOMAINS = [
      'https://www.zohoapis.ca',
      'https://www.zohoapis.com',
      'https://www.zohoapis.eu',
      'https://www.zohoapis.in',
      'https://www.zohoapis.com.au',
      'https://www.zohoapis.jp'
    ];

    let workingApiDomain: string | null = null;
    let tokenValid = false;
    const apiErrors: Array<{ domain: string; status?: number; body?: string }> = [];

    for (const api of API_DOMAINS) {
      const testUrl = `${api}/inventory/v1/items?organization_id=${organizationId}&limit=1`;
      console.log(`🧪 Testing token on: ${testUrl}`);
      const tr = await fetch(testUrl, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (tr.ok) {
        tokenValid = true;
        workingApiDomain = api;
        console.log(`📊 Token test succeeded on ${api}`);
        break;
      } else {
        const errText = await tr.text().catch(() => '');
        apiErrors.push({ domain: api, status: tr.status, body: errText });
        console.warn(`⚠️ Token test failed on ${api}: ${tr.status} ${errText}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: accessToken,
        organization_id: organizationId,
        token_valid: tokenValid,
        working_api_domain: workingApiDomain,
        token_domain_used: tokenDomainUsed,
        debug: { tokenErrors, apiErrors },
        message: tokenValid ? 'New access token generated and tested successfully!' : 'Token generated but API test failed on all regions',
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