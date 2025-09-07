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

    // Helper function to extract parent key from SKU or name
    const extractParentKey = (item: any) => {
      // First try to extract from SKU if it has the pattern "XXX-YYY/ZZZ"
      if (item.sku && item.sku.includes('-')) {
        const beforeDash = item.sku.split('-')[0];
        if (beforeDash) return beforeDash;
      }
      
      // Fallback: use name before any dash or special character
      if (item.name) {
        const beforeDash = item.name.split('-')[0];
        return beforeDash.trim();
      }
      
      return item.name || item.sku || item.item_id;
    };

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

    // Group items by parent key for proper variant handling
    const productGroups = new Map();
    
    for (const item of zohoData.items) {
      // Skip if already exists
      if (existingZohoIds.has(item.item_id)) {
        continue;
      }

      // Extract parent key using the new logic
      const parentKey = extractParentKey(item);

      if (!productGroups.has(parentKey)) {
        productGroups.set(parentKey, []);
      }
      productGroups.get(parentKey).push(item);
    }

    // Process each product group
    for (const [parentKey, items] of productGroups) {
      try {
    // Process each product group
    for (const [parentKey, items] of productGroups) {
      try {
        // Build attributes schema from all variants
        const attributesSchema: any = {};
        const colorValues = new Set();
        const sizeValues = new Set();
        
        for (const item of items) {
          const { color, size } = extractColorSize(item);
          
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

        // Use first item for base product info
        const baseItem = items[0];
        
        // Process product images from first item
        let imageUrls = [];
        if (baseItem.image_documents && baseItem.image_documents.length > 0) {
          imageUrls = baseItem.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
        }

        // Calculate total stock for base product (sum of all variants)
        const totalStock = items.reduce((sum, item) => sum + (parseInt(item.stock_on_hand) || 0), 0);
        
        // Use base price from first item
        const basePrice = parseFloat(baseItem.rate) || 0;

        const productData = {
          merchant_id: merchant.id,
          title: parentKey, // Use parent key as title
          external_id: parentKey, // Use parent key as external_id
          description: baseItem.description || `Parent product for ${parentKey}`,
          price_sar: basePrice,
          stock: totalStock,
          category: baseItem.category_name || 'General',
          image_urls: imageUrls,
          is_active: baseItem.status === 'active',
          commission_rate: null,
          attributes_schema: finalAttributesSchema,
        };

        // Check if product already exists with this external_id
        let { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('external_id', parentKey)
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
              is_active: baseItem.status === 'active',
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
        for (const item of items) {
          const { color, size } = extractColorSize(item);
          
          // Check if variant already exists
          let { data: existingVariant } = await supabase
            .from('product_variants')
            .select('id')
            .eq('external_id', item.item_id)
            .eq('product_id', product.id)
            .single();

          const variantData: any = {
            product_id: product.id,
            external_id: item.item_id,
            stock: parseInt(item.stock_on_hand) || 0,
            price_modifier: (parseFloat(item.rate) || 0) - basePrice,
            sku: item.sku || `${parentKey}-${item.item_id}`,
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

          // Create mapping for each item
          mappings.push({
            shop_id: shopId,
            zoho_item_id: item.item_id,
            local_product_id: product.id
          });
        }

        syncedCount += items.length;
        console.log(`Synced product: ${parentKey} with ${items.length} variants`);

      } catch (error) {
        console.error(`Error processing product group ${parentKey}:`, error);
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