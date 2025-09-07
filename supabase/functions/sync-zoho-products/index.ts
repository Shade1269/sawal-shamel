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

    // Fetch item groups from Zoho Inventory API
    const zohoResponse = await fetch(`https://www.zohoapis.com/inventory/v1/itemgroups?organization_id=${organizationId}`, {
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
    console.log('Zoho item groups fetched:', zohoData.itemgroups?.length || 0);

    if (!zohoData.itemgroups || zohoData.itemgroups.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No item groups found in Zoho', 
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

    // Helper function to extract color and size from SKU
    const extractColorSize = (item: any) => {
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
      
      // If not found in attributes, try to parse from SKU
      // Expected format: "AS14-NB/M" where NB=color, M=size
      if ((!color || !size) && item.sku && item.sku.includes('-') && item.sku.includes('/')) {
        const parts = item.sku.split('-');
        if (parts.length >= 2) {
          const afterDash = parts[1]; // "NB/M"
          const colorSizeParts = afterDash.split('/');
          if (colorSizeParts.length === 2) {
            if (!color) color = colorSizeParts[0]; // "NB"
            if (!size) size = colorSizeParts[1];   // "M"
          }
        }
      }
      
      return { color, size };
    };

    let syncedCount = 0;
    const mappings = [];

    // Process each item group
    for (const itemGroup of zohoData.itemgroups) {
      try {
        // Skip if item group already exists
        if (existingZohoIds.has(itemGroup.group_id)) {
          continue;
        }

        // Fetch variants (items) for this item group
        const variantsResponse = await fetch(`https://www.zohoapis.com/inventory/v1/itemgroups/${itemGroup.group_id}/items?organization_id=${organizationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!variantsResponse.ok) {
          console.error(`Failed to fetch variants for group ${itemGroup.group_id}:`, variantsResponse.status);
          continue;
        }

        const variantsData = await variantsResponse.json();
        const variants = variantsData.items || [];

        if (variants.length === 0) {
          continue;
        }

        // Build attributes schema from all variants
        const attributesSchema: any = {};
        const colorValues = new Set();
        const sizeValues = new Set();
        
        for (const variant of variants) {
          const { color, size } = extractColorSize(variant);
          
          if (color) {
            colorValues.add(color);
            if (!attributesSchema['COLOR']) {
              attributesSchema['COLOR'] = new Set();
            }
            attributesSchema['COLOR'].add(color);
          }
          
          if (size) {
            sizeValues.add(size);
            if (!attributesSchema['SIZE']) {
              attributesSchema['SIZE'] = new Set();
            }
            attributesSchema['SIZE'].add(size);
          }
        }

        // Convert Sets to Arrays for JSON storage
        const finalAttributesSchema: any = {};
        for (const [key, values] of Object.entries(attributesSchema)) {
          finalAttributesSchema[key] = Array.from(values as Set<string>);
        }

        // Use item group info for parent product
        const baseVariant = variants[0];
        
        // Process product images from item group or first variant
        let imageUrls = [];
        if (itemGroup.image_documents && itemGroup.image_documents.length > 0) {
          imageUrls = itemGroup.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
        } else if (baseVariant.image_documents && baseVariant.image_documents.length > 0) {
          imageUrls = baseVariant.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
        }

        // Calculate total stock for parent product (sum of all variants)
        const totalStock = variants.reduce((sum, variant) => sum + (parseInt(variant.stock_on_hand) || 0), 0);
        
        // Use base price from first variant
        const basePrice = parseFloat(baseVariant.rate) || 0;

        const productData = {
          merchant_id: merchant.id,
          title: itemGroup.group_name, // Use item group name as title
          external_id: itemGroup.group_id, // Use item group ID as external_id
          description: itemGroup.description || `Item group: ${itemGroup.group_name}`,
          price_sar: basePrice,
          stock: totalStock,
          category: baseVariant.category_name || 'General',
          image_urls: imageUrls,
          is_active: itemGroup.status === 'active',
          commission_rate: null,
          attributes_schema: finalAttributesSchema,
        };

        // Check if product already exists with this external_id
        let { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('external_id', itemGroup.group_id)
          .eq('merchant_id', merchant.id)
          .single();

        let product;
        if (existingProduct) {
          // Update existing product
          const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({
              stock: totalStock,
              attributes_schema: finalAttributesSchema,
              is_active: itemGroup.status === 'active',
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
          // Create new product
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

        // Create/Update variants for each item in the group
        for (const variant of variants) {
          const { color, size } = extractColorSize(variant);
          
          // Check if variant already exists
          let { data: existingVariant } = await supabase
            .from('product_variants')
            .select('id')
            .eq('external_id', variant.item_id)
            .eq('product_id', product.id)
            .single();

          const variantData: any = {
            product_id: product.id,
            external_id: variant.item_id,
            stock: parseInt(variant.stock_on_hand) || 0,
            price_modifier: (parseFloat(variant.rate) || 0) - basePrice,
            sku: variant.sku || `${itemGroup.group_name}-${variant.item_id}`,
            option1_name: color ? 'COLOR' : null,
            option1_value: color || null,
            option2_name: size ? 'SIZE' : null,
            option2_value: size || null,
            // Keep legacy fields for compatibility
            variant_type: 'combination',
            variant_value: [color, size].filter(Boolean).join('-') || 'default',
          };

          if (existingVariant) {
            // Update existing variant
            const { error: updateVariantError } = await supabase
              .from('product_variants')
              .update({
                stock: variantData.stock,
                price_modifier: variantData.price_modifier,
                option1_name: variantData.option1_name,
                option1_value: variantData.option1_value,
                option2_name: variantData.option2_name,
                option2_value: variantData.option2_value,
                variant_value: variantData.variant_value,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingVariant.id);

            if (updateVariantError) {
              console.error('Error updating variant:', updateVariantError);
            }
          } else {
            // Create new variant
            const { error: variantError } = await supabase
              .from('product_variants')
              .insert(variantData);

            if (variantError) {
              console.error('Error creating variant:', variantError);
            }
          }

          // Create mapping for each variant
          mappings.push({
            shop_id: shopId,
            zoho_item_id: variant.item_id,
            local_product_id: product.id
          });
        }

        // Also create mapping for the item group itself
        mappings.push({
          shop_id: shopId,
          zoho_item_id: itemGroup.group_id,
          local_product_id: product.id
        });

        syncedCount += variants.length;
        console.log(`Synced item group: ${itemGroup.group_name} with ${variants.length} variants`);

      } catch (error) {
        console.error(`Error processing item group ${itemGroup.group_name}:`, error);
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

    console.log(`Sync completed. Item groups synced: ${syncedCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully synced ${syncedCount} variants from ${zohoData.itemgroups.length} item groups`,
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
