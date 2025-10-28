# Modern Sidebar v4.0 - دليل الاستخدام 🚀

قائمة جانبية حديثة ومتطورة مع تأثيرات بصرية جميلة ونظام ألوان متكامل للوضع الفاتح والمظلم.

---

## ✨ المميزات الرئيسية

### 🎨 **التصميم البصري**
- ✅ Glass Morphism Effect مع Backdrop Blur
- ✅ تدرجات لونية ديناميكية
- ✅ ظلال وتوهج متحرك
- ✅ رسوم متحركة سلسة
- ✅ دعم كامل للوضع الفاتح والمظلم

### 🔍 **البحث الذكي**
- ✅ بحث فوري أثناء الكتابة
- ✅ تظليل النتائج
- ✅ زر مسح سريع

### ⭐ **نظام المفضلة**
- ✅ حفظ الصفحات المفضلة
- ✅ وصول سريع
- ✅ أيقونة نجمة تفاعلية

### 🕐 **الصفحات الأخيرة**
- ✅ حفظ تلقائي لآخر 5 صفحات
- ✅ قسم مخصص في القائمة

### 📱 **الوضع المضغوط**
- ✅ قابل للطي والتوسيع
- ✅ Tooltips عند التحويم
- ✅ حفظ الحالة في localStorage

### 🎯 **ترميز الألوان**
- ✅ لون مخصص لكل قسم
- ✅ مؤشرات بصرية
- ✅ تدرجات ديناميكية

---

## 📦 الملفات المضافة

```
src/
├── components/navigation/
│   ├── ModernSidebar.tsx          # الكومبوننت الرئيسي
│   ├── SidebarSearch.tsx          # نظام البحث
│   ├── SidebarSection.tsx         # قسم قابل للطي
│   ├── SidebarItem.tsx            # عنصر القائمة
│   └── ModernSidebarExample.tsx   # مثال الاستخدام
├── hooks/
│   └── useSidebarState.ts         # إدارة الحالة
└── index.css                      # متغيرات الألوان
```

---

## 🎨 نظام الألوان

### الوضع الفاتح ☀️
```css
--sidebar-bg: 0 0% 98%              /* خلفية بيضاء فاتحة */
--sidebar-glass-bg: 0 0% 100%       /* زجاج أبيض */
--sidebar-text: 222 47% 11%         /* نص داكن */
--sidebar-hover: 210 40% 96%        /* أزرق فاتح للتحويم */
--sidebar-active: 221 83% 53%       /* أزرق ساطع */
```

### الوضع المظلم 🌙
```css
--sidebar-bg: 222 47% 11%           /* خلفية زرقاء داكنة */
--sidebar-glass-bg: 222 47% 11%     /* زجاج داكن */
--sidebar-text: 210 40% 98%         /* نص فاتح */
--sidebar-hover: 217 33% 17%        /* أزرق داكن للتحويم */
--sidebar-active: 221 83% 53%       /* أزرق ساطع */
```

### ألوان الأقسام 🎯
```css
--sidebar-wallet: 142 76% 36%       /* أخضر - المحفظة */
--sidebar-store: 221 83% 53%        /* أزرق - المتجر */
--sidebar-orders: 262 83% 58%       /* بنفسجي - الطلبات */
--sidebar-analytics: 24 95% 53%     /* برتقالي - التحليلات */
--sidebar-settings: 215 16% 47%     /* رمادي - الإعدادات */
```

---

## 🚀 طريقة الاستخدام

### 1️⃣ **الاستخدام الأساسي**

```tsx
import { ModernSidebar } from '@/components/navigation/ModernSidebar';

export function YourLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <ModernSidebar />
      
      <main className="flex-1 mr-64 transition-all duration-300">
        {/* محتوى الصفحة */}
      </main>
    </div>
  );
}
```

### 2️⃣ **تخصيص القوائم**

قم بتعديل `navigationSections` في ملف `ModernSidebar.tsx`:

```tsx
const navigationSections = [
  {
    id: 'wallet',
    title: 'المحفظة',
    icon: <Wallet className="h-4 w-4" />,
    color: '142 76% 36%', // HSL color
    items: [
      {
        id: 'wallet-overview',
        title: 'نظرة عامة',
        href: '/affiliate/wallet',
        icon: Wallet,
        color: '142 76% 36%',
        badge: '5', // optional
      },
    ],
  },
];
```

### 3️⃣ **إضافة Badges للإشعارات**

```tsx
{
  id: 'orders',
  title: 'الطلبات',
  href: '/orders',
  icon: ShoppingCart,
  badge: 12, // عدد الطلبات الجديدة
}
```

### 4️⃣ **إضافة عناصر فرعية**

