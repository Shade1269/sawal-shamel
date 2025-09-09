import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    console.log('Starting direct Zoho to Firestore sync for user:', userId);

    // Get Zoho credentials from environment
    const accessToken = Deno.env.get('ZOHO_ACCESS_TOKEN');
    const organizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');

    if (!accessToken || !organizationId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Zoho credentials not configured' 
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
        const perPage = 200;

        console.log('Starting to fetch all items from Zoho...');

        while (hasMorePages) {
          const zohoResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&page=${page}&per_page=${perPage}`, {
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
          const pageItems = zohoData.items || [];
          
          console.log(`Fetched page ${page}: ${pageItems.length} items`);
          allItems = allItems.concat(pageItems);

          // Check if there are more pages
          const pageInfo = zohoData.page_context || {};
          hasMorePages = pageInfo.has_more_page || false;
          
          if (pageItems.length < perPage) {
            hasMorePages = false;
          }

          page++;
          
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
              baseModel = parts[0];
              
              if (parts[1].includes('/')) {
                const afterDash = parts[1];
                const colorSizeParts = afterDash.split('/');
                if (colorSizeParts.length === 2) {
                  if (!color) color = colorSizeParts[0];
                  if (!size) size = colorSizeParts[1];
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

        // Group items by base model
        const itemsByModel = new Map();
        
        for (const item of allItems) {
          const { baseModel } = extractProductInfo(item);
          if (!itemsByModel.has(baseModel)) {
            itemsByModel.set(baseModel, []);
          }
          itemsByModel.get(baseModel).push(item);
        }

        console.log(`Found ${itemsByModel.size} unique product models from ${allItems.length} items`);

        // Get frontend origin for making requests
        const frontendUrl = req.headers.get('origin') || 'https://uewuiiopkctdtaexmtxu.lovable.app';
        
        let syncedCount = 0;
        const modelEntries = Array.from(itemsByModel.entries());

        // Process products in batches
        const BATCH_SIZE = 5;
        
        for (let i = 0; i < modelEntries.length; i += BATCH_SIZE) {
          const batch = modelEntries.slice(i, i + BATCH_SIZE);
          console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(modelEntries.length/BATCH_SIZE)}: ${batch.length} models`);

          for (const [baseModel, modelItems] of batch) {
            try {
              const variants = modelItems;

              // Build attributes schema from all variants
              const attributesSchema: any = {};
              const colorValues = new Set();
              const sizeValues = new Set();
              
              for (const variant of variants) {
                const { color, size } = extractProductInfo(variant);
                
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

              // Use first item as base for parent product
              const baseVariant = variants[0];
              
              // Process product images from first variant
              let imageUrls = [];
              if (baseVariant.image_documents && baseVariant.image_documents.length > 0) {
                imageUrls = baseVariant.image_documents.map((img: any) => img.file_path || img.attachment_url || img.document_url).filter(Boolean);
              }

              // Calculate total stock for parent product (sum of all variants)
              const totalStock = variants.reduce((sum, variant) => sum + (parseInt(variant.stock_on_hand) || 0), 0);
              
              // Use base price from first variant
              const basePrice = parseFloat(baseVariant.rate) || 0;

              // Format variants for Firestore
              const firestoreVariants = variants.map(variant => {
                const { color, size } = extractProductInfo(variant);
                return {
                  id: variant.item_id,
                  variant_type: 'combination',
                  variant_value: [color, size].filter(Boolean).join('-') || 'default',
                  stock: parseInt(variant.stock_on_hand) || 0,
                  color: color,
                  size: size,
                  sku: variant.sku,
                  price_modifier: (parseFloat(variant.rate) || 0) - basePrice
                };
              });

              const productData = {
                id: `zoho_${baseModel}_${Date.now()}`,
                title: baseModel,
                description: `منتج ${baseModel} متوفر بألوان ومقاسات مختلفة`,
                price_sar: basePrice,
                stock: totalStock,
                category: baseVariant.category_name || 'General',
                image_urls: imageUrls,
                is_active: baseVariant.status === 'active',
                external_id: `zoho_model_${baseModel}`,
                variants: firestoreVariants,
                attributes_schema: finalAttributesSchema,
                source: 'zoho_direct_sync'
              };

              // Send to frontend for Firestore saving
              const saveResponse = await fetch(`${frontendUrl}/api/save-product-to-firestore`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': req.headers.get('authorization') || ''
                },
                body: JSON.stringify({
                  userId: userId,
                  productData: productData
                })
              });

              if (saveResponse.ok) {
                syncedCount++;
                console.log(`Synced product model: ${baseModel} with ${variants.length} variants`);
              } else {
                console.error(`Failed to save product ${baseModel} to Firestore`);
              }

            } catch (error) {
              console.error(`Error processing product model ${baseModel}:`, error);
              continue;
            }
          }

          // Small delay between batches to avoid overwhelming the frontend
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`Direct Zoho sync completed. ${syncedCount} products synced`);

      } catch (error) {
        console.error('Error in sync-zoho-to-firestore (background):', error);
      }
    })());

    // Immediate response while work continues in the background
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Direct Zoho sync started. Processing in background.'
    }), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-zoho-to-firestore:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});