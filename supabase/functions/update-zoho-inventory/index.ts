import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    console.log('Updating Zoho inventory for order:', orderId);

    // Get order with items and shop info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        shop_id,
        order_items (
          id,
          product_id,
          quantity
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Get Zoho integration settings for this shop
    const { data: zohoIntegration } = await supabase
      .from('zoho_integration')
      .select('access_token, organization_id, is_enabled')
      .eq('shop_id', order.shop_id)
      .eq('is_enabled', true)
      .single();

    if (!zohoIntegration) {
      console.log('Zoho integration not enabled for this shop');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Zoho integration not enabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Zoho mappings for the order items
    const productIds = order.order_items.map((item: any) => item.product_id);
    
    const { data: mappings } = await supabase
      .from('zoho_product_mapping')
      .select('zoho_item_id, local_product_id')
      .eq('shop_id', order.shop_id)
      .in('local_product_id', productIds);

    if (!mappings || mappings.length === 0) {
      console.log('No Zoho mappings found for order items');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No Zoho products to update' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mappingMap = new Map(mappings.map(m => [m.local_product_id, m.zoho_item_id]));
    let updatedCount = 0;

    // Update inventory for each item
    for (const orderItem of order.order_items) {
      const zohoItemId = mappingMap.get(orderItem.product_id);
      
      if (!zohoItemId) {
        console.log(`No Zoho mapping for product ${orderItem.product_id}`);
        continue;
      }

      try {
        // First, get current stock from Zoho
        const getStockResponse = await fetch(
          `https://www.zohoapis.com/inventory/v1/items/${zohoItemId}?organization_id=${zohoIntegration.organization_id}`, 
          {
            method: 'GET',
            headers: {
              'Authorization': `Zoho-oauthtoken ${zohoIntegration.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!getStockResponse.ok) {
          console.error(`Failed to get stock for Zoho item ${zohoItemId}`);
          continue;
        }

        const stockData = await getStockResponse.json();
        const currentStock = stockData.item?.available_stock || 0;
        const newStock = Math.max(0, currentStock - orderItem.quantity);

        // Update stock in Zoho using inventory adjustment
        const adjustmentPayload = {
          date: new Date().toISOString().split('T')[0],
          reason: `Order ${orderId} - Sale`,
          line_items: [{
            item_id: zohoItemId,
            quantity_adjusted: -orderItem.quantity,
            warehouse_id: stockData.item?.warehouses?.[0]?.warehouse_id || null
          }]
        };

        const adjustmentResponse = await fetch(
          `https://www.zohoapis.com/inventory/v1/inventoryadjustments?organization_id=${zohoIntegration.organization_id}`, 
          {
            method: 'POST',
            headers: {
              'Authorization': `Zoho-oauthtoken ${zohoIntegration.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(adjustmentPayload),
          }
        );

        if (adjustmentResponse.ok) {
          updatedCount++;
          console.log(`Updated Zoho inventory for item ${zohoItemId}: ${currentStock} -> ${newStock}`);
        } else {
          const errorText = await adjustmentResponse.text();
          console.error(`Failed to update Zoho inventory for item ${zohoItemId}:`, errorText);
        }

      } catch (error) {
        console.error(`Error updating Zoho inventory for item ${zohoItemId}:`, error);
        continue;
      }
    }

    console.log(`Zoho inventory update completed. Updated ${updatedCount} items.`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Updated ${updatedCount} items in Zoho inventory`,
      updated: updatedCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-zoho-inventory:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});