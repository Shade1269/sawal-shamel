import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      cart_id,
      shop_id,
      affiliate_store_id,
      buyer_session_id,
      customer,
    } = body || {};

    console.log("[create-ecommerce-order] Start", { cart_id, shop_id, affiliate_store_id });

    if (!cart_id || !affiliate_store_id || !customer?.name || !customer?.phone || !customer?.address?.city || !customer?.address?.street) {
      return new Response(
        JSON.stringify({ success: false, error: "بيانات الطلب ناقصة" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Load cart items with product details
    const { data: items, error: itemsLoadError } = await supabase
      .from("cart_items")
      .select(
         `id, product_id, quantity, unit_price_sar, total_price_sar,
         products ( id, title, image_urls, shop_id )`
      )
      .eq("cart_id", cart_id);

    if (itemsLoadError) {
      console.error("[create-ecommerce-order] Load cart items error", itemsLoadError);
      throw itemsLoadError;
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "السلة فارغة" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subtotal = items.reduce((sum: number, it: any) => sum + (it.total_price_sar ?? (it.quantity * it.unit_price_sar)), 0);
    const shipping = 25;
    const tax = 0;
    const total = subtotal + shipping + tax;

    const orderNumber = `EC-${Date.now()}-${Math.random().toString(36).slice(-6).toUpperCase()}`;

    // Resolve shop_id from payload or cart items' products
    const resolvedShopId = shop_id ?? (items?.[0]?.products?.shop_id ?? null);
    if (!resolvedShopId) {
      return new Response(
        JSON.stringify({ success: false, error: "معرّف المتجر مفقود" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("ecommerce_orders")
      .insert({
        shop_id: resolvedShopId,
        affiliate_store_id,
        buyer_session_id: buyer_session_id ?? null,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email ?? null,
        shipping_address: {
          city: customer.address.city,
          district: customer.address.district ?? null,
          street: customer.address.street,
          building: customer.address.building ?? null,
          apartment: customer.address.apartment ?? null,
          postalCode: customer.address.postalCode ?? null,
          phone: customer.phone,
        },
        subtotal_sar: subtotal,
        shipping_sar: shipping,
        tax_sar: tax,
        total_sar: total,
        payment_method: "CASH_ON_DELIVERY",
        payment_status: "PENDING",
        status: "PENDING",
        order_number: orderNumber,
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("[create-ecommerce-order] Insert order error", orderError);
      throw orderError;
    }

    // Create order items
    const orderItems = items.map((it: any) => ({
      order_id: order.id,
      product_id: it.product_id,
      product_title: it.products?.title ?? "منتج",
      product_image_url: it.products?.image_urls?.[0] ?? null,
      quantity: it.quantity,
      unit_price_sar: it.unit_price_sar,
      total_price_sar: it.total_price_sar ?? (it.quantity * it.unit_price_sar),
    }));

    const { error: oiError } = await supabase
      .from("ecommerce_order_items")
      .insert(orderItems);

    if (oiError) {
      console.error("[create-ecommerce-order] Insert order items error", oiError);
      throw oiError;
    }

    // Payment transaction snapshot
    const { error: txError } = await supabase
      .from("ecommerce_payment_transactions")
      .insert({
        order_id: order.id,
        transaction_id: `COD-${order.id.slice(-6)}`,
        payment_method: "CASH_ON_DELIVERY",
        payment_status: "PENDING",
        amount_sar: total,
        currency: "SAR",
        gateway_name: "Cash on Delivery",
      });

    if (txError) {
      console.warn("[create-ecommerce-order] Insert payment tx warning", txError);
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("cart_id", cart_id);
    await supabase.from("shopping_carts").delete().eq("id", cart_id);

    return new Response(
      JSON.stringify({ success: true, order_id: order.id, order_number: order.order_number ?? orderNumber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[create-ecommerce-order] Error", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message ?? "خطأ في إنشاء الطلب" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});