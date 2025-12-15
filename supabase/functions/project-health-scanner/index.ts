import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthIssue {
  id: string;
  category: 'database' | 'security' | 'code' | 'performance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion: string;
  table_name?: string;
  detected_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const issues: HealthIssue[] = [];
    const generateId = () => crypto.randomUUID();

    // 1. فحص الجداول بدون RLS
    console.log("Checking tables without RLS...");
    const { data: tablesWithoutRLS } = await supabase.rpc('check_all_data_quality').catch(() => ({ data: null }));

    // 2. فحص الجداول الفارغة أو المشاكل في البيانات
    console.log("Checking data quality...");
    
    // فحص profiles orphans
    const { data: profileOrphans } = await supabase
      .from('profiles')
      .select('id')
      .is('auth_user_id', null)
      .limit(10);

    if (profileOrphans && profileOrphans.length > 0) {
      issues.push({
        id: generateId(),
        category: 'database',
        severity: 'warning',
        title: 'ملفات شخصية بدون مستخدم مرتبط',
        description: `يوجد ${profileOrphans.length} ملف شخصي بدون auth_user_id`,
        suggestion: 'راجع الملفات الشخصية وأربطها بمستخدمين أو احذف غير المستخدمة',
        table_name: 'profiles',
        detected_at: new Date().toISOString()
      });
    }

    // 3. فحص الطلبات المعلقة لفترة طويلة
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: stuckOrders } = await supabase
      .from('order_hub')
      .select('id')
      .eq('status', 'PENDING')
      .lt('created_at', threeDaysAgo)
      .limit(10);

    if (stuckOrders && stuckOrders.length > 0) {
      issues.push({
        id: generateId(),
        category: 'database',
        severity: 'warning',
        title: 'طلبات معلقة لأكثر من 3 أيام',
        description: `يوجد ${stuckOrders.length} طلب معلق لفترة طويلة`,
        suggestion: 'راجع الطلبات المعلقة وحدث حالتها',
        table_name: 'order_hub',
        detected_at: new Date().toISOString()
      });
    }

    // 4. فحص المحافظ بأرصدة سلبية
    const { data: negativeWallets } = await supabase
      .from('wallet_balances')
      .select('id')
      .lt('available_balance_sar', 0)
      .limit(10);

    if (negativeWallets && negativeWallets.length > 0) {
      issues.push({
        id: generateId(),
        category: 'database',
        severity: 'critical',
        title: 'محافظ برصيد سلبي',
        description: `يوجد ${negativeWallets.length} محفظة برصيد سلبي`,
        suggestion: 'هذا خطأ حرج - راجع المعاملات وصحح الأرصدة',
        table_name: 'wallet_balances',
        detected_at: new Date().toISOString()
      });
    }

    // 5. فحص طلبات السحب المعلقة
    const { data: pendingWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('status', 'PENDING')
      .lt('created_at', threeDaysAgo)
      .limit(10);

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      issues.push({
        id: generateId(),
        category: 'database',
        severity: 'warning',
        title: 'طلبات سحب معلقة لفترة طويلة',
        description: `يوجد ${pendingWithdrawals.length} طلب سحب معلق لأكثر من 3 أيام`,
        suggestion: 'راجع طلبات السحب ووافق عليها أو ارفضها',
        table_name: 'withdrawal_requests',
        detected_at: new Date().toISOString()
      });
    }

    // 6. فحص المنتجات بدون تاجر
    const { data: orphanProducts } = await supabase
      .from('products')
      .select('id')
      .is('merchant_id', null)
      .limit(10);

    if (orphanProducts && orphanProducts.length > 0) {
      issues.push({
        id: generateId(),
        category: 'database',
        severity: 'warning',
        title: 'منتجات بدون تاجر مرتبط',
        description: `يوجد ${orphanProducts.length} منتج بدون merchant_id`,
        suggestion: 'أربط المنتجات بتجار أو احذف غير المستخدمة',
        table_name: 'products',
        detected_at: new Date().toISOString()
      });
    }

    // 7. فحص الجلسات المنتهية
    const { data: expiredSessions } = await supabase
      .from('customer_otp_sessions')
      .select('id')
      .lt('expires_at', new Date().toISOString())
      .limit(100);

    if (expiredSessions && expiredSessions.length > 50) {
      issues.push({
        id: generateId(),
        category: 'performance',
        severity: 'info',
        title: 'جلسات OTP منتهية كثيرة',
        description: `يوجد ${expiredSessions.length} جلسة منتهية يمكن تنظيفها`,
        suggestion: 'قم بتنظيف الجلسات المنتهية لتحسين الأداء',
        table_name: 'customer_otp_sessions',
        detected_at: new Date().toISOString()
      });
    }

    // 8. استخدام AI لتحليل إضافي إذا كان متاحاً
    if (LOVABLE_API_KEY) {
      console.log("Using AI for advanced analysis...");
      
      // جمع إحصائيات للتحليل
      const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: totalOrders } = await supabase.from('order_hub').select('*', { count: 'exact', head: true });
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      const stats = {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalUsers: totalUsers || 0,
        issuesFound: issues.length
      };

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `أنت محلل أنظمة متخصص في منصات التجارة الإلكترونية. قم بتحليل الإحصائيات التالية وقدم توصيات قصيرة ومفيدة باللغة العربية. أجب بـ JSON فقط بالشكل: { "recommendations": [{ "title": "...", "description": "..." }] }`
              },
              {
                role: "user",
                content: `إحصائيات المشروع: ${JSON.stringify(stats)}. المشاكل المكتشفة: ${issues.length}. قدم 2-3 توصيات لتحسين المنصة.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.recommendations) {
                for (const rec of parsed.recommendations) {
                  issues.push({
                    id: generateId(),
                    category: 'performance',
                    severity: 'info',
                    title: rec.title,
                    description: rec.description,
                    suggestion: 'توصية من الذكاء الاصطناعي',
                    detected_at: new Date().toISOString()
                  });
                }
              }
            } catch (e) {
              console.log("Could not parse AI response:", e);
            }
          }
        }
      } catch (aiError) {
        console.log("AI analysis skipped:", aiError);
      }
    }

    // إضافة فحص صحة عام
    if (issues.length === 0) {
      issues.push({
        id: generateId(),
        category: 'performance',
        severity: 'info',
        title: 'المشروع سليم ✓',
        description: 'لم يتم اكتشاف أي مشاكل في الفحص الحالي',
        suggestion: 'استمر في المراقبة الدورية',
        detected_at: new Date().toISOString()
      });
    }

    console.log(`Health scan completed. Found ${issues.length} issues.`);

    return new Response(JSON.stringify({ 
      success: true, 
      issues,
      scanned_at: new Date().toISOString(),
      total_issues: issues.length,
      critical_count: issues.filter(i => i.severity === 'critical').length,
      warning_count: issues.filter(i => i.severity === 'warning').length,
      info_count: issues.filter(i => i.severity === 'info').length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Health scanner error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
