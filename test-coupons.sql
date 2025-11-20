-- ✨ سكريبت إنشاء كوبونات تجريبية
-- يمكنك تنفيذ هذا السكريبت في Supabase SQL Editor

-- 1️⃣ كوبون خصم نسبة مئوية (20% خصم)
INSERT INTO public.affiliate_coupons (
  affiliate_store_id,
  coupon_name,
  coupon_code,
  discount_type,
  discount_value,
  minimum_order_amount,
  maximum_discount_amount,
  valid_from,
  valid_until,
  usage_limit,
  usage_limit_per_customer,
  usage_count,
  is_active,
  target_type
)
SELECT
  id AS affiliate_store_id,
  'خصم ترحيبي 20%' AS coupon_name,
  'WELCOME20' AS coupon_code,
  'percentage' AS discount_type,
  20 AS discount_value,
  100 AS minimum_order_amount,
  200 AS maximum_discount_amount,
  NOW() AS valid_from,
  NOW() + INTERVAL '30 days' AS valid_until,
  100 AS usage_limit,
  1 AS usage_limit_per_customer,
  0 AS usage_count,
  true AS is_active,
  'store' AS target_type
FROM public.affiliate_stores
WHERE is_active = true
LIMIT 1
ON CONFLICT (affiliate_store_id, coupon_code) DO NOTHING;

-- 2️⃣ كوبون خصم ثابت (50 ريال خصم)
INSERT INTO public.affiliate_coupons (
  affiliate_store_id,
  coupon_name,
  coupon_code,
  discount_type,
  discount_value,
  minimum_order_amount,
  maximum_discount_amount,
  valid_from,
  valid_until,
  usage_limit,
  usage_limit_per_customer,
  usage_count,
  is_active,
  target_type
)
SELECT
  id AS affiliate_store_id,
  'خصم 50 ريال' AS coupon_name,
  'SAVE50' AS coupon_code,
  'fixed' AS discount_type,
  50 AS discount_value,
  200 AS minimum_order_amount,
  NULL AS maximum_discount_amount,
  NOW() AS valid_from,
  NOW() + INTERVAL '30 days' AS valid_until,
  50 AS usage_limit,
  1 AS usage_limit_per_customer,
  0 AS usage_count,
  true AS is_active,
  'store' AS target_type
FROM public.affiliate_stores
WHERE is_active = true
LIMIT 1
ON CONFLICT (affiliate_store_id, coupon_code) DO NOTHING;

-- 3️⃣ كوبون VIP (30% خصم بدون حد أدنى)
INSERT INTO public.affiliate_coupons (
  affiliate_store_id,
  coupon_name,
  coupon_code,
  discount_type,
  discount_value,
  minimum_order_amount,
  maximum_discount_amount,
  valid_from,
  valid_until,
  usage_limit,
  usage_limit_per_customer,
  usage_count,
  is_active,
  target_type
)
SELECT
  id AS affiliate_store_id,
  'خصم VIP 30%' AS coupon_name,
  'VIP30' AS coupon_code,
  'percentage' AS discount_type,
  30 AS discount_value,
  0 AS minimum_order_amount,
  500 AS maximum_discount_amount,
  NOW() AS valid_from,
  NOW() + INTERVAL '30 days' AS valid_until,
  20 AS usage_limit,
  2 AS usage_limit_per_customer,
  0 AS usage_count,
  true AS is_active,
  'store' AS target_type
FROM public.affiliate_stores
WHERE is_active = true
LIMIT 1
ON CONFLICT (affiliate_store_id, coupon_code) DO NOTHING;

-- 4️⃣ كوبون تجريبي منتهي (لاختبار التحقق من الصلاحية)
INSERT INTO public.affiliate_coupons (
  affiliate_store_id,
  coupon_name,
  coupon_code,
  discount_type,
  discount_value,
  minimum_order_amount,
  maximum_discount_amount,
  valid_from,
  valid_until,
  usage_limit,
  usage_limit_per_customer,
  usage_count,
  is_active,
  target_type
)
SELECT
  id AS affiliate_store_id,
  'كوبون منتهي (اختبار)' AS coupon_name,
  'EXPIRED10' AS coupon_code,
  'percentage' AS discount_type,
  10 AS discount_value,
  0 AS minimum_order_amount,
  NULL AS maximum_discount_amount,
  NOW() - INTERVAL '30 days' AS valid_from,
  NOW() - INTERVAL '1 day' AS valid_until,
  100 AS usage_limit,
  1 AS usage_limit_per_customer,
  0 AS usage_count,
  true AS is_active,
  'store' AS target_type
FROM public.affiliate_stores
WHERE is_active = true
LIMIT 1
ON CONFLICT (affiliate_store_id, coupon_code) DO NOTHING;

-- 5️⃣ كوبون محدود الاستخدام (لاختبار حد الاستخدام)
INSERT INTO public.affiliate_coupons (
  affiliate_store_id,
  coupon_name,
  coupon_code,
  discount_type,
  discount_value,
  minimum_order_amount,
  maximum_discount_amount,
  valid_from,
  valid_until,
  usage_limit,
  usage_limit_per_customer,
  usage_count,
  is_active,
  target_type
)
SELECT
  id AS affiliate_store_id,
  'كوبون محدود (تم استنفاذه)' AS coupon_name,
  'LIMITED5' AS coupon_code,
  'fixed' AS discount_type,
  25 AS discount_value,
  0 AS minimum_order_amount,
  NULL AS maximum_discount_amount,
  NOW() AS valid_from,
  NOW() + INTERVAL '30 days' AS valid_until,
  5 AS usage_limit,
  1 AS usage_limit_per_customer,
  5 AS usage_count, -- تم استخدامه 5 مرات (نفس الحد)
  true AS is_active,
  'store' AS target_type
FROM public.affiliate_stores
WHERE is_active = true
LIMIT 1
ON CONFLICT (affiliate_store_id, coupon_code) DO NOTHING;

-- ✅ عرض جميع الكوبونات المنشأة
SELECT
  c.coupon_code,
  c.coupon_name,
  c.discount_type,
  c.discount_value,
  c.minimum_order_amount,
  c.maximum_discount_amount,
  c.valid_from::date,
  c.valid_until::date,
  c.usage_count || '/' || c.usage_limit AS usage,
  c.is_active,
  s.store_name
FROM public.affiliate_coupons c
JOIN public.affiliate_stores s ON c.affiliate_store_id = s.id
ORDER BY c.created_at DESC;
