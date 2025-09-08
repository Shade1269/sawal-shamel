import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    // Get Firebase configuration from Supabase secrets
    const firebaseConfig = {
      apiKey: Deno.env.get("FIREBASE_API_KEY"),
      authDomain: Deno.env.get("FIREBASE_AUTH_DOMAIN"),
      projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
      storageBucket: Deno.env.get("FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: Deno.env.get("FIREBASE_MESSAGING_SENDER_ID"),
      appId: Deno.env.get("FIREBASE_APP_ID")
    };

    // Validate that all required fields are present
    const missingFields = [];
    if (!firebaseConfig.apiKey) missingFields.push('FIREBASE_API_KEY');
    if (!firebaseConfig.authDomain) missingFields.push('FIREBASE_AUTH_DOMAIN');
    if (!firebaseConfig.projectId) missingFields.push('FIREBASE_PROJECT_ID');
    if (!firebaseConfig.storageBucket) missingFields.push('FIREBASE_STORAGE_BUCKET');
    if (!firebaseConfig.messagingSenderId) missingFields.push('FIREBASE_MESSAGING_SENDER_ID');
    if (!firebaseConfig.appId) missingFields.push('FIREBASE_APP_ID');

    if (missingFields.length > 0) {
      console.error('Missing Firebase configuration:', missingFields);
      return new Response(
        JSON.stringify({ 
          error: 'Missing Firebase configuration',
          missingFields: missingFields
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Firebase config loaded successfully for project:', firebaseConfig.projectId);

    return new Response(
      JSON.stringify({ firebaseConfig }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting Firebase config:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get Firebase configuration' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});