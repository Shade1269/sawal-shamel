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

// Firebase configuration
const firebaseConfig = {
  projectId: Deno.env.get('FIREBASE_PROJECT_ID')!,
};

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

function extractProductInfo(item: any) {
  let baseModel: string | null = null;
  let color: string | null = null;
  let size: string | null = null;

  if (item.attribute_name1 && item.attribute_option_name1 && item.attribute_name1.toUpperCase() === 'COLOR') {
    color = item.attribute_option_name1;
  }
  if (item.attribute_name2 && item.attribute_option_name2 && item.attribute_name2.toUpperCase() === 'SIZE') {
    size = item.attribute_option_name2;
  }

  if (item.sku && item.sku.includes('-')) {
    const parts = item.sku.split('-');
    if (parts.length >= 2) {
      baseModel = parts[0];
      if (parts[1].includes('/')) {
        const cs = parts[1].split('/');
        if (cs.length === 2) {
          if (!color) color = cs[0];
          if (!size) size = cs[1];
        }
      }
    }
  }

  if (!baseModel) {
    baseModel = item.name?.split('-')[0] || item.name || `Item_${item.item_id}`;
  }

  return { baseModel, color, size };
}

// Download an image from Zoho with timeout and better error handling
async function getItemImagePublicUrl(item: any, accessToken: string, organizationId: string): Promise<string | null> {
  try {
    // Add timeout to prevent function from hanging
    const timeoutMs = 10000; // 10 seconds timeout
    
    // 1) Try direct image_url on the item
    if (item.image_url) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const resp = await fetch(item.image_url, { 
          headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || 'image/jpeg';
          const buffer = await resp.arrayBuffer();
          
          // Check file size (max 5MB)
          if (buffer.byteLength > 5 * 1024 * 1024) {
            console.log(`Image too large for item ${item.item_id}: ${buffer.byteLength} bytes`);
            return null;
          }
          
          const blob = new Blob([buffer], { type: contentType });
          const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : contentType.includes('gif') ? 'gif' : 'jpg';
          const filePath = `zoho/${item.item_id}.${ext}`;
          
          const { error: uploadErr } = await supabase.storage.from('product-images').upload(filePath, blob, { upsert: true, contentType });
          if (!uploadErr) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
            return data?.publicUrl || null;
          }
        }
      } catch (fetchError) {
        console.log(`Failed to fetch image from direct URL for item ${item.item_id}:`, fetchError);
      }
    }

    // 2) Try the standard item image endpoint with timeout
    try {
      const endpoint = `https://www.zohoapis.com/inventory/v1/items/${item.item_id}/image?organization_id=${organizationId}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const imgResp = await fetch(endpoint, { 
        headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (imgResp.ok) {
        const ct = imgResp.headers.get('content-type') || 'image/jpeg';
        const buf = await imgResp.arrayBuffer();
        
        // Check file size (max 5MB)
        if (buf.byteLength > 5 * 1024 * 1024) {
          console.log(`Image too large for item ${item.item_id}: ${buf.byteLength} bytes`);
          return null;
        }
        
        const blob = new Blob([buf], { type: ct });
        const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : ct.includes('gif') ? 'gif' : 'jpg';
        const filePath = `zoho/${item.item_id}.${ext}`;
        
        const { error: upErr } = await supabase.storage.from('product-images').upload(filePath, blob, { upsert: true, contentType: ct });
        if (!upErr) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          return data?.publicUrl || null;
        }
      }
    } catch (fetchError) {
      console.log(`Failed to fetch image from API endpoint for item ${item.item_id}:`, fetchError);
    }

  } catch (e) {
    console.error(`getItemImagePublicUrl error for item ${item.item_id}:`, e);
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const userId: string | undefined = body?.userId;
    const maxModels: number = Math.min(Math.max(parseInt(body?.maxModels ?? '1000', 10) || 1000, 1), 1000);
    const accessToken: string | undefined = body?.accessToken;
    const organizationId: string | undefined = body?.organizationId;

    if (!userId || !accessToken || !organizationId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required parameters: userId, accessToken, or organizationId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch Zoho items and group by model
    let allItems: any[] = [];
    let page = 1;
    const perPage = 200;

    while (allItems.length < maxModels * 10) { // Allow more items to create the requested number of models
      const resp = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}&page=${page}&per_page=${perPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Zoho API error:', resp.status, errText);
        return new Response(
          JSON.stringify({ success: false, error: `Zoho API error: ${resp.status}`, detail: errText }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await resp.json();
      const pageItems = data.items || [];
      if (pageItems.length === 0) break;

      allItems = allItems.concat(pageItems);
      page += 1;
      if (page > 50) break; // safety
    }

    // Group items by base model
    const productsByModel: { [key: string]: any[] } = {};
    allItems.forEach(item => {
      const { baseModel } = extractProductInfo(item);
      if (!productsByModel[baseModel]) {
        productsByModel[baseModel] = [];
      }
      productsByModel[baseModel].push(item);
    });

    // Build normalized products for frontend to save into Firestore
    const products: any[] = [];
    let processedCount = 0;
    const maxProductsWithImages = 50; // Limit image processing to prevent timeout
    
    const modelNames = Object.keys(productsByModel).slice(0, maxModels);
    
    for (const baseModel of modelNames) {
      const items = productsByModel[baseModel];
      const mainItem = items[0]; // Use first item as main product info
      
      // Process images from all variants for this model
      const imageUrls: string[] = [];
      if (processedCount < maxProductsWithImages) {
        // Collect all unique images from all variants
        const imageSet = new Set<string>();
        
        for (const item of items) {
          // Try to get image for each variant
          const imageUrl = await getItemImagePublicUrl(item, accessToken, organizationId);
          if (imageUrl) {
            imageSet.add(imageUrl);
          }
          
          // Also check for direct image documents
          if (item.image_documents && item.image_documents.length > 0) {
            item.image_documents.forEach((img: any) => {
              const directImageUrl = img.file_path || img.attachment_url || img.document_url;
              if (directImageUrl) {
                imageSet.add(directImageUrl);
              }
            });
          }
        }
        
        imageUrls.push(...Array.from(imageSet));
        processedCount++;
      }

      // Build attributes schema from all variants
      const attributesSchema: Record<string, string[]> = {};
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

      // Calculate total stock and average price
      const totalStock = items.reduce((sum, item) => sum + (parseInt(item.stock_on_hand) || 0), 0);
      const averagePrice = items.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0) / items.length;

      // Create variants for each item
      const variants = items.map(item => {
        const { color, size } = extractProductInfo(item);
        let variantName = '';
        if (color && size) {
          variantName = `${color}/${size}`;
        } else if (color) {
          variantName = color;
        } else if (size) {
          variantName = size;
        } else {
          variantName = 'Default';
        }

        return {
          id: `variant_${item.item_id}`,
          name: variantName,
          price_sar: parseFloat(item.rate) || 0,
          stock: parseInt(item.stock_on_hand) || 0,
          sku: item.sku || null,
          attributes: {
            ...(color && { COLOR: color }),
            ...(size && { SIZE: size })
          },
          zoho_item_id: item.item_id
        };
      });

      products.push({
        id: `zoho_${baseModel}_${Date.now()}`,
        title: baseModel,
        description: mainItem.description || baseModel,
        price_sar: averagePrice,
        stock: totalStock,
        category: mainItem.category_name || 'General',
        image_urls: imageUrls,
        is_active: mainItem.status === 'active',
        external_id: baseModel,
        variants: variants,
        attributes_schema: attributesSchema,
        source: 'zoho_sync'
      });
    }

    return new Response(JSON.stringify({ success: true, products, modelsReturned: products.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in sync-zoho-to-firestore:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
