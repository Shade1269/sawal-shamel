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

// Download and upload image from Zoho with proper error handling
async function uploadImageFromZoho(imageUrl: string, itemId: string, accessToken: string): Promise<string | null> {
  try {
    const timeoutMs = 10000; // 10 seconds timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(imageUrl, {
      headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`Failed to fetch image for item ${itemId}: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    
    // Check file size (max 5MB)
    if (buffer.byteLength > 5 * 1024 * 1024) {
      console.log(`Image too large for item ${itemId}: ${buffer.byteLength} bytes`);
      return null;
    }
    
    const blob = new Blob([buffer], { type: contentType });
    const ext = contentType.includes('png') ? 'png' : 
                contentType.includes('webp') ? 'webp' : 
                contentType.includes('gif') ? 'gif' : 'jpg';
    const filePath = `zoho/${itemId}_${Date.now()}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, blob, { upsert: true, contentType });
      
    if (uploadError) {
      console.error(`Upload error for item ${itemId}:`, uploadError);
      return null;
    }
    
    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data?.publicUrl || null;
    
  } catch (error) {
    console.error(`Error processing image for item ${itemId}:`, error);
    return null;
  }
}

// Get all images for an item from various Zoho sources
async function getAllItemImages(item: any, accessToken: string, organizationId: string): Promise<string[]> {
  const uploadedImages: string[] = [];
  
  // 1. Process image_documents array
  if (item.image_documents && item.image_documents.length > 0) {
    for (const img of item.image_documents) {
      const imageUrl = img.file_path || img.attachment_url || img.document_url;
      if (imageUrl) {
        const uploadedUrl = await uploadImageFromZoho(imageUrl, item.item_id, accessToken);
        if (uploadedUrl) {
          uploadedImages.push(uploadedUrl);
        }
      }
    }
  }
  
  // 2. Try direct image_url if available
  if (item.image_url) {
    const uploadedUrl = await uploadImageFromZoho(item.image_url, item.item_id, accessToken);
    if (uploadedUrl) {
      uploadedImages.push(uploadedUrl);
    }
  }
  
  // 3. Try standard Zoho API image endpoint
  try {
    const endpoint = `https://www.zohoapis.com/inventory/v1/items/${item.item_id}/image?organization_id=${organizationId}`;
    const uploadedUrl = await uploadImageFromZoho(endpoint, item.item_id, accessToken);
    if (uploadedUrl) {
      uploadedImages.push(uploadedUrl);
    }
  } catch (error) {
    console.log(`Failed to fetch from API endpoint for item ${item.item_id}`);
  }
  
  return uploadedImages;
}

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

        // Group items by base model
        const productsByModel: { [key: string]: any[] } = {};
        allItems.forEach(item => {
          const { baseModel } = extractProductInfo(item);
          if (!productsByModel[baseModel]) {
            productsByModel[baseModel] = [];
          }
          productsByModel[baseModel].push(item);
        });

        const modelNames = Object.keys(productsByModel);
        const BATCH_SIZE = 50;
        console.log(`Processing ${modelNames.length} product models in batches of ${BATCH_SIZE}...`);
        
        for (let i = 0; i < modelNames.length; i += BATCH_SIZE) {
          const batch = modelNames.slice(i, i + BATCH_SIZE);
          console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(modelNames.length/BATCH_SIZE)}: ${batch.length} models`);

          // Process each model in current batch
          for (const baseModel of batch) {
            try {
              const items = productsByModel[baseModel];
              const mainItem = items[0]; // Use first item as main product info

              // Skip if this model already exists
              if (existingZohoIds.has(baseModel)) {
                continue;
              }

              // Build attributes schema from all variants
              const attributesSchema: any = {};
              const allColors = new Set<string>();
              const allSizes = new Set<string>();
              
              items.forEach(item => {
                const { color, size } = extractProductInfo(item);
                if (color) allColors.add(color);
                if (size) allSizes.add(size);
              });

              if (allColors.size > 0) {
                attributesSchema['COLOR'] = Array.from(allColors);
              }
              if (allSizes.size > 0) {
                attributesSchema['SIZE'] = Array.from(allSizes);
              }
              
              // Process product images from all variants
              const allImageUrls: string[] = [];
              
              // Only process images for smaller products to avoid performance issues
              if (items.length <= 10) { 
                // Collect images from all variants
                for (const item of items) {
                  const itemImages = await getAllItemImages(item, integration.access_token, integration.organization_id);
                  allImageUrls.push(...itemImages);
                }
              }
              
              // Remove duplicates
              const imageUrls = [...new Set(allImageUrls)];

              // Calculate total stock and average price
              const totalStock = items.reduce((sum, item) => sum + (parseInt(item.stock_on_hand) || 0), 0);
              const averagePrice = items.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0) / items.length;

              const productData = {
                merchant_id: merchant.id,
                title: baseModel,
                external_id: baseModel,
                description: mainItem.description || baseModel,
                price_sar: averagePrice,
                stock: totalStock,
                category: mainItem.category_name || 'General',
                image_urls: imageUrls,
                is_active: mainItem.status === 'active',
                commission_rate: null,
                attributes_schema: attributesSchema,
              };

              // Check if product already exists with this external_id
              let { data: existingProduct } = await supabase
                .from('products')
                .select('id')
                .eq('external_id', baseModel)
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

              // Create variants for each item
              for (const item of items) {
                const { color, size } = extractProductInfo(item);
                
                let variantValue = '';
                if (color && size) {
                  variantValue = `${color}/${size}`;
                } else if (color) {
                  variantValue = color;
                } else if (size) {
                  variantValue = size;
                } else {
                  variantValue = 'Default';
                }

                const variantData = {
                  product_id: product.id,
                  variant_type: color && size ? 'color_size' : color ? 'color' : size ? 'size' : 'default',
                  variant_value: variantValue,
                  option1_name: color ? 'COLOR' : null,
                  option1_value: color || null,
                  option2_name: size ? 'SIZE' : null,
                  option2_value: size || null,
                  stock: parseInt(item.stock_on_hand) || 0,
                  price_modifier: parseFloat(item.rate) - averagePrice,
                  sku: item.sku || null,
                  external_id: item.item_id
                };

                const { error: variantError } = await supabase
                  .from('product_variants')
                  .upsert(variantData, { onConflict: 'external_id' });

                if (variantError) {
                  console.error('Error creating variant:', variantError);
                }
              }

              // Create mapping for this model
              mappings.push({
                shop_id: userProfile.id,
                zoho_item_id: baseModel,
                local_product_id: product.id
              });

              syncedCount++;
              console.log(`Synced product model: ${baseModel} with ${items.length} variants`);

            } catch (error) {
              console.error(`Error processing model ${baseModel}:`, error);
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

        console.log(`Sync completed. Product models synced: ${syncedCount}`);
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
