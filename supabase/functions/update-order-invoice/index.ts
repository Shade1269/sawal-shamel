import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      order_id, 
      order_number,
      invoice_number, 
      invoice_id,
      invoice_url,
      invoice_date,
      invoice_status
    } = await req.json();

    console.log('Received invoice update:', { order_id, order_number, invoice_number });

    if (!order_id && !order_number) {
      return new Response(
        JSON.stringify({ error: 'Missing order_id or order_number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build update data
    const updateData: Record<string, any> = {
      zoho_sync_status: 'SYNCED',
      updated_at: new Date().toISOString()
    };

    if (invoice_number) updateData.zoho_invoice_number = invoice_number;
    if (invoice_id) updateData.zoho_invoice_id = invoice_id;
    if (invoice_url) updateData.zoho_invoice_url = invoice_url;

    // Update order_hub
    let query = supabase.from('order_hub').update(updateData);
    
    if (order_id) {
      query = query.eq('id', order_id);
    } else if (order_number) {
      query = query.eq('order_number', order_number);
    }

    const { data, error } = await query.select('id, order_number').single();

    if (error) {
      console.error('Error updating order:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update order', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Order updated with invoice:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invoice data saved successfully',
        order: data
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-order-invoice:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
