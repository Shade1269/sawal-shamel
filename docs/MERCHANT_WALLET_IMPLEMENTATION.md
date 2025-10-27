# تنفيذ نظام المحفظة المالية للتجار

## 📋 نظرة عامة

تم بناء نظام محفظة مالية شامل للتجار يتكامل مع نظام العمولات الحالي للمسوقين، مع تتبع دقيق لأرباح المنصة.

---

## 🗄️ البنية التحتية (Database)

### **1. جداول جديدة (4):**

#### `merchant_wallet_balances`
محفظة التاجر - تخزين الأرصدة
```sql
- available_balance_sar      -- الرصيد المتاح للسحب
- pending_balance_sar         -- الرصيد المعلق (قيد التوصيل)
- lifetime_earnings_sar       -- إجمالي الأرباح
- total_withdrawn_sar         -- إجمالي المسحوب
- minimum_withdrawal_sar      -- الحد الأدنى للسحب (100 ر.س)
```

#### `merchant_transactions`
سجل المعاملات المالية للتاجر
```sql
- transaction_type           -- COMMISSION_PENDING | COMMISSION_CONFIRMED | WITHDRAWAL_COMPLETED | REFUND
- amount_sar                 -- المبلغ
- balance_after_sar          -- الرصيد بعد المعاملة
- reference_id               -- معرف المرجع
- description                -- الوصف
```

#### `merchant_withdrawal_requests`
طلبات السحب من التجار
```sql
- amount_sar                 -- المبلغ المطلوب
- status                     -- PENDING | APPROVED | COMPLETED | REJECTED
- payment_method             -- bank_transfer | stc_pay | wallet
- bank_details               -- تفاصيل الحساب (JSONB)
- processed_by               -- معالج الطلب (admin)
- admin_notes                -- ملاحظات الإدارة
```

#### `platform_revenue`
أرباح المنصة من المبيعات
```sql
- merchant_base_price_sar    -- سعر التاجر الأساسي
- platform_share_sar         -- نصيب المنصة (25%)
- affiliate_commission_sar   -- عمولة المسوق
- final_sale_price_sar       -- السعر النهائي
- status                     -- PENDING | CONFIRMED | REFUNDED
```

### **2. تعديلات على الجداول الحالية:**

#### `products`
```sql
+ merchant_base_price_sar    -- سعر التاجر الأساسي (جديد)
+ catalog_price_sar          -- سعر الكتالوج = base × 1.25 (محسوب تلقائياً)
  price_sar                  -- السعر النهائي (يحدده المسوق)
```

---

## ⚙️ Functions & Triggers

### **Functions (7):**

1. **`auto_calculate_catalog_price()`**
   - حساب سعر الكتالوج تلقائياً (base × 1.25)

2. **`initialize_merchant_wallet()`**
   - إنشاء محفظة عند تسجيل تاجر جديد

3. **`record_merchant_transaction()`**
   - تسجيل معاملة مالية وتحديث الرصيد

4. **`create_merchant_pending_balance()`**
   - إضافة رصيد معلق عند دفع الطلب

5. **`confirm_merchant_balance()`**
   - تحويل PENDING → AVAILABLE عند التوصيل

6. **`process_merchant_withdrawal()`**
   - معالجة طلب السحب من قبل الإدارة

7. **`reverse_merchant_transaction()`**
   - عكس المعاملة عند إرجاع المنتج

### **Triggers (6):**

1. **`trg_auto_calculate_catalog_price`** على `products`
2. **`trg_initialize_merchant_wallet`** على `profiles`
3. **`trg_create_merchant_pending`** على `ecommerce_orders`
4. **`trg_confirm_merchant_balance`** على `order_hub`
5. **`trg_reverse_merchant_transaction`** على `order_returns`
6. **`trg_merchant_wallet_updated_at`** على `merchant_wallet_balances`

---

## 🎨 Frontend (React)

### **Hooks (5):**

1. **`useMerchantWallet`** - محفظة التاجر والمعاملات
2. **`useMerchantWithdrawals`** - طلبات سحب التاجر
3. **`useAdminMerchantWithdrawals`** - إدارة السحوبات (للإدارة)
4. **`usePlatformRevenue`** - أرباح المنصة
5. تحديث `src/hooks/wallet/index.ts` لتصدير الهوكس الجديدة

### **Components (4):**

1. **`MerchantWalletCard`** - بطاقات عرض الأرصدة (4 بطاقات)
2. **`MerchantWithdrawalForm`** - نموذج طلب السحب
3. **`MerchantTransactionsList`** - قائمة المعاملات
4. **`AdminMerchantWithdrawals`** - إدارة السحوبات (للإدارة)

### **Pages (3):**

1. **`/merchant/wallet`** - صفحة محفظة التاجر
   - عرض الأرصدة (متاح، معلق، إجمالي)
   - طلب سحب جديد
   - سجل السحوبات
   - سجل المعاملات

2. **`/admin/merchant-withdrawals`** - إدارة سحوبات التجار
   - عرض جميع الطلبات
   - موافقة/رفض الطلبات
   - عرض تفاصيل الحساب البنكي

3. **`/admin/platform-revenue`** - أرباح المنصة
   - إجمالي الأرباح
   - الأرباح المعلقة
   - تفاصيل كل معاملة

### **Navigation:**
- ✅ إضافة "المحفظة المالية" في `MerchantLayout`
- ✅ إضافة "سحوبات التجار" و "أرباح المنصة" في `AdminSidebar`

