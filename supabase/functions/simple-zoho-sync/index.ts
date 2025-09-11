import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { access_token, organization_id, user_id } = await req.json();

    if (!access_token || !organization_id || !user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Starting simple Zoho sync for user:', user_id);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user_id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get or create merchant
    let { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (!merchant) {
      const { data: newMerchant, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          profile_id: profile.id,
          business_name: 'Zoho Store'
        })
        .select('id')
        .single();

      if (merchantError) {
        throw new Error('Failed to create merchant: ' + merchantError.message);
      }
      merchant = newMerchant;
    }

    // Fetch items from Zoho
    console.log('Fetching items from Zoho...');
    const zohoResponse = await fetch(
      `https://www.zohoapis.ca/inventory/v1/items?organization_id=${organization_id}&per_page=200`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!zohoResponse.ok) {
      const errorText = await zohoResponse.text();
      console.error('Zoho API error:', errorText);
      throw new Error(`Zoho API error: ${zohoResponse.status} - ${errorText}`);
    }

    const zohoData = await zohoResponse.json();
    const items = zohoData.items || [];

    console.log(`Found ${items.length} items in Zoho`);

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          synced_count: 0,
          message: 'No items found in Zoho'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let syncedCount = 0;

    // Process each item as a separate product
    for (const item of items) {
      try {
        const productData = {
          title: item.name || `Zoho Item ${item.item_id}`,
          description: item.description || '',
          category: item.category_name || 'General',
          merchant_id: merchant.id,
          price_sar: parseFloat(item.rate) || 0,
          stock: item.available_stock || 0,
          is_active: item.status === 'active',
          external_id: `zoho_${item.item_id}`,
          image_urls: []
        };

        // Try to get item image
        if (item.image_name) {
          try {
            const imageResponse = await fetch(
              `https://www.zohoapis.ca/inventory/v1/items/${item.item_id}/image?organization_id=${organization_id}`,
              {
                headers: {
                  'Authorization': `Zoho-oauthtoken ${access_token}`,
                },
              }
            );

            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.arrayBuffer();
              const fileName = `zoho-${item.item_id}-${Date.now()}.jpg`;
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, imageBuffer, {
                  contentType: 'image/jpeg',
                  cacheControl: '3600'
                });

              if (!uploadError && uploadData) {
                const { data: { publicUrl } } = supabase.storage
                  .from('product-images')
                  .getPublicUrl(fileName);
                
                productData.image_urls = [publicUrl];
              }
            }
          } catch (imageError) {
            console.log(`Failed to download image for item ${item.item_id}:`, imageError);
          }
        }

        // Insert or update product
        const { data: product, error: productError } = await supabase
          .from('products')
          .upsert(productData, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
          .select('id')
          .single();

        if (productError) {
          console.error('Error creating product:', productError);
          continue;
        }

        // Create a single variant for the product
        const variantData = {
          product_id: product.id,
          variant_type: 'simple',
          variant_value: 'Default',
          price_modifier: 0,
          stock: item.available_stock || 0,
          sku: item.sku || '',
          external_id: `zoho_variant_${item.item_id}`
        };

        const { error: variantError } = await supabase
          .from('product_variants')
          .upsert(variantData, { onConflict: 'external_id' });

        if (variantError) {
          console.error('Error creating variant:', variantError);
        }

        // Create product mapping
        const mappingData = {
          shop_id: profile.id,
          zoho_item_id: item.item_id,
          local_product_id: product.id
        };

        const { error: mappingError } = await supabase
          .from('zoho_product_mapping')
          .upsert(mappingData, { 
            onConflict: 'shop_id,zoho_item_id',
            ignoreDuplicates: false 
          });

        if (mappingError) {
          console.error('Error creating mapping:', mappingError);
        }

        syncedCount++;
        console.log(`Synced product: ${item.name} (ID: ${item.item_id})`);

      } catch (itemError) {
        console.error(`Error processing item ${item.item_id}:`, itemError);
      }
    }

    // Update last sync time
    await supabase
      .from('zoho_integration')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('shop_id', profile.id);

    console.log(`Sync completed. Synced ${syncedCount} out of ${items.length} items`);

    return new Response(
      JSON.stringify({ 
        success: true,
        synced_count: syncedCount,
        total_items: items.length,
        message: `Successfully synced ${syncedCount} products from Zoho`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in simple Zoho sync:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});