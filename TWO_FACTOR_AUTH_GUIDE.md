# 🔒 دليل المصادقة الثنائية (2FA) - التنفيذ الكامل

**آخر تحديث:** 2025-11-24
**الحالة:** ✅ جاهز للتطبيق
**الوقت المتوقع:** 2-3 ساعات للإكمال والاختبار

---

## 📋 ملخص التنفيذ

تم إنشاء نظام مصادقة ثنائية (2FA) كامل باستخدام:
- ✅ TOTP (Time-based One-Time Password)
- ✅ Google Authenticator / Microsoft Authenticator compatible
- ✅ Backup codes للطوارئ (10 أكواد)
- ✅ إلزامي للمشرفين (admins)
- ✅ اختياري للتجار والأفلييت

---

## ✅ ما تم إنجازه

### 1. Database Schema ✅
**الملف:** `supabase/migrations/20251124000000_add_two_factor_auth.sql`

**الجداول:**
- `two_factor_auth` - تخزين معلومات 2FA
- `two_factor_auth_attempts` - تتبع محاولات التحقق

**الميزات:**
- ✅ TOTP secret storage (Base32)
- ✅ Backup codes (hashed with SHA-256)
- ✅ RLS policies للأمان
- ✅ Automatic timestamp updates
- ✅ Security monitoring (failed attempts tracking)
- ✅ Flag `require_2fa` في user_profiles للإلزام

---

### 2. Edge Functions ✅

#### A) `setup-2fa` - إعداد المصادقة الثنائية
**الملف:** `supabase/functions/setup-2fa/index.ts`

**الوظائف:**
- ✅ توليد TOTP secret (Base32)
- ✅ إنشاء 10 أكواد احتياطية
- ✅ توليد QR Code URL (otpauth://)
- ✅ حفظ البيانات مع التشفير

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "ABCD1234...",
    "qrCodeUrl": "otpauth://totp/...",
    "backupCodes": ["XXXXXXXX", "YYYYYYYY", ...]
  }
}
```

---

#### B) `verify-2fa` - التحقق من الرمز
**الملف:** `supabase/functions/verify-2fa/index.ts`

**الوظائف:**
- ✅ التحقق من TOTP code (6 أرقام)
- ✅ التحقق من backup code (8 أحرف)
- ✅ Time window tolerance (±30 ثانية)
- ✅ استخدام backup code مرة واحدة فقط
- ✅ تسجيل المحاولات (نجاح/فشل)
- ✅ تفعيل 2FA بعد أول تحقق ناجح

**Request:**
```json
{
  "code": "123456",
  "enableAfterVerify": true
}
```

---

#### C) `disable-2fa` - إيقاف المصادقة الثنائية
**الملف:** `supabase/functions/disable-2fa/index.ts`

**الوظائف:**
- ✅ حذف بيانات 2FA
- ✅ التحقق من الصلاحيات

---

### 3. React Hooks ✅

**الملف:** `src/hooks/useTwoFactorAuth.ts`

**الوظائف:**
```typescript
checkTwoFactorStatus()  // فحص حالة 2FA
setup2FA()              // إعداد 2FA جديد
verify2FA(code)         // التحقق من الرمز
disable2FA()            // إيقاف 2FA
```

**الاستخدام:**
```typescript
const { setup2FA, verify2FA, isLoading } = useTwoFactorAuth();

// Setup
const data = await setup2FA();
// data.qrCodeUrl, data.secret, data.backupCodes

// Verify
const success = await verify2FA('123456', true);
```

---

### 4. UI Components ✅

#### A) `TwoFactorAuthSettings` - إعدادات 2FA
**الملف:** `src/components/security/TwoFactorAuthSettings.tsx`

**الميزات:**
- ✅ عرض حالة 2FA (مفعلة/غير مفعلة)
- ✅ زر تفعيل/إيقاف
- ✅ عرض QR Code للمسح
- ✅ عرض Secret للإدخال اليدوي
- ✅ عرض Backup Codes مع نسخ
- ✅ إدخال رمز التحقق
- ✅ تأكيد الإيقاف

**الاستخدام:**
```tsx
import { TwoFactorAuthSettings } from '@/components/security/TwoFactorAuthSettings';

