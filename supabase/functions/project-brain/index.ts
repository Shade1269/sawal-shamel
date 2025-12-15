import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrainAction {
  id: string;
  type: 'monitoring' | 'prediction' | 'auto_fix' | 'decision' | 'alert';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  data?: any;
  timestamp: string;
  auto_executed?: boolean;
}

interface BrainReport {
  generated_at: string;
  summary: string;
  health_score: number;
  actions: BrainAction[];
  predictions: any[];
  stats: any;
  recommendations: string[];
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
    const body = await req.json().catch(() => ({}));
    const { action, question, auto_fix = false } = body;

    const actions: BrainAction[] = [];
    const generateId = () => crypto.randomUUID();

    // ============ جمع البيانات الشاملة ============
    console.log("🧠 Brain: Collecting comprehensive data...");
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // إحصائيات عامة
    const [
      { count: totalUsers },
      { count: totalOrders },
      { count: totalProducts },
      { count: totalStores },
      { count: todayOrders },
      { count: weekOrders },
      { count: pendingOrders },
      { count: deliveredOrders },
      { count: activeUsers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('order_hub').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('affiliate_stores').select('*', { count: 'exact', head: true }),
      supabase.from('order_hub').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('order_hub').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('order_hub').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('order_hub').select('*', { count: 'exact', head: true }).eq('status', 'DELIVERED'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_activity_at', weekAgo),
    ]);

    // ============ المراقبة والكشف ============
    console.log("🧠 Brain: Monitoring systems...");

    // 1. كشف المحافظ السلبية
    const { data: negativeWallets } = await supabase
      .from('wallet_balances')
      .select('id, affiliate_profile_id, available_balance_sar')
      .lt('available_balance_sar', 0);

    if (negativeWallets && negativeWallets.length > 0) {
      actions.push({
        id: generateId(),
        type: 'monitoring',
        title: '🚨 محافظ برصيد سلبي',
        description: `اكتشفت ${negativeWallets.length} محفظة برصيد سلبي - هذا خطأ حرج`,
        severity: 'critical',
        data: { wallets: negativeWallets },
        timestamp: now.toISOString()
      });
    }

    // 2. كشف الطلبات المعلقة طويلاً
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: stuckOrders } = await supabase
      .from('order_hub')
      .select('id, order_number, created_at')
      .eq('status', 'PENDING')
      .lt('created_at', threeDaysAgo)
      .limit(20);

    if (stuckOrders && stuckOrders.length > 0) {
      actions.push({
        id: generateId(),
        type: 'monitoring',
        title: '⏳ طلبات معلقة لفترة طويلة',
        description: `${stuckOrders.length} طلب معلق لأكثر من 3 أيام`,
        severity: 'warning',
        data: { orders: stuckOrders },
        timestamp: now.toISOString()
      });
    }

    // 3. كشف محاولات OTP المشبوهة
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const { data: suspiciousOtp } = await supabase
      .from('customer_otp_sessions')
      .select('phone, store_id')
      .eq('verified', false)
      .gte('created_at', oneHourAgo);

    const otpByPhone: Record<string, number> = {};
    suspiciousOtp?.forEach(s => {
      otpByPhone[s.phone] = (otpByPhone[s.phone] || 0) + 1;
    });

    const suspiciousPhones = Object.entries(otpByPhone).filter(([_, count]) => count > 5);
    if (suspiciousPhones.length > 0) {
      actions.push({
        id: generateId(),
        type: 'alert',
        title: '🔐 نشاط مشبوه في OTP',
        description: `${suspiciousPhones.length} رقم جوال حاول أكثر من 5 مرات في ساعة`,
        severity: 'warning',
        data: { phones: suspiciousPhones.map(([phone, count]) => ({ phone, attempts: count })) },
        timestamp: now.toISOString()
      });
    }

