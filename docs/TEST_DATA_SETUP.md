# دليل إنشاء بيانات تجريبية

## الخطوة 1: إنشاء المستخدمين

يجب إنشاء 3 مستخدمين من واجهة Supabase Authentication:

### 1. حساب التاجر
- **البريد:** `merchant@test.com`
- **كلمة المرور:** `Test123456!`
- **الدور:** merchant

### 2. حساب العميل
- **البريد:** `customer@test.com`
- **كلمة المرور:** `Test123456!`
- **الدور:** customer

### 3. حساب المسوق
- **البريد:** `affiliate@test.com`
- **كلمة المرور:** `Test123456!`
- **الدور:** affiliate

## الخطوة 2: تشغيل SQL Script

بعد إنشاء المستخدمين، قم بتشغيل الـ SQL التالي من SQL Editor:

```sql
-- الحصول على IDs المستخدمين
DO $$
DECLARE
  v_merchant_id UUID;
  v_customer_id UUID;
  v_affiliate_id UUID;
  v_merchant_profile_id UUID;
  v_shop_id UUID;
  v_product1_id UUID;
BEGIN
  -- الحصول على IDs من auth
  SELECT id INTO v_merchant_id FROM auth.users WHERE email = 'merchant@test.com';
  SELECT id INTO v_customer_id FROM auth.users WHERE email = 'customer@test.com';
  SELECT id INTO v_affiliate_id FROM auth.users WHERE email = 'affiliate@test.com';
  
  IF v_merchant_id IS NULL THEN
    RAISE EXCEPTION 'يجب إنشاء حساب merchant@test.com أولاً';
  END IF;
  
  -- الحصول على merchant_profile_id
  SELECT id INTO v_merchant_profile_id FROM public.profiles WHERE auth_user_id = v_merchant_id;
  
  -- الحصول على shop_id
  SELECT id INTO v_shop_id FROM public.shops WHERE owner_id = v_merchant_profile_id;
  
  -- إضافة رصيد معلق للتاجر
  UPDATE public.merchant_wallet_balances
  SET pending_balance_sar = pending_balance_sar + 800.00
  WHERE merchant_id = (SELECT id FROM public.merchants WHERE profile_id = v_merchant_profile_id);
  
  -- إضافة رصيد معلق للمسوق
  UPDATE public.wallet_balances
  SET pending_balance_sar = pending_balance_sar + 200.00
  WHERE affiliate_profile_id = v_affiliate_id;
  
  -- إنشاء منتجات تجريبية
  INSERT INTO public.products (
    shop_id,
    merchant_id,
    title,
    description,
    merchant_base_price_sar,
    catalog_price_sar,
    price_sar,
    stock_quantity,
    is_active,
    sku
  )
  VALUES 
    (
      v_shop_id,
      (SELECT id FROM public.merchants WHERE profile_id = v_merchant_profile_id),
      'منتج تجريبي 1',
      'وصف المنتج الأول - يحتوي على مواصفات عالية الجودة',
      800.00,
      1000.00,
      1200.00,
      50,
      true,
      'TEST-PRODUCT-001'
    ),
    (
      v_shop_id,
      (SELECT id FROM public.merchants WHERE profile_id = v_merchant_profile_id),
      'منتج تجريبي 2',
      'وصف المنتج الثاني - منتج متوسط السعر',
      400.00,
      500.00,
      600.00,
      30,
      true,
      'TEST-PRODUCT-002'
    ),
    (
      v_shop_id,
      (SELECT id FROM public.merchants WHERE profile_id = v_merchant_profile_id),
      'منتج تجريبي 3',
      'وصف المنتج الثالث - منتج فاخر',
      1600.00,
      2000.00,
      2400.00,
      20,
      true,
      'TEST-PRODUCT-003'
    )
  ON CONFLICT (sku) DO UPDATE SET 
    merchant_base_price_sar = EXCLUDED.merchant_base_price_sar,
    catalog_price_sar = EXCLUDED.catalog_price_sar,
    price_sar = EXCLUDED.price_sar;
  
  RAISE NOTICE 'تم إنشاء البيانات التجريبية بنجاح!';
  RAISE NOTICE 'التاجر لديه رصيد معلق: 800 ريال';
  RAISE NOTICE 'المسوق لديه رصيد معلق: 200 ريال';
  RAISE NOTICE 'تم إضافة 3 منتجات تجريبية';
  
END $$;
```

