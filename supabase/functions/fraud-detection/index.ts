import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';


interface FraudCheckRequest {
  user_id: string;
  order_id: string;
  transaction_data: {
    amount: number;
    currency: string;
    payment_method: string;
    ip_address?: string;
    user_agent?: string;
    billing_address?: any;
    is_international?: boolean;
  };
  user_data: {
    is_new_customer?: boolean;
    account_age_days?: number;
    previous_orders_count?: number;
    suspicious_location?: boolean;
  };
}

interface FraudCheckResponse {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommended_action: 'APPROVE' | 'REVIEW' | 'BLOCK' | 'REQUIRE_VERIFICATION';
  triggered_rules: string[];
  fraud_alert_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders }
      );
    }

    const requestData: FraudCheckRequest = await req.json();
    console.log('Fraud detection request:', requestData);

    // جلب القوانين النشطة لكشف الاحتيال
    const { data: rules, error: rulesError } = await supabase
      .from('fraud_detection_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching fraud rules:', rulesError);
      throw rulesError;
    }

    // حساب البيانات التاريخية للمستخدم
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('ecommerce_orders')
      .select('total_sar, created_at, user_id')
      .eq('user_id', requestData.user_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (transactionsError) {
      console.warn('Error fetching recent transactions:', transactionsError);
    }

    const transactionsLastHour = recentTransactions?.filter(
      t => new Date(t.created_at) > new Date(Date.now() - 60 * 60 * 1000)
    ).length || 0;

    const historicalData = {
      transactions_last_hour: transactionsLastHour,
      transactions_last_24h: recentTransactions?.length || 0,
      total_spent_24h: recentTransactions?.reduce((sum, t) => sum + Number(t.total_sar || 0), 0) || 0
    };

    // حساب نقاط المخاطر باستخدام الدالة المخزنة
    const { data: riskScoreData, error: riskError } = await supabase
      .rpc('calculate_risk_score', {
        user_data: requestData.user_data,
        transaction_data: requestData.transaction_data,
        historical_data: historicalData
      });

    if (riskError) {
      console.error('Error calculating risk score:', riskError);
      throw riskError;
    }

    const riskScore = riskScoreData || 0;
    const triggeredRules: string[] = [];

    // فحص كل قانون ضد البيانات الحالية
    for (const rule of rules) {
      let ruleTriggered = false;

      switch (rule.rule_type) {
        case 'AMOUNT':
          const conditions = rule.conditions as any;
          if (requestData.transaction_data.amount > conditions.max_amount) {
            ruleTriggered = true;
          }
          break;

        case 'VELOCITY':
          const velocityConditions = rule.conditions as any;
          const timeWindow = velocityConditions.time_window;
          const maxTransactions = velocityConditions.max_transactions;
          
          if (timeWindow === '1 hour' && transactionsLastHour >= maxTransactions) {
            ruleTriggered = true;
          } else if (timeWindow === '24 hours' && (recentTransactions?.length || 0) >= maxTransactions) {
            ruleTriggered = true;
          }
          break;

        case 'PATTERN':
          const patternConditions = rule.conditions as any;
          if (patternConditions.is_new_customer && requestData.user_data.is_new_customer && 
              requestData.transaction_data.amount >= patternConditions.min_amount) {
            ruleTriggered = true;
          }
          break;

        case 'LOCATION':
          const locationConditions = rule.conditions as any;
          if (requestData.transaction_data.is_international && 
              requestData.transaction_data.amount >= locationConditions.min_amount) {
            ruleTriggered = true;
          }
          break;

        case 'BLACKLIST':
          // فحص القوائم السوداء (يتطلب تطوير إضافي)
          break;
      }

      if (ruleTriggered) {
        triggeredRules.push(rule.rule_name);
      }
    }

    // تحديد مستوى المخاطر والإجراء الموصى به
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let recommendedAction: 'APPROVE' | 'REVIEW' | 'BLOCK' | 'REQUIRE_VERIFICATION';

    if (riskScore >= 80) {
      riskLevel = 'CRITICAL';
      recommendedAction = 'BLOCK';
    } else if (riskScore >= 60) {
      riskLevel = 'HIGH';
      recommendedAction = 'REQUIRE_VERIFICATION';
    } else if (riskScore >= 30) {
      riskLevel = 'MEDIUM';
      recommendedAction = 'REVIEW';
    } else {
      riskLevel = 'LOW';
      recommendedAction = 'APPROVE';
    }

    // إنشاء تنبيه احتيال إذا كان مستوى المخاطر عالي
    let fraudAlertId: string | undefined;

    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      const { data: alertData, error: alertError } = await supabase
        .from('fraud_alerts')
        .insert({
          order_id: requestData.order_id,
          user_id: requestData.user_id,
          alert_type: 'AUTOMATED_DETECTION',
          risk_score: riskScore,
          status: 'PENDING',
          metadata: {
            triggered_rules: triggeredRules,
            transaction_data: requestData.transaction_data,
            user_data: requestData.user_data,
            historical_data: historicalData
          }
        })
        .select('id')
        .single();

      if (alertError) {
        console.error('Error creating fraud alert:', alertError);
      } else {
        fraudAlertId = alertData?.id;
      }
    }

    // تسجيل الحدث الأمني
    const { error: logError } = await supabase
      .rpc('log_security_event', {
        event_type: 'TRANSACTION',
        user_id: requestData.user_id,
        resource_accessed: `order_${requestData.order_id}`,
        action_performed: 'FRAUD_CHECK',
        risk_level: riskLevel,
        additional_metadata: {
          risk_score: riskScore,
          triggered_rules: triggeredRules,
          recommended_action: recommendedAction
        }
      });

    if (logError) {
      console.warn('Error logging security event:', logError);
    }

    const response: FraudCheckResponse = {
      risk_score: riskScore,
      risk_level: riskLevel,
      recommended_action: recommendedAction,
      triggered_rules: triggeredRules,
      fraud_alert_id: fraudAlertId
    };

    console.log('Fraud check response:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fraud detection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});