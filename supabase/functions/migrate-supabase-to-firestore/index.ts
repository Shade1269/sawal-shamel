import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Firebase config from Supabase secrets
const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID')!;
const FIREBASE_API_KEY = Deno.env.get('FIREBASE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Firebase Firestore REST API functions
const getFirebaseAccessToken = async () => {
  // Use Firebase Auth to get access token for Firestore API
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@system.local', // Service account email
      password: 'service-migration-2024',
      returnSecureToken: true
    })
  });
  
  if (!response.ok) {
    // For migration purposes, we'll use the API key directly
    return null;
  }
  
  const data = await response.json();
  return data.idToken;
};

const saveToFirestore = async (collection: string, docId: string, data: any, subcollection?: string, subdocId?: string) => {
  try {
    let url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
    
    if (subcollection && subdocId) {
      url += `/${subcollection}/${subdocId}`;
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIREBASE_API_KEY}`, // Use API key for service operations
      },
      body: JSON.stringify({
        fields: convertToFirestoreFields(data)
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Firestore save error:', error);
      throw new Error(`Firestore error: ${response.status} ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
};

const convertToFirestoreFields = (obj: any): any => {
  const fields: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return Number.isInteger(item) ? { integerValue: item.toString() } : { doubleValue: item };
            if (typeof item === 'boolean') return { booleanValue: item };
            return { stringValue: JSON.stringify(item) };
          })
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: convertToFirestoreFields(value) } };
    } else {
      fields[key] = { stringValue: String(value) };
    }
  }
  
  return fields;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting comprehensive migration from Supabase to Firebase...');

    const results = {
      users: { success: false, count: 0, total: 0, error: null },
      shops: { success: false, count: 0, total: 0, error: null },
      products: { success: false, count: 0, total: 0, error: null },
      activities: { success: false, count: 0, total: 0, error: null }
    };

    // 1. Migrate Users/Profiles
    console.log('\n=== Migrating Users ===');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (profiles && profiles.length > 0) {
        results.users.total = profiles.length;
        
        for (const profile of profiles) {
          try {
            const userData = {
              uid: profile.auth_user_id || profile.id,
              phone: profile.phone || profile.whatsapp,
              email: profile.email,
              displayName: profile.full_name || profile.email,
              photoURL: profile.avatar_url,
              role: profile.role || 'affiliate',
              isActive: profile.is_active !== false,
              points: profile.points || 0,
              createdShopsCount: profile.created_shops_count || 0,
              createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
              updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
              lastActivityAt: profile.last_activity_at ? new Date(profile.last_activity_at) : new Date()
            };

            await saveToFirestore('users', userData.uid, userData);
            results.users.count++;
            console.log(`✓ Migrated user: ${userData.email || userData.phone}`);
          } catch (error) {
            console.error(`✗ Error migrating user ${profile.email}:`, error);
          }
        }
        results.users.success = true;
      }
    } catch (error) {
      console.error('Users migration error:', error);
      results.users.error = error.message;
    }

    // 2. Migrate Shops
    console.log('\n=== Migrating Shops ===');
    try {
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select(`
          *,
          profiles!shops_owner_id_fkey (auth_user_id),
          shop_settings_extended (*)
        `)
        .order('created_at', { ascending: false });

      if (shopsError) throw shopsError;

      if (shops && shops.length > 0) {
        results.shops.total = shops.length;
        
        for (const shop of shops) {
          try {
            const ownerUid = shop.profiles?.auth_user_id || shop.owner_id;
            if (!ownerUid) {
              console.warn(`⚠ Shop without owner: ${shop.display_name}`);
              continue;
            }

            const shopSettings = {
              shopName: shop.display_name || '',
              shopSlug: shop.slug || '',
              description: shop.bio || '',
              logoUrl: shop.logo_url || '',
              isActive: true,
              theme: shop.theme || 'classic',
              currency: 'SAR',
              taxRate: shop.shop_settings_extended?.[0]?.tax_rate || 15,
              settings: shop.settings || {},
              createdAt: shop.created_at ? new Date(shop.created_at) : new Date(),
              updatedAt: shop.updated_at ? new Date(shop.updated_at) : new Date()
            };

            await saveToFirestore('users', ownerUid, shopSettings, 'shopSettings', 'main');

            const stats = {
              totalProducts: shop.total_products || 0,
              totalOrders: shop.total_orders || 0,
              totalRevenue: 0,
              totalCustomers: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await saveToFirestore('users', ownerUid, stats, 'statistics', 'main');
            
            results.shops.count++;
            console.log(`✓ Migrated shop: ${shop.display_name}`);
          } catch (error) {
            console.error(`✗ Error migrating shop ${shop.display_name}:`, error);
          }
        }
        results.shops.success = true;
      }
    } catch (error) {
      console.error('Shops migration error:', error);
      results.shops.error = error.message;
    }

    // 3. Migrate Products
    console.log('\n=== Migrating Products ===');
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          merchants (profile_id, profiles (auth_user_id)),
          product_variants (*)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        results.products.total = products.length;
        
        for (const product of products) {
          try {
            const ownerUid = product.merchants?.profiles?.auth_user_id;
            if (!ownerUid) {
              console.warn(`⚠ Product without owner: ${product.title}`);
              continue;
            }

            const productData = {
              id: product.id,
              title: product.title,
              description: product.description,
              price_sar: product.price_sar,
              category: product.category,
              stock: product.stock || 0,
              image_urls: product.image_urls || [],
              commission_rate: product.commission_rate || 10,
              is_active: product.is_active !== false,
              external_id: product.external_id,
              view_count: product.view_count || 0,
              last_viewed_at: product.last_viewed_at ? new Date(product.last_viewed_at) : null,
              attributes_schema: product.attributes_schema || {},
              variants: (product.product_variants || []).map((v: any) => ({
                id: v.id,
                variant_type: v.variant_type,
                variant_value: v.variant_value,
                stock: v.stock || 0,
                price_modifier: v.price_modifier || 0,
                sku: v.sku,
                external_id: v.external_id,
                option1_name: v.option1_name,
                option1_value: v.option1_value,
                option2_name: v.option2_name,
                option2_value: v.option2_value
              })),
              createdAt: product.created_at ? new Date(product.created_at) : new Date(),
              updatedAt: product.updated_at ? new Date(product.updated_at) : new Date()
            };

            await saveToFirestore('users', ownerUid, productData, 'products', product.id);
            results.products.count++;
            console.log(`✓ Migrated product: ${product.title}`);
          } catch (error) {
            console.error(`✗ Error migrating product ${product.title}:`, error);
          }
        }
        results.products.success = true;
      }
    } catch (error) {
      console.error('Products migration error:', error);
      results.products.error = error.message;
    }

    // 4. Migrate User Activities
    console.log('\n=== Migrating User Activities ===');
    try {
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select(`
          *,
          profiles (auth_user_id)
        `)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      if (activities && activities.length > 0) {
        results.activities.total = activities.length;
        
        for (const activity of activities) {
          try {
            const ownerUid = activity.profiles?.auth_user_id;
            if (!ownerUid) {
              console.warn(`⚠ Activity without user`);
              continue;
            }

            const activityData = {
              userId: ownerUid,
              activity_type: activity.activity_type,
              description: activity.description,
              shop_id: activity.shop_id,
              metadata: activity.metadata || {},
              createdAt: activity.created_at ? new Date(activity.created_at) : new Date()
            };

            // Generate unique ID for activity
            const activityId = `${ownerUid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await saveToFirestore('users', ownerUid, activityData, 'activities', activityId);
            
            results.activities.count++;
          } catch (error) {
            console.error(`✗ Error migrating activity:`, error);
          }
        }
        results.activities.success = true;
      }
    } catch (error) {
      console.error('Activities migration error:', error);
      results.activities.error = error.message;
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Users: ${results.users.count}/${results.users.total}`);
    console.log(`Shops: ${results.shops.count}/${results.shops.total}`);
    console.log(`Products: ${results.products.count}/${results.products.total}`);
    console.log(`Activities: ${results.activities.count}/${results.activities.total}`);

    const totalMigrated = results.users.count + results.shops.count + results.products.count + results.activities.count;
    const totalItems = results.users.total + results.shops.total + results.products.total + results.activities.total;

    return new Response(JSON.stringify({ 
      success: true,
      message: `Migration completed: ${totalMigrated}/${totalItems} items migrated`,
      results,
      totalMigrated,
      totalItems
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