# Admin Dashboard Components

هذا المجلد يحتوي على جميع الـ components المستخرجة من ملف `AdminDashboard.tsx` الرئيسي لتحسين قابلية الصيانة والقراءة.

## 📁 البنية

```
components/
├── ProductsSection.tsx          # قسم إدارة المنتجات
├── PaymentProvidersSection.tsx  # قسم إدارة وسائل الدفع
├── ShippingSection.tsx          # قسم إدارة شركات الشحن
├── ChannelsSection.tsx          # قسم إدارة الغرف/القنوات
├── ModeratorsSection.tsx        # قسم إدارة المشرفين
├── UsersSection.tsx             # قسم إدارة المستخدمين
├── InventoryAutomation.tsx      # أتمتة المخزون
├── CronJobsMonitoring.tsx       # مراقبة الـ Cron Jobs
├── index.ts                     # ملف تصدير مركزي
└── README.md                    # هذا الملف
```

## 🧩 Components

### 1. ProductsSection

**الوصف:** قسم شامل لإدارة المنتجات في المخزون العام.

**المسؤوليات:**
- إضافة منتجات جديدة مع صور ومقاسات وألوان
- تعديل المنتجات الموجودة
- حذف المنتجات
- تفعيل/تعطيل ظهور المنتجات
- إدارة الأصناف (Categories)

**Props:**
```typescript
interface ProductsSectionProps {
  products: any[];              // قائمة المنتجات
  categories: string[];         // قائمة الأصناف
  loading: boolean;             // حالة التحميل
  onRefresh: () => void;        // تحديث القائمة
  onAddProduct: (productData: any, images: File[], variants: any[]) => Promise<void>;
  onUpdateProduct: (productId: string, updates: any) => Promise<void>;
  onDeleteProduct: (product: any) => Promise<void>;
  onToggleVisibility: (product: any) => Promise<void>;
  onAddCategory: (category: string) => void;
}
```

**الميزات:**
- رفع حتى 10 صور لكل منتج
- إضافة تركيبات متعددة (مقاس + لون + مخزون)
- نافذة تعديل مدمجة
- معاينة الصور قبل الرفع

---

### 2. PaymentProvidersSection

**الوصف:** إدارة وسائل الدفع المتاحة للمتاجر.

**المسؤوليات:**
- إضافة وسائل دفع جديدة (تابي، تمارا، إلخ)
- حذف وسائل الدفع
- عرض حالة كل وسيلة (نشط/غير نشط)

**Props:**
```typescript
interface PaymentProvidersSectionProps {
  paymentGateways: any[];
  loading: boolean;
  onCreate: (gateway: any) => Promise<void>;
  onDelete: (gatewayId: string) => Promise<void>;
}
```

---

### 3. ShippingSection

**الوصف:** إدارة شركات الشحن والأسعار.

**المسؤوليات:**
- إضافة شركات شحن جديدة
- تعديل بيانات الشركات (الاسم، الرمز، السعر)
- تفعيل/تعطيل الشركات
- الانتقال لصفحة إدارة المناطق والأسعار

**Props:**
```typescript
interface ShippingSectionProps {
  providers: any[];
  loading: boolean;
  onCreate: (provider: any) => Promise<void>;
  onUpdate: (providerId: string, updates: any) => Promise<void>;
  onRefetch?: () => Promise<void>;
}
```

---

### 4. ChannelsSection

**الوصف:** إدارة الغرف والقنوات في النظام.

**المسؤوليات:**
- إنشاء غرف جديدة
- عرض عدد الأعضاء في كل غرفة
- حذف رسائل الغرف

**Props:**
```typescript
interface ChannelsSectionProps {
  channels: any[];
  channelMembers: Record<string, number>;
  loading: boolean;
  onCreate: (channelName: string, channelDesc: string) => Promise<void>;
  onClearMessages: (channelId: string, channelName: string) => Promise<void>;
}
```

---

### 5. ModeratorsSection

**الوصف:** إدارة المشرفين في المنصة.

**المسؤوليات:**
- تعيين مستخدمين حاليين كمشرفين
- إنشاء حسابات جديدة للمشرفين
- سحب صلاحيات الإشراف

**Props:**
```typescript
interface ModeratorsSectionProps {
  users: any[];
  loading: boolean;
  onAssign: (email: string) => Promise<void>;
  onRevoke: (email: string) => Promise<void>;
  onCreateModerator: (email: string, password: string) => Promise<void>;
  onRefresh: () => void;
}
```

---

### 6. UsersSection

**الوصف:** إدارة المستخدمين والأعضاء.

**المسؤوليات:**
- البحث عن المستخدمين
- عرض معلومات المستخدمين (الاسم، البريد، النقاط، الحالة)
- فتح ملف المستخدم التفصيلي
- إجراءات الإشراف (حظر، كتم، تغيير الدور)

**Props:**
```typescript
interface UsersSectionProps {
  users: any[];
  loading: boolean;
  currentUserRole: string;
  onSearch: () => void;
  onProfileClick: (user: any) => void;
  onModerationAction: (action: 'ban' | 'mute' | 'tempban', targetUser: any) => Promise<void>;
  onRoleChange: (user: any, newRole: string) => Promise<void>;
}
```

---

## 📊 الإحصائيات

### قبل إعادة الهيكلة:
- **AdminDashboard.tsx:** 1,622 سطر

### بعد إعادة الهيكلة:
- **AdminDashboard.tsx:** 616 سطر (~62% تحسين)
- **Components:** 6 ملفات جديدة
- **متوسط عدد الأسطر لكل component:** ~150-300 سطر

## 🎯 الفوائد

✅ **قابلية الصيانة:** كل component مسؤول عن وظيفة واحدة محددة
✅ **قابلية القراءة:** كود أوضح وأسهل للفهم
✅ **قابلية إعادة الاستخدام:** يمكن استخدام الـ components في صفحات أخرى
✅ **سهولة الاختبار:** كل component يمكن اختباره بشكل منفصل
✅ **التطوير الموازي:** فرق متعددة يمكنها العمل على components مختلفة

## 🔧 الاستخدام

```typescript
// استيراد فردي
import { ProductsSection } from '@/pages/admin/components/ProductsSection';

// استيراد من الملف المركزي
import {
  ProductsSection,
  PaymentProvidersSection
} from '@/pages/admin/components';

// الاستخدام
<ProductsSection
  products={products}
  categories={categories}
  loading={loading}
  onRefresh={loadProducts}
  onAddProduct={handleAddProduct}
  onUpdateProduct={updateProduct}
  onDeleteProduct={handleDeleteProduct}
  onToggleVisibility={handleToggleVisibility}
  onAddCategory={handleAddCategory}
/>
```

## 📝 ملاحظات مهمة

1. **Semantic Tokens:** جميع الـ components تستخدم semantic tokens (bg-card, text-foreground, إلخ)
2. **TypeScript:** جميع الـ components مكتوبة بـ TypeScript مع types واضحة
3. **Named Exports:** جميع الـ components تستخدم named exports (لا default exports)
4. **التعليقات:** جميع التعليقات مكتوبة بالعربية لسهولة الفهم
5. **الحفاظ على الوظائف:** لم يتم تغيير أي business logic، فقط إعادة تنظيم

## 🚀 التحديثات المستقبلية

- [ ] إضافة unit tests لكل component
- [ ] استخراج types إلى ملفات منفصلة
- [ ] إضافة Storybook documentation
- [ ] تحسين performance باستخدام React.memo

---

**آخر تحديث:** 2025-11-23
**المطور:** Claude Code Agent
**الإصدار:** 1.0.0