```tsx
{
  id: 'settings',
  title: 'الإعدادات',
  href: '/settings',
  icon: Settings,
  children: [
    {
      id: 'settings-profile',
      title: 'الملف الشخصي',
      href: '/settings/profile',
      icon: User,
    },
    {
      id: 'settings-security',
      title: 'الأمان',
      href: '/settings/security',
      icon: Lock,
    },
  ],
}
```

---

## 🎭 الرسوم المتحركة

### المتاحة في tailwind.config.ts:
```js
animate-accordion-down   // للقوائم المنسدلة
animate-fade-in         // ظهور تدريجي
animate-scale-in        // تكبير عند الدخول
hover:scale-[1.02]      // تكبير خفيف عند التحويم
active:scale-[0.98]     // تصغير عند الضغط
```

---

## 🛠️ الـ Hooks المتاحة

### `useSidebarState()`

```tsx
const {
  state,           // الحالة الكاملة
  toggleCollapse,  // طي/فتح السيدبار
  toggleSection,   // طي/فتح قسم معين
  addRecentPage,   // إضافة صفحة للأخيرة
  toggleFavorite,  // إضافة/إزالة من المفضلة
  setSearchQuery   // تغيير نص البحث
} = useSidebarState();
```

### State Structure:
```typescript
interface SidebarState {
  isCollapsed: boolean;        // حالة الطي
  expandedSections: string[];  // الأقسام المفتوحة
  recentPages: string[];       // الصفحات الأخيرة
  favorites: string[];         // المفضلة
  searchQuery: string;         // نص البحث
}
```

---

## 💡 نصائح الاستخدام

### 1️⃣ **تخصيص العرض**
```tsx
// في الوضع المضغوط
<main className="mr-16 transition-all">

// في الوضع الكامل
<main className="mr-64 transition-all">
```

### 2️⃣ **إضافة لوجو مخصص**
```tsx
// في ModernSidebar.tsx
{!state.isCollapsed && (
  <div className="flex items-center gap-2">
    <img src="/logo.svg" className="h-8 w-8" />
    <h2 className="text-lg font-bold">اسم التطبيق</h2>
  </div>
)}
```

### 3️⃣ **إضافة معلومات المستخدم**
```tsx
// في Footer Section
<div className="p-4 border-t">
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={user.avatar} />
      <AvatarFallback>{user.name[0]}</AvatarFallback>
    </Avatar>
    {!state.isCollapsed && (
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    )}
  </div>
</div>
```

---

## 🎨 تخصيص الألوان

### تغيير ألوان قسم معين:
```css
/* في index.css */
:root {
  --sidebar-custom-section: 280 100% 70%; /* بنفسجي فاتح */
}

html.dark {
  --sidebar-custom-section: 280 100% 40%; /* بنفسجي داكن */
}
```

```tsx
// في navigationSections
{
  id: 'custom',
  title: 'قسم مخصص',
  color: 'var(--sidebar-custom-section)',
  items: [...]
}
```

---

## 📱 الاستجابة (Responsive)

السيدبار يدعم:
- ✅ Desktop (عرض كامل)
- ✅ Tablet (قابل للطي)
- ✅ Mobile (مخفي افتراضياً، استخدم drawer أو bottom nav)

```tsx
// مثال للإخفاء على Mobile
<div className="hidden md:block">
  <ModernSidebar />
</div>
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الألوان لا تعمل
**الحل:** تأكد من أن `index.css` محمّل وأن المتغيرات محددة بصيغة HSL صحيحة.

### المشكلة: الرسوم المتحركة بطيئة
**الحل:** تحقق من `transition-all duration-300` وقلل المدة إذا لزم.

### المشكلة: السيدبار يغطي المحتوى
**الحل:** أضف margin للـ main content بنفس عرض السيدبار.

---

## 📚 أمثلة إضافية

### مثال 1: إضافة زر إجراء سريع
```tsx
<div className="p-3">
  <Button 
    className="w-full bg-[hsl(var(--sidebar-active))]"
    variant="default"
  >
    إضافة جديد
  </Button>
</div>
```

### مثال 2: إضافة إحصائيات
```tsx
<div className="p-3 mx-2 bg-[hsl(var(--sidebar-hover))] rounded-lg">
  <p className="text-xs text-[hsl(var(--sidebar-text-secondary))]">
    الرصيد المتاح
  </p>
  <p className="text-lg font-bold text-[hsl(var(--sidebar-text))]">
    1,234 ر.س
  </p>
</div>
```

---

## 🎉 الخلاصة

تم إنشاء قائمة جانبية حديثة ومتطورة مع:
- ✅ تصميم Glass Morphism جميل
- ✅ نظام ألوان متكامل للوضعين الفاتح والمظلم
- ✅ ميزات تفاعلية متقدمة
- ✅ رسوم متحركة سلسة
- ✅ سهلة التخصيص والاستخدام

استمتع بالاستخدام! 🚀