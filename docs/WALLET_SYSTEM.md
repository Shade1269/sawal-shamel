# نظام المحفظة المالية

## نظرة عامة
نظام محفظة مالي متكامل للمسوقات مع إدارة العمولات والسحوبات بشكل تلقائي.

## البنية التحتية

### الجداول

#### 1. wallet_balances
يحتوي على رصيد كل مسوقة:
- `available_balance_sar`: الرصيد المتاح للسحب
- `pending_balance_sar`: الرصيد المعلق (عمولات لم تؤكد بعد)
- `lifetime_earnings_sar`: إجمالي الأرباح
- `total_withdrawn_sar`: إجمالي ما تم سحبه
- `minimum_withdrawal_sar`: الحد الأدنى للسحب (افتراضي 100 ريال)

#### 2. wallet_transactions
سجل كامل لجميع المعاملات المالية:
- `transaction_type`: نوع المعاملة (COMMISSION, WITHDRAWAL, ADJUSTMENT, REFUND)
- `amount_sar`: المبلغ
- `balance_after_sar`: الرصيد بعد المعاملة
- `reference_id`: مرجع المعاملة (order_id, commission_id, etc.)
- `reference_type`: نوع المرجع
- `description`: وصف المعاملة

#### 3. withdrawal_requests
طلبات السحب:
- `affiliate_profile_id`: معرف المسوقة
- `amount_sar`: المبلغ المطلوب
- `status`: حالة الطلب (PENDING, APPROVED, REJECTED, COMPLETED)
- `payment_method`: طريقة الدفع (BANK_TRANSFER, WALLET, CASH)
- `bank_details`: تفاصيل الحساب البنكي (JSON)
- `notes`: ملاحظات المسوقة
- `admin_notes`: ملاحظات الإدارة
- `processed_by`: معالج الطلب
- `processed_at`: تاريخ المعالجة

#### 4. order_returns
إرجاع الطلبات:
- `order_id`: معرف الطلب
- `customer_id`: معرف العميل
- `affiliate_id`: معرف المسوقة
- `return_reason`: سبب الإرجاع
- `return_status`: حالة الإرجاع
- `returned_items`: المنتجات المرجعة (JSON)
- `refund_amount_sar`: مبلغ الاسترجاع

## الوظائف التلقائية (Functions & Triggers)

### 1. initialize_affiliate_wallet()
يتم تنفيذها تلقائياً عند تسجيل مسوقة جديدة لإنشاء محفظة لها.

### 2. record_wallet_transaction()
تسجيل معاملة مالية جديدة:
```sql
SELECT record_wallet_transaction(
  p_affiliate_id := 'uuid',
  p_transaction_type := 'COMMISSION',
  p_amount_sar := 150.00,
  p_reference_id := 'order_uuid',
  p_reference_type := 'commission',
  p_description := 'عمولة من الطلب #123'
);
```

### 3. update_wallet_on_commission_confirmed()
يتم تنفيذه تلقائياً عند:
- **إنشاء عمولة جديدة بحالة PENDING**: يضيف المبلغ للرصيد المعلق
- **تأكيد العمولة (CONFIRMED)**: ينقل المبلغ من المعلق للمتاح ويسجل معاملة

### 4. process_withdrawal_request()
معالجة طلب السحب من الأدمن:
```sql
SELECT process_withdrawal_request(
  p_withdrawal_id := 'uuid',
  p_status := 'APPROVED',
  p_admin_notes := 'تمت الموافقة'
);
```

## React Hooks

### useWallet()
```typescript
const { 
  balance,           // معلومات المحفظة الكاملة
  transactions,      // سجل المعاملات
  isLoading,         // حالة التحميل
  error,            // الأخطاء
  refreshWallet,    // تحديث البيانات
  canWithdraw       // هل يمكن السحب؟
} = useWallet();
```

### useWithdrawals()
```typescript
const {
  withdrawals,            // جميع طلبات السحب
  pendingWithdrawals,     // الطلبات المعلقة
  completedWithdrawals,   // الطلبات المكتملة
  totalPending,           // إجمالي المبالغ المعلقة
  totalCompleted,         // إجمالي المبالغ المكتملة
  isLoading,
  createWithdrawal,       // إنشاء طلب سحب جديد
  isCreating
} = useWithdrawals();
```

## Components

### WalletCard
عرض معلومات المحفظة:
```tsx
<WalletCard onWithdrawClick={() => setShowDialog(true)} />
```

