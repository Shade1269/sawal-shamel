import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// قائمة بنطاقات Zoho مع كندا أولاً
const ZOHO_DOMAINS = [
  'www.zohoapis.ca',       // كندا - أولاً بناءً على الخطأ
  'www.zohoapis.com',      // الولايات المتحدة وعالمي
  'www.zohoapis.eu',       // أوروبا
  'www.zohoapis.in',       // الهند
  'www.zohoapis.com.au',   // أستراليا
  'www.zohoapis.jp'        // اليابان
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting Enhanced Zoho Status Check...');
    
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
          last_sync_at: null,
          debug_info: 'No database integration found'
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
          last_sync_at: integration.last_sync_at,
          debug_info: 'No access token in database'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test the token across all Zoho domains
    console.log('🌍 Testing token across all Zoho domains...');
    let tokenStatus = 'error';
    let workingDomain = null;
    let lastError = null;
    let debugInfo = [];

    for (const domain of ZOHO_DOMAINS) {
      try {
        const testUrl = `https://${domain}/inventory/v1/items?organization_id=${organizationId}&limit=1`;
        console.log(`🧪 Testing with domain: ${domain}`);
        
        const testResponse = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`📡 ${domain} response: ${testResponse.status}`);
        
        // إضافة معلومات تشخيصية إضافية لخطأ 401
        if (testResponse.status === 401) {
          const errorText = await testResponse.text();
          console.log(`🔐 Authorization error on ${domain}:`, errorText);
          debugInfo.push(`AUTH_ERROR: ${domain} - Status 401 - ${errorText.substring(0, 150)}`);
          
          // هذا الخطأ مهم - قد يكون نقص في الصلاحيات
          lastError = {
            domain: domain,
            status: 401,
            error: errorText,
            suggestion: domain === 'www.zohoapis.ca' ? 
              'Try refreshing token with Canada domain (accounts.zoho.ca) and full access scope' :
              'Authorization issue - check token scope and permissions'
          };
        } else if (testResponse.ok) {
          tokenStatus = 'active';
          workingDomain = domain;
          console.log(`✅ SUCCESS! Token works with domain: ${domain}`);
          debugInfo.push(`SUCCESS: ${domain} returned ${testResponse.status}`);
          break;
        } else {
          const errorText = await testResponse.text();
          console.log(`❌ ${domain} failed: ${testResponse.status} - ${errorText}`);
          debugInfo.push(`FAILED: ${domain} returned ${testResponse.status} - ${errorText.substring(0, 100)}`);
          
          // Store the most detailed error
          if (testResponse.status !== 404) {
            lastError = {
              domain: domain,
              status: testResponse.status,
              error: errorText
            };
          }
        }
      } catch (error) {
        console.log(`💥 Error testing ${domain}:`, error.message);
        debugInfo.push(`ERROR: ${domain} - ${error.message}`);
      }
    }

    // Prepare detailed response
    const response = {
      success: true,
      organization_id: organizationId,
      is_enabled: true,
      token_status: tokenStatus,
      last_sync_at: integration.last_sync_at,
      working_domain: workingDomain,
      debug_info: debugInfo,
      detailed_error: lastError
    };

    if (tokenStatus === 'active') {
      console.log(`🎉 Final result: Token is ACTIVE with domain ${workingDomain}!`);
    } else {
      console.log('😞 Final result: Token failed on all domains');
      console.log('📋 Debug info:', debugInfo);
      console.log('🔍 Last error:', lastError);
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error in check-zoho-status:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        is_enabled: false,
        token_status: 'error',
        debug_info: [`General error: ${error.message}`]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});