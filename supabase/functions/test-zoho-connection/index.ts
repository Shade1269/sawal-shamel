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
    const { access_token, organization_id } = await req.json();

    if (!access_token || !organization_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing access_token or organization_id' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Testing Zoho connection with organization:', organization_id);

    // Test connection to Zoho API
    const testResponse = await fetch(
      `https://www.zohoapis.ca/inventory/v1/items?organization_id=${organization_id}&limit=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Zoho API response status:', testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('Zoho API error:', errorText);
      
      let errorMessage = 'خطأ في الاتصال مع Zoho';
      if (testResponse.status === 401) {
        errorMessage = 'Access Token غير صالح أو منتهي الصلاحية';
      } else if (testResponse.status === 403) {
        errorMessage = 'ليس لديك صلاحية للوصول لهذا Organization';
      } else if (testResponse.status === 404) {
        errorMessage = 'Organization ID غير صحيح';
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: errorText,
          status: testResponse.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await testResponse.json();
    const itemsCount = data.items?.length || 0;

    console.log('Connection test successful, items found:', itemsCount);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'تم الاتصال بنجاح!',
        items_count: itemsCount,
        organization_id: organization_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error testing Zoho connection:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'خطأ في الخادم: ' + error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});