### WithdrawalRequestForm
نموذج طلب سحب:
```tsx
<WithdrawalRequestForm 
  open={showDialog}
  onOpenChange={setShowDialog}
/>
```

### WithdrawalManagement (Admin)
إدارة طلبات السحب للأدمن:
```tsx
<WithdrawalManagement />
```

## الصفحات

### 1. WalletPage (للمسوقات)
**المسار**: `/affiliate/wallet`

تحتوي على:
- عرض الرصيد (متاح، معلق، إجمالي)
- سجل المعاملات المالية
- طلبات السحب السابقة
- إنشاء طلب سحب جديد

### 2. AdminWithdrawalsPage (للإدارة)
**المسار**: `/admin/withdrawals`

تحتوي على:
- إحصائيات السحوبات
- قائمة الطلبات حسب الحالة
- الموافقة/الرفض على الطلبات
- إضافة ملاحظات إدارية

## سير العمل التلقائي

### عند إنشاء طلب جديد
1. ✅ عميل يطلب منتج من متجر المسوقة
2. ✅ يتم إنشاء order في الـ database
3. ✅ يتم إنشاء commission بحالة PENDING
4. ✅ **Trigger تلقائي**: يضيف المبلغ للرصيد المعلق في المحفظة

### عند تسليم الطلب
1. ✅ يتم تغيير حالة الطلب إلى DELIVERED
2. ✅ **Trigger تلقائي**: يحول العمولة من PENDING إلى CONFIRMED
3. ✅ **Trigger تلقائي**: ينقل المبلغ من المعلق للمتاح
4. ✅ **Trigger تلقائي**: يسجل معاملة في wallet_transactions

### عند طلب سحب
1. ✅ المسوقة تنشئ طلب سحب
2. ✅ يظهر للأدمن في قائمة الطلبات المعلقة
3. ✅ الأدمن يوافق/يرفض مع ملاحظات
4. ✅ **عند الموافقة**: Function تلقائي يسجل معاملة ويخصم من المحفظة

## قواعد الأمان (RLS)

### wallet_balances
- المسوقة ترى محفظتها فقط
- الأدمن يرى جميع المحافظ

### wallet_transactions
- المسوقة ترى معاملاتها فقط
- الأدمن يرى جميع المعاملات

### withdrawal_requests
- **SELECT**: المسوقة ترى طلباتها، الأدمن يرى الجميع
- **INSERT**: المسوقة تنشئ طلباتها فقط
- **UPDATE**: الأدمن فقط

### order_returns
- المستخدم يرى الإرجاعات المتعلقة بطلباته

## الأمان والصلاحيات

جميع Functions المهمة مصممة بـ `SECURITY DEFINER` مع `SET search_path = public` لضمان:
- ✅ تنفيذ آمن بصلاحيات محددة
- ✅ عدم إمكانية التلاعب بالبيانات المالية
- ✅ تسجيل جميع المعاملات في audit trail

## الإحصائيات المتوفرة

### للمسوقة
- الرصيد المتاح للسحب
- الرصيد المعلق (عمولات لم تؤكد)
- إجمالي الأرباح
- إجمالي ما تم سحبه
- عدد طلبات السحب وحالتها

### للأدمن
- إجمالي السحوبات المعلقة
- إجمالي السحوبات الموافق عليها
- إجمالي السحوبات المكتملة
- عدد الطلبات لكل حالة
- تفاصيل كل طلب سحب

## التكامل مع النظام القائم

النظام يتكامل بشكل كامل مع:
- ✅ جدول `commissions` الموجود
- ✅ جدول `profiles` الموجود
- ✅ نظام الطلبات الموحد
- ✅ لا يؤثر على أي كود موجود

## الاختبار

للاختبار اليدوي:
1. سجل دخول كمسوقة
2. اذهب إلى `/affiliate/wallet`
3. جرب إنشاء طلب سحب
4. سجل دخول كأدمن
5. اذهب إلى `/admin/withdrawals`
6. راجع وعالج الطلب

## الصيانة

### لإضافة رصيد يدوياً
```sql
SELECT record_wallet_transaction(
  'affiliate_uuid',
  'ADJUSTMENT',
  100.00,
  NULL,
  'manual',
  'تعديل يدوي من الإدارة'
);
```

### لعرض تاريخ محفظة مسوقة
```sql
SELECT * FROM wallet_transactions
WHERE affiliate_profile_id = 'uuid'
ORDER BY created_at DESC;
```

### لعرض جميع الطلبات المعلقة
```sql
SELECT * FROM withdrawal_requests
WHERE status = 'PENDING'
ORDER BY created_at ASC;
```
