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

    const { userId } = await req.json();

    console.log('Starting Zoho products sync for user:', userId);

    // Get Zoho integration settings
    const { data: integration } = await supabase
      .from('zoho_integration')
      .select('*')
      .eq('is_enabled', true)
      .single();

    if (!integration) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No Zoho integration found or disabled' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Run the heavy sync work in the background to avoid client timeouts
    EdgeRuntime.waitUntil((async () => {
      try {
        // Fetch all items from Zoho Inventory API with pagination
        let allItems = [];
        let page = 1;
        let hasMorePages = true;
        const perPage = 200; // Maximum items per page for Zoho API

        console.log('Starting to fetch all items from Zoho...');

        while (hasMorePages) {
          const zohoResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${integration.organization_id}&page=${page}&per_page=${perPage}`, {
            method: 'GET',
            headers: {
              'Authorization': `Zoho-oauthtoken ${integration.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!zohoResponse.ok) {
            const errorText = await zohoResponse.text();
            console.error('Zoho API error:', zohoResponse.status, errorText);
            throw new Error(`Zoho API error: ${zohoResponse.status} - ${errorText}`);
          }

          const zohoData = await zohoResponse.json();
          const pageItems = zohoData.items || [];
          
          console.log(`Fetched page ${page}: ${pageItems.length} items`);
          allItems = allItems.concat(pageItems);

          // Check if there are more pages
          const pageInfo = zohoData.page_context || {};
          hasMorePages = pageInfo.has_more_page || false;
          
          // Also check if we got fewer items than requested (indicates last page)
          if (pageItems.length < perPage) {
            hasMorePages = false;
          }

          page++;
          
          // Safety check to prevent infinite loops
          if (page > 50) {
            console.warn('Reached maximum page limit (50), stopping pagination');
            break;
          }
        }

        console.log(`Total Zoho items fetched: ${allItems.length}`);

        if (!allItems || allItems.length === 0) {
          console.log('No items found in Zoho');
          return;
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', userId)
          .single();

        if (!userProfile) {
          throw new Error('User profile not found');
        }

        // Get existing Zoho product mappings for this user
        const { data: existingMappings } = await supabase
          .from('zoho_product_mapping')
          .select('zoho_item_id, local_product_id')
          .eq('shop_id', userProfile.id);

        const existingZohoIds = new Set(existingMappings?.map(m => m.zoho_item_id) || []);

        // Get or create merchant for the user
        let { data: merchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('profile_id', userProfile.id)
          .single();

        if (!merchant) {
          const { data: newMerchant, error: merchantError } = await supabase
            .from('merchants')
            .insert({
              profile_id: userProfile.id,
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

        // Helper function to extract base model, color and size from SKU
        const extractProductInfo = (item: any) => {
          let baseModel = null;
          let color = null;
          let size = null;
          
          // First try from Zoho attributes if available
          if (item.attribute_name1 && item.attribute_option_name1) {
            if (item.attribute_name1 === 'COLOR') {
              color = item.attribute_option_name1;
            }
          }
          
          if (item.attribute_name2 && item.attribute_option_name2) {
            if (item.attribute_name2 === 'SIZE') {
              size = item.attribute_option_name2;
            }
          }
          
          // Parse from SKU - Expected format: "AS14-NB/M" where AS14=model, NB=color, M=size
          if (item.sku && item.sku.includes('-')) {
            const parts = item.sku.split('-');
            if (parts.length >= 2) {
              baseModel = parts[0]; // "AS14"
              
              if (parts[1].includes('/')) {
                const afterDash = parts[1]; // "NB/M"
                const colorSizeParts = afterDash.split('/');
                if (colorSizeParts.length === 2) {
                  if (!color) color = colorSizeParts[0]; // "NB"
                  if (!size) size = colorSizeParts[1];   // "M"
                }
              }
            }
          }
          
          // Fallback: use item name as base model if SKU parsing fails
          if (!baseModel) {
            baseModel = item.name?.split('-')[0] || item.name || `Item_${item.item_id}`;
          }
          
          return { baseModel, color, size };
        };

        let syncedCount = 0;
        const mappings = [];

        // Process each item as individual product (no grouping by model)
        const BATCH_SIZE = 50;
        console.log(`Processing ${allItems.length} individual items as separate products`);
        console.log(`Processing in batches of ${BATCH_SIZE} items...`);
        
        for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
          const batch = allItems.slice(i, i + BATCH_SIZE);
          console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(allItems.length/BATCH_SIZE)}: ${batch.length} items`);

          // Process each item in current batch
          for (const item of batch) {
            try {
              // Skip if this item already exists
              if (existingZohoIds.has(item.item_id)) {
                continue;
              }

              const { baseModel, color, size } = extractProductInfo(item);

              // Build attributes schema from item attributes
              const attributesSchema: any = {};
              if (color) {
                attributesSchema['COLOR'] = [color];
              }
              if (size) {
                attributesSchema['SIZE'] = [size];
              }
              
              // Process product images
              let imageUrls = [];
              if (item.image_documents && item.image_documents.length > 0) {
                imageUrls = item.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
              }

              // Use item stock and price directly
              const itemStock = parseInt(item.stock_on_hand) || 0;
              const itemPrice = parseFloat(item.rate) || 0;

              const productData = {
                merchant_id: merchant.id,
                title: item.name || baseModel, // Use item name directly
                external_id: item.item_id, // Use item_id as external_id for individual items
                description: item.description || `${item.name || baseModel}${color ? ` - ${color}` : ''}${size ? ` - ${size}` : ''}`,
                price_sar: itemPrice,
                stock: itemStock,
                category: item.category_name || 'General',
                image_urls: imageUrls,
                is_active: item.status === 'active',
                commission_rate: null,
                attributes_schema: attributesSchema,
              };

              // Check if product already exists with this external_id
              let { data: existingProduct } = await supabase
                .from('products')
                .select('id')
                .eq('external_id', item.item_id)
                .eq('merchant_id', merchant.id)
                .single();

              let product;
              if (existingProduct) {
                // Update existing product in Supabase
                const { data: updatedProduct, error: updateError } = await supabase
                  .from('products')
                  .update({
                    title: productData.title,
                    description: productData.description,
                    price_sar: productData.price_sar,
                    stock: productData.stock,
                    category: productData.category,
                    image_urls: productData.image_urls,
                    is_active: productData.is_active,
                    attributes_schema: productData.attributes_schema,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', existingProduct.id)
                  .select('id')
                  .single();
                
                if (updateError) {
                  console.error('Error updating product:', updateError);
                  continue;
                }
                product = updatedProduct;
              } else {
                // Create new product in Supabase
                const { data: newProduct, error: productError } = await supabase
                  .from('products')
                  .insert(productData)
                  .select('id')
                  .single();

                if (productError) {
                  console.error('Error creating product:', productError);
                  continue;
                }
                product = newProduct;
              }

              // Create mapping for this item
              mappings.push({
                shop_id: userProfile.id,
                zoho_item_id: item.item_id,
                local_product_id: product.id
              });

              syncedCount++;
              console.log(`Synced individual item: ${item.name || baseModel} (${item.item_id})`);

            } catch (error) {
              console.error(`Error processing item ${item.item_id}:`, error);
              continue;
            }
          }

          // Save mappings between batches to avoid large payloads
          if (mappings.length > 0 && (i + BATCH_SIZE >= allItems.length)) {
            const { error: mappingError } = await supabase
              .from('zoho_product_mapping')
              .insert(mappings);

            if (mappingError) {
              console.error('Error saving mappings:', mappingError);
            }
          }
          
          // Small delay between batches to prevent overwhelming the system
          if (i + BATCH_SIZE < allItems.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // Final save of any remaining mappings
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
          .single();

        console.log(`Sync completed. Individual items synced: ${syncedCount}`);
      } catch (error) {
        console.error('Error in sync-zoho-products (background):', error);
      }
    })());

    // Immediate response while work continues in the background
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Sync started. Processing in background.'
    }), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
});
