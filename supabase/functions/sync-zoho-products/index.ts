import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Firebase configuration
const firebaseConfig = {
  projectId: Deno.env.get('FIREBASE_PROJECT_ID')!,
};

// Firebase Firestore REST API helper
async function getFirestoreDoc(path: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${path}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  
  // Convert Firestore format to regular object
  const result: any = {};
  if (data.fields) {
    for (const [key, value] of Object.entries(data.fields as any)) {
      if (value.stringValue !== undefined) result[key] = value.stringValue;
      if (value.booleanValue !== undefined) result[key] = value.booleanValue;
      if (value.integerValue !== undefined) result[key] = parseInt(value.integerValue);
      if (value.timestampValue !== undefined) result[key] = value.timestampValue;
    }
  }
  return result;
}

// Firebase Firestore REST API helper
async function updateFirestoreDoc(path: string, data: any) {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${path}`;
  
  // Convert data to Firestore format
  const fields: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') fields[key] = { stringValue: value };
    else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    else if (typeof value === 'number') fields[key] = { integerValue: value.toString() };
    else if (value instanceof Date) fields[key] = { timestampValue: value.toISOString() };
  }
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  
  return response.ok;
}

// Download and upload image from Zoho with proper error handling
async function uploadImageFromZoho(imageUrl: string, itemId: string, accessToken: string): Promise<string | null> {
  try {
    const timeoutMs = 10000; // 10 seconds timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    console.log(`Downloading image for item ${itemId}: ${imageUrl}`);
    
    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      console.error(`Invalid content type: ${contentType}`);
      return null;
    }

    // Check file size (limit to 5MB)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      console.error(`Image too large: ${contentLength} bytes`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileExtension = imageUrl.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `zoho-${itemId}-${Date.now()}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, arrayBuffer, {
        contentType: contentType,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log(`Successfully uploaded image for item ${itemId}: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    console.error(`Error uploading image for item ${itemId}:`, error);
    return null;
  }
}

// Collect all images for an item from different sources
async function getAllItemImages(item: any, accessToken: string, organizationId: string): Promise<string[]> {
  const imageUrls: string[] = [];
  const uploadedImages: string[] = [];

  // Get images from different sources
  if (item.image_name && item.image_type) {
    imageUrls.push(`https://www.zohoapis.ca/inventory/v1/items/${item.item_id}/image?organization_id=${organizationId}`);
  }

  // Check for additional images in documents
  if (item.documents && Array.isArray(item.documents)) {
    for (const doc of item.documents) {
      if (doc.file_type && doc.file_type.startsWith('image/')) {
        imageUrls.push(`https://www.zohoapis.ca/inventory/v1/items/${item.item_id}/documents/${doc.document_id}?organization_id=${organizationId}`);
      }
    }
  }

  console.log(`Found ${imageUrls.length} images for item ${item.item_id}`);

  // Upload each image
  for (const imageUrl of imageUrls) {
    const uploadedUrl = await uploadImageFromZoho(imageUrl, item.item_id, accessToken);
    if (uploadedUrl) {
      uploadedImages.push(uploadedUrl);
    }
  }
  
  return uploadedImages;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle both manual sync (with userId) and scheduled sync (with shopId)
    const requestBody = await req.json();
    const { userId, shopId, accessToken: providedAccessToken, organizationId: providedOrgId } = requestBody;

    // Get credentials from secrets
    const secretAccessToken = Deno.env.get('ZOHO_ACCESS_TOKEN');
    const secretOrganizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');

    let userProfile;
    let integration;

    if (shopId && providedAccessToken && providedOrgId) {
      // Scheduled sync - use provided shop data
      console.log('Starting Zoho products sync for shop:', shopId);
      
      // Get shop owner's profile ID
      const { data: shop } = await supabase
        .from('shops')
        .select('owner_id')
        .eq('id', shopId)
        .single();

      if (!shop) {
        throw new Error('Shop not found');
      }

      // Get the owner's auth_user_id from profiles
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('auth_user_id')
        .eq('id', shop.owner_id)
        .single();

      userProfile = { id: shop.owner_id };
      integration = {
        access_token: providedAccessToken || secretAccessToken,
        organization_id: providedOrgId || secretOrganizationId,
        shop_id: shopId,
        user_id: ownerProfile?.auth_user_id
      };
    } else if (userId) {
      // Manual sync - get user profile and integration
      console.log('Starting Zoho products sync for user:', userId);
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      userProfile = profile;

      // Use credentials from secrets
      integration = {
        access_token: secretAccessToken,
        organization_id: secretOrganizationId,
        shop_id: userProfile.id
      };
    } else {
      throw new Error('Either userId or shopId with credentials must be provided');
    }

    if (!integration || !integration.access_token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No Zoho integration found or disabled' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all items from Zoho Inventory API with pagination
    let allItems = [];
    let page = 1;
    let hasMorePages = true;
    const perPage = 200; // Maximum items per page for Zoho API

    console.log('Starting to fetch all items from Zoho...');

    while (hasMorePages) {
      const zohoResponse = await fetch(`https://www.zohoapis.ca/inventory/v1/items?organization_id=${integration.organization_id}&page=${page}&per_page=${perPage}`, {
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
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No items found in Zoho',
        synced: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get existing Zoho product mappings for this shop
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

    // Extract product information from item data
    function extractProductInfo(item: any) {
      // Try to extract from custom fields first
      let baseModel = '';
      let color = '';
      let size = '';

      if (item.custom_fields && Array.isArray(item.custom_fields)) {
        for (const field of item.custom_fields) {
          if (field.label?.toLowerCase().includes('model') || field.label?.toLowerCase().includes('base')) {
            baseModel = field.value || '';
          } else if (field.label?.toLowerCase().includes('color') || field.label?.toLowerCase().includes('colour')) {
            color = field.value || '';
          } else if (field.label?.toLowerCase().includes('size')) {
            size = field.value || '';
          }
        }
      }

      // If not found in custom fields, try to extract from SKU or name
      if (!baseModel) {
        const sku = item.sku || '';
        const name = item.name || '';
        
        // Try to extract pattern like "MODEL-COLOR-SIZE" from SKU
        if (sku.includes('-')) {
          const parts = sku.split('-');
          if (parts.length >= 2) {
            baseModel = parts[0];
            if (parts.length >= 2 && !color) color = parts[1];
            if (parts.length >= 3 && !size) size = parts[2];
          }
        } else if (name.includes('-')) {
          const parts = name.split('-');
          if (parts.length >= 2) {
            baseModel = parts[0];
            if (parts.length >= 2 && !color) color = parts[1];
            if (parts.length >= 3 && !size) size = parts[2];
          }
        } else {
          // Use the full name as base model if no pattern found
          baseModel = name || sku || `product_${item.item_id}`;
        }
      }

      return {
        baseModel: baseModel.trim(),
        color: color.trim(),
        size: size.trim()
      };
    }

    // Group items by base model
    const productModels = new Map();
    
    for (const item of allItems) {
      const { baseModel, color, size } = extractProductInfo(item);
      
      if (!productModels.has(baseModel)) {
        productModels.set(baseModel, []);
      }
      
      productModels.get(baseModel).push({
        ...item,
        extracted: { baseModel, color, size }
      });
    }

    console.log(`Grouped ${allItems.length} items into ${productModels.size} product models`);

    // Process each product model
    let syncedCount = 0;
    const mappings = [];
    const batchSize = 5; // Process in smaller batches
    const modelEntries = Array.from(productModels.entries());

    for (let i = 0; i < modelEntries.length; i += batchSize) {
      const batch = modelEntries.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async ([baseModel, items]) => {
        try {
          // Skip if already synced
          if (existingZohoIds.has(baseModel)) {
            console.log(`Skipping existing model: ${baseModel}`);
            return;
          }

          // Get all images for all variants of this model
          const allImages = [];
          for (const item of items) {
            const itemImages = await getAllItemImages(item, integration.access_token, integration.organization_id);
            allImages.push(...itemImages);
          }

          // Remove duplicates
          const uniqueImages = [...new Set(allImages)];
          console.log(`Collected ${uniqueImages.length} unique images for model: ${baseModel}`);

          // Calculate average price and total stock
          const totalStock = items.reduce((sum, item) => sum + (item.available_stock || 0), 0);
          const averagePrice = items.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0) / items.length;

          // Create main product and build attributes schema
          const colors = new Set<string>();
          const sizes = new Set<string>();
          for (const it of items) {
            const c = it.extracted?.color || '';
            const s = it.extracted?.size || '';
            if (c) colors.add(c);
            if (s) sizes.add(s);
          }
          const attributesSchema: Record<string, string[]> = {};
          if (colors.size) attributesSchema.COLOR = Array.from(colors);
          if (sizes.size) attributesSchema.SIZE = Array.from(sizes);
          const { data: product, error: productError } = await supabase
            .from('products')
            .upsert({
              title: baseModel,
              description: items[0].description || `${baseModel} with multiple variants`,
              category: items[0].category_name || items[0].category?.name || 'General',
              merchant_id: merchant.id,
              price_sar: averagePrice,
              is_active: items[0].status === 'active',
              stock: totalStock,
              image_urls: uniqueImages,
              external_id: baseModel,
              attributes_schema: attributesSchema
            }, { 
              onConflict: 'external_id',
              ignoreDuplicates: false 
            })
            .select('id')
            .single();

          if (productError) {
            console.error('Error creating/updating product:', productError);
            return;
          }

          // Create variants for each item
          for (const item of items) {
            const color = item.extracted?.color || null;
            const size = item.extracted?.size || null;
            const variantName = (color && size) ? `${color}/${size}` : (color || size || 'Default');
            const itemPrice = parseFloat(item.rate) || 0;
            const priceModifier = itemPrice - averagePrice;

            const variantData = {
              product_id: product.id,
              variant_type: 'combination',
              variant_value: variantName,
              option1_name: color ? 'COLOR' : null,
              option1_value: color,
              option2_name: size ? 'SIZE' : null,
              option2_value: size,
              price_modifier: priceModifier,
              stock: item.available_stock || 0,
              sku: item.sku || '',
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
        }
      }));
    }

    // Insert all mappings at once
    if (mappings.length > 0) {
      const { error: mappingError } = await supabase
        .from('zoho_product_mapping')
        .upsert(mappings, { 
          onConflict: 'shop_id,zoho_item_id',
          ignoreDuplicates: false 
        });

      if (mappingError) {
        console.error('Error creating mappings:', mappingError);
      }
    }

    // Update the sync timestamp in Firebase
    try {
      const userIdForUpdate = userId || (integration as any).user_id;
      if (userIdForUpdate) {
        await updateFirestoreDoc(`users/${userIdForUpdate}/integrations/zoho`, {
          last_sync_at: new Date()
        });
        console.log('Updated last_sync_at in Firebase for user:', userIdForUpdate);
      } else {
        console.log('No userId available to update Firebase sync timestamp');
      }
    } catch (firebaseError) {
      console.error('Failed to update last_sync_at in Firebase:', firebaseError);
    }

    console.log(`Sync completed. Total synced: ${syncedCount} products`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Successfully synced ${syncedCount} products`,
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