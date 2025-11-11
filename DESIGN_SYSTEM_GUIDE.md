# 🎨 دليل نظام التصميم الموحد

## 📋 نظرة عامة

تم إنشاء نظام تصميم موحد لضمان الاتساق عبر جميع صفحات ومكونات المنصة.

---

## 🎯 **المكونات الجديدة**

### **1. UnifiedButton**

```tsx
import { UnifiedButton } from '@/components/design-system';

// Primary button
<UnifiedButton variant="primary">حفظ</UnifiedButton>

// Luxury button with glow animation
<UnifiedButton variant="luxury" animation="glow">
  اشتري الآن
</UnifiedButton>

// Glass button with icon
<UnifiedButton variant="glass" leftIcon={<Icon />}>
  متابعة
</UnifiedButton>
```

**Variants المتاحة:**
- `primary`, `secondary` - أزرار أساسية
- `luxury`, `persian`, `premium`, `hero` - أزرار خاصة
- `success`, `warning`, `danger` - حالات
- `outline`, `ghost`, `link` - محايدة
- `glass`, `glass-primary` - زجاجية

**Sizes:**
- `sm`, `md`, `lg`, `xl`
- `icon`, `icon-sm`, `icon-lg`

**Animations:**
- `glow`, `float`, `scale`

---

### **2. UnifiedCard**

```tsx
import { 
  UnifiedCard, 
  UnifiedCardHeader, 
  UnifiedCardTitle,
  UnifiedCardDescription,
  UnifiedCardContent 
} from '@/components/design-system';

<UnifiedCard variant="glass" hover="lift">
  <UnifiedCardHeader>
    <UnifiedCardTitle>عنوان البطاقة</UnifiedCardTitle>
    <UnifiedCardDescription>وصف قصير</UnifiedCardDescription>
  </UnifiedCardHeader>
  <UnifiedCardContent>
    المحتوى هنا
  </UnifiedCardContent>
</UnifiedCard>
```

**Variants:**
- `default` - بطاقة عادية
- `glass`, `glass-strong` - زجاجية
- `luxury`, `persian`, `premium` - فاخرة
- `elegant`, `flat` - بسيطة

**Padding:**
- `none`, `sm`, `md`, `lg`, `xl`

**Hover Effects:**
- `lift`, `glow`, `scale`

---

## 🎨 **نظام الألوان والتدرجات**

### **Gradient Classes**

```css
.gradient-primary     /* تدرج أساسي */
.gradient-hero        /* تدرج Hero */
.gradient-luxury      /* تدرج فاخر */
.gradient-premium     /* تدرج ممتاز */
.gradient-persian     /* تدرج فارسي */
.gradient-commerce    /* تدرج تجاري */
.gradient-heritage    /* تدرج تراثي */
.gradient-sunset      /* غروب الشمس */
.gradient-ocean       /* المحيط */
.gradient-forest      /* الغابة */
.gradient-purple      /* بنفسجي */
.gradient-gold        /* ذهبي */
```

**مثال:**
```tsx
<div className="gradient-hero p-6 rounded-card">
  محتوى مع تدرج جميل
</div>
```

---

## ✨ **Shadow System**

```css
.shadow-soft          /* ظل خفيف */
.shadow-card          /* ظل البطاقة */
.shadow-glow          /* ظل متوهج */
.shadow-luxury        /* ظل فاخر */
.shadow-glass         /* ظل زجاجي */
.shadow-elegant       /* ظل أنيق */
.shadow-persian       /* ظل فارسي */
.shadow-premium       /* ظل ممتاز */
```

---

## 🪟 **Glass Effects**

```css
.glass-card           /* بطاقة زجاجية */
.glass-card-strong    /* بطاقة زجاجية قوية */
.glass-button         /* زر زجاجي */
```

**مثال:**
```tsx
<div className="glass-card p-6 rounded-card">
  تأثير زجاجي جميل مع blur
</div>
```

