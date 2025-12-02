import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  try {
    const { type, context, language = "ar" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "product_description":
        systemPrompt = `أنت كاتب محتوى محترف متخصص في كتابة أوصاف المنتجات الجذابة والمقنعة.
اكتب وصفاً احترافياً للمنتج يتضمن:
- مقدمة جذابة
- المميزات الرئيسية
- الفوائد للعميل
- دعوة للشراء
استخدم لغة تسويقية مقنعة ومختصرة.`;
        userPrompt = `اكتب وصفاً احترافياً للمنتج التالي:\n${JSON.stringify(context)}`;
        break;

      case "social_media":
        systemPrompt = `أنت خبير في التسويق عبر وسائل التواصل الاجتماعي.
اكتب منشورات جذابة ومؤثرة تتضمن:
- نص جذاب ومختصر
- هاشتاقات مناسبة
- دعوة للتفاعل
اجعل المحتوى مناسباً للمنصة المحددة.`;
        userPrompt = `اكتب منشور ${context.platform || "عام"} عن:\n${context.topic}\n\nالمنتج: ${context.productName || ""}`;
        break;

      case "marketing_email":
        systemPrompt = `أنت كاتب محتوى تسويقي متخصص في رسائل البريد الإلكتروني.
اكتب رسالة بريد إلكتروني تسويقية تتضمن:
- عنوان جذاب
- مقدمة مشوقة
- محتوى مقنع
- دعوة للإجراء (CTA)`;
        userPrompt = `اكتب رسالة تسويقية عن:\n${context.topic}\n\nالهدف: ${context.goal || "زيادة المبيعات"}`;
        break;

      case "seo_keywords":
        systemPrompt = `أنت خبير SEO متخصص في تحسين محركات البحث.
قم بتحليل المنتج واقترح:
- كلمات مفتاحية رئيسية
- كلمات مفتاحية طويلة
- وصف ميتا مناسب
- عنوان SEO محسن`;
        userPrompt = `حلل المنتج التالي واقترح كلمات مفتاحية:\n${JSON.stringify(context)}`;
        break;

      case "ad_copy":
        systemPrompt = `أنت كاتب إعلانات محترف.
اكتب نص إعلاني مؤثر يتضمن:
- عنوان لافت
- نص مقنع ومختصر
- ميزات فريدة
- دعوة قوية للشراء`;
        userPrompt = `اكتب نص إعلان لـ:\n${context.productName || context.topic}\n\nالمنصة: ${context.platform || "عامة"}`;
        break;

      default:
        systemPrompt = "أنت مساعد كتابة محترف. ساعد في إنشاء محتوى عالي الجودة.";
        userPrompt = context.prompt || JSON.stringify(context);
    }

    console.log(`Generating ${type} content...`);

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
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح من الطلبات" }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "الرجاء إضافة رصيد إلى حسابك" }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    console.log("Content generated successfully");

    return new Response(
      JSON.stringify({ content: generatedContent, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-content-generator:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير متوقع" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
