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

// Download an image from Zoho (requires Authorization) and upload to Supabase Storage to obtain a public URL
async function getItemImagePublicUrl(item: any, accessToken: string, organizationId: string): Promise<string | null> {
  try {
    // 1) Try direct image_url on the item
    if (item.image_url) {
      const resp = await fetch(item.image_url, { headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` } });
      if (resp.ok) {
        const contentType = resp.headers.get('content-type') || 'image/jpeg';
        const buffer = await resp.arrayBuffer();
        const blob = new Blob([buffer], { type: contentType });
        const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : contentType.includes('gif') ? 'gif' : 'jpg';
        const filePath = `zoho/${item.item_id}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('product-images').upload(filePath, blob, { upsert: true, contentType });
        if (!uploadErr) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          return data?.publicUrl || null;
        }
      }
    }

    // 2) Try the standard item image endpoint
    const endpoint = `https://www.zohoapis.com/inventory/v1/items/${item.item_id}/image?organization_id=${organizationId}`;
    const imgResp = await fetch(endpoint, { headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` } });
    if (imgResp.ok) {
      const ct = imgResp.headers.get('content-type') || 'image/jpeg';
      const buf = await imgResp.arrayBuffer();
      const blob = new Blob([buf], { type: ct });
      const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : ct.includes('gif') ? 'gif' : 'jpg';
      const filePath = `zoho/${item.item_id}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(filePath, blob, { upsert: true, contentType: ct });
      if (!upErr) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        return data?.publicUrl || null;
      }
    }

    // 3) Fallback: fetch item details and try image_url again
    const detailResp = await fetch(`https://www.zohoapis.com/inventory/v1/items/${item.item_id}?organization_id=${organizationId}`, {
      headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` }
    });
    if (detailResp.ok) {
      const detail = await detailResp.json();
      const imageUrl = detail?.item?.image_url;
      if (imageUrl) {
        const resp2 = await fetch(imageUrl, { headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}` } });
        if (resp2.ok) {
          const ct2 = resp2.headers.get('content-type') || 'image/jpeg';
          const buf2 = await resp2.arrayBuffer();
          const blob2 = new Blob([buf2], { type: ct2 });
          const ext2 = ct2.includes('png') ? 'png' : ct2.includes('webp') ? 'webp' : ct2.includes('gif') ? 'gif' : 'jpg';
          const path2 = `zoho/${item.item_id}.${ext2}`;
          const { error: upErr2 } = await supabase.storage.from('product-images').upload(path2, blob2, { upsert: true, contentType: ct2 });
          if (!upErr2) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(path2);
            return data?.publicUrl || null;
          }
        }
      }
    }
  } catch (e) {
    console.error('getItemImagePublicUrl error:', e);
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
    const maxModels: number = Math.min(Math.max(parseInt(body?.maxModels ?? '50', 10) || 50, 1), 200);

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get latest Zoho credentials from integration table (kept fresh by refresh-zoho-token)
    const { data: integration, error: intErr } = await supabase
      .from('zoho_integration')
      .select('access_token, organization_id, is_enabled')
      .eq('is_enabled', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (intErr || !integration?.access_token || !integration?.organization_id) {
      return new Response(JSON.stringify({ success: false, error: 'Zoho integration not configured or disabled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = integration.access_token as string;
    const organizationId = integration.organization_id as string;

    // Fetch Zoho items until we gather maxModels unique models
    let allItems: any[] = [];
    let page = 1;
    const perPage = 200;
    const itemsByModel = new Map<string, any[]>();

    while (itemsByModel.size < maxModels) {
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
        return new Response(JSON.stringify({ success: false, error: `Zoho API error: ${resp.status}`, detail: errText }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await resp.json();
      const pageItems = data.items || [];
      if (pageItems.length === 0) break;

      for (const item of pageItems) {
        const { baseModel } = extractProductInfo(item);
        if (!itemsByModel.has(baseModel)) itemsByModel.set(baseModel, []);
        itemsByModel.get(baseModel)!.push(item);
        if (itemsByModel.size >= maxModels) break;
      }

      page += 1;
      if (page > 50) break; // safety
    }

    // Build normalized products for frontend to save into Firestore
    const products: any[] = [];
    for (const [baseModel, variants] of itemsByModel.entries()) {
      const attributesSchema: Record<string, Set<string>> = {};
      const baseVariant = variants[0];
      // Resolve and upload product image to public storage
      const uploadedImageUrl = await getItemImagePublicUrl(baseVariant, accessToken, organizationId);
      const imageUrls: string[] = uploadedImageUrl ? [uploadedImageUrl] : [];

      let totalStock = 0;
      const variantObjs = variants.map((v: any) => {
        const { color, size } = extractProductInfo(v);
        if (color) {
          attributesSchema['COLOR'] = attributesSchema['COLOR'] || new Set();
          attributesSchema['COLOR'].add(color);
        }
        if (size) {
          attributesSchema['SIZE'] = attributesSchema['SIZE'] || new Set();
          attributesSchema['SIZE'].add(size);
        }
        const stock = parseInt(v.stock_on_hand) || 0;
        totalStock += stock;
        return {
          id: v.item_id,
          variant_type: 'combination',
          variant_value: [color, size].filter(Boolean).join('-') || 'default',
          stock,
          color,
          size,
          sku: v.sku || `${baseModel}-${v.item_id}`,
          price_modifier: (parseFloat(v.rate) || 0) - (parseFloat(baseVariant.rate) || 0),
        };
      });

      const finalSchema: Record<string, string[]> = {};
      for (const [k, set] of Object.entries(attributesSchema)) {
        finalSchema[k] = Array.from(set as Set<string>);
      }

      products.push({
        id: `zoho_${baseModel}_${Date.now()}`,
        title: baseModel,
        description: `منتج ${baseModel} متوفر بألوان ومقاسات مختلفة`,
        price_sar: parseFloat(baseVariant.rate) || 0,
        stock: totalStock,
        category: baseVariant.category_name || 'General',
        image_urls: imageUrls,
        is_active: baseVariant.status === 'active',
        external_id: `zoho_model_${baseModel}`,
        variants: variantObjs,
        attributes_schema: finalSchema,
        source: 'zoho_direct_sync'
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
