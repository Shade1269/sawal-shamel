import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface TestConnectionRequest {
  merchantId: string;
  apiKey: string;
  password: string;
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
    const { merchantId, apiKey, password }: TestConnectionRequest = await req.json();

    if (!merchantId || !apiKey || !password) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "جميع البيانات مطلوبة: معرف التاجر، مفتاح API، وكلمة المرور" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Testing Emkan connection for merchant:", merchantId);

    // Test connection with minimal order data
    const testPayload = {
      merchantId: merchantId,
      amount: 1.00,
      currency: "SAR",
      orderId: `TEST-CONN-${Date.now()}`,
      items: [{
        id: "test-item",
        name: "اختبار الاتصال",
        quantity: 1,
        price: 1.00,
        total: 1.00
      }],
      customerInfo: {
        fullName: "اختبار العميل",
        email: "test@example.com", 
        phone: "+966500000000",
        address: "عنوان تجريبي"
      },
      redirectUrls: {
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel"
      },
      description: "اختبار الاتصال مع إمكان"
    };

    console.log("Sending test request to Emkan API...");

    const response = await fetch("https://merchants.emkanfinance.com.sa/retail/bnpl/bff/v1/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${apiKey}:${password}`)}`
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    console.log("Emkan API response:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    // Parse response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawResponse: responseText };
    }

    if (response.ok) {
      return new Response(JSON.stringify({
        success: true,
        message: "✅ نجح الاتصال مع إمكان - بيانات الاعتماد صحيحة",
        details: responseData
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (response.status === 401 || response.status === 403) {
      return new Response(JSON.stringify({
        success: false,
        error: "❌ بيانات الاعتماد غير صحيحة - تحقق من مفتاح API وكلمة المرور",
        statusCode: response.status,
        details: responseData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (response.status === 400) {
      // 400 might be expected for test data, but auth worked
      return new Response(JSON.stringify({
        success: true,
        message: "✅ نجح الاتصال مع إمكان - بيانات الاعتماد صحيحة (بيانات الاختبار غير صالحة لكن التفويض نجح)",
        details: responseData
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: `❌ خطأ في الاتصال مع إمكان (${response.status}): ${responseData?.message || responseData?.error || responseText}`,
        statusCode: response.status,
        details: responseData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("Error testing Emkan connection:", error);
    return new Response(JSON.stringify({
      success: false,
      error: `❌ خطأ في اختبار الاتصال: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});