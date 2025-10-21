# بنية المشروع المحسّنة - Project Structure

## 📁 البنية الحالية (قبل التحسين)
```
src/
├── components/ (95+ files مختلطة)
│   ├── AtlantisChat.tsx
│   ├── UserDashboard.tsx  
│   ├── ProductForm.tsx
│   ├── admin/
│   ├── affiliate/
│   ├── analytics/
│   └── ui/
├── hooks/ (25+ files مختلطة)
├── pages/ (45+ files مختلطة)
├── contexts/
├── utils/
└── lib/
```

## 🎯 البنية المطلوبة (بعد التحسين)

### 1. Feature-Based Organization
```
src/
├── features/                    # ميزات المنتج الأساسية
│   ├── auth/                   # المصادقة والتسجيل
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── chat/                   # الدردشة الأتلانتية
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── commerce/               # التجارة الإلكترونية
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── affiliate/              # التسويق بالعمولة
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── admin/                  # لوحة الإدارة
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── analytics/              # التحليلات والإحصائيات
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
```

### 2. Shared Resources
```
├── shared/                     # الموارد المشتركة
│   ├── components/             # المكونات القابلة لإعادة الاستخدام
│   │   ├── ui/                # مكونات UI الأساسية
│   │   ├── forms/             # مكونات النماذج
│   │   ├── layouts/           # التخطيطات
│   │   ├── navigation/        # التنقل
│   │   └── feedback/          # التنبيهات والتغذية الراجعة
│   ├── hooks/                 # Hooks مشتركة
│   ├── services/              # خدمات API وExternal
│   ├── utils/                 # أدوات مساعدة
│   ├── types/                 # أنواع TypeScript
│   ├── constants/             # الثوابت
│   └── styles/                # أنماط CSS
```

### 3. Pages & Routing
```
├── pages/                     # صفحات التطبيق
│   ├── auth/
│   ├── dashboard/
│   ├── admin/
│   ├── affiliate/
│   ├── commerce/
│   └── public/
```

### 4. Configuration & Setup
```
├── config/                    # إعدادات التطبيق
├── lib/                       # مكتبات خارجية مُعدّة
├── assets/                    # الصور والموارد الثابتة
└── integrations/              # تكاملات خارجية (Supabase, Firebase)
```

## 🔄 خطة إعادة التنظيم

### المرحلة 1: إنشاء البنية الجديدة
- إنشاء مجلدات features
- إنشاء مجلد shared
- إنشاء مجلدات فرعية لكل ميزة

### المرحلة 2: تصنيف الملفات الحالية
- تحديد كل ملف وتصنيفه حسب الميزة
- نقل الملفات للمجلدات المناسبة
- تحديث imports/exports

### المرحلة 3: إنشاء index.ts files
- إنشاء ملفات فهرسة لكل مجلد
- تبسيط الimports
- إنشاء barrel exports

### المرحلة 4: تحسين imports
- تحديث جميع imports للبنية الجديدة
- استخدام path aliases
- تنظيف circular dependencies

## 🎯 الفوائد المتوقعة

1. **سهولة الصيانة**: كل ميزة في مكان واحد
2. **قابلية القراءة**: بنية واضحة ومنطقية
3. **قابلية الاختبار**: أسهل كتابة واختبار
4. **الأداء**: تحسين tree-shaking
5. **التطوير**: سرعة في العثور على الملفات
6. **التوسع**: سهولة إضافة ميزات جديدة

## 📝 قواعد التنظيم

### 1. Feature Folder Rules
- كل feature له مجلد منفصل
- كل feature يحتوي على: components, hooks, services, types
- لا dependencies بين features (إلا عبر shared)

### 2. Shared Folder Rules  
- مكونات قابلة لإعادة الاستخدام فقط
- لا business logic محددة
- generic وflexible

### 3. Import Rules
```typescript
// ✅ Good - from feature
import { UserProfile } from '@/features/auth';

// ✅ Good - from shared
import { Button } from '@/shared/components/ui';

// ❌ Bad - direct component import
import { UserProfile } from '@/components/UserProfile';
```

### 4. Naming Conventions
- PascalCase للمكونات: `UserProfile.tsx`
- camelCase للhooks: `useAuth.ts`
- camelCase للservices: `authService.ts`
- PascalCase للأنواع: `UserTypes.ts`
- UPPER_CASE للثوابت: `API_ENDPOINTS.ts`