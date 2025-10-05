-- Fix SECURITY DEFINER views by recreating them with security_invoker = true
-- This ensures views run with the permissions of the current user, not the view creator

-- 1. Fix security_definer_functions_audit view
DROP VIEW IF EXISTS public.security_definer_functions_audit;
CREATE VIEW public.security_definer_functions_audit
WITH (security_invoker = true)
AS
SELECT 
  p.proname AS function_name,
  n.nspname AS schema_name,
  p.prosecdef AS has_security_definer,
  pg_get_userbyid(p.proowner) AS owner,
  obj_description(p.oid, 'pg_proc') AS documentation,
  CASE
    WHEN p.prosecdef THEN 'REVIEW_REQUIRED'::text
    ELSE 'SAFE'::text
  END AS security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- 2. Fix v_order_items_unified view
DROP VIEW IF EXISTS public.v_order_items_unified;
CREATE VIEW public.v_order_items_unified
WITH (security_invoker = true)
AS
SELECT 
  'order_items'::text AS source_table,
  order_items.id,
  order_items.order_id,
  order_items.product_id,
  order_items.merchant_id,
  order_items.title_snapshot AS product_title,
  order_items.quantity,
  order_items.unit_price_sar,
  order_items.line_total_sar AS total_price_sar,
  order_items.commission_rate,
  ((order_items.line_total_sar * COALESCE(order_items.commission_rate, 0)) / 100) AS commission_sar,
  order_items.created_at
FROM order_items
UNION ALL
SELECT 
  'ecommerce_order_items'::text AS source_table,
  ecommerce_order_items.id,
  ecommerce_order_items.order_id,
  ecommerce_order_items.product_id,
  NULL::uuid AS merchant_id,
  ecommerce_order_items.product_title,
  ecommerce_order_items.quantity,
  ecommerce_order_items.unit_price_sar,
  ecommerce_order_items.total_price_sar,
  COALESCE(ecommerce_order_items.commission_rate, 0) AS commission_rate,
  COALESCE(ecommerce_order_items.commission_sar, 0) AS commission_sar,
  ecommerce_order_items.created_at
FROM ecommerce_order_items
UNION ALL
SELECT 
  'simple_order_items'::text AS source_table,
  simple_order_items.id,
  simple_order_items.order_id,
  simple_order_items.product_id,
  NULL::uuid AS merchant_id,
  simple_order_items.product_title,
  simple_order_items.quantity,
  simple_order_items.unit_price_sar,
  simple_order_items.total_price_sar,
  0 AS commission_rate,
  0 AS commission_sar,
  simple_order_items.created_at
FROM simple_order_items;

-- 3. Fix v_orders_unified view with correct column names and type casting
DROP VIEW IF EXISTS public.v_orders_unified;
CREATE VIEW public.v_orders_unified
WITH (security_invoker = true)
AS
SELECT 
  'orders'::text AS source_table,
  orders.id,
  orders.order_number,
  orders.shop_id,
  orders.customer_profile_id AS user_id,
  orders.customer_name,
  orders.customer_phone,
  NULL::text AS customer_email,
  orders.shipping_address,
  orders.status::text AS status,
  orders.subtotal_sar AS subtotal,
  COALESCE(orders.vat_sar, 0) AS tax,
  COALESCE(orders.shipping_sar, 0) AS shipping,
  orders.total_sar AS total,
  orders.payment_method::text AS payment_method,
  'PENDING'::text AS payment_status,
  orders.affiliate_store_id,
  COALESCE(orders.affiliate_commission_sar, 0) AS affiliate_commission_sar,
  orders.created_at,
  orders.updated_at
FROM orders
UNION ALL
SELECT 
  'ecommerce_orders'::text AS source_table,
  ecommerce_orders.id,
  ecommerce_orders.order_number,
  ecommerce_orders.shop_id,
  ecommerce_orders.user_id,
  ecommerce_orders.customer_name,
  ecommerce_orders.customer_phone,
  ecommerce_orders.customer_email,
  ecommerce_orders.shipping_address,
  ecommerce_orders.status::text AS status,
  ecommerce_orders.subtotal_sar AS subtotal,
  COALESCE(ecommerce_orders.tax_sar, 0) AS tax,
  COALESCE(ecommerce_orders.shipping_sar, 0) AS shipping,
  ecommerce_orders.total_sar AS total,
  ecommerce_orders.payment_method::text AS payment_method,
  ecommerce_orders.payment_status::text AS payment_status,
  ecommerce_orders.affiliate_store_id,
  COALESCE(ecommerce_orders.affiliate_commission_sar, 0) AS affiliate_commission_sar,
  ecommerce_orders.created_at,
  ecommerce_orders.updated_at
FROM ecommerce_orders
UNION ALL
SELECT 
  'simple_orders'::text AS source_table,
  simple_orders.id,
  simple_orders.id::text AS order_number,
  NULL::uuid AS shop_id,
  simple_orders.user_id,
  simple_orders.customer_name,
  simple_orders.customer_phone,
  simple_orders.customer_email,
  simple_orders.shipping_address,
  COALESCE(simple_orders.order_status, 'pending') AS status,
  simple_orders.total_amount_sar AS subtotal,
  0 AS tax,
  0 AS shipping,
  simple_orders.total_amount_sar AS total,
  COALESCE(simple_orders.payment_method, 'cash') AS payment_method,
  COALESCE(simple_orders.payment_status, 'PENDING') AS payment_status,
  simple_orders.affiliate_store_id,
  COALESCE(simple_orders.affiliate_commission_sar, 0) AS affiliate_commission_sar,
  simple_orders.created_at,
  simple_orders.updated_at
FROM simple_orders;