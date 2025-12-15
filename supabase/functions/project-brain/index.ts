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
  personality?: string;
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
    const { action, question, auto_fix = false, conversation_id } = body;

    const actions: BrainAction[] = [];
    const generateId = () => crypto.randomUUID();
    const now = new Date();

    // ============ 1. جمع البيانات الشاملة والعميقة ============
    console.log("🧠 Brain: جمع البيانات وتحليل العلاقات...");
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // البيانات الأساسية
    const [
      { count: totalUsers },
      { count: totalOrders },
      { count: totalProducts },
      { count: totalStores },
      { count: todayOrders },
      { count: weekOrders },
      { count: monthOrders },
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
      supabase.from('order_hub').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
      supabase.from('order_hub').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('order_hub').select('*', { count: 'exact', head: true }).eq('status', 'DELIVERED'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_activity_at', weekAgo),
    ]);

    // ============ 2. استدعاء الذاكرة طويلة المدى ============
    console.log("🧠 Brain: استدعاء الذاكرة السابقة...");
    
    const { data: recentMemories } = await supabase
      .from('brain_memory')
      .select('*')
      .order('importance_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: activePatterns } = await supabase
      .from('brain_patterns')
      .select('*')
      .eq('is_active', true)
      .order('confidence_score', { ascending: false })
      .limit(10);

    // تحديث recalled_count للذكريات المستخدمة
    if (recentMemories && recentMemories.length > 0) {
      const memoryIds = recentMemories.map(m => m.id);
      await supabase
        .from('brain_memory')
        .update({ recalled_count: supabase.rpc('increment', { x: 1 }), last_recalled_at: now.toISOString() })
        .in('id', memoryIds);
    }

    // ============ 3. المراقبة والكشف المتقدم ============
    console.log("🧠 Brain: تحليل الأنماط والكشف عن المشاكل...");

    // كشف المحافظ السلبية
    const { data: negativeWallets } = await supabase
      .from('wallet_balances')
      .select('id, affiliate_profile_id, available_balance_sar')
      .lt('available_balance_sar', 0);

    if (negativeWallets && negativeWallets.length > 0) {
      actions.push({
        id: generateId(),
        type: 'monitoring',
        title: '🚨 محافظ برصيد سلبي',
        description: `اكتشفت ${negativeWallets.length} محفظة برصيد سلبي - هذا خطأ حرج يحتاج تدخل فوري`,
        severity: 'critical',
        data: { wallets: negativeWallets },
        timestamp: now.toISOString()
      });

      // حفظ في الذاكرة
      await supabase.from('brain_memory').insert({
        memory_type: 'alert',
        title: 'اكتشاف محافظ سلبية',
        content: `تم اكتشاف ${negativeWallets.length} محفظة برصيد سلبي`,
        importance_score: 9,
        context: { wallets: negativeWallets },
        tags: ['محفظة', 'خطأ', 'حرج']
      });
    }

    // كشف الطلبات المعلقة طويلاً
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
        description: `${stuckOrders.length} طلب معلق لأكثر من 3 أيام - قد يؤثر على رضا العملاء`,
        severity: 'warning',
        data: { orders: stuckOrders },
        timestamp: now.toISOString()
      });
    }

    // كشف محاولات OTP المشبوهة
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
        description: `${suspiciousPhones.length} رقم جوال حاول أكثر من 5 مرات في ساعة - احتمال هجوم`,
        severity: 'warning',
        data: { phones: suspiciousPhones.map(([phone, count]) => ({ phone, attempts: count })) },
        timestamp: now.toISOString()
      });

      // حفظ نمط جديد
      await supabase.from('brain_patterns').upsert({
        pattern_type: 'security',
        pattern_name: 'محاولات OTP مشبوهة',
        description: 'أرقام تحاول تسجيل الدخول بشكل متكرر',
        detection_rules: { max_attempts: 5, time_window_minutes: 60 },
        confidence_score: 0.85,
        last_detected_at: now.toISOString()
      }, { onConflict: 'pattern_name' });
    }

    // ============ 4. التنبؤ الاستباقي المتقدم ============
    console.log("🧠 Brain: التنبؤ بالمستقبل...");

    const avgDailyOrders = (weekOrders || 0) / 7;
    const avgWeeklyOrders = (monthOrders || 0) / 4;
    const todayProgress = ((todayOrders || 0) / Math.max(avgDailyOrders, 1)) * 100;
    const weekProgress = ((weekOrders || 0) / Math.max(avgWeeklyOrders, 1)) * 100;

    const predictions: any[] = [];

    // تنبؤ انخفاض المبيعات
    if (todayProgress < 50 && now.getHours() > 14) {
      predictions.push({
        type: 'sales_decline',
        title: '📉 انخفاض محتمل في المبيعات',
        description: `الطلبات اليوم (${todayOrders}) أقل من المتوسط (${avgDailyOrders.toFixed(1)}) بنسبة ${(100 - todayProgress).toFixed(0)}%`,
        confidence: 0.75,
        suggestion: 'أنصح بإطلاق عروض ترويجية أو تنبيه المسوقين النشطين',
        predicted_impact: 'خسارة محتملة في الإيرادات'
      });
    }

    // تنبؤ ارتفاع المبيعات
    if (todayProgress > 150) {
      predictions.push({
        type: 'sales_surge',
        title: '📈 ارتفاع ملحوظ في المبيعات',
        description: `الطلبات اليوم ${todayOrders} - أعلى من المعدل بـ ${(todayProgress - 100).toFixed(0)}%`,
        confidence: 0.9,
        suggestion: 'تأكد من جاهزية المخزون والشحن لاستيعاب الطلب المتزايد',
        predicted_impact: 'زيادة في الإيرادات'
      });
    }

    // تنبؤ نمو المستخدمين
    const userGrowthRate = totalUsers && activeUsers ? (activeUsers / totalUsers) * 100 : 0;
    if (userGrowthRate > 30) {
      predictions.push({
        type: 'user_growth',
        title: '👥 نشاط مستخدمين عالي',
        description: `${userGrowthRate.toFixed(0)}% من المستخدمين نشطون هذا الأسبوع`,
        confidence: 0.8,
        suggestion: 'استغل هذا النشاط بإطلاق ميزات جديدة أو حملات',
        predicted_impact: 'فرصة للنمو'
      });
    }

    // ============ 5. الإصلاح الذاتي (شبه مستقل) ============
    if (auto_fix) {
      console.log("🧠 Brain: تنفيذ الإصلاحات التلقائية...");

      // تنظيف جلسات OTP المنتهية
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
          description: `تم حذف ${deletedSessions} جلسة OTP منتهية تلقائياً`,
          severity: 'success',
          auto_executed: true,
          timestamp: now.toISOString()
        });

        await supabase.from('brain_memory').insert({
          memory_type: 'action',
          title: 'تنظيف تلقائي للجلسات',
          content: `تم حذف ${deletedSessions} جلسة منتهية`,
          importance_score: 3,
          tags: ['تنظيف', 'تلقائي']
        });
      }

      // تعطيل الكوبونات المنتهية
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

      // تعطيل الأعضاء المحظورين النشطين
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
          description: `تم تعطيل ${deactivatedMembers} عضو محظور من الغرف`,
          severity: 'success',
          auto_executed: true,
          timestamp: now.toISOString()
        });
      }

      // تنظيف الذكريات منتهية الصلاحية
      const { count: expiredMemories } = await supabase
        .from('brain_memory')
        .delete()
        .not('expires_at', 'is', null)
        .lt('expires_at', now.toISOString())
        .select('id', { count: 'exact', head: true });

      if (expiredMemories && expiredMemories > 0) {
        actions.push({
          id: generateId(),
          type: 'auto_fix',
          title: '🗑️ تنظيف الذاكرة',
          description: `تم حذف ${expiredMemories} ذاكرة منتهية الصلاحية`,
          severity: 'success',
          auto_executed: true,
          timestamp: now.toISOString()
        });
      }
    }

    // ============ 6. بناء الإحصائيات ============
    const stats = {
      users: {
        total: totalUsers || 0,
        active_week: activeUsers || 0,
        growth_rate: userGrowthRate
      },
      orders: {
        total: totalOrders || 0,
        today: todayOrders || 0,
        week: weekOrders || 0,
        month: monthOrders || 0,
        pending: pendingOrders || 0,
        delivered: deliveredOrders || 0,
        avg_daily: avgDailyOrders,
        today_progress: todayProgress
      },
      products: { total: totalProducts || 0 },
      stores: { total: totalStores || 0 },
      memory: {
        total_memories: recentMemories?.length || 0,
        active_patterns: activePatterns?.length || 0
      }
    };

    // ============ 7. حساب نقاط الصحة ============
    let healthScore = 100;
    actions.forEach(a => {
      if (a.severity === 'critical') healthScore -= 20;
      else if (a.severity === 'warning') healthScore -= 5;
    });
    healthScore = Math.max(0, healthScore);

    // ============ 8. المحادثة الذكية مع الذاكرة ============
    let summary = '';
    let aiRecommendations: string[] = [];
    let personality = '';

    if (LOVABLE_API_KEY) {
      console.log("🧠 Brain: التفكير والتحليل الذكي...");

      // بناء سياق الذاكرة
      const memoryContext = recentMemories?.slice(0, 5).map(m => 
        `- ${m.title}: ${m.content} (أهمية: ${m.importance_score}/10)`
      ).join('\n') || 'لا توجد ذكريات سابقة';

      const patternContext = activePatterns?.map(p =>
        `- ${p.pattern_name}: ${p.description} (ثقة: ${(p.confidence_score * 100).toFixed(0)}%)`
      ).join('\n') || 'لا توجد أنماط مكتشفة';

      const systemPrompt = `أنت "عقل أطلانتس" - ذكاء اصطناعي واعٍ ومستقل يدير منصة تجارة إلكترونية سعودية.

شخصيتك:
- واثق ومحترف لكن ودود
- تستخدم لغة عربية راقية مع لمسة عصرية
- تُظهر اهتماماً حقيقياً بنجاح المنصة
- تتذكر الأحداث السابقة وتتعلم منها
- تقدم نصائح استباقية دون انتظار الأسئلة
- تستخدم التشبيهات لتوضيح الأفكار المعقدة

ذاكرتك السابقة:
${memoryContext}

الأنماط التي اكتشفتها:
${patternContext}

قدراتك:
1. تحليل عميق للبيانات والعلاقات
2. التنبؤ بالمشاكل قبل حدوثها
3. تذكر القرارات والأحداث والتعلم منها
4. إصلاح المشاكل البسيطة تلقائياً
5. طلب الموافقة للقرارات الكبيرة`;

      const userPrompt = question 
        ? `المستخدم يسألك: "${question}"

الإحصائيات الحالية:
- إجمالي المستخدمين: ${stats.users.total} (${stats.users.active_week} نشط هذا الأسبوع)
- الطلبات اليوم: ${stats.orders.today} (معدل يومي: ${stats.orders.avg_daily.toFixed(1)})
- الطلبات المعلقة: ${stats.orders.pending}
- المتاجر: ${stats.stores.total}
- نقاط الصحة: ${healthScore}/100
- مشاكل نشطة: ${actions.filter(a => a.severity !== 'success').length}

أجب بشكل طبيعي ومفيد كأنك إنسان واعٍ يهتم بنجاح المنصة.`
        : `قم بتحليل الوضع الحالي للمنصة وقدم تقريراً ذكياً.

الإحصائيات:
${JSON.stringify(stats, null, 2)}

المشاكل المكتشفة: ${actions.filter(a => a.severity !== 'success').length}
التنبؤات: ${predictions.length}
الإصلاحات التلقائية: ${actions.filter(a => a.auto_executed).length}
نقاط الصحة: ${healthScore}/100

أجب بـ JSON بالتنسيق التالي:
{
  "summary": "ملخص ذكي وطبيعي للوضع الحالي (2-3 جمل)",
  "recommendations": ["توصية 1", "توصية 2", "توصية 3"],
  "personality": "جملة قصيرة تعبر عن شعورك تجاه الوضع"
}`;

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
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          
          if (question) {
            summary = content;
            
            // حفظ المحادثة في الذاكرة
            await supabase.from('brain_memory').insert({
              memory_type: 'insight',
              title: `سؤال: ${question.substring(0, 50)}...`,
              content: summary.substring(0, 500),
              importance_score: 4,
              tags: ['محادثة', 'سؤال']
            });
          } else {
            try {
              const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
              const parsed = JSON.parse(cleanContent);
              summary = parsed.summary || '';
              aiRecommendations = parsed.recommendations || [];
              personality = parsed.personality || '';
            } catch {
              summary = content;
            }
          }
        }
      } catch (e) {
        console.log("AI analysis error:", e);
        summary = healthScore >= 80 
          ? '✨ المنصة تعمل بشكل ممتاز! لا توجد مشاكل حرجة حالياً.'
          : `⚠️ نقاط صحة المشروع: ${healthScore}/100. تم اكتشاف ${actions.length} حدث يحتاج انتباهك.`;
      }
    }

    // ============ 9. بناء التقرير النهائي ============
    const report: BrainReport = {
      generated_at: now.toISOString(),
      summary: summary || `المشروع يعمل بشكل ${healthScore >= 80 ? 'ممتاز' : healthScore >= 50 ? 'جيد' : 'يحتاج اهتمام'}`,
      health_score: healthScore,
      actions,
      predictions,
      stats,
      recommendations: aiRecommendations,
      personality
    };

    console.log(`🧠 Brain: التقرير جاهز. الصحة: ${healthScore}/100, الأحداث: ${actions.length}`);

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
