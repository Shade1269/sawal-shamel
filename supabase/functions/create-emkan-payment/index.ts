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

    // Create payment session with Emkan based on requested API shape
    const merchantId = Deno.env.get("EMKAN_MERCHANT_ID");
    if (!merchantId) {
      throw new Error("EMKAN_MERCHANT_ID not configured");
    }

    const rawPhone = paymentRequest.customerInfo.phone || "";
    let normalizedPhone = rawPhone.trim();
    if (!normalizedPhone.startsWith("+966")) {
      if (/^05\d{8}$/.test(normalizedPhone)) {
        normalizedPhone = "+966" + normalizedPhone.slice(1);
      } else if (/^5\d{8}$/.test(normalizedPhone)) {
        normalizedPhone = "+966" + normalizedPhone;
      } else if (/^0\d{9,}$/.test(normalizedPhone)) {
        normalizedPhone = "+966" + normalizedPhone.slice(1);
      } else if (!normalizedPhone.startsWith("+")) {
        normalizedPhone = "+966" + normalizedPhone;
      }
    }

    // Create unique order ID with timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
    const emkanOrderId = `ORD-${paymentRequest.orderInfo.orderId}-${timestamp}`;

    const emkanPayload = {
      merchantId: merchantId,
      amount: Math.round(paymentRequest.amount * 100) / 100, // Ensure 2 decimal places
      currency: paymentRequest.currency || "SAR",
      orderId: emkanOrderId,
      items: paymentRequest.orderInfo.items.map((item, index) => ({
        id: `item-${index + 1}`,
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price * 100) / 100,
        total: Math.round(item.price * item.quantity * 100) / 100
      })),
      customerInfo: {
        fullName: paymentRequest.customerInfo.name,
        email: paymentRequest.customerInfo.email || "",
        phone: normalizedPhone,
        address: paymentRequest.customerInfo.address || ""
      },
      redirectUrls: {
        successUrl: paymentRequest.redirectUrls.successUrl,
        cancelUrl: paymentRequest.redirectUrls.cancelUrl,
      },
      description: `Order payment for ${emkanOrderId}`
    };

    console.log("Sending request to Emkan API...");
    console.log("Payload:", JSON.stringify(emkanPayload, null, 2));

    // Call Emkan API with correct endpoint from documentation
    const emkanResponse = await fetch("https://merchants.emkanfinance.com.sa/retail/bnpl/bff/v1/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${emkanApiKey}:${emkanPassword}`)}`,
      },
      body: JSON.stringify(emkanPayload),
    });

    // Enhanced logging for better debugging
    console.log("Emkan API response status:", emkanResponse.status);
    console.log("Emkan API response headers:", Object.fromEntries(emkanResponse.headers.entries()));
    
    const responseText = await emkanResponse.text();
    console.log("Emkan API raw response:", responseText);
    
    if (!emkanResponse.ok) {
      let parsed: any = null;
      try { 
        parsed = JSON.parse(responseText); 
      } catch (e) { 
        console.error("Failed to parse error response:", e);
      }
      
      const errorMessage = parsed?.message || parsed?.error || parsed?.description || responseText;
      console.error("Emkan API error details:", {
        status: emkanResponse.status,
        statusText: emkanResponse.statusText,
        error: errorMessage,
        fullResponse: parsed
      });
      
      throw new Error(`Emkan API error ${emkanResponse.status}: ${errorMessage}`);
    }

    let emkanResult: any;
    try {
      emkanResult = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse success response:", e);
      throw new Error(`Invalid JSON response from Emkan API: ${responseText}`);
    }
    
    console.log("Emkan API parsed response:", JSON.stringify(emkanResult, null, 2));

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
        provider_ref: emkanResult.orderId || emkanResult.orderCode || emkanResult.requestId || null,
        amount_sar: paymentRequest.amount,
        status: (emkanResult.statusCode && ["CREATED", "PENDING", "INITIATED"].includes(emkanResult.statusCode)) ? "pending" : "failed",
        created_at: new Date().toISOString()
      });
    }

    // Return the response based on Emkan API structure
    if (emkanResult.statusCode === "CREATED" || emkanResult.checkoutUrl || emkanResult.redirectUrl) {
      return new Response(JSON.stringify({ 
        success: true,
        orderId: emkanResult.orderId || paymentRequest.orderInfo.orderId,
        checkoutUrl: emkanResult.checkoutUrl || emkanResult.redirectUrl || emkanResult.paymentUrl || null,
        statusCode: emkanResult.statusCode,
        description: emkanResult.description || "Order created successfully",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error(`Emkan order creation failed: ${emkanResult.description || 'Unknown error'}`);
    }

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