### **تحديث نماذج المنتجات:**
- ✅ تحديث `SimpleProductForm` لاستخدام `merchant_base_price_sar`
- ✅ حساب وعرض `catalog_price_sar` تلقائياً
- ✅ شرح نظام التسعير للتاجر مع مثال حي
- ✅ تحديث عرض المنتجات في `MerchantProducts`

---

## 🔄 تدفق العمل (Workflow)

### **1. إضافة منتج:**
```
التاجر يدخل: سعره الأساسي (1000 ريال)
    ↓
Trigger: auto_calculate_catalog_price
    ↓
النظام يحسب: catalog_price = 1000 × 1.25 = 1250 ريال
    ↓
المنتج جاهز للمسوقين
```

### **2. عملية البيع:**
```
العميل يدفع: 1500 ريال (المسوق حدد السعر)
    ↓
Trigger: create_merchant_pending_balance
    ↓
merchant_wallet: pending += 1000 ريال
platform_revenue: platform_share = 250 ريال (PENDING)
affiliate commission: 250 ريال (PENDING)
```

### **3. التوصيل:**
```
الطلب يتم توصيله
    ↓
Trigger: confirm_merchant_balance
    ↓
merchant_wallet: pending → available (1000 ريال)
platform_revenue: status = CONFIRMED
merchant_transaction: COMMISSION_CONFIRMED
```

### **4. السحب:**
```
التاجر يطلب سحب: 500 ريال
    ↓
merchant_withdrawal_requests: status = PENDING
    ↓
الإدارة توافق
    ↓
Function: process_merchant_withdrawal
    ↓
merchant_wallet: available -= 500 ريال
merchant_wallet: total_withdrawn += 500 ريال
merchant_transaction: WITHDRAWAL_COMPLETED
```

### **5. الإرجاع:**
```
العميل يرجع المنتج
    ↓
Trigger: reverse_merchant_transaction
    ↓
merchant_wallet: available -= 1000 ريال (أو pending)
platform_revenue: status = REFUNDED
merchant_transaction: REFUND
```

---

## 🔒 الأمان (Security)

### **Row Level Security (RLS):**

جميع الجداول محمية بـ RLS:

- التجار يرون فقط محافظهم ومعاملاتهم
- الإدارة ترى كل شيء
- استخدام `has_role()` function لتجنب infinite recursion

### **SECURITY DEFINER:**
جميع الـ Functions تستخدم `SECURITY DEFINER` لضمان:
- تنفيذ آمن للعمليات المالية
- عدم تلاعب المستخدمين بالأرصدة
- تكامل البيانات

---

## 📊 الإحصائيات المتاحة

### **للتاجر:**
- الرصيد المتاح
- الرصيد المعلق
- إجمالي الأرباح
- إجمالي المسحوب
- سجل المعاملات
- سجل السحوبات

### **للإدارة:**
- جميع طلبات السحب (معلقة، موافق عليها، مرفوضة)
- إجمالي أرباح المنصة
- الأرباح المعلقة
- تفاصيل كل معاملة (تاجر، مسوق، مبالغ)

---

## 🛠️ الصيانة

### **Scripts SQL:**

#### `sql/create_missing_merchant_wallets.sql`
إنشاء محافظ للتجار الحاليين الذين لا يملكون محافظ

#### `sql/update_existing_products_pricing.sql`
تحديث المنتجات الحالية بحقول التسعير الجديدة
- حساب `merchant_base_price_sar` من `price_sar` الحالي
- تعيين `catalog_price_sar`

---

## 📚 التوثيق

### **دليل التاجر:**
`docs/MERCHANT_PRICING_GUIDE.md` - دليل شامل للتجار يشرح:
- نظام التسعير
- كيفية عمل المحفظة
- دورة العمل المالية
- طريقة السحب
- أسئلة شائعة

---

## ✅ الاختبار

### **خطوات الاختبار:**

1. **إنشاء محفظة:**
   ```sql
   -- التحقق من إنشاء محفظة للتاجر الجديد
   SELECT * FROM merchant_wallet_balances WHERE merchant_id = 'xxx';
   ```

2. **إضافة منتج:**
   - تسجيل دخول كتاجر
   - إضافة منتج بسعر أساسي
   - التحقق من حساب catalog_price تلقائياً

3. **عملية بيع:**
   - إنشاء طلب وتسديده
   - التحقق من زيادة pending_balance
   - التحقق من تسجيل platform_revenue

4. **التوصيل:**
   - تغيير حالة الطلب إلى DELIVERED
   - التحقق من تحويل pending → available
   - التحقق من تسجيل المعاملة

5. **السحب:**
   - طلب سحب من صفحة المحفظة
   - موافقة الإدارة
   - التحقق من خصم الرصيد

6. **الإرجاع:**
   - إنشاء طلب إرجاع
   - التحقق من خصم المبلغ من الرصيد

---

## 🔮 التطويرات المستقبلية

### **محتمل:**
- [ ] إشعارات فورية عند تغيير حالة السحب
- [ ] تقارير مالية شهرية للتجار
- [ ] رسوم بيانية لتطور الأرباح
- [ ] تصدير المعاملات (PDF/Excel)
- [ ] تحويل تلقائي للأرصدة (Auto-withdrawal)
- [ ] دعم عملات إضافية
- [ ] API للتكامل مع أنظمة محاسبية

---

## 📞 الدعم الفني

للأسئلة أو المشاكل:
- مراجعة التوثيق في `docs/`
- فحص console logs
- مراجعة Supabase Analytics
- التواصل مع فريق التطوير

---

**تاريخ الإنشاء:** 2025-01-27  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للإنتاج
