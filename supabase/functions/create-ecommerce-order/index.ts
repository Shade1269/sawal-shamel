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
      shipping,
      items: directItems, // للطلبات المباشرة من SimpleCheckout
    } = body || {};

    console.log("[create-ecommerce-order] Start", { 
      cart_id, 
      shop_id, 
      affiliate_store_id,
      hasDirectItems: !!directItems,
      isCartBased: !!cart_id,
    });

    // التحقق من البيانات الأساسية
    if (!affiliate_store_id || !customer?.name || !customer?.phone) {
      console.warn("[create-ecommerce-order] Validation failed", {
        hasAffiliate: !!affiliate_store_id,
        hasName: !!customer?.name,
        hasPhone: !!customer?.phone,
      });
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

    let items: any[] = [];

    // تحميل المنتجات من السلة أو استخدام المنتجات المباشرة
    if (cart_id) {
      // نظام السلة (cart-based)
      const { data: cartItems, error: itemsLoadError } = await supabase
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
      items = cartItems || [];
    } else if (directItems && Array.isArray(directItems)) {
      // نظام الطلب المباشر (direct order من SimpleCheckout)
      console.log("[create-ecommerce-order] Using direct items", { count: directItems.length });
      
      // تحميل بيانات المنتجات
      const productIds = directItems.map((item: any) => item.id);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, image_urls, shop_id, price_sar")
        .in("id", productIds);

      if (productsError) {
        console.error("[create-ecommerce-order] Load products error", productsError);
        throw productsError;
      }

      // تحويل المنتجات المباشرة إلى نفس صيغة cart items
      items = directItems.map((item: any) => {
        const product = products?.find((p: any) => p.id === item.id);
        return {
          product_id: item.id,
          quantity: item.quantity,
          unit_price_sar: item.price,
          total_price_sar: item.price * item.quantity,
          products: product ? {
            id: product.id,
            title: product.title,
            image_urls: product.image_urls,
            shop_id: product.shop_id,
          } : null,
        };
      });
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "لا توجد منتجات في الطلب" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subtotal = items.reduce((sum: number, it: any) => sum + (it.total_price_sar ?? (it.quantity * it.unit_price_sar)), 0);
    const shippingCost = shipping?.cost_sar ?? 25;
    const tax = 0;
    const total = subtotal + shippingCost + tax;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).slice(-8).toUpperCase()}`;
    
    console.log("[create-ecommerce-order] Order totals", { 
      subtotal, 
      shippingCost, 
      tax, 
      total,
      itemsCount: items.length 
    });

    // Resolve shop_id from payload or cart items' products
    const normalizedShopId = (typeof shop_id === "string" && shop_id.trim().length > 0) ? shop_id : null;
    let resolvedShopId = normalizedShopId ?? (items?.[0]?.products?.shop_id ?? null);

    // Fallback: fetch product's shop_id if not present in the nested select
    if (!resolvedShopId && items?.[0]?.product_id) {
      const { data: prod, error: prodErr } = await supabase
        .from("products")
        .select("shop_id")
        .eq("id", items[0].product_id)
        .single();
      if (prodErr) {
        console.warn("[create-ecommerce-order] Fallback fetch product shop_id error", prodErr);
      } else {
        resolvedShopId = prod?.shop_id ?? null;
      }
    }

    if (!resolvedShopId) {
      console.warn("[create-ecommerce-order] Missing shop_id after resolution", { shop_id, productShopId: items?.[0]?.products?.shop_id, firstProductId: items?.[0]?.product_id });

      // Try to resolve shop via affiliate store owner (profile -> shops)
      if (affiliate_store_id) {
        try {
          const { data: affStore, error: affErr } = await supabase
            .from("affiliate_stores")
            .select("profile_id, store_name, store_slug")
            .eq("id", affiliate_store_id)
            .single();

          if (affErr) {
            console.warn("[create-ecommerce-order] Failed to fetch affiliate store for fallback", affErr);
          } else if (affStore?.profile_id) {
            // 1) Try to find an existing shop for this profile
            const { data: existingShop, error: shopLookupErr } = await supabase
              .from("shops")
              .select("id")
              .eq("owner_id", affStore.profile_id)
              .limit(1)
              .single();

            if (existingShop?.id) {
              resolvedShopId = existingShop.id;
              console.log("[create-ecommerce-order] Resolved shop_id via affiliate owner shop", { resolvedShopId });
            } else if (shopLookupErr) {
              console.warn("[create-ecommerce-order] Shop lookup error (may be just not found)", shopLookupErr);
            }

            // 2) If still missing, create a minimal shop for this profile and use it
            if (!resolvedShopId) {
              const generatedSlug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
              const { data: newShop, error: createShopErr } = await supabase
                .from("shops")
                .insert({
                  owner_id: affStore.profile_id,
                  display_name: affStore.store_name ?? "Affiliate Shop",
                  slug: (affStore.store_slug ? `${affStore.store_slug}-store` : `store-${generatedSlug}`),
                })
                .select("id")
                .single();

              if (createShopErr) {
                console.error("[create-ecommerce-order] Failed to create fallback shop", createShopErr);
              } else if (newShop?.id) {
                resolvedShopId = newShop.id;
                console.log("[create-ecommerce-order] Created and resolved fallback shop_id", { resolvedShopId });
              }
            }
          }
        } catch (fallbackErr) {
          console.error("[create-ecommerce-order] Fallback via affiliate store failed", fallbackErr);
        }
      }

      if (!resolvedShopId) {
        return new Response(
          JSON.stringify({ success: false, error: "معرّف المتجر مفقود" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
          city: customer.address?.city || customer.city || "غير محدد",
          district: customer.address?.district || customer.district || null,
          street: customer.address?.street || customer.address || null,
          building: customer.address?.building || null,
          apartment: customer.address?.apartment || null,
          postalCode: customer.address?.postalCode || null,
          phone: customer.phone,
          shipping_provider: shipping?.provider_name || null,
          notes: customer.notes || shipping?.notes || null,
        },
        subtotal_sar: subtotal,
        shipping_sar: shippingCost,
        tax_sar: tax,
        total_sar: total,
        payment_method: body.payment_method || "CASH_ON_DELIVERY",
        payment_status: body.payment_method === 'geidea' ? "PENDING" : "PENDING",
        status: "PENDING",
        order_number: orderNumber,
        tracking_number: trackingNumber,
      })
      .select("id, order_number, tracking_number")
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

    // إضافة الطلب إلى order_hub الموحد
    const { error: hubError } = await supabase
      .from("order_hub")
      .insert({
        source: "ecommerce",
        source_order_id: order.id,
        order_number: order.order_number ?? orderNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email ?? null,
        total_amount_sar: total,
        status: "PENDING",
        payment_status: "PENDING",
        affiliate_store_id,
        shop_id: resolvedShopId,
      });

    if (hubError) {
      console.warn("[create-ecommerce-order] Insert order_hub warning", hubError);
    }

    // Clear cart (فقط إذا كان الطلب من السلة)
    if (cart_id) {
      await supabase.from("cart_items").delete().eq("cart_id", cart_id);
      await supabase.from("shopping_carts").delete().eq("id", cart_id);
      console.log("[create-ecommerce-order] Cart cleared", { cart_id });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id, 
        order_number: order.order_number ?? orderNumber,
        tracking_number: order.tracking_number ?? trackingNumber
      }),
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