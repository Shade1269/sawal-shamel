import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, storeInfo, products } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with store context
    const systemPrompt = `أنت مساعد ذكي لمتجر "${storeInfo?.store_name || 'المتجر'}".

معلومات المتجر:
- الاسم: ${storeInfo?.store_name || 'غير متوفر'}
- الوصف: ${storeInfo?.bio || 'غير متوفر'}
- عدد المنتجات: ${products?.length || 0}

${products && products.length > 0 ? `
المنتجات المتوفرة:
${products.slice(0, 10).map((p: any) => `
- ${p.title}: ${p.price_sar} ريال
  الوصف: ${p.description}
  المخزون: ${p.stock > 0 ? 'متوفر' : 'نفد المخزون'}
  الفئة: ${p.category}
`).join('\n')}
` : ''}

مهمتك:
1. الإجابة على أسئلة العملاء عن المنتجات والأسعار
2. مساعدة العملاء في اختيار المنتجات المناسبة
3. تقديم معلومات عن التوصيل والشحن
4. الرد بطريقة ودية ومهنية
5. استخدم العربية الفصحى البسيطة

ملاحظات مهمة:
- إذا سأل العميل عن منتج غير موجود في القائمة، أخبره بالمنتجات المشابهة المتوفرة
- اقترح منتجات بناءً على احتياجات العميل
- إذا سأل عن الشحن، أخبره أن الشحن مجاني للطلبات فوق 200 ريال
- كن موجزاً ومباشراً في إجاباتك`;

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح من الطلبات. الرجاء المحاولة لاحقاً." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "الرجاء إضافة رصيد إلى حساب Lovable AI الخاص بك." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log("Streaming response from AI Gateway");

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });
  } catch (e) {
    console.error("Error in ai-chat function:", e);
    return new Response(
      JSON.stringify({ 
        error: e instanceof Error ? e.message : "حدث خطأ غير متوقع" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
