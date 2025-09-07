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

    // Group items by base product name (extract base name from SKU or name)
    const productGroups = new Map();
    
    for (const item of zohoData.items) {
      // Skip if already exists
      if (existingZohoIds.has(item.item_id)) {
        continue;
      }

      // Extract base product name (remove variant suffixes like /L, /M, -BE, etc.)
      let baseName = item.name;
      if (item.sku) {
        // Try to extract base name from SKU (e.g., "TES-BE/L" -> "TES")
        const skuParts = item.sku.split('-');
        if (skuParts.length > 1) {
          baseName = skuParts[0];
        }
      }

      if (!productGroups.has(baseName)) {
        productGroups.set(baseName, []);
      }
      productGroups.get(baseName).push(item);
    }

    // Process each product group
    for (const [baseName, items] of productGroups) {
      try {
        // Use first item for base product info
        const baseItem = items[0];
        
        // Process product images from first item
        let imageUrls = [];
        if (baseItem.image_documents && baseItem.image_documents.length > 0) {
          imageUrls = baseItem.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
        }

        // Calculate total stock for base product
        const totalStock = items.reduce((sum, item) => sum + (parseInt(item.stock_on_hand) || 0), 0);
        
        // Use average price or price from first item
        const basePrice = parseFloat(baseItem.rate) || 0;

        const productData = {
          merchant_id: merchant.id,
          title: baseName,
          description: baseItem.description || '',
          price_sar: basePrice,
          stock: totalStock,
          category: baseItem.category_name || 'General',
          image_urls: imageUrls,
          is_active: baseItem.status === 'active',
          commission_rate: null,
        };

        // Create the base product
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (productError) {
          console.error('Error creating product:', productError);
          continue;
        }

        // Create variants for each item in the group
        const variants = [];
        for (const item of items) {
          const variantData: any = {
            product_id: product.id,
            stock: parseInt(item.stock_on_hand) || 0,
            price_modifier: (parseFloat(item.rate) || 0) - basePrice,
            sku: item.sku || `${baseName}-${item.item_id}`,
          };

          // Determine variant type and value based on attributes or SKU
          if (item.attribute_option_name1 || item.attribute_option_name2) {
            // Use attributes if available
            const variantParts = [];
            if (item.attribute_option_name1) variantParts.push(item.attribute_option_name1);
            if (item.attribute_option_name2) variantParts.push(item.attribute_option_name2);
            
            variantData.variant_type = 'color_size';
            variantData.variant_value = variantParts.join('/');
          } else if (item.sku && item.sku.includes('-')) {
            // Extract variant from SKU
            const skuVariant = item.sku.split('-').slice(1).join('-');
            variantData.variant_type = 'variant';
            variantData.variant_value = skuVariant;
          } else {
            // Default variant
            variantData.variant_type = 'default';
            variantData.variant_value = 'default';
          }

          variants.push(variantData);

          // Create mapping for each item
          mappings.push({
            shop_id: shopId,
            zoho_item_id: item.item_id,
            local_product_id: product.id
          });
        }

        // Insert all variants for this product
        if (variants.length > 0) {
          const { error: variantsError } = await supabase
            .from('product_variants')
            .insert(variants);

          if (variantsError) {
            console.error('Error creating product variants:', variantsError);
          }
        }

        syncedCount += items.length;
        console.log(`Synced product: ${baseName} with ${items.length} variants`);

      } catch (error) {
        console.error(`Error processing product group ${baseName}:`, error);
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