<TwoFactorAuthSettings />
```

---

#### B) `TwoFactorVerification` - صفحة التحقق عند الدخول
**الملف:** `src/components/auth/TwoFactorVerification.tsx`

**الميزات:**
- ✅ إدخال رمز TOTP (6 أرقام)
- ✅ إدخال Backup Code (8 أحرف)
- ✅ التبديل بين النوعين
- ✅ Error handling
- ✅ تصميم responsive

**الاستخدام:**
```tsx
<TwoFactorVerification
  onVerified={() => {
    // Success - allow access
  }}
  onCancel={() => {
    // Cancel - go back to login
  }}
/>
```

---

## 🚀 خطوات الإكمال

### الخطوة 1: تثبيت الحزم المطلوبة (5 دقائق)

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

---

### الخطوة 2: تطبيق Database Migration (1 دقيقة)

**عبر Supabase Dashboard:**
1. افتح https://app.supabase.com/project/YOUR_PROJECT/sql/new
2. انسخ محتوى `supabase/migrations/20251124000000_add_two_factor_auth.sql`
3. نفذ الـ SQL

**أو عبر Supabase CLI:**
```bash
supabase db push
```

---

### الخطوة 3: Deploy Edge Functions (5 دقائق)

```bash
# Deploy all 2FA functions
supabase functions deploy setup-2fa
supabase functions deploy verify-2fa
supabase functions deploy disable-2fa
```

**أو عبر Dashboard:**
1. Settings → Edge Functions
2. Deploy كل function على حدة

---

### الخطوة 4: إضافة 2FA Settings للـ Profile (10 دقائق)

**افتح:** `src/pages/profile/index.tsx` أو صفحة الإعدادات

**أضف:**
```tsx
import { TwoFactorAuthSettings } from '@/components/security/TwoFactorAuthSettings';

// في المكان المناسب (تبويب الأمان مثلاً)
<TwoFactorAuthSettings />
```

---

### الخطوة 5: تحديث Auth Flow (30-60 دقيقة)

**هدف:** فحص 2FA بعد تسجيل الدخول وقبل الوصول للنظام

**الملف:** `src/hooks/useFastAuth.ts` أو `src/contexts/FirebaseAuthContext.tsx`

**الخطوات:**

#### A) إضافة حالة 2FA

```typescript
const [needs2FA, setNeeds2FA] = useState(false);
const [is2FAVerified, setIs2FAVerified] = useState(false);
```

#### B) فحص 2FA بعد تسجيل الدخول

```typescript
useEffect(() => {
  if (user && !is2FAVerified) {
    check2FARequired();
  }
}, [user]);

const check2FARequired = async () => {
  // Check if user has 2FA enabled
  const { data } = await supabase
    .from('two_factor_auth')
    .select('enabled')
    .eq('user_id', user.id)
    .single();

  if (data?.enabled) {
    setNeeds2FA(true);
  }
};
```

#### C) عرض صفحة التحقق إذا لزم

```typescript
if (needs2FA && !is2FAVerified) {
  return (
    <TwoFactorVerification
      onVerified={() => {
        setIs2FAVerified(true);
        setNeeds2FA(false);
      }}
      onCancel={() => {
        // Logout
        supabase.auth.signOut();
      }}
    />
  );
}
```

---

### الخطوة 6: فرض 2FA على المشرفين (15 دقائق)

**الملف:** `src/hooks/useFastAuth.ts` أو Admin route guard

**الكود:**
```typescript
useEffect(() => {
  if (user && userRole === 'admin') {
    enforceAdminTwoFactor();
  }
}, [user, userRole]);

