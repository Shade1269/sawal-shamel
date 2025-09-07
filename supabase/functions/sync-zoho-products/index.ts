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
    const { shopId, accessToken, organizationId } = await req.json();

    console.log('Starting Zoho products sync for shop:', shopId);

    // Fetch products from Zoho Inventory API
    const zohoResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!zohoResponse.ok) {
      const errorText = await zohoResponse.text();
      console.error('Zoho API error:', zohoResponse.status, errorText);
      throw new Error(`Zoho API error: ${zohoResponse.status} - ${errorText}`);
    }

    const zohoData = await zohoResponse.json();
    console.log('Zoho products fetched:', zohoData.items?.length || 0);

    if (!zohoData.items || zohoData.items.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No products found in Zoho', 
        synced: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get existing Zoho product mappings for this shop
    const { data: existingMappings } = await supabase
      .from('zoho_product_mapping')
      .select('zoho_item_id, local_product_id')
      .eq('shop_id', shopId);

    const existingZohoIds = new Set(existingMappings?.map(m => m.zoho_item_id) || []);

    // Get merchant for this shop
    const { data: shop } = await supabase
      .from('shops')
      .select(`
        owner_id,
        profiles!inner(id)
      `)
      .eq('id', shopId)
      .single();

    if (!shop) {
      throw new Error('Shop not found');
    }

    // Get or create merchant for the shop owner
    let { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', shop.profiles.id)
      .single();

    if (!merchant) {
      const { data: newMerchant, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          profile_id: shop.profiles.id,
          business_name: 'Zoho Import'
        })
        .select('id')
        .single();

      if (merchantError) {
        console.error('Error creating merchant:', merchantError);
        throw new Error('Failed to create merchant');
      }
      merchant = newMerchant;
    }

    let syncedCount = 0;
    const mappings = [];

    // Process each Zoho product
    for (const item of zohoData.items) {
      try {
        // Skip if already synced
        if (existingZohoIds.has(item.item_id)) {
          console.log(`Product ${item.name} already synced, skipping...`);
          continue;
        }

        // Create product in local database
        const productData = {
          merchant_id: merchant.id,
          title: item.name || 'Untitled Product',
          description: item.description || '',
          price_sar: parseFloat(item.rate) || 0,
          stock: item.available_stock || 0,
          category: item.category_name || 'General',
          image_urls: item.image_documents?.map((img: any) => img.file_path) || [],
          is_active: item.status === 'active',
        };

        const { data: product, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (productError) {
          console.error('Error creating product:', productError);
          continue;
        }

        // Create mapping
        mappings.push({
          shop_id: shopId,
          zoho_item_id: item.item_id,
          local_product_id: product.id
        });

        syncedCount++;
        console.log(`Synced product: ${item.name}`);

      } catch (error) {
        console.error(`Error processing product ${item.name}:`, error);
        continue;
      }
    }

    // Save all mappings at once
    if (mappings.length > 0) {
      const { error: mappingError } = await supabase
        .from('zoho_product_mapping')
        .insert(mappings);

      if (mappingError) {
        console.error('Error saving mappings:', mappingError);
      }
    }

    // Update sync timestamp
    await supabase
      .from('zoho_integration')
      .update({ 
        last_sync_at: new Date().toISOString(),
        is_enabled: true 
      })
      .eq('shop_id', shopId);

    console.log(`Sync completed. Products synced: ${syncedCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully synced ${syncedCount} products from Zoho`,
      synced: syncedCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-zoho-products:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});