# 🎨 دليل استخدام Semantic Color Tokens

## 📖 المقدمة

هذا الدليل يشرح كيفية استخدام الألوان الدلالية (Semantic Colors) في المشروع بدلاً من الألوان المكتوبة مباشرة (Hardcoded Colors).

---

## ❌ لا تفعل (Hardcoded Colors)

```tsx
// ❌ خطأ - ألوان مكتوبة مباشرة
<div className="text-blue-600 bg-blue-100">
<Icon className="text-green-500" />
<Badge className="bg-red-100 text-red-800">
<p className="text-purple-600">
```

---

## ✅ افعل (Semantic Tokens)

```tsx
// ✅ صحيح - استخدام semantic tokens
<div className="text-info bg-info/10">
<Icon className="text-success" />
<Badge className="bg-destructive/10 text-destructive">
<p className="text-accent">
```

---

## 🎨 جدول الاستبدالات

### الألوان الأساسية

| Hardcoded ❌ | Semantic Token ✅ | الاستخدام |
|-------------|------------------|-----------|
| `text-blue-600` | `text-info` | معلومات عامة |
| `bg-blue-100` | `bg-info/10` | خلفية معلومات |
| `text-green-600` | `text-success` | نجاح، تأكيد |
| `bg-green-100` | `bg-success/10` | خلفية نجاح |
| `text-red-600` | `text-destructive` | خطأ، حذف |
| `bg-red-100` | `bg-destructive/10` | خلفية خطأ |
| `text-yellow-600` | `text-warning` | تحذير |
| `bg-yellow-100` | `bg-warning/10` | خلفية تحذير |
| `text-purple-600` | `text-accent` | تمييز، مميز |
| `bg-purple-100` | `bg-accent/10` | خلفية مميزة |
| `text-orange-600` | `text-warning` | تنبيه متوسط |
| `bg-orange-100` | `bg-warning/10` | خلفية تنبيه |

### الألوان الحيادية

| Hardcoded ❌ | Semantic Token ✅ | الاستخدام |
|-------------|------------------|-----------|
| `text-gray-600` | `text-muted-foreground` | نص ثانوي |
| `bg-gray-100` | `bg-muted` | خلفية محايدة |
| `text-gray-800` | `text-foreground` | نص رئيسي |
| `bg-gray-50` | `bg-secondary` | خلفية ثانوية |
| `border-gray-300` | `border-border` | حدود |

### ألوان الثيم

| Hardcoded ❌ | Semantic Token ✅ | الاستخدام |
|-------------|------------------|-----------|
| `text-blue-500` | `text-primary` | لون أساسي |
| `bg-blue-500` | `bg-primary` | خلفية أساسية |
| `text-white` | `text-primary-foreground` | نص على primary |

---

## 🎯 أمثلة عملية

### مثال 1: بطاقة حالة (Status Card)

```tsx
// ❌ قبل
<Card className="bg-green-100 border-green-300">
  <CheckCircle className="text-green-600" />
  <span className="text-green-800">تم بنجاح</span>
</Card>

// ✅ بعد
<Card className="bg-success/10 border-success/20">
  <CheckCircle className="text-success" />
  <span className="text-success">تم بنجاح</span>
</Card>
```

### مثال 2: Badge مخصص

```tsx
// ❌ قبل
const getStatusColor = (status: string) => {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// ✅ بعد
const getStatusColor = (status: string) => {
  if (status === 'active') return 'bg-success/10 text-success';
  if (status === 'pending') return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
};
```

### مثال 3: أيقونات حسب النوع

```tsx
// ❌ قبل
const getIcon = (type: string) => {
  switch(type) {
    case 'success':
      return <CheckCircle className="text-green-600" />;
    case 'error':
      return <XCircle className="text-red-600" />;
    case 'warning':
      return <AlertTriangle className="text-yellow-600" />;
    default:
      return <Info className="text-blue-600" />;
  }
};

// ✅ بعد
const getIcon = (type: string) => {
  switch(type) {
    case 'success':
      return <CheckCircle className="text-success" />;
    case 'error':
      return <XCircle className="text-destructive" />;
    case 'warning':
      return <AlertTriangle className="text-warning" />;
    default:
      return <Info className="text-info" />;
  }
};
```

