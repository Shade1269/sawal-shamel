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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting Zoho token refresh process');

    // Get all enabled Zoho integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('zoho_integration')
      .select('*')
      .eq('is_enabled', true);

    if (integrationsError) {
      console.error('Error fetching integrations:', integrationsError);
      throw integrationsError;
    }

    if (!integrations || integrations.length === 0) {
      console.log('No enabled Zoho integrations found');
      return new Response(
        JSON.stringify({ success: true, message: 'No integrations to refresh' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh the access token using the refresh token
    const refreshResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: Deno.env.get('ZOHO_CLIENT_ID') || '',
        client_secret: Deno.env.get('ZOHO_CLIENT_SECRET') || '',
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error('Token refresh failed:', errorText);
      throw new Error(`Token refresh failed: ${refreshResponse.status} - ${errorText}`);
    }

    const tokenData = await refreshResponse.json();
    const newAccessToken = tokenData.access_token;

    if (!newAccessToken) {
      throw new Error('No access token received from refresh');
    }

    console.log('Successfully refreshed Zoho access token');

    // Update all integrations with the new access token
    const updatePromises = integrations.map(async (integration) => {
      const { error: updateError } = await supabase
        .from('zoho_integration')
        .update({ 
          access_token: newAccessToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id);

      if (updateError) {
        console.error(`Error updating integration ${integration.id}:`, updateError);
        return { success: false, integration_id: integration.id, error: updateError };
      }

      console.log(`Updated access token for integration ${integration.id} (shop: ${integration.shop_id})`);
      return { success: true, integration_id: integration.id };
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Log the refresh event
    await supabase
      .from('event_log')
      .insert({
        event: 'zoho_token_refresh',
        data: {
          integrations_updated: successCount,
          integrations_failed: failureCount,
          results: results
        }
      });

    console.log(`Token refresh completed: ${successCount} success, ${failureCount} failures`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Token refresh completed',
        integrations_updated: successCount,
        integrations_failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in refresh-zoho-token:', error);
    
    // Log the error
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase
      .from('event_log')
      .insert({
        event: 'zoho_token_refresh_error',
        data: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});