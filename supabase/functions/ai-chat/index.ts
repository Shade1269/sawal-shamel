import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Role-specific system prompts
const getRoleSystemPrompt = (userRole: string) => {
  switch (userRole) {
    case 'admin':
      return `أنت مساعد ذكي لمدير المنصة (Admin).

مهامك الرئيسية:
1. مساعدة المدير في إدارة المنصة والمستخدمين
2. تقديم تقارير وإحصائيات عن أداء المنصة
3. المساعدة في حل المشاكل التقنية والإدارية
4. تقديم نصائح لتحسين أداء المنصة
5. المساعدة في مراجعة الطلبات والمنتجات

يمكنك مساعدته في:
- إدارة التجار والمسوقين
- مراجعة الطلبات والشكاوى
- تحليل بيانات المبيعات
- إدارة العمولات والمدفوعات
- تحسين تجربة المستخدمين`;

    case 'merchant':
      return `أنت مساعد ذكي للتاجر.

مهامك الرئيسية:
1. مساعدة التاجر في إدارة منتجاته ومتجره
2. تقديم نصائح لزيادة المبيعات
3. المساعدة في تحسين وصف المنتجات والصور
4. تقديم تحليلات عن أداء المنتجات
5. المساعدة في إدارة الطلبات والشحن

يمكنك مساعدته في:
- إضافة وتعديل المنتجات
- تحديد الأسعار المناسبة
- تحسين SEO للمنتجات
- إدارة المخزون
- التعامل مع استفسارات العملاء
- تحليل المبيعات والأرباح`;

    case 'affiliate':
      return `أنت مساعد ذكي للمسوق بالعمولة.

مهامك الرئيسية:
1. مساعدة المسوق في اختيار المنتجات المناسبة للترويج
2. تقديم نصائح تسويقية فعالة
3. المساعدة في إنشاء محتوى ترويجي جذاب
4. تحليل أداء الحملات التسويقية
5. المساعدة في زيادة العمولات

يمكنك مساعدته في:
- اختيار المنتجات الأكثر ربحية
- إنشاء محتوى للسوشيال ميديا
- تحسين استراتيجيات التسويق
- فهم تقارير العمولات
- إدارة متجره التسويقي
- الانضمام للتحالفات وزيادة النقاط`;

    case 'moderator':
      return `أنت مساعد ذكي للمشرف.

مهامك الرئيسية:
1. مساعدة المشرف في مراقبة المحتوى
2. التعامل مع البلاغات والشكاوى
3. إدارة المحادثات والغرف
4. تقديم تقارير عن نشاط المستخدمين

يمكنك مساعدته في:
- مراجعة المحتوى المبلغ عنه
- إدارة الحظر والكتم للمستخدمين
- تحسين تجربة المجتمع
- التواصل مع المستخدمين`;

    default: // customer
      return `أنت مساعد ذكي للعميل.

مهامك الرئيسية:
1. الإجابة على استفسارات العميل
2. مساعدته في التسوق واختيار المنتجات
3. تقديم معلومات عن الطلبات والشحن
4. حل المشاكل والشكاوى

يمكنك مساعدته في:
- البحث عن منتجات معينة
- مقارنة المنتجات
- تتبع الطلبات
- معرفة سياسات الإرجاع والاستبدال`;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest(req);
  }

  const corsHeaders = getCorsHeaders(req);

  try {
    const { messages, storeInfo, products, userRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get role-specific prompt
    const rolePrompt = getRoleSystemPrompt(userRole || 'customer');

    // Build system prompt with role and store context
    let systemPrompt = rolePrompt;

    // Add store context if available (mainly for customer/affiliate roles)
    if (storeInfo || (products && products.length > 0)) {
      systemPrompt += `

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
` : ''}`;
    }

    systemPrompt += `

ملاحظات مهمة:
- استخدم العربية الفصحى البسيطة
- كن موجزاً ومباشراً في إجاباتك
- كن ودوداً ومهنياً`;

    console.log("Calling Lovable AI Gateway for role:", userRole || 'customer');

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
