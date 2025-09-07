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

    // Helper function to check if product name follows code pattern
    const isCodedProduct = (name) => {
      if (!name) return false;
      // Enhanced patterns to match various coded formats:
      // - AS25-GR/XL, AS10-BL/M (slash format)
      // - AS10-RE-XL, AS10-RE-L, AS10-RE-XXL (dash format)
      const patterns = [
        /^[A-Z0-9]+-[A-Z]+\/[A-Z0-9]+$/,    // AS25-GR/XL format
        /^[A-Z0-9]+-[A-Z]+-[A-Z0-9]*$/      // AS10-RE-XL format
      ];
      return patterns.some(pattern => pattern.test(name));
    };

    // Filter products to only include coded products (exclude linguistic/descriptive names)
    const codedProducts = zohoData.items.filter(item => {
      const isCoded = isCodedProduct(item.name);
      if (!isCoded) {
        console.log(`Skipping non-coded product: ${item.name}`);
      }
      return isCoded;
    });

    console.log(`Found ${codedProducts.length} coded products out of ${zohoData.items.length} total products`);

    // Group products by model (extract product code before first dash)
    const productGroups = new Map();
    
    for (const item of codedProducts) {
      // Extract product model from name (e.g., "AS25-GR/XL" or "AS10-RE-XL" -> "AS25" or "AS10")
      const modelMatch = item.name?.match(/^([A-Z0-9]+)-/);
      const modelCode = modelMatch ? modelMatch[1] : item.name || 'UNKNOWN';
      
      if (!productGroups.has(modelCode)) {
        productGroups.set(modelCode, []);
      }
      productGroups.get(modelCode).push(item);
    }

    console.log(`Found ${productGroups.size} product models with variants`);

    // Process each product group
    for (const [modelCode, items] of productGroups) {
      try {
        // Use the first item as the base product info
        const baseItem = items[0];
        
        // Check if this model already exists
        const existingMapping = existingMappings?.find(m => 
          items.some(item => item.item_id === m.zoho_item_id)
        );
        
        let product;
        let isNewProduct = !existingMapping;

        // Fetch detailed info for the first item to get description, category etc.
        const itemDetailResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items/${baseItem.item_id}?organization_id=${organizationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        let baseItemDetail = baseItem;
        if (itemDetailResponse.ok) {
          const itemDetailData = await itemDetailResponse.json();
          baseItemDetail = itemDetailData.item || baseItem;
        }

        // Calculate total stock and average price for the model
        const totalStock = items.reduce((sum, item) => sum + (item.available_stock || 0), 0);
        const avgPrice = items.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0) / items.length;

        // Process product images from base item
        let imageUrls = [];
        if (baseItemDetail.image_documents && baseItemDetail.image_documents.length > 0) {
          imageUrls = baseItemDetail.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
        }

        const productData = {
          merchant_id: merchant.id,
          title: modelCode, // Use model code as title
          description: baseItemDetail.description || `Product model ${modelCode}`,
          price_sar: avgPrice,
          stock: totalStock,
          category: baseItemDetail.category_name || 'General',
          image_urls: imageUrls,
          is_active: baseItemDetail.status === 'active',
        };

        if (existingMapping) {
          // Update existing product
          console.log(`Updating existing product model: ${modelCode}`);
          
          const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({
              ...productData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingMapping.local_product_id)
            .select('id')
            .single();

          if (updateError) {
            console.error('Error updating product:', updateError);
            continue;
          }
          product = updatedProduct;

          // Clear existing mappings for this product to recreate them
          await supabase
            .from('zoho_product_mapping')
            .delete()
            .eq('local_product_id', product.id);

        } else {
          // Create new product
          console.log(`Creating new product model: ${modelCode}`);
          
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
          syncedCount++;
        }

        // Create variants from all items in this group
        const variants = [];
        
        for (const item of items) {
          // Parse color and size from item name supporting multiple formats
          let variantMatch = item.name?.match(/^[A-Z0-9]+-([A-Z]+)\/([A-Z0-9]*)$/); // AS25-GR/XL
          let colorCode, sizeCode;
          
          if (variantMatch) {
            colorCode = variantMatch[1]; // e.g., "GR", "BL", "RE"
            sizeCode = variantMatch[2];  // e.g., "XL", "M", "L"
          } else {
            // Try dash format: AS10-RE-XL
            variantMatch = item.name?.match(/^[A-Z0-9]+-([A-Z]+)-([A-Z0-9]*)$/);
            if (variantMatch) {
              colorCode = variantMatch[1];
              sizeCode = variantMatch[2];
            }
          }
          
          if (colorCode) {
            // Add color variant
            variants.push({
              product_id: product.id,
              variant_type: 'color',
              variant_value: colorCode,
              stock: item.available_stock || 0,
              price_modifier: 0,
              sku: `${modelCode}-${colorCode}`
            });

            // Add size variant if exists
            if (sizeCode) {
              variants.push({
                product_id: product.id,
                variant_type: 'size',
                variant_value: sizeCode,
                stock: item.available_stock || 0,
                price_modifier: 0,
                sku: `${modelCode}-${colorCode}-${sizeCode}`
              });
            }
          }

          // Create mapping for each Zoho item (both new and updated products need mappings)
          mappings.push({
            shop_id: shopId,
            zoho_item_id: item.item_id,
            local_product_id: product.id
          });
        }

        // Process variants using upsert to avoid duplicates
        if (variants.length > 0) {
          console.log(`Processing ${variants.length} variants for product ${modelCode}`);
          
          // Group variants by type and value to avoid duplicates
          const uniqueVariants = variants.reduce((acc, variant) => {
            const key = `${variant.variant_type}-${variant.variant_value}`;
            if (!acc.has(key)) {
              acc.set(key, variant);
            } else {
              // Accumulate stock for duplicates
              const existing = acc.get(key);
              existing.stock += variant.stock;
            }
            return acc;
          }, new Map());

          // Clear existing variants for this product to recreate them
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', product.id);

          // Insert unique variants
          const uniqueVariantsList = Array.from(uniqueVariants.values());
          if (uniqueVariantsList.length > 0) {
            const { error: variantsError } = await supabase
              .from('product_variants')
              .insert(uniqueVariantsList);

            if (variantsError) {
              console.error(`Error creating product variants for ${modelCode}:`, variantsError);
            } else {
              console.log(`Created ${uniqueVariantsList.length} unique variants for model: ${modelCode}`);
            }
          }
        }

        console.log(`${isNewProduct ? 'Synced new' : 'Updated'} product model: ${modelCode} with ${items.length} variants`);

      } catch (error) {
        console.error(`Error processing product model ${modelCode}:`, error);
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

    console.log(`Sync completed. New product models synced: ${syncedCount}, Total models processed: ${productGroups.size}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed ${productGroups.size} product models from Zoho (${syncedCount} new models created)`,
      synced: syncedCount,
      total_models: productGroups.size
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