### مثال 4: بطاقات إحصائيات (Stats Cards)

```tsx
// ❌ قبل
<div className="bg-blue-100 rounded-lg p-4">
  <Users className="text-blue-600" />
  <p className="text-2xl text-blue-800">1,234</p>
</div>

// ✅ بعد
<div className="bg-info/10 rounded-lg p-4">
  <Users className="text-info" />
  <p className="text-2xl text-info">1,234</p>
</div>
```

---

## 🌈 الشفافية (Opacity)

استخدم `/` للتحكم في الشفافية:

```tsx
// خلفيات بشفافية مختلفة
bg-primary/5   // 5% opacity
bg-primary/10  // 10% opacity
bg-primary/20  // 20% opacity
bg-primary/50  // 50% opacity

// مثال
<div className="bg-success/10">     // خلفية خفيفة جداً
<div className="bg-success/20">     // خلفية أقوى قليلاً
<div className="border-success/30"> // حدود شفافة
```

---

## 🎨 ألوان مخصصة للثيمات

### Ferrari Theme
```tsx
// ألوان خاصة بثيم Ferrari
text-ferrari-red
bg-ferrari-red/10
text-navy
bg-navy/10
text-silver
text-metallic
```

### Damascus Theme
```tsx
// ألوان تراثية دمشقية
text-persian
bg-persian/10
text-turquoise
bg-turquoise/10
text-bronze
text-olive
```

### Luxury Theme
```tsx
// ألوان فخمة
text-luxury
bg-luxury/10
text-premium
bg-premium/10
text-coral
text-pearl
```

---

## 📝 متى تستخدم كل لون

### `text-info` / `bg-info/10`
- معلومات عامة
- رسائل إرشادية
- عدادات وإحصائيات محايدة

### `text-success` / `bg-success/10`
- عمليات ناجحة
- تأكيدات
- حالات "مفعل" أو "نشط"
- نمو إيجابي

### `text-destructive` / `bg-destructive/10`
- أخطاء
- تحذيرات خطيرة
- حذف أو إلغاء
- حالات "معطل" أو "فاشل"

### `text-warning` / `bg-warning/10`
- تحذيرات متوسطة
- حالات "معلق" أو "قيد المراجعة"
- تنبيهات تحتاج انتباه

### `text-accent` / `bg-accent/10`
- عناصر مميزة
- ميزات جديدة
- عروض خاصة
- تحديدات مهمة

### `text-muted-foreground` / `bg-muted`
- نصوص ثانوية
- تواريخ وأوقات
- أوصاف إضافية
- عناصر غير نشطة

---

## 🔍 البحث والاستبدال

### في VS Code:

1. افتح البحث والاستبدال (`Ctrl+Shift+H`)
2. فعّل Regex
3. استخدم هذه الأنماط:

```regex
# البحث عن
text-blue-\d+

# الاستبدال بـ
text-info
```

```regex
# البحث عن
bg-green-100

# الاستبدال بـ
bg-success/10
```

---

## ✅ Checklist للمراجعة

عند مراجعة component:

- [ ] لا يوجد `text-blue-*`
- [ ] لا يوجد `text-green-*`
- [ ] لا يوجد `text-red-*`
- [ ] لا يوجد `text-yellow-*`
- [ ] لا يوجد `text-purple-*`
- [ ] لا يوجد `text-orange-*`
- [ ] لا يوجد `text-gray-*`
- [ ] لا يوجد `bg-[color]-*`
- [ ] جميع الألوان تستخدم semantic tokens
- [ ] الألوان متسقة مع الثيم الحالي

---

## 📚 موارد إضافية

- [Design System Guide](./design-system.md)
- [Theme Configuration](../src/themes/)
- [Tailwind Config](../tailwind.config.ts)

---

**آخر تحديث:** 2025-11-12
