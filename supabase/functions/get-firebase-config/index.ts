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
    const firebaseConfig = {
      apiKey: Deno.env.get('FIREBASE_API_KEY'),
      authDomain: Deno.env.get('FIREBASE_AUTH_DOMAIN'),
      projectId: Deno.env.get('FIREBASE_PROJECT_ID'),
      storageBucket: Deno.env.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: Deno.env.get('FIREBASE_MESSAGING_SENDER_ID'),
      appId: Deno.env.get('FIREBASE_APP_ID')
    };

    return new Response(
      JSON.stringify({ firebaseConfig }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});