## الخطوة 3: التحقق من البيانات

### تحقق من محفظة التاجر:
```sql
SELECT * FROM merchant_wallet_balances 
WHERE merchant_id = (
  SELECT m.id FROM merchants m
  JOIN profiles p ON p.id = m.profile_id
  JOIN auth.users u ON u.id = p.auth_user_id
  WHERE u.email = 'merchant@test.com'
);
```

### تحقق من المنتجات:
```sql
SELECT 
  p.sku,
  p.title,
  p.merchant_base_price_sar,
  p.catalog_price_sar,
  p.price_sar,
  p.stock_quantity
FROM products p
WHERE p.sku LIKE 'TEST-PRODUCT-%'
ORDER BY p.sku;
```

### تحقق من محفظة المسوق:
```sql
SELECT * FROM wallet_balances 
WHERE affiliate_profile_id = (
  SELECT id FROM auth.users WHERE email = 'affiliate@test.com'
);
```

## الخطوة 4: اختبار النظام

### كتاجر (`merchant@test.com`):
1. سجل دخول بالبريد والكلمة
2. اذهب إلى `/merchant/wallet`
3. يجب أن تشاهد:
   - رصيد معلق: 800.00 ريال
   - رصيد متاح: 0.00 ريال
4. جرب طلب سحب (لن ينجح لأن الرصيد المتاح = 0)

### كعميل (`customer@test.com`):
1. سجل دخول
2. تصفح المنتجات
3. أضف منتج للسلة
4. أتمم عملية الشراء

### كمسوق (`affiliate@test.com`):
1. سجل دخول
2. اذهب إلى المحفظة
3. يجب أن تشاهد رصيد معلق: 200.00 ريال

## الخطوة 5: محاكاة توصيل طلب (لتحويل الرصيد المعلق إلى متاح)

```sql
-- ابحث عن طلب معين
SELECT id, order_number, status 
FROM order_hub 
WHERE merchant_id = (
  SELECT m.id FROM merchants m
  JOIN profiles p ON p.id = m.profile_id
  JOIN auth.users u ON u.id = p.auth_user_id
  WHERE u.email = 'merchant@test.com'
)
LIMIT 1;

-- حدّث حالته إلى DELIVERED
UPDATE order_hub
SET status = 'DELIVERED'
WHERE order_number = 'رقم_الطلب_هنا';

-- تحقق من تحويل الرصيد
SELECT * FROM merchant_wallet_balances 
WHERE merchant_id = (
  SELECT m.id FROM merchants m
  JOIN profiles p ON p.id = m.profile_id
  JOIN auth.users u ON u.id = p.auth_user_id
  WHERE u.email = 'merchant@test.com'
);
```

## ملاحظات مهمة

- 🔐 **الأمان:** هذه بيانات تجريبية فقط، لا تستخدمها في بيئة الإنتاج
- 💰 **الأسعار:** تم حساب جميع الأسعار وفق نظام المنصة (merchant_base × 1.25 = catalog)
- 📊 **الأرباح:** يمكنك متابعة الأرباح من `/admin/platform-revenue`
- 🏦 **السحوبات:** لاختبار السحب، يجب أولاً توصيل طلب لتحويل الرصيد المعلق إلى متاح

## استعلامات مفيدة للمراقبة

### عرض جميع المحافظ:
```sql
SELECT 
  p.email,
  p.role,
  COALESCE(mwb.available_balance_sar, wb.available_balance_sar) as available,
  COALESCE(mwb.pending_balance_sar, wb.pending_balance_sar) as pending
FROM profiles p
LEFT JOIN merchant_wallet_balances mwb ON mwb.merchant_id IN (SELECT id FROM merchants WHERE profile_id = p.id)
LEFT JOIN wallet_balances wb ON wb.affiliate_profile_id = p.auth_user_id
WHERE p.email LIKE '%@test.com';
```

### عرض جميع المعاملات:
```sql
-- معاملات التجار
SELECT * FROM merchant_transactions 
WHERE merchant_id IN (
  SELECT m.id FROM merchants m
  JOIN profiles p ON p.id = m.profile_id
  WHERE p.email = 'merchant@test.com'
)
ORDER BY created_at DESC;

-- معاملات المسوقين
SELECT * FROM wallet_transactions
WHERE affiliate_profile_id = (
  SELECT id FROM auth.users WHERE email = 'affiliate@test.com'
)
ORDER BY created_at DESC;
```
