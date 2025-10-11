# تفعيل Supabase Phone Authentication

## خطوات التفعيل (يجب عليك القيام بها):

### 1. افتح Supabase Dashboard
انتقل إلى: https://supabase.com/dashboard/project/uewuiiopkctdtaexmtxu/auth/providers

### 2. فعّل Phone Provider
- في قسم "Phone"، اضغط على "Enable"
- اختر SMS Provider (Twilio موصى به)

### 3. أضف Twilio Credentials
تحتاج:
- **Twilio Account SID**
- **Twilio Auth Token**  
- **Twilio Phone Number** (رقم مسجل في Twilio)

### 4. احصل على Twilio Credentials:
1. سجل دخول في Twilio: https://www.twilio.com/console
2. انسخ:
   - Account SID
   - Auth Token
3. اشترِ رقم جوال من Twilio (Phone Numbers)

### 5. أضفها في Supabase:
- **Twilio Account SID**: `[اللصق هنا]`
- **Twilio Auth Token**: `[اللصق هنا]`
- **Twilio Phone Number**: `[مثال: +1234567890]`
- **SMS Template**: يمكن تركها افتراضية أو تخصيصها

### 6. احفظ الإعدادات

---

## بعد التفعيل:
بمجرد إتمام الخطوات أعلاه، النظام سيعمل تلقائياً وسأحول الكود من Firebase لـ Supabase.

## ملاحظة مهمة:
Twilio خدمة مدفوعة، لكن يوفر credit مجاني للتجربة.

بدائل أخرى إذا لم تكن تريد استخدام Twilio:
- MessageBird
- Vonage (Nexmo)
- Textlocal (للسعودية)
