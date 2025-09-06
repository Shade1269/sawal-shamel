import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Testing Emkan API connection...");
    
    const emkanApiKey = Deno.env.get("EMKAN_API_KEY");
    const emkanPassword = Deno.env.get("EMKAN_PASSWORD");

    if (!emkanApiKey || !emkanPassword) {
      throw new Error("Emkan API credentials not configured");
    }

    console.log("API Key found:", emkanApiKey.substring(0, 10) + "...");

    // Test payload similar to what the real function would send
    const testPayload = {
      merchantId: "556480",
      requestId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callerReferenceNumber: `ORDER_TEST_${Date.now()}`,
      orderItems: [
        {
          itemPrice: 100,
          quantity: 1,
          itemCode: `test_item_${Math.random().toString(36).substr(2, 9)}`,
          createAt: new Date().toISOString()
        }
      ],
      channel: "BNPL_MERCHANT"
    };

    console.log("Test payload:", JSON.stringify(testPayload, null, 2));

    // Test the Emkan API
    const emkanResponse = await fetch("https://merchants.emkanfinance.com.sa/retail/bnpl/bff/v1/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${emkanApiKey}:${emkanPassword}`)}`,
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await emkanResponse.text();
    console.log("Emkan API Response Status:", emkanResponse.status);
    console.log("Emkan API Response:", responseText);

    let emkanResult;
    try {
      emkanResult = JSON.parse(responseText);
    } catch (e) {
      emkanResult = { raw: responseText };
    }

    return new Response(JSON.stringify({ 
      success: emkanResponse.ok,
      status: emkanResponse.status,
      response: emkanResult,
      testPayload: testPayload
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Test error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});