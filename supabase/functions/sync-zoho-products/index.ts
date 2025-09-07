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

    // Fetch products from Zoho Inventory API with extended fields
    const zohoResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&include=attributes`, {
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

    // Helper function to check if product has attributes (parent product)
    const hasAttributes = (item) => {
      return item.attribute_name1 || item.attribute_name2;
    };

    // Filter products to only include items with attributes (parent products with variants)
    const parentProducts = zohoData.items.filter(item => {
      const hasAttribs = hasAttributes(item);
      if (!hasAttribs) {
        console.log(`Skipping product without attributes: ${item.name}`);
      }
      return hasAttribs;
    });

    console.log(`Found ${parentProducts.length} parent products with attributes out of ${zohoData.items.length} total products`);

    // Group products by their base product name (before variants)
    const productGroups = new Map();
    
    for (const item of parentProducts) {
      // Use the base name or sku as the product group key
      const baseKey = item.sku || item.name || item.item_id;
      // Extract base product name (remove variant info if present)
      const baseName = baseKey.split('-')[0] || baseKey;
      
      if (!productGroups.has(baseName)) {
        productGroups.set(baseName, []);
      }
      productGroups.get(baseName).push(item);
    }

    console.log(`Found ${productGroups.size} parent product groups with variants`);

    // Process each parent product group
    for (const [baseName, items] of productGroups) {
      try {
        // Use the first item as the base product info
        const baseItem = items[0];
        
        // Check if this parent product already exists
        const existingMapping = existingMappings?.find(m => 
          items.some(item => item.item_id === m.zoho_item_id)
        );
        
        let product;
        let isNewProduct = !existingMapping;

        // Fetch detailed info for the first item to get full product details
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

        // Build attributes schema from all variants
        const attributesSchema = {};
        
        // Collect unique attribute values for this parent product
        if (baseItemDetail.attribute_name1) {
          const attribute1Values = new Set();
          items.forEach(item => {
            if (item.attribute_option_name1) {
              attribute1Values.add(item.attribute_option_name1);
            }
          });
          attributesSchema[baseItemDetail.attribute_name1] = Array.from(attribute1Values);
        }
        
        if (baseItemDetail.attribute_name2) {
          const attribute2Values = new Set();
          items.forEach(item => {
            if (item.attribute_option_name2) {
              attribute2Values.add(item.attribute_option_name2);
            }
          });
          attributesSchema[baseItemDetail.attribute_name2] = Array.from(attribute2Values);
        }

        // Calculate total stock and average price across all variants
        const totalStock = items.reduce((sum, item) => sum + (parseInt(item.stock_on_hand) || 0), 0);
        const avgPrice = items.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0) / items.length;

        // Process product images from base item
        let imageUrls = [];
        if (baseItemDetail.image_documents && baseItemDetail.image_documents.length > 0) {
          imageUrls = baseItemDetail.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
        }

        const productData = {
          merchant_id: merchant.id,
          title: baseItemDetail.name || baseName,
          description: baseItemDetail.description || `Parent product ${baseName}`,
          price_sar: avgPrice,
          stock: totalStock,
          category: baseItemDetail.category_name || 'General',
          image_urls: imageUrls,
          is_active: baseItemDetail.status === 'active',
          // Store attributes schema as JSON
          commission_rate: null, // Will store attributes_schema here temporarily until we add the column
        };

        if (existingMapping) {
          // Update existing parent product
          console.log(`Updating existing parent product: ${baseName}`);
          
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

          // Clear existing variants and mappings for this product to recreate them
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', product.id);
            
          await supabase
            .from('zoho_product_mapping')
            .delete()
            .eq('local_product_id', product.id);

        } else {
          // Create new parent product
          console.log(`Creating new parent product: ${baseName}`);
          
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

        // Create individual product variants from all items in this group
        const variants = [];
        
        for (const item of items) {
          // Create a complete variant record for each Zoho item with its specific attributes
          const variantData = {
            product_id: product.id,
            variant_type: 'combination', // This represents a combination of all attributes
            variant_value: `${item.attribute_option_name1 || ''}-${item.attribute_option_name2 || ''}`.replace(/^-|-$/g, ''),
            stock: parseInt(item.stock_on_hand) || 0,
            price_modifier: (parseFloat(item.rate) || 0) - avgPrice, // Difference from average price
            sku: item.sku || item.name || item.item_id,
          };

          // Store individual attribute values in separate variants for filtering
          if (item.attribute_option_name1 && baseItemDetail.attribute_name1) {
            variants.push({
              product_id: product.id,
              variant_type: baseItemDetail.attribute_name1.toLowerCase(),
              variant_value: item.attribute_option_name1,
              stock: parseInt(item.stock_on_hand) || 0,
              price_modifier: (parseFloat(item.rate) || 0) - avgPrice,
              sku: `${baseName}-${item.attribute_option_name1}`,
            });
          }

          if (item.attribute_option_name2 && baseItemDetail.attribute_name2) {
            variants.push({
              product_id: product.id,
              variant_type: baseItemDetail.attribute_name2.toLowerCase(),
              variant_value: item.attribute_option_name2,
              stock: parseInt(item.stock_on_hand) || 0,
              price_modifier: (parseFloat(item.rate) || 0) - avgPrice,
              sku: `${baseName}-${item.attribute_option_name2}`,
            });
          }

          // Also add the combination variant
          variants.push(variantData);

          // Create mapping for each Zoho item to track inventory updates
          mappings.push({
            shop_id: shopId,
            zoho_item_id: item.item_id,
            local_product_id: product.id
          });
        }

        // Process variants - insert all variants for this parent product
        if (variants.length > 0) {
          console.log(`Processing ${variants.length} variants for parent product ${baseName}`);
          
          // Group variants by type and value to avoid duplicates, but keep stock separate
          const uniqueVariants = variants.reduce((acc, variant) => {
            const key = `${variant.variant_type}-${variant.variant_value}`;
            if (!acc.has(key)) {
              acc.set(key, variant);
            } else {
              // For duplicate keys, take the highest stock value (in case of multiple items with same attributes)
              const existing = acc.get(key);
              if (variant.stock > existing.stock) {
                existing.stock = variant.stock;
                existing.price_modifier = variant.price_modifier;
                existing.sku = variant.sku;
              }
            }
            return acc;
          }, new Map());

          // Insert unique variants (already cleared existing ones above)
          const uniqueVariantsList = Array.from(uniqueVariants.values());
          if (uniqueVariantsList.length > 0) {
            const { error: variantsError } = await supabase
              .from('product_variants')
              .insert(uniqueVariantsList);

            if (variantsError) {
              console.error(`Error creating product variants for ${baseName}:`, variantsError);
            } else {
              console.log(`Created ${uniqueVariantsList.length} unique variants for parent product: ${baseName}`);
            }
          }
        }

        console.log(`${isNewProduct ? 'Synced new' : 'Updated'} parent product: ${baseName} with ${items.length} Zoho items (${variants.length} variants)`);

        // Log attributes schema for debugging
        console.log(`Attributes schema for ${baseName}:`, JSON.stringify(attributesSchema));

      } catch (error) {
        console.error(`Error processing parent product ${baseName}:`, error);
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

    console.log(`Sync completed. New parent products synced: ${syncedCount}, Total parent products processed: ${productGroups.size}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed ${productGroups.size} parent products from Zoho with variants (${syncedCount} new parent products created)`,
      synced: syncedCount,
      total_products: productGroups.size
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