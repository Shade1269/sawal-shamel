import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for full access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching products from Supabase...');

    // Get all active products
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        category,
        price_sar,
        stock,
        image_urls,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch products', details: error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${products?.length || 0} products`);

    // Transform products to ensure consistent format
    const transformedProducts = products?.map(product => ({
      id: product.id,
      title: product.title || '',
      description: product.description,
      price_sar: product.price_sar || 0,
      image_urls: Array.isArray(product.image_urls) ? product.image_urls : [],
      category: product.category,
      stock: product.stock || 0,
      is_active: product.is_active,
      created_at: product.created_at
    })) || [];

    console.log('Sample product:', transformedProducts[0]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        products: transformedProducts,
        count: transformedProducts.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});