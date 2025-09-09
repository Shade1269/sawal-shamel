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
    const { userId } = await req.json();

    console.log('Starting migration from Supabase to Firestore for user:', userId);

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get user's merchant to find their products
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('profile_id', userProfile.id)
      .single();

    if (!merchant) {
      console.log('No merchant found for user, no products to migrate');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No products to migrate',
        productsCount: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all products for this merchant from Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants(*)
      `)
      .eq('merchant_id', merchant.id)
      .eq('is_active', true);

    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      console.log('No products found to migrate');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No products found to migrate',
        productsCount: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${products.length} products to migrate`);

    // Call the frontend API to save products to Firestore
    // We need to make HTTP calls to the frontend since edge functions can't directly write to Firestore
    const frontendUrl = req.headers.get('origin') || 'https://uewuiiopkctdtaexmtxu.lovable.app';
    
    let migratedCount = 0;
    for (const product of products) {
      try {
        // Format product data for Firestore
        const productData = {
          id: product.id,
          title: product.title,
          description: product.description,
          price_sar: product.price_sar,
          stock: product.stock,
          category: product.category,
          image_urls: product.image_urls || [],
          is_active: product.is_active,
          external_id: product.external_id,
          source: 'supabase_migration',
          variants: product.product_variants || []
        };

        // Send to frontend for Firestore saving
        const migrationResponse = await fetch(`${frontendUrl}/api/migrate-product`, {
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

        if (migrationResponse.ok) {
          migratedCount++;
          console.log(`Migrated product: ${product.title}`);
        } else {
          console.error(`Failed to migrate product ${product.title}`);
        }

      } catch (productError) {
        console.error(`Error migrating product ${product.title}:`, productError);
        continue;
      }
    }

    console.log(`Migration completed. ${migratedCount} products migrated out of ${products.length}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Migration completed: ${migratedCount}/${products.length} products migrated`,
      productsCount: migratedCount,
      totalProducts: products.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in migrate-supabase-to-firestore:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});