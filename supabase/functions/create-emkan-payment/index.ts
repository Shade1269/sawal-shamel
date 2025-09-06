import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmkanPaymentRequest {
  amount: number;
  currency: string;
  customerInfo: {
    name: string;
    email?: string;
    phone: string;
    address: string;
  };
  orderInfo: {
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  redirectUrls: {
    successUrl: string;
    cancelUrl: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log("Starting Emkan payment process...");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    const paymentRequest: EmkanPaymentRequest = await req.json();
    console.log("Payment request received:", { 
      amount: paymentRequest.amount, 
      orderId: paymentRequest.orderInfo.orderId 
    });

    const emkanApiKey = Deno.env.get("EMKAN_API_KEY");
    const emkanPassword = Deno.env.get("EMKAN_PASSWORD");

    if (!emkanApiKey || !emkanPassword) {
      throw new Error("Emkan API credentials not configured");
    }

    // Create payment session with Emkan
    // Note: This is a template based on common BNPL patterns
    // The actual endpoint and payload structure should match Emkan's documentation
    const emkanPayload = {
      merchant_id: emkanApiKey,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency || "SAR",
      order_id: paymentRequest.orderInfo.orderId,
      customer: {
        name: paymentRequest.customerInfo.name,
        email: paymentRequest.customerInfo.email || "customer@example.com",
        phone: paymentRequest.customerInfo.phone,
        address: paymentRequest.customerInfo.address,
      },
      items: paymentRequest.orderInfo.items,
      return_url: paymentRequest.redirectUrls.successUrl,
      cancel_url: paymentRequest.redirectUrls.cancelUrl,
      callback_url: `${req.headers.get("origin")}/api/emkan-webhook`, // For payment status updates
    };

    console.log("Sending request to Emkan API...");

    // Call Emkan API - Updated based on common BNPL patterns
    // Try multiple possible endpoints
    let emkanResponse;
    const possibleEndpoints = [
      "https://merchants.emkanfinance.com.sa/api/v1/payments",
      "https://api.emkanfinance.com.sa/v1/payments",
      "https://gateway.emkanfinance.com.sa/api/payments",
      "https://merchants.emkanfinance.com.sa/api/payments/create"
    ];

    // Try different authentication methods
    const authMethods = [
      { "Authorization": `Bearer ${emkanApiKey}`, "X-API-Password": emkanPassword },
      { "Authorization": `Basic ${btoa(`${emkanApiKey}:${emkanPassword}`)}` },
      { "X-API-Key": emkanApiKey, "X-API-Password": emkanPassword },
      { "API-Key": emkanApiKey, "API-Secret": emkanPassword }
    ];

    let lastError = null;
    
    for (const endpoint of possibleEndpoints) {
      for (const authMethod of authMethods) {
        try {
          console.log(`Trying endpoint: ${endpoint} with auth method:`, Object.keys(authMethod));
          
          emkanResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authMethod,
            },
            body: JSON.stringify(emkanPayload),
          });

          if (emkanResponse.ok) {
            console.log("Successful response from:", endpoint);
            break;
          } else {
            const errorText = await emkanResponse.text();
            console.log(`Failed with ${endpoint}:`, emkanResponse.status, errorText);
            lastError = { endpoint, status: emkanResponse.status, error: errorText };
          }
        } catch (error) {
          console.log(`Error with ${endpoint}:`, error.message);
          lastError = { endpoint, error: error.message };
        }
      }
      if (emkanResponse && emkanResponse.ok) break;
    }

    if (!emkanResponse || !emkanResponse.ok) {
      console.error("All Emkan API attempts failed. Last error:", lastError);
      throw new Error(`Emkan API error: ${lastError?.status || 'Unknown'} - ${lastError?.error || 'All endpoints failed'}`);
    }

    if (!emkanResponse.ok) {
      const errorText = await emkanResponse.text();
      console.error("Emkan API error:", errorText);
      throw new Error(`Emkan API error: ${emkanResponse.status} - ${errorText}`);
    }

    const emkanResult = await emkanResponse.json();
    console.log("Emkan API response:", emkanResult);

    // Store payment record in database for tracking
    if (user) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      await supabaseService.from("payments").insert({
        order_id: paymentRequest.orderInfo.orderId,
        provider: "emkan",
        provider_ref: emkanResult.payment_id || emkanResult.session_id,
        amount_sar: paymentRequest.amount,
        status: "pending",
        created_at: new Date().toISOString()
      });
    }

    // Return the payment URL for redirection
    return new Response(JSON.stringify({ 
      success: true,
      payment_url: emkanResult.payment_url || emkanResult.redirect_url,
      payment_id: emkanResult.payment_id || emkanResult.session_id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-emkan-payment function:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});