    // 4. كشف طلبات السحب المعلقة
    const { data: pendingWithdrawals } = await supabase
      .from('withdrawal_requests')
      .select('id, amount_sar, created_at')
      .eq('status', 'PENDING')
      .lt('created_at', threeDaysAgo);

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      const totalPending = pendingWithdrawals.reduce((sum, w) => sum + (w.amount_sar || 0), 0);
      actions.push({
        id: generateId(),
        type: 'monitoring',
        title: '💰 طلبات سحب تنتظر المراجعة',
        description: `${pendingWithdrawals.length} طلب سحب بقيمة ${totalPending.toFixed(2)} ريال`,
        severity: 'warning',
        data: { withdrawals: pendingWithdrawals, total: totalPending },
        timestamp: now.toISOString()
      });
    }

    // ============ التنبؤ والاستباق ============
    console.log("🧠 Brain: Analyzing trends and predictions...");

    // حساب معدل الطلبات
    const avgDailyOrders = (weekOrders || 0) / 7;
    const todayProgress = ((todayOrders || 0) / Math.max(avgDailyOrders, 1)) * 100;

    const predictions: any[] = [];

    if (todayProgress < 50 && now.getHours() > 14) {
      predictions.push({
        type: 'sales_decline',
        title: '📉 انخفاض محتمل في المبيعات',
        description: `الطلبات اليوم ${todayOrders} مقارنة بمعدل ${avgDailyOrders.toFixed(1)} يومياً`,
        confidence: 0.75,
        suggestion: 'فكر في إطلاق عروض ترويجية أو تنبيه المسوقين'
      });
    }

    if (todayProgress > 150) {
      predictions.push({
        type: 'sales_surge',
        title: '📈 ارتفاع ملحوظ في المبيعات',
        description: `الطلبات اليوم ${todayOrders} - أعلى من المعدل بـ ${(todayProgress - 100).toFixed(0)}%`,
        confidence: 0.9,
        suggestion: 'تأكد من جاهزية المخزون والشحن'
      });
    }

    // ============ الإصلاح الذاتي ============
    if (auto_fix) {
      console.log("🧠 Brain: Executing auto-fix actions...");

      // 1. تنظيف جلسات OTP المنتهية
      const { count: deletedSessions } = await supabase
        .from('customer_otp_sessions')
        .delete()
        .lt('expires_at', now.toISOString())
        .select('id', { count: 'exact', head: true });

      if (deletedSessions && deletedSessions > 0) {
        actions.push({
          id: generateId(),
          type: 'auto_fix',
          title: '🧹 تنظيف الجلسات المنتهية',
          description: `تم حذف ${deletedSessions} جلسة OTP منتهية`,
          severity: 'success',
          auto_executed: true,
          timestamp: now.toISOString()
        });
      }

      // 2. تعطيل الكوبونات المنتهية
      const { count: disabledCoupons } = await supabase
        .from('affiliate_coupons')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('valid_until', now.toISOString())
        .select('id', { count: 'exact', head: true });

      if (disabledCoupons && disabledCoupons > 0) {
        actions.push({
          id: generateId(),
          type: 'auto_fix',
          title: '🎫 تعطيل الكوبونات المنتهية',
          description: `تم تعطيل ${disabledCoupons} كوبون منتهي الصلاحية`,
          severity: 'success',
          auto_executed: true,
          timestamp: now.toISOString()
        });
      }

      // 3. تعطيل الأعضاء المحظورين النشطين
      const { count: deactivatedMembers } = await supabase
        .from('room_members')
        .update({ is_active: false })
        .eq('is_banned', true)
        .eq('is_active', true)
        .select('id', { count: 'exact', head: true });

      if (deactivatedMembers && deactivatedMembers > 0) {
        actions.push({
          id: generateId(),
          type: 'auto_fix',
          title: '🚫 تعطيل المحظورين',
          description: `تم تعطيل ${deactivatedMembers} عضو محظور`,
          severity: 'success',
          auto_executed: true,
          timestamp: now.toISOString()
        });
      }
    }

    // ============ الإحصائيات الشاملة ============
    const stats = {
      users: {
        total: totalUsers || 0,
        active_week: activeUsers || 0,
      },
      orders: {
        total: totalOrders || 0,
        today: todayOrders || 0,
        week: weekOrders || 0,
        pending: pendingOrders || 0,
        delivered: deliveredOrders || 0,
        avg_daily: avgDailyOrders,
      },
      products: { total: totalProducts || 0 },
      stores: { total: totalStores || 0 },
    };

    // ============ حساب نقاط الصحة ============
    let healthScore = 100;
    actions.forEach(a => {
      if (a.severity === 'critical') healthScore -= 20;
      else if (a.severity === 'warning') healthScore -= 5;
    });
    healthScore = Math.max(0, healthScore);

    // ============ توليد الملخص بالذكاء الاصطناعي ============
    let summary = '';
    let aiRecommendations: string[] = [];

    if (LOVABLE_API_KEY) {
      console.log("🧠 Brain: Generating AI insights...");

      const aiPrompt = question 
        ? `أنت عقل مشروع منصة أطلانتس للتجارة الإلكترونية. المستخدم يسألك: "${question}"\n\nالإحصائيات الحالية:\n${JSON.stringify(stats, null, 2)}\n\nالمشاكل المكتشفة: ${actions.length}\n\nأجب بإيجاز ووضوح باللغة العربية.`
        : `أنت عقل مشروع منصة أطلانتس. قم بتحليل الوضع الحالي وقدم ملخصاً وتوصيات.\n\nالإحصائيات:\n${JSON.stringify(stats, null, 2)}\n\nالمشاكل: ${actions.filter(a => a.severity !== 'success').length}\nالإصلاحات التلقائية: ${actions.filter(a => a.auto_executed).length}\nnقاط الصحة: ${healthScore}/100\n\nأجب بـ JSON: { "summary": "ملخص قصير", "recommendations": ["توصية 1", "توصية 2"] }`;

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
              { role: "system", content: "أنت عقل ذكي لمنصة تجارة إلكترونية سعودية. تحلل البيانات وتقدم رؤى مفيدة." },
              { role: "user", content: aiPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          
          if (question) {
            summary = content;
          } else {
            try {
              const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
              const parsed = JSON.parse(cleanContent);
              summary = parsed.summary || '';
              aiRecommendations = parsed.recommendations || [];
            } catch {
              summary = content;
            }
          }
        }
      } catch (e) {
        console.log("AI analysis error:", e);
        summary = `نقاط صحة المشروع: ${healthScore}/100. تم اكتشاف ${actions.length} حدث.`;
      }
    }

    // ============ بناء التقرير النهائي ============
    const report: BrainReport = {
      generated_at: now.toISOString(),
      summary: summary || `المشروع يعمل بشكل ${healthScore >= 80 ? 'جيد' : healthScore >= 50 ? 'متوسط' : 'يحتاج اهتمام'}`,
      health_score: healthScore,
      actions,
      predictions,
      stats,
      recommendations: aiRecommendations
    };

    console.log(`🧠 Brain: Report generated. Health: ${healthScore}/100, Actions: ${actions.length}`);

    return new Response(JSON.stringify({
      success: true,
      report
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("🧠 Brain error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