const enforceAdminTwoFactor = async () => {
  const { data } = await supabase
    .from('two_factor_auth')
    .select('enabled')
    .eq('user_id', user.id)
    .single();

  if (!data || !data.enabled) {
    // Admin must setup 2FA
    toast.error('يجب تفعيل المصادقة الثنائية للمشرفين', {
      description: 'سيتم توجيهك لصفحة الإعدادات',
      duration: 5000,
    });

    setTimeout(() => {
      navigate('/profile?tab=security');
    }, 2000);
  }
};
```

---

### الخطوة 7: اختبار شامل (30 دقيقة)

#### Test Case 1: إعداد 2FA
1. سجل دخول كأدمن
2. اذهب للإعدادات → الأمان
3. اضغط "تفعيل المصادقة الثنائية"
4. امسح QR Code بتطبيق Google Authenticator
5. أدخل الرمز من التطبيق
6. تحقق من ظهور "تم تفعيل المصادقة الثنائية"
7. احفظ Backup Codes

#### Test Case 2: تسجيل الدخول مع 2FA
1. سجل خروج
2. سجل دخول مرة أخرى
3. يجب أن تظهر صفحة التحقق الثنائي
4. أدخل رمز من Google Authenticator
5. يجب أن تدخل للنظام بنجاح

#### Test Case 3: استخدام Backup Code
1. في صفحة التحقق، اضغط "استخدام كود احتياطي"
2. أدخل أحد الأكواد الاحتياطية
3. يجب أن تدخل بنجاح
4. تحقق أن الكود لا يعمل مرة أخرى

#### Test Case 4: إيقاف 2FA
1. اذهب للإعدادات
2. اضغط "إيقاف المصادقة الثنائية"
3. أكد الإيقاف
4. سجل خروج ودخول
5. يجب ألا تظهر صفحة التحقق الثنائي

#### Test Case 5: فرض 2FA على الأدمن
1. سجل دخول كأدمن بدون 2FA
2. يجب توجيهك تلقائياً لصفحة الإعدادات
3. يجب ظهور رسالة "يجب تفعيل المصادقة الثنائية"

---

## 🔧 استكشاف الأخطاء

### المشكلة: QR Code لا يظهر
**الحل:** تأكد من تثبيت `qrcode`:
```bash
npm install qrcode @types/qrcode
```

---

### المشكلة: "Invalid code" دائماً
**الأسباب المحتملة:**
1. وقت الخادم غير متزامن (time drift)
2. Secret غير صحيح
3. TOTP window ضيق جداً

**الحل:**
- تحقق من وقت النظام: `date`
- زد الـ window في TOTP class من 1 إلى 2

---

### المشكلة: Edge Functions تفشل
**الحل:**
```bash
# Check logs
supabase functions logs setup-2fa
supabase functions logs verify-2fa

# Redeploy
supabase functions deploy setup-2fa --no-verify-jwt
```

---

### المشكلة: RLS policy blocking
**الحل:**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'two_factor_auth';

-- Grant permissions
GRANT ALL ON two_factor_auth TO authenticated;
```

---

## 📊 التقدم والحالة

```
✅ Database Schema:        100% (جاهز)
✅ Edge Functions:         100% (جاهز)
✅ React Hooks:            100% (جاهز)
✅ UI Components:          100% (جاهز)
⏸️ Package Installation:    0% (npm install qrcode)
⏸️ Migration Application:   0% (تطبيق SQL)
⏸️ Functions Deployment:    0% (deploy)
⏸️ Auth Flow Integration:   0% (تحديث auth logic)
⏸️ Testing:                 0% (اختبار شامل)

Overall Progress: 55% ████████████░░░░░░░░░░
```

---

## 🎯 الخطوات التالية

### الآن:
1. ✅ `npm install qrcode @types/qrcode`
2. ✅ تطبيق Migration في Supabase
3. ✅ Deploy Edge Functions

### بعدها:
4. ✅ إضافة TwoFactorAuthSettings لصفحة Profile
5. ✅ تحديث Auth Flow للتحقق من 2FA
6. ✅ فرض 2FA على الأدمن
7. ✅ اختبار شامل

**الوقت المتوقع الكلي:** 2-3 ساعات ✨

---

## 💡 ملاحظات مهمة

### الأمان:
- ✅ TOTP secrets مخزنة بشكل آمن في قاعدة البيانات
- ✅ Backup codes مشفرة بـ SHA-256
- ✅ RLS policies تمنع الوصول غير المصرح
- ✅ Failed attempts logged للمراقبة

### تطبيقات المصادقة المدعومة:
- ✅ Google Authenticator
- ✅ Microsoft Authenticator
- ✅ Authy
- ✅ 1Password
- ✅ أي تطبيق يدعم TOTP

### المستقبل (اختياري):
- 🔜 SMS 2FA (إضافة Twilio/SNS)
- 🔜 Email 2FA
- 🔜 Trusted devices (تذكر هذا الجهاز)
- 🔜 2FA recovery via support ticket

---

**جاهز للتطبيق! 🚀**

قل "يلا نطبق" وأبدأ فوراً بالخطوات!