---

## 🎭 **Interactive States**

```css
.interactive-lift     /* يرتفع عند hover */
.interactive-glow     /* يتوهج عند hover */
.interactive-scale    /* يكبر عند hover */
```

---

## 📝 **Typography Utilities**

```css
.heading-ar           /* عنوان عربي */
.body-ar              /* نص عربي */
.premium-text         /* نص مميز */
.elegant-text         /* نص أنيق */
```

---

## 🎬 **Animation Utilities**

```css
.animate-shimmer      /* تأثير shimmer */
.animate-float        /* تأثير طفو */
.animate-glow-pulse   /* نبض متوهج */
```

---

## 📐 **Layout Utilities**

```css
.section-spacing      /* مسافات القسم */
.container-spacing    /* مسافات الحاوية */
.card-spacing         /* مسافات البطاقة */
.compact-spacing      /* مسافات مضغوطة */

.grid-auto-fit        /* شبكة تلقائية fit */
.grid-auto-fill       /* شبكة تلقائية fill */

.flex-center          /* مركز بـ flex */
.flex-between         /* بين بـ flex */
```

---

## 🔘 **Border Radius Utilities**

```css
.rounded-card         /* زوايا البطاقة */
.rounded-button       /* زوايا الزر */
.rounded-input        /* زوايا الإدخال */
.rounded-full         /* دائري كامل */
```

---

## ✅ **أفضل الممارسات**

### **DO ✅**

```tsx
// استخدم المكونات الموحدة
<UnifiedButton variant="primary">حفظ</UnifiedButton>

// استخدم classes من Design System
<div className="gradient-hero shadow-glow rounded-card">

// استخدم semantic tokens
<div className="bg-card text-card-foreground">
```

### **DON'T ❌**

```tsx
// لا تستخدم ألوان hardcoded
<div className="bg-blue-500">  ❌

// لا تستخدم gradients inline
<div style={{ background: 'linear-gradient(...)' }}>  ❌

// لا تستخدم bg-[color:var(...)]
<div className="bg-[color:var(--primary)]">  ❌
```

---

## 🚀 **الخطوات القادمة**

- [ ] توحيد جميع الـ Buttons في المشروع
- [ ] توحيد جميع الـ Cards في المشروع
- [ ] إنشاء UnifiedHeader component
- [ ] إنشاء UnifiedSidebar component
- [ ] تحديث جميع الصفحات لاستخدام النظام الجديد

---

## 📚 **الملفات الرئيسية**

```
src/
├── styles/
│   └── design-system.css          # نظام التصميم الموحد
├── components/
│   └── design-system/
│       ├── UnifiedButton.tsx      # مكون الزر الموحد
│       ├── UnifiedCard.tsx        # مكون البطاقة الموحد
│       └── index.ts               # Exports
├── themes/
│   ├── default/tokens.css         # ثيم افتراضي
│   ├── luxury/tokens.css          # ثيم فاخر
│   ├── damascus/tokens.css        # ثيم دمشقي
│   └── ferrari/tokens.css         # ثيم فيراري (تم إصلاحه)
└── index.css                      # الملف الرئيسي
```

---

## 🎯 **التغييرات المهمة**

### **تم إصلاح:**
1. ✅ Ferrari theme border color (كان أبيض، الآن `220 30% 25%`)
2. ✅ إنشاء نظام gradients موحد
3. ✅ إنشاء نظام shadows متسق
4. ✅ إنشاء glass effects system

### **تم إضافة:**
1. ✅ UnifiedButton component (14 variants)
2. ✅ UnifiedCard component (8 variants)
3. ✅ Design system utilities
4. ✅ Animation system
5. ✅ Layout utilities

---

**ملاحظة:** هذا هو الإصدار 1.0 من نظام التصميم. سيتم تحديثه باستمرار.

**تاريخ آخر تحديث:** 2025-11-11
