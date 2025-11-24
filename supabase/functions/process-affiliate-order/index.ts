import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  // Get CORS headers for this request
  const corsHeaders = getCorsHeaders(req);

  try {
    const { session_id, affiliate_store_id, order_items } = await req.json();

    console.log('Processing affiliate order:', {
      session_id,
      affiliate_store_id,
      order_items_count: order_items?.length
    });

    // التحقق من وجود البيانات المطلوبة
    if (!session_id || !affiliate_store_id || !order_items || order_items.length === 0) {
      throw new Error('بيانات الطلب غير مكتملة');
    }

    // إنشاء عميل Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // استدعاء function لمعالجة الطلب
    const { data, error } = await supabase.rpc('process_affiliate_order', {
      p_session_id: session_id,
      p_affiliate_store_id: affiliate_store_id,
      p_order_items: order_items
    });

    if (error) {
      console.error('Database function error:', error);
      throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
    }

    console.log('Order processed successfully:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-affiliate-order function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ في معالجة الطلب' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});