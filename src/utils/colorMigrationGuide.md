# دليل تحويل الألوان إلى نظام التصميم

## تحويل الألوان المباشرة إلى المتغيرات المدعومة

### ❌ الاستخدام الخاطئ → ✅ الاستخدام الصحيح

## خلفيات الألوان
```typescript
// ❌ WRONG - استخدام مباشر
bg-white → bg-background
bg-black → bg-foreground
bg-gray-100 → bg-muted
bg-gray-500 → bg-muted-foreground
bg-red-500 → bg-destructive
bg-blue-500 → bg-accent
bg-green-500 → bg-status-online
bg-yellow-500 → bg-premium
bg-purple-500 → bg-luxury

// ✅ CORRECT - استخدام نظام التصميم
bg-primary, bg-secondary, bg-accent, bg-muted
bg-card, bg-popover, bg-destructive
```

## ألوان النصوص
```typescript
// ❌ WRONG
text-white → text-primary-foreground
text-black → text-foreground
text-gray-500 → text-muted-foreground
text-red-500 → text-destructive
text-blue-500 → text-accent
text-green-500 → text-status-online

// ✅ CORRECT
text-foreground, text-muted-foreground
text-primary, text-secondary-foreground
text-accent-foreground, text-destructive
```

## ألوان الحدود
```typescript
// ❌ WRONG
border-gray-200 → border-border
border-red-500 → border-destructive
border-blue-500 → border-accent

// ✅ CORRECT  
border-border, border-input
border-destructive, border-accent
```

## حالات خاصة - Persian Theme
```typescript
// الأدوار
admin → bg-destructive/10 text-destructive
moderator → bg-accent/10 text-accent-foreground  
merchant → bg-luxury/10 text-luxury-foreground
affiliate → bg-premium/10 text-premium-foreground

// المستويات
bronze → bg-bronze/10 text-bronze-foreground
silver → bg-muted text-muted-foreground
gold → bg-premium/10 text-premium-foreground
legendary → bg-luxury/10 text-luxury-foreground

// الحالات
success → text-status-online, bg-status-online/10
error → text-destructive, bg-destructive/10
warning → text-premium, bg-premium/10
info → text-turquoise, bg-turquoise/10
```

## التدرجات الفارسية
```typescript
// ❌ WRONG
bg-gradient-to-r from-red-500 to-blue-500

// ✅ CORRECT
bg-gradient-primary
bg-gradient-hero
bg-gradient-luxury
bg-gradient-persian
bg-gradient-commerce
```

## الظلال المخصصة
```typescript
// ❌ WRONG
shadow-lg shadow-xl

// ✅ CORRECT
shadow-soft
shadow-glow
shadow-luxury
shadow-persian
shadow-elegant
```

## أمثلة عملية

### أزرار
```typescript
// ❌ WRONG
<button className="bg-blue-500 text-white hover:bg-blue-600">

// ✅ CORRECT
<button className="bg-accent text-accent-foreground hover:bg-accent/90">
```

### بطاقات
```typescript
// ❌ WRONG
<div className="bg-white border border-gray-200 text-gray-900">

// ✅ CORRECT  
<div className="bg-card border border-border text-card-foreground">
```

### أيقونات الحالة
```typescript
// ❌ WRONG
<Icon className="text-green-500" /> // online
<Icon className="text-red-500" />   // error

// ✅ CORRECT
<Icon className="text-status-online" />
<Icon className="text-destructive" />
```

## استخدام الأدوات المساعدة
```typescript
import { getRoleColor, getStatusColor, getLevelColor } from '@/utils/designSystem';

// مثال
const roleClass = getRoleColor('admin'); // 'bg-destructive/10 text-destructive'
const statusClass = getStatusColor('online'); // 'text-status-online'
```

## نصائح للتحويل السريع

1. **استخدم Find & Replace في IDE:**
   - `text-white` → `text-primary-foreground`
   - `bg-white` → `bg-background`
   - `text-black` → `text-foreground`

2. **تحقق من الوضع الداكن:**
   - تأكد أن الألوان تدعم dark mode
   - استخدم متغيرات CSS بدلاً من الألوان المباشرة

3. **اختبر التباين:**
   - تأكد من وضوح النصوص
   - استخدم foreground colors مع background colors

4. **الأولوية للألوان الدلالية:**
   - destructive للأخطاء
   - status-online للنجاح
   - premium للتحذيرات
   - accent للمعلومات