import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

    const { shopId, accessToken, organizationId } = await req.json();

    console.log('Starting Zoho products sync for shop (background):', shopId);

    // Initialize Firebase
    const firebaseConfig = {
      apiKey: Deno.env.get('FIREBASE_API_KEY'),
      authDomain: Deno.env.get('FIREBASE_AUTH_DOMAIN'),
      projectId: Deno.env.get('FIREBASE_PROJECT_ID'),
      storageBucket: Deno.env.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: Deno.env.get('FIREBASE_MESSAGING_SENDER_ID'),
      appId: Deno.env.get('FIREBASE_APP_ID')
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);

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

        // Get shop owner's Firebase UID for saving to Firestore
        const { data: shopOwner } = await supabase
          .from('profiles')
          .select('auth_user_id')
          .eq('id', shop.profiles.id)
          .single();

        let shopOwnerFirebaseUID = null;
        if (shopOwner?.auth_user_id) {
          shopOwnerFirebaseUID = shopOwner.auth_user_id;
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
        const itemsByModel = new Map();
        
        for (const item of allItems) {
          const { baseModel } = extractProductInfo(item);
          if (!itemsByModel.has(baseModel)) {
            itemsByModel.set(baseModel, []);
          }
          itemsByModel.get(baseModel).push(item);
        }

        // Process products in batches to avoid timeout
        const BATCH_SIZE = 10;
        console.log(`Found ${itemsByModel.size} unique product models from ${allItems.length} items`);
        console.log(`Processing in batches of ${BATCH_SIZE} models...`);

        const modelEntries = Array.from(itemsByModel.entries());
        
        for (let i = 0; i < modelEntries.length; i += BATCH_SIZE) {
          const batch = modelEntries.slice(i, i + BATCH_SIZE);
          console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(modelEntries.length/BATCH_SIZE)}: ${batch.length} models`);

          // Process each product model in current batch
          for (const [baseModel, modelItems] of batch) {
            try {
              // Skip if any item in this model already exists
              const modelItemIds = modelItems.map(item => item.item_id);
              const hasExistingItems = modelItemIds.some(id => existingZohoIds.has(id));
              if (hasExistingItems) {
                continue;
              }

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

              const productData = {
                merchant_id: merchant.id,
                title: baseModel, // Use base model as title
                external_id: `model_${baseModel}`, // Use custom external_id for model
                description: `منتج ${baseModel} متوفر بألوان ومقاسات مختلفة`,
                price_sar: basePrice,
                stock: totalStock,
                category: baseVariant.category_name || 'General',
                image_urls: imageUrls,
                is_active: baseVariant.status === 'active',
                commission_rate: null,
                attributes_schema: finalAttributesSchema,
              };

              // Check if product already exists with this external_id
              let { data: existingProduct } = await supabase
                .from('products')
                .select('id')
                .eq('external_id', `model_${baseModel}`)
                .eq('merchant_id', merchant.id)
                .single();

              let product;
              if (existingProduct) {
                // Update existing product in Supabase
                const { data: updatedProduct, error: updateError } = await supabase
                  .from('products')
                  .update({
                    stock: totalStock,
                    attributes_schema: finalAttributesSchema,
                    is_active: baseVariant.status === 'active',
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

              // Also save/update in Firestore if we have the Firebase UID
              if (shopOwnerFirebaseUID) {
                try {
                  const firestoreProductData = {
                    id: product.id,
                    title: productData.title,
                    description: productData.description,
                    price_sar: productData.price_sar,
                    stock: productData.stock,
                    category: productData.category,
                    image_urls: productData.image_urls || [],
                    is_active: productData.is_active,
                    external_id: productData.external_id,
                    attributes_schema: productData.attributes_schema,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    source: 'zoho_sync'
                  };

                  const productDocRef = doc(db, 'users', shopOwnerFirebaseUID, 'products', product.id);
                  
                  if (existingProduct) {
                    await updateDoc(productDocRef, firestoreProductData);
                  } else {
                    await setDoc(productDocRef, firestoreProductData);
                  }

                  console.log(`Saved product ${baseModel} to Firestore for user ${shopOwnerFirebaseUID}`);
                } catch (firestoreError) {
                  console.error('Error saving to Firestore:', firestoreError);
                  // Continue with Supabase sync even if Firestore fails
                }
              }

              // Create/Update variants for each item in the model
              for (const variant of variants) {
                const { color, size } = extractProductInfo(variant);
                
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
                  sku: variant.sku || `${baseModel}-${variant.item_id}`,
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

              syncedCount++;
              console.log(`Synced product model: ${baseModel} with ${variants.length} variants`);

            } catch (error) {
              console.error(`Error processing product model ${baseModel}:`, error);
              continue;
            }
          }

          // Save mappings between batches to avoid large payloads
          if (mappings.length > 0 && (i + BATCH_SIZE >= modelEntries.length)) {
            const { error: mappingError } = await supabase
              .from('zoho_product_mapping')
              .insert(mappings);

            if (mappingError) {
              console.error('Error saving mappings:', mappingError);
            }
          }
          
          // Small delay between batches to prevent overwhelming the system
          if (i + BATCH_SIZE < modelEntries.length) {
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
          .eq('shop_id', shopId);

        console.log(`Sync completed. Item groups synced: ${syncedCount}`);
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
