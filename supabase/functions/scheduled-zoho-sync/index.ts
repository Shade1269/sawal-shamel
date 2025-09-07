import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled Zoho sync for all enabled integrations...');

    // Get all enabled Zoho integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('zoho_integration')
      .select(`
        shop_id,
        access_token,
        organization_id,
        shops!inner(
          owner_id,
          display_name
        )
      `)
      .eq('is_enabled', true)
      .not('access_token', 'is', null)
      .not('organization_id', 'is', null);

    if (integrationsError) {
      console.error('Error fetching integrations:', integrationsError);
      throw new Error('Failed to fetch Zoho integrations');
    }

    if (!integrations || integrations.length === 0) {
      console.log('No enabled Zoho integrations found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No enabled integrations to sync',
        synced_shops: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalSynced = 0;
    const syncResults = [];

    // Process each integration
    for (const integration of integrations) {
      try {
        console.log(`Syncing shop: ${integration.shops.display_name} (${integration.shop_id})`);

        // Call the existing sync function
        const syncResponse = await supabase.functions.invoke('sync-zoho-products', {
          body: {
            shopId: integration.shop_id,
            accessToken: integration.access_token,
            organizationId: integration.organization_id
          }
        });

        if (syncResponse.error) {
          console.error(`Error syncing shop ${integration.shop_id}:`, syncResponse.error);
          syncResults.push({
            shop_id: integration.shop_id,
            shop_name: integration.shops.display_name,
            success: false,
            error: syncResponse.error.message
          });
          continue;
        }

        const result = syncResponse.data;
        totalSynced += result.synced || 0;
        
        syncResults.push({
          shop_id: integration.shop_id,
          shop_name: integration.shops.display_name,
          success: true,
          synced: result.synced || 0
        });

        console.log(`Successfully synced ${result.synced || 0} products for shop ${integration.shops.display_name}`);

      } catch (error) {
        console.error(`Error processing shop ${integration.shop_id}:`, error);
        syncResults.push({
          shop_id: integration.shop_id,
          shop_name: integration.shops?.display_name || 'Unknown',
          success: false,
          error: error.message
        });
      }
    }

    // Log the sync event
    await supabase
      .from('event_log')
      .insert({
        event: 'scheduled_zoho_sync',
        data: {
          total_shops: integrations.length,
          successful_syncs: syncResults.filter(r => r.success).length,
          total_products_synced: totalSynced,
          results: syncResults
        }
      });

    console.log(`Scheduled sync completed. Total products synced: ${totalSynced} across ${integrations.length} shops`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Scheduled sync completed for ${integrations.length} shops`,
      total_products_synced: totalSynced,
      shops_processed: integrations.length,
      successful_syncs: syncResults.filter(r => r.success).length,
      results: syncResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scheduled-zoho-sync:', error);
    
    // Log the error event
    await supabase
      .from('event_log')
      .insert({
        event: 'scheduled_zoho_sync_error',
        data: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});