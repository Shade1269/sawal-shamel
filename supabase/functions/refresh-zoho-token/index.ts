import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting Zoho token refresh process');

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

    // Get all enabled Zoho integrations from Supabase (legacy)
    const { data: supabaseIntegrations, error: integrationsError } = await supabase
      .from('zoho_integration')
      .select('*')
      .eq('is_enabled', true);

    // Get all enabled Zoho integrations from Firestore (new)
    let firestoreIntegrations: any[] = [];
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      for (const userDoc of usersSnapshot.docs) {
        const integrationDocRef = doc(db, 'users', userDoc.id, 'integrations', 'zoho');
        try {
          const integrationDoc = await getDocs(query(collection(db, 'users', userDoc.id, 'integrations')));
          for (const intDoc of integrationDoc.docs) {
            if (intDoc.id === 'zoho' && intDoc.data()?.is_enabled) {
              firestoreIntegrations.push({
                userId: userDoc.id,
                ...intDoc.data()
              });
            }
          }
        } catch (e) {
          console.log(`No integrations found for user ${userDoc.id}`);
        }
      }
    } catch (e) {
      console.log('Error fetching Firestore integrations:', e);
    }

    const allIntegrations = [...(supabaseIntegrations || []), ...firestoreIntegrations];

    if (integrationsError && !supabaseIntegrations) {
      console.error('Error fetching Supabase integrations:', integrationsError);
    }

    if (allIntegrations.length === 0) {
      console.log('No enabled Zoho integrations found');
      return new Response(
        JSON.stringify({ success: true, message: 'No integrations to refresh' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh the access token using the refresh token
    const refreshResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: Deno.env.get('ZOHO_CLIENT_ID') || '',
        client_secret: Deno.env.get('ZOHO_CLIENT_SECRET') || '',
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error('Token refresh failed:', errorText);
      throw new Error(`Token refresh failed: ${refreshResponse.status} - ${errorText}`);
    }

    const tokenData = await refreshResponse.json();
    const newAccessToken = tokenData.access_token;

    if (!newAccessToken) {
      throw new Error('No access token received from refresh');
    }

    console.log('Successfully refreshed Zoho access token');

    // Update all integrations with the new access token
    const updatePromises = allIntegrations.map(async (integration) => {
      try {
        if (integration.userId) {
          // Firestore integration
          const integrationDocRef = doc(db, 'users', integration.userId, 'integrations', 'zoho');
          await updateDoc(integrationDocRef, { 
            access_token: newAccessToken,
            updated_at: new Date().toISOString()
          });
          console.log(`Updated Firestore access token for user ${integration.userId}`);
          return { success: true, integration_id: integration.userId, type: 'firestore' };
        } else {
          // Supabase integration (legacy)
          const { error: updateError } = await supabase
            .from('zoho_integration')
            .update({ 
              access_token: newAccessToken,
              updated_at: new Date().toISOString()
            })
            .eq('id', integration.id);

          if (updateError) {
            console.error(`Error updating Supabase integration ${integration.id}:`, updateError);
            return { success: false, integration_id: integration.id, error: updateError, type: 'supabase' };
          }

          console.log(`Updated Supabase access token for integration ${integration.id} (shop: ${integration.shop_id})`);
          return { success: true, integration_id: integration.id, type: 'supabase' };
        }
      } catch (error) {
        console.error(`Error updating integration:`, error);
        return { success: false, integration_id: integration.id || integration.userId, error: error.message };
      }
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const supabaseCount = results.filter(r => r.type === 'supabase').length;
    const firestoreCount = results.filter(r => r.type === 'firestore').length;

    // Log the refresh event to cron job logs
    await supabase
      .from('cron_job_logs')
      .insert({
        job_name: 'refresh-zoho-tokens-every-30-minutes',
        status: failureCount > 0 ? 'partial_success' : 'success',
        message: `Updated ${successCount} integrations (${supabaseCount} Supabase, ${firestoreCount} Firestore). ${failureCount} failed.`
      });

    console.log(`Token refresh completed: ${successCount} success (${supabaseCount} Supabase, ${firestoreCount} Firestore), ${failureCount} failures`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Token refresh completed',
        integrations_updated: successCount,
        integrations_failed: failureCount,
        supabase_integrations: supabaseCount,
        firestore_integrations: firestoreCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in refresh-zoho-token:', error);
    
    // Log the error
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase
      .from('cron_job_logs')
      .insert({
        job_name: 'refresh-zoho-tokens-every-30-minutes',
        status: 'error',
        message: `Error: ${error.message}`
      });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});